const mongoose = require('mongoose');
const { Schema } = mongoose;

const assignmentSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    answer: { type: String, required: true },
    dueDate: { type: Date, required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    isActive: { type: Boolean, default: true },
    submissions: [{ type: Schema.Types.ObjectId, ref: 'Submission' }],
}, { timestamps: true });

assignmentSchema.index({ title: 1, description: 1 }, { unique: true });

module.exports = mongoose.model('Assignment', assignmentSchema);