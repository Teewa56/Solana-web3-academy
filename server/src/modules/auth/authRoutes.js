const express = require('express');
const {
    register,
    verifyEmail,
    resendOTP,
    login,
    logout,
    refreshToken,
    forgotPassword,
    resetPassword
} = require('./authController');

const router = express.Router();

router.post('/register', register);
router.post('/verify-email', verifyEmail);
router.post('/resedn-otp', resendOTP);
router.post('/login', login);
router.post('/logout', logout);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;