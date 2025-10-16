const Student = require('../students/studentModel');
const Course = require('../courses/courseModel');
const axios = require('axios');
const { contract_program_id } = require('../../config/env');

const generateCertificate = async (req, res) => {
    try {
        const { courseId, grade } = req.body;
        
        const student = await Student.findOne({ user: req.user.id }).populate('user');
        const course = await Course.findById(courseId);
        
        if (!student || !course) {
            return res.status(404).json({ success: false, message: 'Student or course not found' });
        }
        
        const certificateData = {
            studentName: student.user.fullName,
            courseName: course.title,
            grade,
            completionDate: new Date(),
            certificateId: `CERT-${student._id}-${courseId}`
        };
        
        res.status(200).json({ success: true, certificateData });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const mintNFT = async (req, res) => {
    try {
        const { courseId, studentWallet, ipfsUrl } = req.body;
        
        // Call smart contract to mint NFT
        const response = await axios.post(contract_program_id, {
            method: 'mint_certificate',
            params: {
                student: studentWallet,
                course: courseId,
                uri: ipfsUrl
            }
        });
        
        const student = await Student.findOne({ user: req.user.id });
        student.certificateMints.push({
            course: courseId,
            nftMint: response.data.mintAddress,
            txId: response.data.txId,
            mintedAt: new Date()
        });
        await student.save();
        
        res.status(200).json({ success: true, nftMint: response.data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getUserCertificates = async (req, res) => {
    try {
        const student = await Student.findOne({ user: req.user.id })
            .select('certificateMints')
            .populate('certificateMints.course');
        
        res.status(200).json({ success: true, certificates: student.certificateMints });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    generateCertificate,
    mintNFT,
    getUserCertificates
};