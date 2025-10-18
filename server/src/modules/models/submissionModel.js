const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
    assignment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment' },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    content: String,
    fileUrl: String,
    txId: String,
    passedPlagiarismCheck: { type: Boolean, default: false },
    passedAssignmentCheck: { type: Boolean, default: false },
    verifiedOwnership: { type: Boolean, default: false },
    submittedAt: { type: Date, default: Date.now },
    grade: { type: Number, default: null, min: 0, max: 100 },
    feedback: { type: String, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Submission', submissionSchema);