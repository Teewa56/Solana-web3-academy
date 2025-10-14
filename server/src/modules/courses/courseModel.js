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
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
}, { timestamps: true });

courseSchema.index({ chain: 1, title: 1, description: 1 });

module.exports = mongoose.model('Course', courseSchema);