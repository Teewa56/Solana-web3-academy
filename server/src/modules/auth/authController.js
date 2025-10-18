const User = require('../models/userModel');
const Student = require('../students/studentModel');
const { generateAccessToken, generateRefreshToken } = require('../../utils/jwtHelpers');
const { hashPassword, comparePassword, generateOTP, verifyOTP } = require('../../utils/authHelpers');
const sendEmail = require('../../utils/emailService');
const blacklistManager = require('../../utils/tokenBlacklistHybrid');
const logger = require('../../utils/logger');

const register = async (req, res) => {
    try {
        const { fullName, email, password, role = 'student' } = req.body;
        
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email already registered' });
        }

        const hashedPassword = await hashPassword(password);
        const otp = generateOTP();
        
        const user = new User({
            fullName,
            email,
            password: hashedPassword,
            role,
            otp,
            otpExpires: Date.now() + (10 * 60 * 1000)
        });

        try {
            await sendEmail({
                to: email,
                subject: 'Verify Your Email, OTP expires in 10 minutes',
                template: 'otpEmail',
                data: { otp }
            });
        } catch (e) {
            return res.status(400).json({ success: false, message: e.message });
        }

        await user.save();
        res.status(201).json({ success: true, message: 'User registered. Check email for OTP.' });
    } catch (error) {
        logger.error('Register error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const resendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email || typeof email !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'No account found with this email. Please register first.'
            });
        }
        if (user.isEmailVerified) {
            return res.status(400).json({
                success: false,
                message: 'Email is already verified. Please login.'
            });
        }
        const newOTP = generateOTP();
        const otpExpiry = Date.now() + (10 * 60 * 1000); // 10 minutes
        user.otp = newOTP;
        user.otpExpires = otpExpiry;

        try {
            await user.save();
            logger.info(`New OTP generated for user: ${email}`);
        } catch (dbError) {
            logger.error('Error saving OTP to database:', dbError);
            return res.status(500).json({
                success: false,
                message: 'Error processing request. Please try again.'
            });
        }
        try {
            await sendEmail({
                to: email,
                subject: 'Your New OTP - Web3 Academy (Expires in 10 minutes)',
                template: 'otpEmail',
                data: { otp: newOTP }
            });

            logger.info(`OTP email sent successfully to: ${email}`);

            res.status(200).json({
                success: true,
                message: 'New OTP sent to your email. Please check your inbox.',
                data: {
                    email,
                    expiresIn: '10 minutes'
                }
            });
        } catch (emailError) {
            logger.error('Error sending OTP email:', emailError);
            user.otp = null;
            user.otpExpires = null;
            await user.save();

            return res.status(500).json({
                success: false,
                message: 'Failed to send OTP email. Please try again later.',
                error: process.env.NODE_ENV === 'development' ? emailError.message : undefined
            });
        }
    } catch (error) {
        logger.error('Resend OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error. Please try again.'
        });
    }
};


const verifyEmail = async (req, res) => {
    try {
        const { email, otp } = req.body;
        
        const userData = await User.findOne({ email });
        
        if (!userData) {
            return res.status(400).json({ 
                success: false, 
                message: 'OTP expired or not found. Please register again.' 
            });
        }
        
        if (Date.now() > userData.otpExpires) {
            await User.findByIdAndDelete(userData._id);
            return res.status(400).json({ 
                success: false, 
                message: 'OTP expired. Please register again.' 
            });
        }

        if (!verifyOTP(otp, userData.otp)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid OTP' 
            });
        }

        userData.isEmailVerified = true;
        userData.isActive = true;

        if (userData.role === 'student') {
            const student = new Student({
                user: userData._id,
                points: 0,
                coursesCompleted: 0,
                badges: []
            });
            await student.save();
        }

        userData.otp = null;
        userData.otpExpires = null;
        await userData.save();

        await sendEmail({
            to: email,
            subject: 'Welcome to Web3 Academy!',
            template: 'welcomeEmail',
            data: { name: userData.fullName }
        });

        const accessToken = generateAccessToken({ id: userData._id, role: userData.role });
        const refreshToken = generateRefreshToken({ id: userData._id });

        res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true });

        res.status(201).json({
            success: true,
            message: 'Email verified successfully',
            accessToken,
            refreshToken,
            userData: {
                id: userData._id,
                fullName: userData.fullName,
                email: userData.email,
                role: userData.role
            }
        });
    } catch (error) {
        logger.error('Verify email error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
        
        const validPassword = await comparePassword(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
        
        const accessToken = generateAccessToken({ id: user._id, role: user.role });
        const refreshToken = generateRefreshToken({ id: user._id });

        res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true });

        res.status(200).json({
            success: true,
            accessToken,
            user: { id: user._id, email: user.email, role: user.role }
        });
    } catch (error) {
        logger.error('Login error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const logout = async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        const refreshToken = req.cookies.refreshToken;

        // Get metadata
        const metadata = {
            ipAddress: req.ip,
            userAgent: req.get('user-agent')
        };

        // Blacklist access token
        if (token) {
            // Parse expiry from env (format: "15m" or just seconds)
            const accessTokenExpiry = parseTokenExpiry(process.env.ACCESS_TOKEN_EXPIRES_IN);
            await blacklistManager.addToBlacklist(
                token,
                accessTokenExpiry,
                req.user.id,
                'logout',
                metadata
            );
        }

        // Blacklist refresh token
        if (refreshToken) {
            const refreshTokenExpiry = parseTokenExpiry(process.env.REFRESH_TOKEN_EXPIRES_IN);
            await blacklistManager.addToBlacklist(
                refreshToken,
                refreshTokenExpiry,
                req.user.id,
                'logout',
                metadata
            );
        }

        res.clearCookie('refreshToken');
        res.status(200).json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
        logger.error('Logout error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const refreshToken = async (req, res) => {
    try {
        const token = req.cookies.refreshToken;
        if (!token) {
            return res.status(401).json({ success: false, message: 'No refresh token' });
        }

        // Check if token is blacklisted
        const isBlacklisted = await blacklistManager.isTokenBlacklisted(token);
        if (isBlacklisted) {
            res.clearCookie('refreshToken');
            return res.status(403).json({ success: false, message: 'Token has been revoked' });
        }

        const { verifyRefreshToken } = require('../../utils/jwtHelpers');
        const decoded = verifyRefreshToken(token);

        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const newAccessToken = generateAccessToken({ id: user._id, role: user.role });

        res.status(200).json({ success: true, accessToken: newAccessToken });
    } catch (error) {
        logger.error('Refresh token error:', error);
        res.status(403).json({ success: false, message: 'Invalid refresh token' });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const resetToken = require('crypto').randomBytes(32).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        await sendEmail({
            to: email,
            subject: 'Reset Your Password',
            template: 'resetPasswordEmail',
            data: { resetToken }
        });

        res.status(200).json({ success: true, message: 'Reset link sent to email' });
    } catch (error) {
        logger.error('Forgot password error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid or expired token' });
        }

        user.password = await hashPassword(newPassword);
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save();

        // Revoke all existing tokens on password reset
        const metadata = {
            ipAddress: req.ip,
            userAgent: req.get('user-agent')
        };

        await blacklistManager.revokeUserTokens(user._id, 'password_reset');

        res.status(200).json({ success: true, message: 'Password reset successfully' });
    } catch (error) {
        logger.error('Reset password error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Helper function to parse token expiry
function parseTokenExpiry(expiryStr) {
    if (!expiryStr) return 900; // 15 minutes default

    // Handle format like "15m", "7d", "3600"
    if (typeof expiryStr === 'string') {
        if (expiryStr.endsWith('m')) {
            return parseInt(expiryStr) * 60;
        }
        if (expiryStr.endsWith('d')) {
            return parseInt(expiryStr) * 24 * 60 * 60;
        }
        if (expiryStr.endsWith('h')) {
            return parseInt(expiryStr) * 60 * 60;
        }
    }

    return parseInt(expiryStr) || 900;
}

module.exports = {
    register,
    resendOTP,
    verifyEmail,
    login,
    logout,
    refreshToken,
    forgotPassword,
    resetPassword
};