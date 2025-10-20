const express = require('express');
const {
    createCourse,
    getCourse,
    updateCourse,
    listCourses,
    getCoursesByCohort
} = require('./courseController');
const { requireAdmin } = require('../../middleware/roleCheck');
const { validator, schemas } = require('../../middleware/validator');

const router = express.Router();

router.get('/', listCourses);
router.get('/:id', getCourse);
router.get('/cohort/:cohortId', getCoursesByCohort);

router.post('/', requireAdmin, validator(schemas.createCourse), createCourse);
router.put('/:id', requireAdmin, validator(schemas.updateCourse), updateCourse);

module.exports = router;