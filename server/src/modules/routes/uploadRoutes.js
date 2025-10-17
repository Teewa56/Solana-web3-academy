const express = require('express');
const {
    uploadFileToIPFS,
    uploadCourseMedia,
    uploadCertificateMetadata,
    uploadAssignment,
    getPinnedFiles,
    unpinFile
} = require('../controllers/uploadController');
const {
    uploadSingle,
    uploadCourseMedia: uploadCourseMediaMiddleware,
    uploadAssignment: uploadAssignmentMiddleware,
    handleUploadError
} = require('../../middleware/uploadMiddleware');
const { requireAdmin } = require('../../middleware/roleCheck');

const router = express.Router();

// Upload routes
router.post('/file', uploadSingle, handleUploadError, uploadFileToIPFS);
router.post('/course-media', uploadCourseMediaMiddleware, handleUploadError, uploadCourseMedia);
router.post('/certificate-metadata', uploadCertificateMetadata);
router.post('/assignment', uploadAssignmentMiddleware, handleUploadError, uploadAssignment);

// Admin routes
router.get('/pinned-files', requireAdmin, getPinnedFiles);
router.delete('/unpin/:ipfsHash', requireAdmin, unpinFile);

module.exports = router;