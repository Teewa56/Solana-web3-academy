const express = require('express');
const {
    submitAssignment,
    getSubmissions,
    gradeAssignment
} = require('../controllers/submissionController');
const { requireAdmin } = require('../../middleware/roleCheck');
const { validator, schemas } = require('../../middleware/validator');

const router = express.Router();

router.post('/submit', validator(schemas.submitAssignment), submitAssignment);
router.get('/:assignmentId', getSubmissions);
router.put('/:submissionId/grade', requireAdmin, validator(schemas.gradeAssignment), gradeAssignment);

module.exports = router;