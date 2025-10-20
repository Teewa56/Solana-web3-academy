const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    title: String,
    description: String,
    chain: String,
    contractAddress: String,
    //audio and video links will be stored in IPFS
    media: {
        text: String,
        audio: String,
        video: String,
    },
    cohort: mongoose.Schema.Types.ObjectId,

    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
}, { timestamps: true });

courseSchema.pre(/^find/, function(next) {
    if (this.options._recursed) {
        return next();
    }
    this.where({ isDeleted: false });
    next();
});

courseSchema.index({ chain: 1, title: 1, description: 1 });

module.exports = mongoose.model('Course', courseSchema);