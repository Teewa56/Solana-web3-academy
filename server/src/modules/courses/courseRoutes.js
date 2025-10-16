const express = require('express');
const {
    createCourse,
    getCourse,
    updateCourse,
    listCourses,
    getCoursesByCohort
} = require('../modules/courses/courseController');
const authMiddleware = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleCheck');

const router = express.Router();

router.get('/', listCourses);
router.get('/:id', getCourse);
router.get('/cohort/:cohortId', getCoursesByCohort);

router.use(authMiddleware);
router.post('/', requireAdmin, createCourse);
router.put('/:id', requireAdmin, updateCourse);

module.exports = router;