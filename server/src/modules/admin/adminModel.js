const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    permissions: [String],
}, { timestamps: true });

module.exports = mongoose.model('Admin', adminSchema);