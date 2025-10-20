const Student = require('../students/studentModel');
const Course = require('../courses/courseModel');
const Cohort = require('../cohorts/cohortModel');
const solanaService = require('../../contractService/solanaService');
const sendEmail = require('../../utils/emailService');
const logger = require('../../utils/logger');

// Enroll student in a course
const enrollInCourse = async (req, res) => {
    try {
        const { courseId } = req.body;

        const student = await Student.findOne({ user: req.user.id })
            .populate('user')
            .populate('cohort');

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student profile not found'
            });
        }

        const course = await Course.findById(courseId).populate('cohort');

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        // Check if student is in the same cohort as the course
        if (!student.cohort) {
            return res.status(400).json({
                success: false,
                message: 'You must be enrolled in a cohort first'
            });
        }

        if (student.cohort._id.toString() !== course.cohort._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'This course is not available for your cohort'
            });
        }

        // Check if already enrolled
        if (student.registeredCourses.includes(courseId)) {
            return res.status(400).json({
                success: false,
                message: 'Already enrolled in this course'
            });
        }

        // Enroll student
        student.registeredCourses.push(courseId);
        await student.save();

        // Send enrollment confirmation email
        await sendEmail({
            to: student.user.email,
            subject: 'Course Registration Successful',
            template: 'courseRegistration',
            data: {
                name: student.user.fullName,
                courseName: course.title
            }
        });

        logger.info(`Student ${student._id} enrolled in course ${courseId}`);

        res.status(200).json({
            success: true,
            message: 'Successfully enrolled in course',
            course: {
                id: course._id,
                title: course.title,
                description: course.description,
                cohort: course.cohort.name
            }
        });
    } catch (error) {
        logger.error('Error enrolling in course:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Enroll student in cohort (with blockchain enrollment)
const enrollInCohort = async (req, res) => {
    try {
        const { cohortId, walletAddress } = req.body;

        if (!cohortId) {
            return res.status(400).json({
                success: false,
                message: 'Cohort ID is required'
            });
        }

        const cohort = await Cohort.findById(cohortId);

        if (!cohort) {
            return res.status(404).json({
                success: false,
                message: 'Cohort not found'
            });
        }

        // Check cohort status
        if (cohort.status === 'completed') {
            return res.status(400).json({
                success: false,
                message: 'This cohort has already completed'
            });
        }

        let student = await Student.findOne({ user: req.user.id }).populate('user');

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student profile not found'
            });
        }

        // Check if already enrolled
        if (student.cohort && student.cohort.toString() === cohortId) {
            return res.status(400).json({
                success: false,
                message: 'Already enrolled in this cohort'
            });
        }

        // Update wallet address if provided
        if (walletAddress && !student.user.solanaWallet) {
            student.user.solanaWallet = walletAddress;
            await student.user.save();
        }

        // Enroll on blockchain if wallet is connected
        let blockchainEnrollment = null;
        if (student.user.solanaWallet) {
            try {
                // Get cohort blockchain address
                const cohortPubkey = cohort.contractAddress || cohort._id.toString();
                
                blockchainEnrollment = await solanaService.enrollStudent(
                    student.user.solanaWallet,
                    cohortPubkey
                );
                
                logger.info(`Blockchain enrollment successful: ${blockchainEnrollment.txId}`);
            } catch (blockchainError) {
                logger.error('Blockchain enrollment failed:', blockchainError);
                // If wallet is connected and blockchain fails, reject
                if (student.user.solanaWallet) {
                    return res.status(500).json({
                        success: false,
                        message: 'Blockchain enrollment failed. Please try again or contact support.',
                        error: blockchainError.message
                    });
                }
                // Only continue if no wallet was provided
            }
        }

        // Update student
        student.cohort = cohortId;
        student.applicationVerified = true;
        await student.save();

        // Add student to cohort
        if (!cohort.students.includes(student._id)) {
            cohort.students.push(student._id);
            await cohort.save();
        }

        // Send acceptance email
        await sendEmail({
            to: student.user.email,
            subject: 'Welcome to the Cohort!',
            template: 'studentAcceptance',
            data: {
                name: student.user.fullName,
                programName: cohort.name
            }
        });

        logger.info(`Student ${student._id} enrolled in cohort ${cohortId}`);

        res.status(200).json({
            success: true,
            message: 'Successfully enrolled in cohort',
            cohort: {
                id: cohort._id,
                name: cohort.name,
                description: cohort.description,
                startDate: cohort.startDate,
                endDate: cohort.endDate,
                status: cohort.status
            },
            blockchainEnrollment: blockchainEnrollment
        });
    } catch (error) {
        logger.error('Error enrolling in cohort:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Unenroll from course
const unenrollFromCourse = async (req, res) => {
    try {
        const { courseId } = req.params;

        const student = await Student.findOne({ user: req.user.id });

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        if (!student.registeredCourses.includes(courseId)) {
            return res.status(400).json({
                success: false,
                message: 'Not enrolled in this course'
            });
        }

        // Remove course
        student.registeredCourses = student.registeredCourses.filter(
            c => c.toString() !== courseId
        );
        await student.save();

        logger.info(`Student ${student._id} unenrolled from course ${courseId}`);

        res.status(200).json({
            success: true,
            message: 'Successfully unenrolled from course'
        });
    } catch (error) {
        logger.error('Error unenrolling from course:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get student's enrolled courses
const getEnrolledCourses = async (req, res) => {
    try {
        const student = await Student.findOne({ user: req.user.id })
            .populate({
                path: 'registeredCourses',
                populate: {
                    path: 'cohort',
                    select: 'name status'
                }
            });

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        res.status(200).json({
            success: true,
            count: student.registeredCourses.length,
            courses: student.registeredCourses
        });
    } catch (error) {
        logger.error('Error fetching enrolled courses:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get available courses for student's cohort
const getAvailableCourses = async (req, res) => {
    try {
        const student = await Student.findOne({ user: req.user.id })
            .populate('cohort');

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        if (!student.cohort) {
            return res.status(400).json({
                success: false,
                message: 'You must be enrolled in a cohort first'
            });
        }

        // Get all courses for student's cohort
        const courses = await Course.find({ cohort: student.cohort._id })
            .populate('createdBy', 'user');

        // Mark which courses student is enrolled in
        const coursesWithEnrollment = courses.map(course => ({
            ...course.toObject(),
            isEnrolled: student.registeredCourses.some(
                c => c.toString() === course._id.toString()
            )
        }));

        res.status(200).json({
            success: true,
            cohort: student.cohort.name,
            count: coursesWithEnrollment.length,
            courses: coursesWithEnrollment
        });
    } catch (error) {
        logger.error('Error fetching available courses:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get enrollment statistics (admin)
const getEnrollmentStats = async (req, res) => {
    try {
        const { cohortId } = req.query;

        let query = {};
        if (cohortId) {
            query.cohort = cohortId;
        }

        const totalStudents = await Student.countDocuments(query);
        const verifiedStudents = await Student.countDocuments({
            ...query,
            applicationVerified: true
        });

        // Get course enrollment counts
        const students = await Student.find(query);
        const courseEnrollments = {};

        students.forEach(student => {
            student.registeredCourses.forEach(courseId => {
                const id = courseId.toString();
                courseEnrollments[id] = (courseEnrollments[id] || 0) + 1;
            });
        });

        // Get top courses
        const courses = await Course.find(cohortId ? { cohort: cohortId } : {});
        const topCourses = courses
            .map(course => ({
                courseId: course._id,
                title: course.title,
                enrollments: courseEnrollments[course._id.toString()] || 0
            }))
            .sort((a, b) => b.enrollments - a.enrollments)
            .slice(0, 10);

        res.status(200).json({
            success: true,
            stats: {
                totalStudents,
                verifiedStudents,
                totalCourses: courses.length,
                averageEnrollmentsPerStudent: totalStudents > 0
                    ? Math.round(Object.values(courseEnrollments).reduce((a, b) => a + b, 0) / totalStudents)
                    : 0,
                topCourses
            }
        });
    } catch (error) {
        logger.error('Error fetching enrollment stats:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    enrollInCourse,
    enrollInCohort,
    unenrollFromCourse,
    getEnrolledCourses,
    getAvailableCourses,
    getEnrollmentStats
};