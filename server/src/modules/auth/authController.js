const User = require('../models/userModel');
const Student = require('../students/studentModel');
const { generateAccessToken, generateRefreshToken } = require('../../utils/jwtHelpers');
const { hashPassword, comparePassword, generateOTP, verifyOTP } = require('../../utils/authHelpers');
const sendEmail = require('../../utils/emailService');

const register = async (req, res) => {
    try {
        const { fullName, email, password, role='student' } = req.body;
        
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
        
        await user.save();
        
        await sendEmail({
            to: email,
            subject: 'Verify Your Email',
            template: 'otpEmail',
            data: { otp }
        });
        
        res.status(201).json({ success: true, message: 'User registered. Check email for OTP.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const verifyEmail = async (req, res) => {
    try {
        const { email, otp } = req.body;
        
        const userData = User.findOne({email});
        
        if (!userData) {
            return res.status(400).json({ 
                success: false, 
                message: 'OTP expired or not found. Please register again.' 
            });
        }
        
        if (Date.now() > userData.otpExpires) {
            User.findByIdAndDelete({email});
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
        
        // Create student profile
        if(userData.role == 'student'){
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

        // Send welcome email
        await sendEmail({
            to: email,
            subject: 'Welcome to Web3 Academy!',
            template: 'welcomeEmail',
            data: { name: userData.fullName }
        });
        
        // Generate tokens
        const accessToken = generateAccessToken({ id: userData._id, role: userData.role });
        const refreshToken = generateRefreshToken({ id: userData._id });
        
        res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true });
        
        res.status(201).json({
            success: true,
            message: 'Email verified successfully',
            accessToken,
            userData: {
                id: userData._id,
                fullName: userData.fullName,
                email: userData.email,
                role: userData.role
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const resendOTP = async (req, res) => {
    try {
        const { email } = req.body;
        
        const userData = User.findOne(email);
        
        if (!userData) {
            return res.status(400).json({ 
                success: false, 
                message: 'No registration found. Please register first.' 
            });
        }
        
        const newOTP = generateOTP();
        
        // Update OTP with new expiry
        userData.otp = newOTP;
        userData.otpExpires = Date.now() + (10 * 60 * 1000);

        await userData.save();
        
        await sendEmail({
            to: email,
            subject: 'Your New OTP - Solana Web3 Academy',
            template: 'otpEmail',
            data: { otp: newOTP }
        });
        
        res.status(200).json({ 
            success: true, 
            message: 'New OTP sent to email' 
        });
    } catch (error) {
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
        res.status(500).json({ success: false, message: error.message });
    }
};

const logout = async (req, res) => {
    try {
        res.clearCookie('refreshToken');
        res.status(200).json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const refreshToken = async (req, res) => {
    try {
        const token = req.cookies.refreshToken;
        if (!token) {
            return res.status(401).json({ success: false, message: 'No refresh token' });
        }
        
        const { verifyRefreshToken } = require('../utils/jwtHelpers');
        const decoded = verifyRefreshToken(token);
        
        const user = await User.findById(decoded.id);
        const newAccessToken = generateAccessToken({ id: user._id, role: user.role });
        
        res.status(200).json({ success: true, accessToken: newAccessToken });
    } catch (error) {
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
        user.resetPasswordExpires = Date.now() + 3600000;
        await user.save();
        await sendEmail({
            to: email,
            subject: 'Reset Your Password',
            template: 'otpEmail',
            data: { otp: resetToken }
        });
        
        res.status(200).json({ success: true, message: 'Reset link sent to email' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const resetPassword = async (req, res) => {
    //this verifies the otp for reseting the password
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
        
        res.status(200).json({ success: true, message: 'Password reset successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    register,
    verifyEmail,
    resendOTP,
    login,
    logout,
    refreshToken,
    forgotPassword,
    resetPassword
};