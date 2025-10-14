const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
    assignment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment' },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    content: String,
    fileUrl: String,
    txId: String, // Blockchain transaction ID
    passedPlagiarismCheck: { type: Boolean, default: false },
    passedAssignmentCheck: { type: Boolean, default: false },
    verifiedOwnership: { type: Boolean, default: false }, // Blockchain-backed?
    submittedAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Submission', submissionSchema);