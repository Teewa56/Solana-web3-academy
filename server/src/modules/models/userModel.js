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
    solanaWallet: { type: String, required: false }, 
    
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    deleteReason: String
}, { timestamps: true });

userSchema.pre(/^find/, function(next) {
    if (this.options._recursed) {
        return next();
    }
    this.where({ isDeleted: false });
    next();
});

userSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model('User', userSchema);