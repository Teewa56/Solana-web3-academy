const User = require('../models/userModel');
const Student = require('../students/studentModel');
const Admin = require('./adminModel');
const blacklistManager = require('../../utils/tokenBlacklistHybrid');

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.status(200).json({ success: true, users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const promoteUserToAdmin = async (req, res) => {
    try {
        const { userId } = req.body;
        
        const user = await User.findByIdAndUpdate(
            userId,
            { role: 'admin' },
            { new: true }
        ).select('-password');
        
        const admin = new Admin({
            user: userId,
            permissions: ['create_course', 'grade_assignment', 'manage_cohorts']
        });
        await admin.save();
        
        res.status(200).json({ success: true, user, admin });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const removeUser = async (req, res) => {
    try {
        const { userId } = req.body;
        
        // Revoke all tokens before removing user
        await blacklistManager.revokeUserTokens(userId, 'admin_revoke');

        await User.findByIdAndDelete(userId);
        await Student.deleteOne({ user: userId });
        
        res.status(200).json({ success: true, message: 'User removed and tokens revoked' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getAdminStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalStudents = await Student.countDocuments();
        const totalAdmins = await Admin.countDocuments();

        // Get blacklist stats
        const blacklistStats = blacklistManager.getStats();
        
        res.status(200).json({
            success: true,
            stats: {
                totalUsers,
                totalStudents,
                totalAdmins,
                tokenBlacklist: blacklistStats
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getAllUsers,
    promoteUserToAdmin,
    removeUser,
    getAdminStats
};