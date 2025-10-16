const express = require('express');
const {
    getStudent,
    updateStudent,
    enrollInCohort
} = require('../modules/students/studentController');

const router = express.Router();

router.get('/', getStudent);
router.put('/update-student', updateStudent);
router.post('/enroll-cohort', enrollInCohort);

module.exports = router;