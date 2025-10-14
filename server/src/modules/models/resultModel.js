const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    score: Number,
    grade: String,
    feedback: String,
    createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

resultSchema.index({ student: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('Result', resultSchema);