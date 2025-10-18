const Student = require('../students/studentModel');
const Course = require('../courses/courseModel');
const Submission = require('../models/submissionModel');
const solanaService = require('../../contractService/solanaService');
const sendEmail = require('../../utils/emailService');
const logger = require('../../utils/logger');

// Generate certificate metadata
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

        // FIX: Verify student is enrolled in course's cohort
        if (!student.cohort || student.cohort._id.toString() !== course.cohort._id.toString()) {
            return res.status(403).json({ 
                success: false, 
                message: 'Student not enrolled in this course cohort' 
            });
        }

        // FIX: Verify student has completed course (graded assignments)
        const submissions = await Submission.find({
            student: student._id,
            assignment: { $in: await Assignment.find({ course: courseId }).select('_id') }
        });

        if (submissions.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'No graded assignments found for this course' 
            });
        }

        const grades = submissions
            .filter(s => s.grade !== null && s.grade !== undefined)
            .map(s => s.grade);

        if (grades.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Not all assignments have been graded' 
            });
        }

        const averageGrade = Math.round(grades.reduce((a, b) => a + b, 0) / grades.length);

        // FIX: Enforce minimum passing grade (70%)
        if (averageGrade < 70) {
            return res.status(400).json({ 
                success: false, 
                message: `Insufficient grade: ${averageGrade}%. Minimum required: 70%` 
            });
        }

        // FIX: Check certificate not already issued
        const existingCert = student.certificateMints.find(
            cert => cert.course.toString() === courseId
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
            issuer: 'RAY Academy',
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

// Mint NFT certificate on Solana
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

        // Check if student has Solana wallet
        if (!student.user.solanaWallet) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please connect your Solana wallet first' 
            });
        }

        // Check if already minted
        const existingCert = student.certificateMints.find(
            cert => cert.course.toString() === courseId
        );

        if (existingCert) {
            return res.status(400).json({ 
                success: false, 
                message: 'Certificate already minted',
                nftMint: existingCert.nftMint
            });
        }

        // Prepare NFT metadata
        const metadata = {
            name: `${course.title} Certificate`,
            symbol: 'W3ACERT',
            uri: ipfsUrl,
            sellerFeeBasisPoints: 0,
            creators: [
                {
                    address: solanaService.wallet.publicKey.toBase58(),
                    verified: true,
                    share: 100
                }
            ]
        };

        // Mint NFT on Solana
        logger.info(`Minting certificate NFT for student: ${student.user.solanaWallet}`);
        
        const mintResult = await solanaService.mintCertificate(
            student.user.solanaWallet,
            course.contractAddress || courseId,
            metadata
        );

        // Save certificate mint info
        student.certificateMints.push({
            course: courseId,
            nftMint: mintResult.mintAddress,
            txId: mintResult.txId,
            mintedAt: new Date(),
            metadataUri: ipfsUrl
        });

        // Update student stats
        student.coursesCompleted += 1;
        student.points += 100; // Award 100 points for course completion
        
        // Award completion badge
        const badgeName = `${course.title} Master`;
        if (!student.badges.includes(badgeName)) {
            student.badges.push(badgeName);
        }

        await student.save();

        // Send certificate email
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

        logger.info(`Certificate minted successfully: ${mintResult.mintAddress}`);

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