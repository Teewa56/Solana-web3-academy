const express = require('express');
const {
    createAssignment,
    getAssignment,
    updateAssignment,
    listAssignmentsByCourse
} = require('../controllers/assignmentController');
const { requireAdmin } = require('../../middleware/roleCheck');

const router = express.Router();

router.get('/:id', getAssignment);
router.get('/course/:courseId', listAssignmentsByCourse);

router.post('/', requireAdmin, createAssignment);
router.put('/:id', requireAdmin, updateAssignment);

module.exports = router;