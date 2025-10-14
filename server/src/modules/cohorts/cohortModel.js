const mongoose = require('mongoose');

const cohortSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    description: String,
    startDate: Date,
    endDate: Date,
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
    courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
    status: { type: String, enum: ['active', 'completed', 'upcoming'], default: 'upcoming' },
}, { timestamps: true });

cohortSchema.index({ name: 1 });

module.exports = mongoose.model('Cohort', cohortSchema);