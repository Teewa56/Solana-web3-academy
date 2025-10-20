const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fullName: {type: String, required: true},
    email: { type: String, unique: true },
    password: {type: String},
    role: { type: String, enum: ['student', 'admin'], default: 'student' },
    profile: {
        bio: String,
        avatar: String,
    },
    isActive: { type: Boolean, default: true },
    isEmailVerified: { type: Boolean, default: false },
    isPasswordReset: { type: Boolean, default: false },
    otp: {type: String, default: null},
    otpExpires: {type: Date, default: null},
    solanaWallet: { type: String, required: false }, // User's public key
}, { timestamps: true });

userSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model('User', userSchema);