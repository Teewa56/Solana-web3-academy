const express = require('express');
const {
    enrollInCourse,
    enrollInCohort,
    unenrollFromCourse,
    getEnrolledCourses,
    getAvailableCourses,
    getEnrollmentStats
} = require('../controllers/enrollementController');
const { requireAdmin } = require('../../middleware/roleCheck');
const { validator } = require('../../middleware/validator');
const Joi = require('joi');

const router = express.Router();

// Validation schemas
const enrollCohortSchema = Joi.object({
    cohortId: Joi.string().required(),
    walletAddress: Joi.string().optional()
});

const enrollCourseSchema = Joi.object({
    courseId: Joi.string().required()
});

// Student routes
router.post('/enroll-cohort', validator(enrollCohortSchema), enrollInCohort);
router.post('/enroll-course', validator(enrollCourseSchema), enrollInCourse);
router.delete('/unenroll-course/:courseId', unenrollFromCourse);
router.get('/my-courses', getEnrolledCourses);
router.get('/available-courses', getAvailableCourses);

// Admin routes
router.get('/stats', requireAdmin, getEnrollmentStats);

module.exports = router;