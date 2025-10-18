const TokenBlacklist = require('../modules/models/tokenBlacklistModel');
const logger = require('./logger');

class TokenBlacklistManager {
    constructor() {
        // In-memory cache: Map<token, expiresAt>
        this.memoryCache = new Map();
        
        // Statistics
        this.stats = {
            cacheHits: 0,
            cacheMisses: 0,
            dbQueries: 0,
            tokensAdded: 0,
            tokensRevoked: 0
        };

        // Sync DB to memory every 10 minutes
        this.syncInterval = setInterval(() => this.syncRecentTokens(), 10 * 60 * 1000);

        // Cleanup memory cache every 15 minutes
        this.cleanupInterval = setInterval(() => this.cleanupMemoryCache(), 15 * 60 * 1000);

        // Initial sync on startup
        this.syncRecentTokens().catch(err => 
            logger.error('Error during initial token sync:', err)
        );
    }

    /**
     * Add token to blacklist
     * @param {string} token - JWT token
     * @param {number} expiresInSeconds - Token expiry in seconds
     * @param {string} userId - User ID (optional)
     * @param {string} reason - Reason for blacklist
     * @param {object} metadata - Additional metadata (ipAddress, userAgent)
     * @returns {Promise<boolean>}
     */
    async addToBlacklist(token, expiresInSeconds, userId = null, reason = 'logout', metadata = {}) {
        try {
            if (!token || typeof token !== 'string') {
                logger.warn('Invalid token provided to blacklist');
                return false;
            }

            const expiresAt = new Date(Date.now() + (expiresInSeconds * 1000));

            // Add to memory immediately (fast)
            this.memoryCache.set(token, expiresAt);

            // Add to DB asynchronously (don't block)
            const tokenDoc = {
                token,
                userId,
                expiresAt,
                reason,
                tokenType: reason === 'password_reset' ? 'access' : 'refresh',
                ipAddress: metadata.ipAddress || null,
                userAgent: metadata.userAgent || null
            };

            TokenBlacklist.create(tokenDoc).catch(err => {
                // Handle unique constraint violation (token already blacklisted)
                if (err.code === 11000) {
                    logger.debug('Token already in blacklist');
                } else {
                    logger.error('Error saving token to DB:', err);
                }
            });

            this.stats.tokensAdded++;
            logger.info(
                `Token blacklisted (${expiresInSeconds}s). Reason: ${reason}. Total: ${this.memoryCache.size}`
            );

            return true;
        } catch (error) {
            logger.error('Error adding token to blacklist:', error);
            return false;
        }
    }

    /**
     * Check if token is blacklisted
     * @param {string} token - JWT token
     * @returns {Promise<boolean>}
     */
    async isTokenBlacklisted(token) {
        try {
            if (!token || typeof token !== 'string') {
                return false;
            }

            // STEP 1: Check memory cache first (fast)
            if (this.memoryCache.has(token)) {
                const expiresAt = this.memoryCache.get(token);
                
                if (expiresAt > new Date()) {
                    this.stats.cacheHits++;
                    return true;
                } else {
                    // Expired, remove from cache
                    this.memoryCache.delete(token);
                    return false;
                }
            }

            // STEP 2: Check database (fallback)
            this.stats.dbQueries++;
            this.stats.cacheMisses++;

            const blacklistedToken = await TokenBlacklist.findOne({ token });

            if (!blacklistedToken) {
                return false;
            }

            // Add to memory for future checks
            this.memoryCache.set(token, blacklistedToken.expiresAt);

            // Check if expired
            if (blacklistedToken.expiresAt < new Date()) {
                // Delete from DB (TTL will handle this, but clean up anyway)
                await TokenBlacklist.deleteOne({ _id: blacklistedToken._id });
                this.memoryCache.delete(token);
                return false;
            }

            return true;
        } catch (error) {
            logger.error('Error checking token blacklist:', error);
            // On error, assume not blacklisted to avoid lockout
            return false;
        }
    }

    /**
     * Sync recently blacklisted tokens to memory cache
     * @private
     */
    async syncRecentTokens() {
        try {
            // Get tokens created/blacklisted in last 2 minutes
            const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);

            const recentTokens = await TokenBlacklist.find({
                revokedAt: { $gte: twoMinutesAgo }
            }).select('token expiresAt');

            recentTokens.forEach(doc => {
                if (!this.memoryCache.has(doc.token)) {
                    this.memoryCache.set(doc.token, doc.expiresAt);
                }
            });

            logger.debug(
                `Synced ${recentTokens.length} tokens to memory. Cache size: ${this.memoryCache.size}`
            );
        } catch (error) {
            logger.error('Error syncing tokens to cache:', error);
        }
    }

    /**
     * Cleanup expired tokens from memory cache
     * @private
     */
    cleanupMemoryCache() {
        try {
            const now = new Date();
            let removed = 0;

            for (const [token, expiresAt] of this.memoryCache.entries()) {
                if (expiresAt < now) {
                    this.memoryCache.delete(token);
                    removed++;
                }
            }

            logger.debug(
                `Memory cleanup: removed ${removed} expired tokens. Cache size: ${this.memoryCache.size}`
            );
        } catch (error) {
            logger.error('Error cleaning memory cache:', error);
        }
    }

    /**
     * Revoke all tokens for a specific user
     * @param {string} userId - User ID
     * @param {string} reason - Reason for revocation
     * @returns {Promise<number>} - Number of tokens revoked
     */
    async revokeUserTokens(userId, reason = 'security_breach') {
        try {
            // Get all active tokens for user
            const tokens = await TokenBlacklist.find({ 
                userId,
                expiresAt: { $gt: new Date() }
            }).select('token expiresAt');

            // Add to memory
            tokens.forEach(doc => {
                this.memoryCache.set(doc.token, doc.expiresAt);
            });

            // Revoke in DB (set expires to now)
            const result = await TokenBlacklist.updateMany(
                { userId },
                { 
                    expiresAt: new Date(),
                    reason
                }
            );

            this.stats.tokensRevoked += result.modifiedCount;
            logger.warn(
                `Revoked ${result.modifiedCount} tokens for user ${userId}. Reason: ${reason}`
            );

            return result.modifiedCount;
        } catch (error) {
            logger.error('Error revoking user tokens:', error);
            return 0;
        }
    }

    /**
     * Get blacklist statistics
     * @returns {object}
     */
    getStats() {
        const hitRate = this.stats.cacheHits + this.stats.cacheMisses > 0
            ? ((this.stats.cacheHits / (this.stats.cacheHits + this.stats.cacheMisses)) * 100).toFixed(2)
            : 0;

        return {
            ...this.stats,
            cacheSize: this.memoryCache.size,
            cacheHitRate: `${hitRate}%`
        };
    }

    /**
     * Clear memory cache (admin use only)
     */
    clearMemoryCache() {
        this.memoryCache.clear();
        logger.warn('Memory cache cleared (admin action)');
    }

    /**
     * Cleanup on shutdown
     */
    destroy() {
        clearInterval(this.syncInterval);
        clearInterval(this.cleanupInterval);
        this.memoryCache.clear();
        logger.info('Token blacklist manager destroyed');
    }
}

// Singleton instance
const blacklistManager = new TokenBlacklistManager();

// Cleanup on process exit
process.on('exit', () => {
    blacklistManager.destroy();
});

process.on('SIGINT', () => {
    blacklistManager.destroy();
    process.exit(0);
});

module.exports = blacklistManager;