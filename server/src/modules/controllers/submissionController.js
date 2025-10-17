const Submission = require('../models/submissionModel');
const Assignment = require('../models/assignmentModel');
const Student = require('../students/studentModel');
const solanaService = require('../../contractService/solanaService');
const plagiarismService = require('../../utils/plagiarismCheckService');
const { awardPointsForSubmission } = require('./gamificationController');
const sendEmail = require('../../utils/emailService');
const logger = require('../../utils/logger');

// Submit assignment with plagiarism check
const submitAssignment = async (req, res) => {
    try {
        const { assignmentId, content, fileUrl } = req.body;
        
        if (!assignmentId || !content) {
            return res.status(400).json({
                success: false,
                message: 'Assignment ID and content are required'
            });
        }

        const student = await Student.findOne({ user: req.user.id }).populate('user');
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        const assignment = await Assignment.findById(assignmentId).populate('course');
        if (!assignment) {
            return res.status(404).json({
                success: false,
                message: 'Assignment not found'
            });
        }

        // Check if already submitted
        const existingSubmission = await Submission.findOne({
            assignment: assignmentId,
            student: student._id
        });

        if (existingSubmission) {
            return res.status(400).json({
                success: false,
                message: 'Assignment already submitted'
            });
        }

        // Check deadline
        const now = new Date();
        const isEarly = now < new Date(assignment.dueDate);
        const isLate = now > new Date(assignment.dueDate);

        if (isLate) {
            return res.status(400).json({
                success: false,
                message: 'Assignment deadline has passed'
            });
        }

        logger.info(`Running plagiarism check for student ${student._id}`);

        // Run plagiarism check
        const plagiarismResult = await plagiarismService.checkPlagiarism(
            content,
            assignmentId,
            student._id
        );

        // Check against answer key
        const answerKeyResult = await plagiarismService.checkAgainstAnswerKey(
            content,
            assignment.answer
        );

        // Create submission
        const submission = new Submission({
            assignment: assignmentId,
            student: student._id,
            content,
            fileUrl,
            submittedAt: new Date(),
            passedPlagiarismCheck: plagiarismResult.passed,
            passedAssignmentCheck: answerKeyResult.passed,
            verifiedOwnership: false
        });

        // Submit to blockchain if student has wallet
        let blockchainTxId = null;
        if (student.user.solanaWallet && assignment.course.contractAddress) {
            try {
                const blockchainResult = await solanaService.submitAssignment(
                    student.user.solanaWallet,
                    assignment.course.contractAddress,
                    fileUrl || content.substring(0, 100)
                );
                
                submission.txId = blockchainResult.txId;
                submission.verifiedOwnership = true;
                blockchainTxId = blockchainResult.txId;
                
                logger.info(`Blockchain submission: ${blockchainResult.txId}`);
            } catch (blockchainError) {
                logger.error('Blockchain submission failed:', blockchainError);
                // Continue with off-chain submission
            }
        }

        await submission.save();

        // Add submission to assignment
        assignment.submissions.push(submission._id);
        await assignment.save();

        // Award points for submission
        const isFirst = (await Submission.countDocuments({ student: student._id })) === 1;
        await awardPointsForSubmission(student._id, 0, isEarly, isFirst);

        // Generate plagiarism report
        const plagiarismReport = plagiarismService.generateReport(plagiarismResult);

        logger.info(`Assignment submitted successfully. Submission ID: ${submission._id}`);

        res.status(201).json({
            success: true,
            message: 'Assignment submitted successfully',
            submission: {
                id: submission._id,
                submittedAt: submission.submittedAt,
                passedPlagiarismCheck: submission.passedPlagiarismCheck,
                passedAssignmentCheck: submission.passedAssignmentCheck,
                verifiedOwnership: submission.verifiedOwnership,
                blockchainTxId: blockchainTxId
            },
            plagiarismCheck: plagiarismReport,
            answerKeyMatch: {
                passed: answerKeyResult.passed,
                similarity: `${(answerKeyResult.similarity * 100).toFixed(2)}%`,
                keywordMatch: `${(answerKeyResult.keywordMatchPercentage * 100).toFixed(2)}%`
            },
            bonusPoints: {
                earlySubmission: isEarly,
                firstSubmission: isFirst
            }
        });
    } catch (error) {
        logger.error('Error submitting assignment:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get submissions for an assignment (instructor view)
const getSubmissions = async (req, res) => {
    try {
        const { assignmentId } = req.params;
        const { page = 1, limit = 20, status } = req.query;

        let query = { assignment: assignmentId };

        // Filter by status
        if (status === 'graded') {
            query.grade = { $ne: null };
        } else if (status === 'ungraded') {
            query.grade = null;
        } else if (status === 'plagiarized') {
            query.passedPlagiarismCheck = false;
        }

        const submissions = await Submission.find(query)
            .populate({
                path: 'student',
                populate: { path: 'user', select: 'fullName email' }
            })
            .populate('assignment', 'title dueDate')
            .sort({ submittedAt: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));

        const total = await Submission.countDocuments(query);

        res.status(200).json({
            success: true,
            page: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit)),
            total: total,
            count: submissions.length,
            submissions: submissions.map(sub => ({
                id: sub._id,
                studentName: sub.student?.user?.fullName,
                studentEmail: sub.student?.user?.email,
                submittedAt: sub.submittedAt,
                grade: sub.grade,
                passedPlagiarismCheck: sub.passedPlagiarismCheck,
                passedAssignmentCheck: sub.passedAssignmentCheck,
                verifiedOwnership: sub.verifiedOwnership,
                txId: sub.txId
            }))
        });
    } catch (error) {
        logger.error('Error fetching submissions:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get student's own submission
const getMySubmission = async (req, res) => {
    try {
        const { assignmentId } = req.params;

        const student = await Student.findOne({ user: req.user.id });
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        const submission = await Submission.findOne({
            assignment: assignmentId,
            student: student._id
        }).populate('assignment', 'title description dueDate');

        if (!submission) {
            return res.status(404).json({
                success: false,
                message: 'Submission not found'
            });
        }

        res.status(200).json({
            success: true,
            submission: {
                id: submission._id,
                content: submission.content,
                fileUrl: submission.fileUrl,
                submittedAt: submission.submittedAt,
                grade: submission.grade,
                passedPlagiarismCheck: submission.passedPlagiarismCheck,
                passedAssignmentCheck: submission.passedAssignmentCheck,
                verifiedOwnership: submission.verifiedOwnership,
                txId: submission.txId,
                assignment: submission.assignment
            }
        });
    } catch (error) {
        logger.error('Error fetching submission:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Grade assignment (instructor/admin)
const gradeAssignment = async (req, res) => {
    try {
        const { submissionId } = req.params;
        const { grade, feedback } = req.body;

        if (grade === undefined || grade === null) {
            return res.status(400).json({
                success: false,
                message: 'Grade is required'
            });
        }

        if (grade < 0 || grade > 100) {
            return res.status(400).json({
                success: false,
                message: 'Grade must be between 0 and 100'
            });
        }

        const submission = await Submission.findById(submissionId)
            .populate({
                path: 'student',
                populate: { path: 'user' }
            })
            .populate('assignment');

        if (!submission) {
            return res.status(404).json({
                success: false,
                message: 'Submission not found'
            });
        }

        // Grade on blockchain if applicable
        let blockchainTxId = null;
        const student = submission.student;
        const assignment = submission.assignment;

        if (student.user.solanaWallet && assignment.course) {
            try {
                const blockchainResult = await solanaService.gradeAssignment(
                    student.user.solanaWallet,
                    assignment.course.toString(),
                    grade,
                    req.user.id // instructor wallet
                );
                
                blockchainTxId = blockchainResult.txId;
                logger.info(`Blockchain grading: ${blockchainResult.txId}`);
            } catch (blockchainError) {
                logger.error('Blockchain grading failed:', blockchainError);
                // Continue with off-chain grading
            }
        }

        // Update submission
        submission.grade = grade;
        if (blockchainTxId) {
            submission.txId = blockchainTxId;
        }
        await submission.save();

        // Award points based on grade
        const wasEarly = new Date(submission.submittedAt) < new Date(assignment.dueDate);
        await awardPointsForSubmission(student._id, grade, wasEarly, false);

        // Send notification email
        await sendEmail({
            to: student.user.email,
            subject: 'Assignment Graded',
            template: 'resultNotification',
            data: {
                name: student.user.fullName,
                courseName: assignment.title,
                result: `${grade}%`
            }
        });

        logger.info(`Assignment graded: ${submissionId}, Grade: ${grade}`);

        res.status(200).json({
            success: true,
            message: 'Assignment graded successfully',
            submission: {
                id: submission._id,
                grade: submission.grade,
                blockchainTxId: blockchainTxId,
                studentPoints: student.points
            }
        });
    } catch (error) {
        logger.error('Error grading assignment:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get submission statistics for an assignment
const getSubmissionStats = async (req, res) => {
    try {
        const { assignmentId } = req.params;

        const assignment = await Assignment.findById(assignmentId);
        if (!assignment) {
            return res.status(404).json({
                success: false,
                message: 'Assignment not found'
            });
        }

        const submissions = await Submission.find({ assignment: assignmentId });

        const stats = {
            total: submissions.length,
            graded: submissions.filter(s => s.grade !== null && s.grade !== undefined).length,
            ungraded: submissions.filter(s => s.grade === null || s.grade === undefined).length,
            passedPlagiarism: submissions.filter(s => s.passedPlagiarismCheck).length,
            failedPlagiarism: submissions.filter(s => !s.passedPlagiarismCheck).length,
            passedAnswerCheck: submissions.filter(s => s.passedAssignmentCheck).length,
            blockchainVerified: submissions.filter(s => s.verifiedOwnership).length,
            averageGrade: 0,
            gradeDistribution: {
                excellent: 0, // 90-100
                good: 0,      // 80-89
                average: 0,   // 70-79
                poor: 0       // 0-69
            }
        };

        const gradedSubmissions = submissions.filter(s => s.grade !== null && s.grade !== undefined);
        if (gradedSubmissions.length > 0) {
            stats.averageGrade = Math.round(
                gradedSubmissions.reduce((sum, s) => sum + s.grade, 0) / gradedSubmissions.length
            );

            gradedSubmissions.forEach(s => {
                if (s.grade >= 90) stats.gradeDistribution.excellent++;
                else if (s.grade >= 80) stats.gradeDistribution.good++;
                else if (s.grade >= 70) stats.gradeDistribution.average++;
                else stats.gradeDistribution.poor++;
            });
        }

        res.status(200).json({
            success: true,
            assignment: {
                id: assignment._id,
                title: assignment.title,
                dueDate: assignment.dueDate
            },
            stats
        });
    } catch (error) {
        logger.error('Error fetching submission stats:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    submitAssignment,
    getSubmissions,
    getMySubmission,
    gradeAssignment,
    getSubmissionStats
};