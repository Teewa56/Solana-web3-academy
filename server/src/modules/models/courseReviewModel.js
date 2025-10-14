const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('CourseReview', reviewSchema);