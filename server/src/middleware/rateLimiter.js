const limiter = require('express-rate-limit');

// Global rate limiter: 100 req/15min
const globalLimiter = limiter({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again after 15 minutes',
    standardHeaders: true,
    legacyHeaders: false,
});

// Strict limiter for auth: 5 req/15min per IP
const authLimiter = limiter({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'Too many login attempts, please try again after 15 minutes',
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true  // Only count failed attempts
});

// Submission limiter: 3 per course per day
const submissionLimiter = limiter({
    windowMs: 24 * 60 * 60 * 1000,  // 24 hours
    max: 3,
    message: 'Maximum 3 submissions per course per day',
    keyGenerator: (req) => `${req.user.id}-${req.body.assignmentId || 'unknown'}`,
    skip: (req) => !req.user  // Skip if not authenticated
});

// Grading limiter: 50 per hour (for instructors)
const gradingLimiter = limiter({
    windowMs: 60 * 60 * 1000,
    max: 50,
    message: 'Too many grading operations, please try again later',
    keyGenerator: (req) => req.user.id,
    skip: (req) => !req.user
});

// Certificate limiter: 5 per day per student
const certificateLimiter = limiter({
    windowMs: 24 * 60 * 60 * 1000,
    max: 5,
    message: 'Too many certificate requests, please try again tomorrow',
    keyGenerator: (req) => req.user.id,
    skip: (req) => !req.user
});

// Leaderboard limiter: 30 per minute (high read volume is ok)
const leaderboardLimiter = limiter({
    windowMs: 60 * 1000,
    max: 30,
    message: 'Too many leaderboard requests, please try again later'
});

module.exports = {
    globalLimiter,
    authLimiter,
    submissionLimiter,
    gradingLimiter,
    certificateLimiter,
    leaderboardLimiter
};