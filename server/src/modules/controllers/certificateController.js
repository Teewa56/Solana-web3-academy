const Student = require('../students/studentModel');
const Course = require('../courses/courseModel');
const Submission = require('../models/submissionModel');
const solanaService = require('../../contractService/solanaService');
const sendEmail = require('../../utils/emailService');
const logger = require('../../utils/logger');
const mongoose = require('mongoose');

const generateCertificate = async (req, res) => {
    try {
        const { courseId } = req.body;
        
        const student = await Student.findOne({ user: req.user.id })
            .populate('user')
            .populate('cohort');
        const course = await Course.findById(courseId).populate('cohort');
        
        if (!student || !course) {
            return res.status(404).json({ 
                success: false, 
                message: 'Student or course not found' 
            });
        }

        // Verify student is in cohort
        if (!student.cohort || student.cohort._id.toString() !== course.cohort._id.toString()) {
            return res.status(403).json({ 
                success: false, 
                message: 'Student not enrolled in this course cohort' 
            });
        }

        // ADD THIS - Verify student actually submitted
        const studentSubmissions = await Submission.find({
            student: student._id,
            assignment: { $in: await Assignment.find({ course: courseId }).select('_id') }
        });

        if (studentSubmissions.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'No submissions found. You must submit assignments to earn a certificate.' 
            });
        }

        // ADD THIS - Verify student completed course timeline
        const now = new Date();
        if (course.cohort.endDate && now < new Date(course.cohort.endDate)) {
            return res.status(400).json({ 
                success: false, 
                message: `Course not yet completed. Completion date: ${course.cohort.endDate.toDateString()}`
            });
        }

        // ADD THIS - Verify all assignments submitted (not just graded)
        const allCourseAssignments = await Assignment.find({ course: courseId });
        const submissionAssignmentIds = new Set(
            studentSubmissions.map(s => s.assignment.toString())
        );

        const missingSubmissions = allCourseAssignments.filter(
            a => !submissionAssignmentIds.has(a._id.toString())
        );

        if (missingSubmissions.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: `${missingSubmissions.length} assignment(s) not submitted`
            });
        }

        // Get grades with full verification
        const submissions = await Submission.find({
            assignment: { $in: allCourseAssignments.map(a => a._id) },
            student: student._id
        }).populate('assignment');

        const gradesMap = new Map();
        submissions.forEach(sub => {
            if (sub.grade !== null && sub.grade !== undefined) {
                gradesMap.set(sub.assignment._id.toString(), sub.grade);
            }
        });

        // Verify all assignments graded
        const ungradedAssignments = allCourseAssignments.filter(
            a => !gradesMap.has(a._id.toString())
        );

        if (ungradedAssignments.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: `${ungradedAssignments.length} assignments not yet graded` 
            });
        }

        const grades = Array.from(gradesMap.values());
        const averageGrade = Math.round(grades.reduce((a, b) => a + b, 0) / grades.length);

        // Enforce minimum passing grade
        if (averageGrade < 70) {
            return res.status(400).json({ 
                success: false, 
                message: `Insufficient grade: ${averageGrade}%. Minimum required: 70%` 
            });
        }

        // Check certificate not already issued
        const existingCert = student.certificateMints.find(
            cert => cert.course.toString() === courseId && cert.txId
        );

        if (existingCert) {
            return res.status(400).json({ 
                success: false, 
                message: 'Certificate already issued for this course'
            });
        }

        const certificateData = {
            studentName: student.user.fullName,
            studentEmail: student.user.email,
            courseName: course.title,
            cohortName: student.cohort.name,
            grade: averageGrade,
            completionDate: new Date().toISOString(),
            certificateId: `CERT-${student._id}-${courseId}`,
            issuer: 'Web3 Academy',
            blockchain: 'Solana'
        };
        
        res.status(200).json({ 
            success: true, 
            certificateData,
            message: 'Certificate data generated. Proceed to mint NFT.'
        });
    } catch (error) {
        logger.error('Error generating certificate:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const mintNFT = async (req, res) => {
    try {
        const { courseId, ipfsUrl, certificateData } = req.body;
        
        if (!ipfsUrl || !certificateData) {
            return res.status(400).json({ 
                success: false, 
                message: 'IPFS URL and certificate data required' 
            });
        }

        const student = await Student.findOne({ user: req.user.id }).populate('user');
        const course = await Course.findById(courseId);
        
        if (!student || !course) {
            return res.status(404).json({ 
                success: false, 
                message: 'Student or course not found' 
            });
        }

        // ADD THIS - Check if already minting
        const existingCert = student.certificateMints.find(
            cert => cert.course.toString() === courseId
        );

        if (existingCert) {
            if (existingCert.txId) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Certificate already minted',
                    nftMint: existingCert.nftMint
                });
            } else {
                // In progress, wait
                return res.status(409).json({
                    success: false,
                    message: 'Certificate minting in progress'
                });
            }
        }

        if (!student.user.solanaWallet) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please connect your Solana wallet first' 
            });
        }

        // ADD PENDING ENTRY
        student.certificateMints.push({
            course: courseId,
            nftMint: null,  // Will be filled after blockchain
            txId: null,
            mintedAt: new Date(),
            metadataUri: null
        });
        await student.save();

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const mintResult = await solanaService.mintCertificate(
                student.user.solanaWallet,
                course.contractAddress || courseId,
                metadata
            );

            // Update with actual values
            const certIndex = student.certificateMints.findIndex(
                c => c.course.toString() === courseId && !c.txId
            );
            
            if (certIndex !== -1) {
                student.certificateMints[certIndex].nftMint = mintResult.mintAddress;
                student.certificateMints[certIndex].txId = mintResult.txId;
                student.certificateMints[certIndex].metadataUri = ipfsUrl;
            }

            student.coursesCompleted += 1;
            student.points += 100;
            
            const badgeName = `${course.title} Master`;
            if (!student.badges.includes(badgeName)) {
                student.badges.push(badgeName);
            }

            await student.save({ session });
            await session.commitTransaction();

            await sendEmail({
                to: student.user.email,
                subject: 'Congratulations! Your Certificate is Ready',
                template: 'certificateTemplate',
                data: {
                    fullName: student.user.fullName,
                    cohortName: certificateData.cohortName,
                    completionDate: certificateData.completionDate,
                    grade: certificateData.grade,
                    issueDate: new Date().toLocaleDateString()
                }
            });

            res.status(200).json({ 
                success: true, 
                message: 'Certificate NFT minted successfully',
                nftMint: mintResult.mintAddress,
                txId: mintResult.txId,
                explorerUrl: `https://explorer.solana.com/tx/${mintResult.txId}?cluster=devnet`,
                points: student.points,
                badges: student.badges
            });

        } catch (error) {
            await session.abortTransaction();
            
            // Remove pending entry on failure
            student.certificateMints = student.certificateMints.filter(
                c => !(c.course.toString() === courseId && !c.txId)
            );
            await student.save();
            
            logger.error('Certificate minting failed:', error);
            res.status(500).json({ success: false, message: error.message });
        } finally {
            await session.endSession();
        }
    } catch (error) {
        logger.error('Error minting NFT:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all certificates for a user
const getUserCertificates = async (req, res) => {
    try {
        const student = await Student.findOne({ user: req.user.id })
            .select('certificateMints')
            .populate('certificateMints.course');
        
        if (!student) {
            return res.status(404).json({ 
                success: false, 
                message: 'Student not found' 
            });
        }

        const certificates = student.certificateMints.map(cert => ({
            course: cert.course,
            nftMint: cert.nftMint,
            txId: cert.txId,
            mintedAt: cert.mintedAt,
            metadataUri: cert.metadataUri,
            explorerUrl: `https://explorer.solana.com/address/${cert.nftMint}?cluster=devnet`
        }));

        res.status(200).json({ 
            success: true, 
            count: certificates.length,
            certificates 
        });
    } catch (error) {
        logger.error('Error fetching certificates:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Verify certificate authenticity
const verifyCertificate = async (req, res) => {
    try {
        const { nftMint } = req.params;
        
        // Find student with this NFT mint
        const student = await Student.findOne({
            'certificateMints.nftMint': nftMint
        })
        .populate('user')
        .populate('certificateMints.course');

        if (!student) {
            return res.status(404).json({ 
                success: false, 
                message: 'Certificate not found' 
            });
        }

        const certificate = student.certificateMints.find(
            cert => cert.nftMint === nftMint
        );

        res.status(200).json({
            success: true,
            verified: true,
            certificate: {
                studentName: student.user.fullName,
                courseName: certificate.course.title,
                mintedAt: certificate.mintedAt,
                nftMint: certificate.nftMint,
                txId: certificate.txId,
                explorerUrl: `https://explorer.solana.com/address/${certificate.nftMint}?cluster=devnet`
            }
        });
    } catch (error) {
        logger.error('Error verifying certificate:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Admin: Issue certificate to student
const issueCertificateToStudent = async (req, res) => {
    try {
        const { studentId, courseId, grade } = req.body;

        const student = await Student.findById(studentId).populate('user');
        const course = await Course.findById(courseId);

        if (!student || !course) {
            return res.status(404).json({ 
                success: false, 
                message: 'Student or course not found' 
            });
        }

        if (grade < 70) {
            return res.status(400).json({ 
                success: false, 
                message: 'Grade must be at least 70% to issue certificate' 
            });
        }

        // Check if already issued
        const existingCert = student.certificateMints.find(
            cert => cert.course.toString() === courseId
        );

        if (existingCert) {
            return res.status(400).json({ 
                success: false, 
                message: 'Certificate already issued' 
            });
        }

        res.status(200).json({
            success: true,
            message: 'Certificate ready to be minted',
            studentWallet: student.user.solanaWallet,
            nextStep: 'Upload metadata to IPFS and call /mint-nft endpoint'
        });
    } catch (error) {
        logger.error('Error issuing certificate:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    generateCertificate,
    mintNFT,
    getUserCertificates,
    verifyCertificate,
    issueCertificateToStudent
};