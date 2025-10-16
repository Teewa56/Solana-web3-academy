const Course = require('./courseModel');

const createCourse = async (req, res) => {
    try {
        const { title, description, chain, contractAddress, media, cohort } = req.body;
        
        const course = new Course({
            title,
            description,
            chain,
            contractAddress,
            media,
            cohort,
            createdBy: req.user.id
        });
        
        await course.save();
        res.status(201).json({ success: true, course });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id)
            .populate('cohort')
            .populate('createdBy');
        
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }
        
        res.status(200).json({ success: true, course });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateCourse = async (req, res) => {
    try {
        const { title, description, chain, contractAddress, media } = req.body;
        
        const course = await Course.findByIdAndUpdate(
            req.params.id,
            { title, description, chain, contractAddress, media },
            { new: true }
        );
        
        res.status(200).json({ success: true, course });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const listCourses = async (req, res) => {
    try {
        const courses = await Course.find()
            .populate('cohort')
            .populate('createdBy');
        
        res.status(200).json({ success: true, courses });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getCoursesByCohort = async (req, res) => {
    try {
        const courses = await Course.find({ cohort: req.params.cohortId })
            .populate('createdBy');
        
        res.status(200).json({ success: true, courses });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    createCourse,
    getCourse,
    updateCourse,
    listCourses,
    getCoursesByCohort
};