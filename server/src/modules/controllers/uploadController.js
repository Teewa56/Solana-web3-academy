const ipfsService = require('../../contractService/ipfsService');
const { cleanupFile } = require('../../middleware/uploadMiddleware');
const logger = require('../../utils/logger');

// Upload single file to IPFS
const uploadFileToIPFS = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        const result = await ipfsService.uploadFile(
            req.file.path,
            req.file.originalname
        );

        // Cleanup local file after upload
        cleanupFile(req.file.path);

        res.status(200).json({
            success: true,
            message: 'File uploaded to IPFS successfully',
            data: result
        });
    } catch (error) {
        // Cleanup file on error
        if (req.file) {
            cleanupFile(req.file.path);
        }
        logger.error('Error uploading file to IPFS:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Upload course media (video/audio) to IPFS
const uploadCourseMedia = async (req, res) => {
    try {
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No files uploaded'
            });
        }

        const { courseTitle } = req.body;
        if (!courseTitle) {
            return res.status(400).json({
                success: false,
                message: 'Course title is required'
            });
        }

        const results = {};

        // Upload video if present
        if (req.files.video && req.files.video[0]) {
            const videoFile = req.files.video[0];
            results.video = await ipfsService.uploadCourseMedia(
                videoFile.path,
                courseTitle,
                'video'
            );
            cleanupFile(videoFile.path);
        }

        // Upload audio if present
        if (req.files.audio && req.files.audio[0]) {
            const audioFile = req.files.audio[0];
            results.audio = await ipfsService.uploadCourseMedia(
                audioFile.path,
                courseTitle,
                'audio'
            );
            cleanupFile(audioFile.path);
        }

        res.status(200).json({
            success: true,
            message: 'Course media uploaded successfully',
            data: results
        });
    } catch (error) {
        // Cleanup files on error
        if (req.files) {
            Object.values(req.files).forEach(fileArray => {
                fileArray.forEach(file => cleanupFile(file.path));
            });
        }
        logger.error('Error uploading course media:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Upload certificate metadata to IPFS
const uploadCertificateMetadata = async (req, res) => {
    try {
        const { certificateData } = req.body;

        if (!certificateData) {
            return res.status(400).json({
                success: false,
                message: 'Certificate data is required'
            });
        }

        const result = await ipfsService.uploadCertificateMetadata(certificateData);

        res.status(200).json({
            success: true,
            message: 'Certificate metadata uploaded successfully',
            data: result
        });
    } catch (error) {
        logger.error('Error uploading certificate metadata:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Upload assignment submission
const uploadAssignment = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No assignment file uploaded'
            });
        }

        const { assignmentId, studentId } = req.body;

        if (!assignmentId) {
            cleanupFile(req.file.path);
            return res.status(400).json({
                success: false,
                message: 'Assignment ID is required'
            });
        }

        const fileName = `assignment-${assignmentId}-${studentId || 'student'}-${Date.now()}`;
        
        const result = await ipfsService.uploadFile(
            req.file.path,
            fileName
        );

        // Cleanup local file
        cleanupFile(req.file.path);

        res.status(200).json({
            success: true,
            message: 'Assignment uploaded successfully',
            data: result
        });
    } catch (error) {
        if (req.file) {
            cleanupFile(req.file.path);
        }
        logger.error('Error uploading assignment:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get all pinned files
const getPinnedFiles = async (req, res) => {
    try {
        const result = await ipfsService.getPinnedFiles();

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        logger.error('Error fetching pinned files:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Unpin file from IPFS
const unpinFile = async (req, res) => {
    try {
        const { ipfsHash } = req.params;

        if (!ipfsHash) {
            return res.status(400).json({
                success: false,
                message: 'IPFS hash is required'
            });
        }

        const result = await ipfsService.unpinFile(ipfsHash);

        res.status(200).json({
            success: true,
            message: 'File unpinned successfully',
            data: result
        });
    } catch (error) {
        logger.error('Error unpinning file:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    uploadFileToIPFS,
    uploadCourseMedia,
    uploadCertificateMetadata,
    uploadAssignment,
    getPinnedFiles,
    unpinFile
};