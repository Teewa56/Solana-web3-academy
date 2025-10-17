const express = require('express');
const {
    getStudentStats,
    getLeaderboard,
    getAvailableBadges,
    getPointsBreakdown,
    awardPoints,
    awardBadge
} = require('../controllers/gamificationController');
const { requireAdmin } = require('../../middleware/roleCheck');

const router = express.Router();

// Student routes
router.get('/my-stats', getStudentStats);
router.get('/leaderboard', getLeaderboard);
router.get('/badges', getAvailableBadges);
router.get('/points-breakdown', getPointsBreakdown);

// Admin routes
router.post('/award-points', requireAdmin, awardPoints);
router.post('/award-badge', requireAdmin, awardBadge);

module.exports = router;