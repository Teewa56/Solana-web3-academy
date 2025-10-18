const mongoose = require('mongoose');

const tokenBlacklistSchema = new mongoose.Schema({
    token: { 
        type: String, 
        required: true, 
        unique: true, 
        index: true,
        trim: true
    },
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        index: true
    },
    tokenType: {
        type: String,
        enum: ['access', 'refresh'],
        default: 'refresh'
    },
    expiresAt: { 
        type: Date, 
        required: true, 
        index: true
    },
    reason: { 
        type: String, 
        enum: ['logout', 'password_reset', 'admin_revoke', 'security_breach'], 
        default: 'logout'
    },
    revokedAt: {
        type: Date,
        default: Date.now
    },
    ipAddress: String,
    userAgent: String
}, { timestamps: true });

tokenBlacklistSchema.index({ token: 1, expiresAt: 1 });

module.exports = mongoose.model('TokenBlacklist', tokenBlacklistSchema);