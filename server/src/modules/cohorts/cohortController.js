const Cohort = require('./cohortModel');

const createCohort = async (req, res) => {
    try {
        const { name, description, startDate, endDate } = req.body;

        const start = new Date(startDate);
        const end = new Date(endDate);
        
        if (end <= start) {
            return res.status(400).json({
                success: false,
                message: 'End date must be after start date'
            });
        }
        
        if (start < new Date()) {
            return res.status(400).json({
                success: false,
                message: 'Start date cannot be in the past'
            });
        }
        
        const cohort = new Cohort({
            name,
            description,
            startDate,
            endDate,
            status: 'upcoming'
        });
        
        await cohort.save();
        res.status(201).json({ success: true, cohort });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getCohort = async (req, res) => {
    try {
        const cohort = await Cohort.findById(req.params.id)
            .populate('students')
            .populate('courses');
        
        if (!cohort) {
            return res.status(404).json({ success: false, message: 'Cohort not found' });
        }
        
        res.status(200).json({ success: true, cohort });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateCohort = async (req, res) => {
    try {
        const { name, description, startDate, endDate, status } = req.body;
        
        const cohort = await Cohort.findByIdAndUpdate(
            req.params.id,
            { name, description, startDate, endDate, status },
            { new: true }
        );
        
        res.status(200).json({ success: true, cohort });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const listCohorts = async (req, res) => {
    try {
        const cohorts = await Cohort.find()
            .populate('students')
            .populate('courses');
        
        res.status(200).json({ success: true, cohorts });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getCohortStudents = async (req, res) => {
    try {
        const cohort = await Cohort.findById(req.params.id)
            .populate({
                path: 'students',
                populate: { path: 'user' }
            });
        
        res.status(200).json({ success: true, students: cohort.students });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    createCohort,
    getCohort,
    updateCohort,
    listCohorts,
    getCohortStudents
};