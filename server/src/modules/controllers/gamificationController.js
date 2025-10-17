const Student = require('../students/studentModel');
const Submission = require('../models/submissionModel');
const logger = require('../../utils/logger');

// Points configuration
const POINTS_CONFIG = {
    ASSIGNMENT_SUBMIT: 10,
    ASSIGNMENT_PERFECT: 50, // 100% grade
    ASSIGNMENT_EXCELLENT: 30, // 90-99%
    ASSIGNMENT_GOOD: 20, // 80-89%
    ASSIGNMENT_PASS: 10, // 70-79%
    COURSE_COMPLETE: 100,
    EARLY_SUBMISSION: 15,
    FIRST_SUBMISSION: 25,
    BADGE_UNLOCK: 50
};

// Badge definitions
const BADGES = {
    FIRST_STEPS: {
        name: 'First Steps',
        description: 'Complete your first assignment',
        requirement: 1,
        type: 'assignment_count'
    },
    RISING_STAR: {
        name: 'Rising Star',
        description: 'Earn 500 points',
        requirement: 500,
        type: 'points'
    },
    OVERACHIEVER: {
        name: 'Overachiever',
        description: 'Score 100% on 3 assignments',
        requirement: 3,
        type: 'perfect_scores'
    },
    SPEEDSTER: {
        name: 'Speedster',
        description: 'Submit 5 assignments early',
        requirement: 5,
        type: 'early_submissions'
    },
    COURSE_MASTER: {
        name: 'Course Master',
        description: 'Complete 5 courses',
        requirement: 5,
        type: 'courses_completed'
    },
    DEDICATED_LEARNER: {
        name: 'Dedicated Learner',
        description: 'Complete 10 assignments',
        requirement: 10,
        type: 'assignment_count'
    },
    SCHOLAR: {
        name: 'Scholar',
        description: 'Earn 1000 points',
        requirement: 1000,
        type: 'points'
    },
    ELITE: {
        name: 'Elite',
        description: 'Earn 2500 points',
        requirement: 2500,
        type: 'points'
    }
};

// Award points for assignment submission
const awardPointsForSubmission = async (studentId, grade, isEarly = false, isFirst = false) => {
    try {
        const student = await Student.findById(studentId);
        if (!student) {
            throw new Error('Student not found');
        }

        let points = POINTS_CONFIG.ASSIGNMENT_SUBMIT;

        // Grade-based points
        if (grade >= 100) {
            points += POINTS_CONFIG.ASSIGNMENT_PERFECT;
        } else if (grade >= 90) {
            points += POINTS_CONFIG.ASSIGNMENT_EXCELLENT;
        } else if (grade >= 80) {
            points += POINTS_CONFIG.ASSIGNMENT_GOOD;
        } else if (grade >= 70) {
            points += POINTS_CONFIG.ASSIGNMENT_PASS;
        }

        // Bonus points
        if (isEarly) {
            points += POINTS_CONFIG.EARLY_SUBMISSION;
        }
        if (isFirst) {
            points += POINTS_CONFIG.FIRST_SUBMISSION;
        }

        student.points += points;
        await student.save();

        // Check for new badges
        await checkAndAwardBadges(studentId);

        logger.info(`Awarded ${points} points to student ${studentId}`);
        
        return { points, totalPoints: student.points };
    } catch (error) {
        logger.error('Error awarding points:', error);
        throw error;
    }
};

// Check and award badges
const checkAndAwardBadges = async (studentId) => {
    try {
        const student = await Student.findById(studentId);
        if (!student) {
            throw new Error('Student not found');
        }

        const newBadges = [];

        // Get submission statistics
        const submissions = await Submission.find({ student: studentId });
        const perfectScores = submissions.filter(s => s.grade === 100).length;
        const earlySubmissions = submissions.filter(s => s.submittedAt < s.assignment?.dueDate).length;

        // Check each badge
        for (const [key, badge] of Object.entries(BADGES)) {
            // Skip if already earned
            if (student.badges.includes(badge.name)) {
                continue;
            }

            let qualified = false;

            switch (badge.type) {
                case 'points':
                    qualified = student.points >= badge.requirement;
                    break;
                case 'assignment_count':
                    qualified = submissions.length >= badge.requirement;
                    break;
                case 'perfect_scores':
                    qualified = perfectScores >= badge.requirement;
                    break;
                case 'early_submissions':
                    qualified = earlySubmissions >= badge.requirement;
                    break;
                case 'courses_completed':
                    qualified = student.coursesCompleted >= badge.requirement;
                    break;
            }

            if (qualified) {
                student.badges.push(badge.name);
                student.points += POINTS_CONFIG.BADGE_UNLOCK;
                newBadges.push(badge);
                logger.info(`Badge "${badge.name}" awarded to student ${studentId}`);
            }
        }

        if (newBadges.length > 0) {
            await student.save();
        }

        return newBadges;
    } catch (error) {
        logger.error('Error checking badges:', error);
        throw error;
    }
};

// Get student points and badges
const getStudentStats = async (req, res) => {
    try {
        const student = await Student.findOne({ user: req.user.id })
            .populate('user', 'fullName email')
            .populate('cohort', 'name');

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        // Get submission stats
        const submissions = await Submission.find({ student: student._id });
        const perfectScores = submissions.filter(s => s.grade === 100).length;
        const averageGrade = submissions.length > 0
            ? Math.round(submissions.reduce((sum, s) => sum + (s.grade || 0), 0) / submissions.length)
            : 0;

        // Get rank in cohort
        const cohortStudents = await Student.find({ cohort: student.cohort })
            .sort({ points: -1 });
        const rank = cohortStudents.findIndex(s => s._id.toString() === student._id.toString()) + 1;

        res.status(200).json({
            success: true,
            stats: {
                fullName: student.user.fullName,
                email: student.user.email,
                cohort: student.cohort?.name,
                points: student.points,
                badges: student.badges,
                coursesCompleted: student.coursesCompleted,
                totalSubmissions: submissions.length,
                perfectScores: perfectScores,
                averageGrade: averageGrade,
                rankInCohort: rank,
                totalInCohort: cohortStudents.length
            }
        });
    } catch (error) {
        logger.error('Error fetching student stats:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get leaderboard
const getLeaderboard = async (req, res) => {
    try {
        const { cohortId, limit = 50 } = req.query;

        let query = {};
        if (cohortId) {
            query.cohort = cohortId;
        }

        const students = await Student.find(query)
            .populate('user', 'fullName email')
            .populate('cohort', 'name')
            .sort({ points: -1 })
            .limit(parseInt(limit));

        const leaderboard = students.map((student, index) => ({
            rank: index + 1,
            studentId: student._id,
            fullName: student.user.fullName,
            cohort: student.cohort?.name,
            points: student.points,
            badges: student.badges.length,
            coursesCompleted: student.coursesCompleted
        }));

        res.status(200).json({
            success: true,
            count: leaderboard.length,
            leaderboard
        });
    } catch (error) {
        logger.error('Error fetching leaderboard:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get available badges
const getAvailableBadges = async (req, res) => {
    try {
        const student = await Student.findOne({ user: req.user.id });
        
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        const allBadges = Object.values(BADGES).map(badge => ({
            ...badge,
            earned: student.badges.includes(badge.name)
        }));

        const earnedCount = allBadges.filter(b => b.earned).length;
        const totalCount = allBadges.length;

        res.status(200).json({
            success: true,
            earned: earnedCount,
            total: totalCount,
            progress: Math.round((earnedCount / totalCount) * 100),
            badges: allBadges
        });
    } catch (error) {
        logger.error('Error fetching badges:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get points breakdown
const getPointsBreakdown = async (req, res) => {
    try {
        const student = await Student.findOne({ user: req.user.id });
        
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        const submissions = await Submission.find({ student: student._id })
            .populate('assignment', 'title dueDate')
            .sort({ submittedAt: -1 });

        const breakdown = {
            totalPoints: student.points,
            sources: {
                assignments: 0,
                courses: student.coursesCompleted * POINTS_CONFIG.COURSE_COMPLETE,
                badges: student.badges.length * POINTS_CONFIG.BADGE_UNLOCK,
                bonuses: 0
            },
            recentActivity: []
        };

        // Calculate assignment points
        submissions.forEach(sub => {
            let points = POINTS_CONFIG.ASSIGNMENT_SUBMIT;
            
            if (sub.grade >= 100) points += POINTS_CONFIG.ASSIGNMENT_PERFECT;
            else if (sub.grade >= 90) points += POINTS_CONFIG.ASSIGNMENT_EXCELLENT;
            else if (sub.grade >= 80) points += POINTS_CONFIG.ASSIGNMENT_GOOD;
            else if (sub.grade >= 70) points += POINTS_CONFIG.ASSIGNMENT_PASS;

            breakdown.sources.assignments += points;

            breakdown.recentActivity.push({
                type: 'assignment',
                title: sub.assignment?.title,
                points: points,
                grade: sub.grade,
                date: sub.submittedAt
            });
        });

        // Limit recent activity to last 10
        breakdown.recentActivity = breakdown.recentActivity.slice(0, 10);

        res.status(200).json({
            success: true,
            breakdown
        });
    } catch (error) {
        logger.error('Error fetching points breakdown:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Admin: Manually award points
const awardPoints = async (req, res) => {
    try {
        const { studentId, points, reason } = req.body;

        if (!studentId || !points) {
            return res.status(400).json({
                success: false,
                message: 'Student ID and points are required'
            });
        }

        const student = await Student.findById(studentId);
        
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        student.points += points;
        await student.save();

        // Check for new badges
        const newBadges = await checkAndAwardBadges(studentId);

        logger.info(`Admin awarded ${points} points to student ${studentId}. Reason: ${reason}`);

        res.status(200).json({
            success: true,
            message: 'Points awarded successfully',
            totalPoints: student.points,
            newBadges: newBadges
        });
    } catch (error) {
        logger.error('Error awarding points:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Admin: Manually award badge
const awardBadge = async (req, res) => {
    try {
        const { studentId, badgeName } = req.body;

        if (!studentId || !badgeName) {
            return res.status(400).json({
                success: false,
                message: 'Student ID and badge name are required'
            });
        }

        const student = await Student.findById(studentId);
        
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        if (student.badges.includes(badgeName)) {
            return res.status(400).json({
                success: false,
                message: 'Student already has this badge'
            });
        }

        student.badges.push(badgeName);
        student.points += POINTS_CONFIG.BADGE_UNLOCK;
        await student.save();

        logger.info(`Admin awarded badge "${badgeName}" to student ${studentId}`);

        res.status(200).json({
            success: true,
            message: 'Badge awarded successfully',
            badges: student.badges,
            points: student.points
        });
    } catch (error) {
        logger.error('Error awarding badge:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    awardPointsForSubmission,
    checkAndAwardBadges,
    getStudentStats,
    getLeaderboard,
    getAvailableBadges,
    getPointsBreakdown,
    awardPoints,
    awardBadge,
    POINTS_CONFIG,
    BADGES
};