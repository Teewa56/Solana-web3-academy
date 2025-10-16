const Submission = require('../modules/models/submissionModel');
const Assignment = require('../modules/models/assignmentModel');
const Student = require('../modules/students/studentModel');

const submitAssignment = async (req, res) => {
    try {
        const { assignmentId, content, fileUrl } = req.body;
        
        const student = await Student.findOne({ user: req.user.id });
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }
        
        const submission = new Submission({
            assignment: assignmentId,
            student: student._id,
            content,
            fileUrl,
            submittedAt: new Date()
        });
        
        await submission.save();
        
        const assignment = await Assignment.findByIdAndUpdate(
            assignmentId,
            { $push: { submissions: submission._id } }
        );
        
        res.status(201).json({ success: true, submission });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getSubmissions = async (req, res) => {
    try {
        const submissions = await Submission.find({ assignment: req.params.assignmentId })
            .populate('student')
            .populate('assignment');
        
        res.status(200).json({ success: true, submissions });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const gradeAssignment = async (req, res) => {
    try {
        const { grade, txId } = req.body;
        
        const submission = await Submission.findByIdAndUpdate(
            req.params.submissionId,
            {
                passedAssignmentCheck: true,
                txId,
                grade
            },
            { new: true }
        ).populate('student');
        
        res.status(200).json({ success: true, submission });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    submitAssignment,
    getSubmissions,
    gradeAssignment
};