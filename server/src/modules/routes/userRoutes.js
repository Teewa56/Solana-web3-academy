const express = require('express');
const { getProfile, updateProfile } = require('../modules/users/userController');

const router = express.Router();

router.get('/profile', getProfile);
router.put('/update-profile', updateProfile);

module.exports = router;