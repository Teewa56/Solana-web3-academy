const express = require('express');
const {
    createCohort,
    getCohort,
    updateCohort,
    listCohorts,
    getCohortStudents
} = require('./cohortController');
const { requireAdmin } = require('../../middleware/roleCheck');
const { validator, schemas } = require('../../middleware/validator');

const router = express.Router();

router.get('/', listCohorts);
router.get('/:id', getCohort);
router.get('/:id/students', getCohortStudents);

router.post('/', requireAdmin, validator(schemas.createCohort), createCohort);
router.put('/:id', requireAdmin, validator(schemas.updateCohort), updateCohort);

module.exports = router;