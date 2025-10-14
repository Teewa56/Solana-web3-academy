const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    registeredCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
    applicationVerified: { type: Boolean, default: false },
    cohort: { type: mongoose.Schema.Types.ObjectId, ref: 'Cohort' },
    points: { type: Number, default: 0 },
    coursesCompleted: { type: Number, default: 0 },
    badges: [{ type: String }], // e.g., ["JavaScript Basics", "Blockchain 101"]
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);