const axios = require('axios');
const crypto = require('crypto');
const Submission = require('../modules/models/submissionModel');
const logger = require('./logger');

async function logCriticalError(type, error) {
    logger.error(`CRITICAL: ${type}`, error);
}

class PlagiarismService {
    constructor() {
        // Using Copyleaks API or similar plagiarism detection service
        this.apiKey = process.env.PLAGIARISM_API_KEY;
        this.apiUrl = process.env.PLAGIARISM_API_URL || 'https://api.copyleaks.com';
        this.similarityThreshold = 0.7; // 70% similarity threshold
    }

    // Calculate similarity between two texts using Levenshtein distance
    calculateSimilarity(text1, text2) {
        const longer = text1.length > text2.length ? text1 : text2;
        const shorter = text1.length > text2.length ? text2 : text1;
        
        if (longer.length === 0) {
            return 1.0;
        }
        
        const editDistance = this.levenshteinDistance(longer, shorter);
        return (longer.length - editDistance) / longer.length;
    }

    levenshteinDistance(str1, str2) {
        const len1 = str1.length;
        const len2 = str2.length;
        
        // For very long strings, use truncated comparison
        if (len1 > 5000 || len2 > 5000) {
            return this.levenshteinDistanceApprox(str1.substring(0, 5000), str2.substring(0, 5000));
        }
        
        const prev = new Array(len2 + 1).fill(0);
        const curr = new Array(len2 + 1).fill(0);
        
        for (let j = 0; j <= len2; j++) {
            prev[j] = j;
        }
        
        for (let i = 1; i <= len1; i++) {
            curr[0] = i;
            for (let j = 1; j <= len2; j++) {
                const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
                curr[j] = Math.min(
                    curr[j - 1] + 1,
                    prev[j] + 1,
                    prev[j - 1] + cost
                );
            }
            [prev, curr] = [curr, prev];
        }
        
        return prev[len2];
    }

    levenshteinDistanceApprox(str1, str2) {
        // Use token-based similarity for large strings
        const tokens1 = new Set(str1.split(/\s+/));
        const tokens2 = new Set(str2.split(/\s+/));
        const intersection = [...tokens1].filter(t => tokens2.has(t)).length;
        const union = new Set([...tokens1, ...tokens2]).size;
        return Math.round((1 - intersection / union) * Math.min(str1.length, str2.length));
    }

    // Normalize text for comparison
    normalizeText(text) {
        return text
            .toLowerCase()
            .replace(/[^\w\s]/g, '') // Remove special characters
            .replace(/\s+/g, ' ') // Normalize whitespace
            .trim();
    }

    // Calculate hash of text for quick comparison
    calculateHash(text) {
        return crypto.createHash('md5').update(text).digest('hex');
    }

    // In checkPlagiarism method, change to:
    async checkPlagiarism(content, assignmentId, studentId) {
        try {
            logger.info(`Starting plagiarism check for student ${studentId}, assignment ${assignmentId}`);

            // ADD TIMEOUT - wait max 30 seconds for both checks
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Plagiarism check timeout')), 30000)
            );

            // Run both checks in parallel with timeout
            const checksPromise = Promise.all([
                this.checkInternalPlagiarism(content, assignmentId, studentId),
                this.checkExternalPlagiarism(content)
            ]);

            const [internalResult, externalResult] = await Promise.race([
                checksPromise,
                timeoutPromise
            ]);

            const overallPassed = internalResult.passed && externalResult.passed;
            const maxSimilarity = Math.max(internalResult.similarity, externalResult.similarity);

            const result = {
                passed: overallPassed,
                overallSimilarity: maxSimilarity,
                internal: internalResult,
                external: externalResult,
                timestamp: new Date(),
                checksPerformed: {
                    internal: true,
                    external: externalResult.checkType !== 'external_skipped'
                }
            };

            logger.info(`Plagiarism check completed. Passed: ${overallPassed}, Similarity: ${maxSimilarity}`);

            return result;
        } catch (error) {
            logger.error('Error in comprehensive plagiarism check:', error);
            
            // If timeout, still return conservative result
            if (error.message.includes('timeout')) {
                return {
                    passed: false,
                    overallSimilarity: 1.0,
                    internal: { passed: false },
                    external: { passed: false },
                    timestamp: new Date(),
                    error: 'Plagiarism check timed out - marking as potential plagiarism',
                    requiresManualReview: true,
                    checksPerformed: {
                        internal: false,
                        external: false
                    }
                };
            }
            
            throw error;
        }
    }

    // Change checkExternalPlagiarism to retry on failure:
    async checkExternalPlagiarism(content) {
        try {
            if (!this.apiKey) {
                logger.warn('External plagiarism API key not configured');
                return {
                    passed: true,
                    similarity: 0,
                    sources: [],
                    checkType: 'external_skipped'
                };
            }

            // ADD RETRY LOGIC
            let retries = 3;
            let lastError;

            while (retries > 0) {
                try {
                    const response = await axios.post(
                        `${this.apiUrl}/v3/scans/submit`,
                        {
                            text: content,
                            properties: {
                                webhookUrl: `${process.env.BACKEND_URL}/api/v1/webhooks/plagiarism`
                            }
                        },
                        {
                            headers: {
                                'Authorization': `Bearer ${this.apiKey}`,
                                'Content-Type': 'application/json'
                            },
                            timeout: 10000  // 10 second timeout per request
                        }
                    );

                    return {
                        passed: response.data.score < this.similarityThreshold,
                        similarity: response.data.score || 0,
                        sources: response.data.results || [],
                        scanId: response.data.scanId,
                        checkType: 'external'
                    };
                } catch (error) {
                    lastError = error;
                    retries--;
                    if (retries > 0) {
                        logger.warn(`External plagiarism check failed, retrying... (${retries} left)`);
                        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s before retry
                    }
                }
            }

            logger.error('External plagiarism check failed after retries:', lastError);
            return {
                passed: false,  // Fail safe
                similarity: 1.0,
                sources: [],
                error: lastError.message,
                checkType: 'external_error',
                requiresManualReview: true
            };
        } catch (error) {
            logger.error('Error in external plagiarism check:', error);
            return {
                passed: false,
                similarity: 1.0,
                sources: [],
                error: error.message,
                checkType: 'external_error',
                requiresManualReview: true
            };
        }
    }

    // Check assignment against answer key
    async checkAgainstAnswerKey(content, answerKey) {
        try {
            const normalizedContent = this.normalizeText(content);
            const normalizedAnswer = this.normalizeText(answerKey);

            // Calculate similarity
            const similarity = this.calculateSimilarity(normalizedContent, normalizedAnswer);

            // Extract keywords from answer key
            const keywords = this.extractKeywords(normalizedAnswer);
            const keywordsFound = keywords.filter(keyword => 
                normalizedContent.includes(keyword)
            );

            const keywordMatchPercentage = keywords.length > 0
                ? (keywordsFound.length / keywords.length)
                : 0;

            // Consider it passed if similarity is high OR most keywords are present
            const passed = similarity >= 0.6 || keywordMatchPercentage >= 0.7;

            return {
                passed: passed,
                similarity: similarity,
                keywordMatchPercentage: keywordMatchPercentage,
                totalKeywords: keywords.length,
                matchedKeywords: keywordsFound.length,
                missingKeywords: keywords.filter(k => !keywordsFound.includes(k))
            };
        } catch (error) {
            logger.error('Error checking against answer key:', error);
            throw error;
        }
    }

    // Extract keywords from text (simple implementation)
    extractKeywords(text) {
        const commonWords = new Set([
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
            'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'be',
            'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
            'would', 'should', 'could', 'may', 'might', 'must', 'can', 'this',
            'that', 'these', 'those', 'it', 'its', 'they', 'them', 'their'
        ]);

        const words = text.toLowerCase().split(/\s+/);
        const keywords = words.filter(word => 
            word.length > 3 && !commonWords.has(word)
        );

        // Return unique keywords
        return [...new Set(keywords)];
    }

    // Generate plagiarism report
    generateReport(plagiarismResult) {
        const report = {
            summary: {
                passed: plagiarismResult.passed,
                overallSimilarity: `${(plagiarismResult.overallSimilarity * 100).toFixed(2)}%`,
                timestamp: plagiarismResult.timestamp
            },
            internalCheck: {
                passed: plagiarismResult.internal.passed,
                similarity: `${(plagiarismResult.internal.similarity * 100).toFixed(2)}%`,
                matchesFound: plagiarismResult.internal.matches.length,
                details: plagiarismResult.internal.matches.map(match => ({
                    similarity: `${(match.similarity * 100).toFixed(2)}%`,
                    type: match.matchType
                }))
            },
            externalCheck: {
                passed: plagiarismResult.external.passed,
                similarity: `${(plagiarismResult.external.similarity * 100).toFixed(2)}%`,
                sourcesFound: plagiarismResult.external.sources?.length || 0,
                checkType: plagiarismResult.external.checkType
            }
        };

        return report;
    }
}

// Singleton instance
const plagiarismService = new PlagiarismService();

module.exports = plagiarismService;