const express = require('express');
const {
    generateCertificate,
    mintNFT,
    getUserCertificates,
    verifyCertificate,
    issueCertificateToStudent
} = require('../controllers/certificateController');
const { requireAdmin } = require('../../middleware/roleCheck');
const { validator } = require('../../middleware/validator');
const Joi = require('joi');
const { certificateLimiter } = require('../../middleware/rateLimiter');

const router = express.Router();

// Validation schemas
const generateCertSchema = Joi.object({
    courseId: Joi.string().required()
});

const mintNFTSchema = Joi.object({
    courseId: Joi.string().required(),
    ipfsUrl: Joi.string().uri().required(),
    certificateData: Joi.object().required()
});

const issueCertSchema = Joi.object({
    studentId: Joi.string().required(),
    courseId: Joi.string().required(),
    grade: Joi.number().min(0).max(100).required()
});

// Student routes
router.post('/generate', certificateLimiter, validator(generateCertSchema), generateCertificate);
router.post('/mint-nft', certificateLimiter, validator(mintNFTSchema), mintNFT);
router.get('/my-certificates', getUserCertificates);

// Public verification
router.get('/verify/:nftMint', verifyCertificate);

// Admin routes
router.post('/issue', requireAdmin, validator(issueCertSchema), issueCertificateToStudent);

module.exports = router;