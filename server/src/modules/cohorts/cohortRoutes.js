const express = require('express');
const {
    createCohort,
    getCohort,
    updateCohort,
    listCohorts,
    getCohortStudents
} = require('../cohorts/cohortController');
const { requireAdmin } = require('../middleware/roleCheck');

const router = express.Router();

router.get('/', listCohorts);
router.get('/:id', getCohort);
router.get('/:id/students', getCohortStudents);

router.post('/', requireAdmin, createCohort);
router.put('/:id', requireAdmin, updateCohort);

module.exports = router;