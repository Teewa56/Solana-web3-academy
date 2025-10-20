const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

const studentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    registeredCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
    applicationVerified: { type: Boolean, default: false },
    cohort: { type: mongoose.Schema.Types.ObjectId, ref: 'Cohort' },
    points: { type: Number, default: 0 },
    coursesCompleted: { type: Number, default: 0 },
    badges: [{ type: String }],
    certificateMints: [{
        course: ObjectId,
        nftMint: String,
        txId: String,   
        mintedAt: Date
    }],
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null }
}, { timestamps: true });

studentSchema.pre(/^find/, function(next) {
    if (this.options._recursed) {
        return next();
    }
    this.where({ isDeleted: false });
    next();
});

studentSchema.index(
    { 'certificateMints.course': 1, user: 1 },
    { unique: true, sparse: true }
);

module.exports = mongoose.model('Student', studentSchema);