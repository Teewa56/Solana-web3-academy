const express = require('express');
const {
    submitAssignment,
    getSubmissions,
    gradeAssignment
} = require('../controllers/submissionController');
const { requireAdmin } = require('../../middleware/roleCheck');
const { validator, schemas } = require('../../middleware/validator');
const { submissionLimiter, gradingLimiter } = require('../../middleware/rateLimiter');

const router = express.Router();

router.post('/submit', submissionLimiter, validator(schemas.submitAssignment), submitAssignment);
router.get('/:assignmentId', getSubmissions);
router.put('/:submissionId/grade', gradingLimiter, requireAdmin, validator(schemas.gradeAssignment), gradeAssignment);

module.exports = router;