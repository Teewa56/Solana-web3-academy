const Student = require('./studentModel');
const User = require('../models/userModel');
const Cohort = require('../cohorts/cohortModel');
const { validateSolanaAddress } = require('../../utils/solanaValidator');

const getStudent = async (req, res) => {
    try {
        const student = await Student.findOne({ user: req.user.id })
            .populate('user')
            .populate('registeredCourses')
            .populate('cohort');
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }
        res.status(200).json({ success: true, student });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateStudent = async (req, res) => {
    try {
        const { solanaWallet } = req.body;
        if (!validateSolanaAddress(solanaWallet)) {
            return res.status(400).json({ success: false, message: "Invalid Solana wallet address" });
        }
        const student = await User.findById(req.user.id);
        if(!student){
            return res.status(404).json({ success: false, message: "Student not found"})
        };
        student.solanaWallet = solanaWallet;
        await student.save();
        res.status(200).json({ success: true, student });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const enrollInCohort = async (req, res) => {
    try {
        const { cohortId } = req.body;
        const cohort = await Cohort.findById(cohortId);
        if (!cohort) {
            return res.status(404).json({ success: false, message: 'Cohort not found' });
        }
        let student = await Student.findOne({ user: req.user.id });
        if (!student) {
            student = new Student({ user: req.user.id });
        }
        student.cohort = cohortId;
        student.applicationVerified = true;
        await student.save();
        if (!cohort.students.includes(req.user.id)) {
            cohort.students.push(req.user.id);
            await cohort.save();
        }
        res.status(200).json({ success: true, message: 'Enrolled in cohort', student });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getStudent,
    updateStudent,
    enrollInCohort
};