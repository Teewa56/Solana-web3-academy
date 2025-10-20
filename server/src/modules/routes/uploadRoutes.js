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
    handleUploadError,
    validateMagicBytes
} = require('../../middleware/uploadMiddleware');
const { requireAdmin } = require('../../middleware/roleCheck');

const router = express.Router();

// ADD validateMagicBytes to each route
router.post('/file', uploadSingle, validateMagicBytes, handleUploadError, uploadFileToIPFS);
router.post('/course-media', uploadCourseMediaMiddleware, validateMagicBytes, handleUploadError, uploadCourseMedia);
router.post('/certificate-metadata', uploadCertificateMetadata);
router.post('/assignment', uploadAssignmentMiddleware, validateMagicBytes, handleUploadError, uploadAssignment);

router.get('/pinned-files', requireAdmin, getPinnedFiles);
router.delete('/unpin/:ipfsHash', requireAdmin, unpinFile);

module.exports = router;