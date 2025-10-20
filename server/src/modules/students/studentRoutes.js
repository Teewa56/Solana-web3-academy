const express = require('express');
const {
    getStudent,
    updateStudent,
    enrollInCohort
} = require('./studentController');
const { validator, schemas } = require('../../middleware/validator');
const router = express.Router();

router.get('/', getStudent);
router.put('/update-student', validator(schemas.updateStudent), updateStudent);
router.post('/enroll-cohort', validator(schemas.enrollCohort), enrollInCohort);

module.exports = router;