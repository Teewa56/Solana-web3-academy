const Assignment = require('../models/assignmentModel');

const createAssignment = async (req, res) => {
    try {
        const { title, description, answer, dueDate, course } = req.body;
        
        const assignment = new Assignment({
            title,
            description,
            answer,
            dueDate,
            course,
            isActive: true
        });
        
        await assignment.save();
        res.status(201).json({ success: true, assignment });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getAssignment = async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id)
            .populate('course')
            .populate('submissions');
        
        if (!assignment) {
            return res.status(404).json({ success: false, message: 'Assignment not found' });
        }
        
        res.status(200).json({ success: true, assignment });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateAssignment = async (req, res) => {
    try {
        const { title, description, answer, dueDate, isActive } = req.body;
        
        const assignment = await Assignment.findByIdAndUpdate(
            req.params.id,
            { title, description, answer, dueDate, isActive },
            { new: true }
        );
        
        res.status(200).json({ success: true, assignment });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const listAssignmentsByCourse = async (req, res) => {
    try {
        const assignments = await Assignment.find({ course: req.params.courseId });
        
        res.status(200).json({ success: true, assignments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    createAssignment,
    getAssignment,
    updateAssignment,
    listAssignmentsByCourse
};