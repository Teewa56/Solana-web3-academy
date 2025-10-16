const express = require('express');
const {
    register,
    login,
    logout,
    refreshToken,
    forgotPassword,
    resetPassword
} = require('../auth/authController');

const router = express.Router();

router.post('/register', register);
//verify email route can be added later
router.post('/login', login);
router.post('/logout', logout);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;