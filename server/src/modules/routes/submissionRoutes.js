const express = require('express');
const {
    submitAssignment,
    getSubmissions,
    gradeAssignment
} = require('../modules/cohorts/submissionController');
const { requireAdmin } = require('../middleware/roleCheck');

const router = express.Router();

router.post('/submit', submitAssignment);
router.get('/:assignmentId', getSubmissions);
router.put('/:submissionId/grade', requireAdmin, gradeAssignment);

module.exports = router;