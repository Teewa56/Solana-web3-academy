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
const { authLimiter } = require('../../middleware/rateLimiter');

const router = express.Router();

router.post('/register', authLimiter, register);
router.post('/verify-email', authLimiter, verifyEmail);
router.post('/resend-otp', authLimiter, resendOTP);
router.post('/login', authLimiter, login);
router.post('/logout', logout);
router.post('/refresh-token', authLimiter, refreshToken);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', authLimiter, resetPassword);

module.exports = router;