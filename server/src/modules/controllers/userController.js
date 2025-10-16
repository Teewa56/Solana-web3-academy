const User = require('../modules/models/userModel');

const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.status(200).json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { fullName, bio, avatar } = req.body;
        
        const user = await User.findByIdAndUpdate(
            req.user.id,
            {
                fullName,
                profile: { bio, avatar }
            },
            { new: true }
        ).select('-password');
        
        res.status(200).json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getProfile,
    updateProfile
};