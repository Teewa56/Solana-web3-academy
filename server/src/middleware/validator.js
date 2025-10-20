const Joi = require('joi');

const schemas = {
    // COHORT VALIDATORS
    createCohort: Joi.object({
        name: Joi.string().required().min(3).max(100),
        description: Joi.string().required().min(10).max(500),
        startDate: Joi.date().required().iso(),
        endDate: Joi.date().required().greater(Joi.ref('startDate')).iso()
    }).unknown(false),

    updateCohort: Joi.object({
        name: Joi.string().min(3).max(100),
        description: Joi.string().min(10).max(500),
        status: Joi.string().valid('active', 'completed', 'upcoming')
    }).unknown(false).min(1),

    // COURSE VALIDATORS
    createCourse: Joi.object({
        title: Joi.string().required().min(3).max(200),
        description: Joi.string().required().min(10).max(1000),
        chain: Joi.string().required(),
        contractAddress: Joi.string().optional().regex(/^[a-zA-Z0-9]{32,}$/),
        media: Joi.object({
            text: Joi.string().optional().max(10000),
            audio: Joi.string().uri().optional(),
            video: Joi.string().uri().optional()
        }).optional(),
        cohort: Joi.string().required().regex(/^[0-9a-f]{24}$/)
    }).unknown(false),

    updateCourse: Joi.object({
        title: Joi.string().min(3).max(200),
        description: Joi.string().min(10).max(1000),
        chain: Joi.string(),
        contractAddress: Joi.string().optional().regex(/^[a-zA-Z0-9]{32,}$/),
        media: Joi.object({
            text: Joi.string().optional().max(10000),
            audio: Joi.string().uri().optional(),
            video: Joi.string().uri().optional()
        }).optional()
    }).unknown(false).min(1),

    // STUDENT VALIDATORS
    updateStudent: Joi.object({
        solanaWallet: Joi.string().required().length(44).regex(/^[1-9A-HJ-NP-Z]{44}$/)
    }).unknown(false),

    enrollCohort: Joi.object({
        cohortId: Joi.string().required().regex(/^[0-9a-f]{24}$/),
        walletAddress: Joi.string().optional().length(44).regex(/^[1-9A-HJ-NP-Z]{44}$/)
    }).unknown(false),

    enrollCourse: Joi.object({
        courseId: Joi.string().required().regex(/^[0-9a-f]{24}$/)
    }).unknown(false),

    // SUBMISSION VALIDATORS
    submitAssignment: Joi.object({
        assignmentId: Joi.string().required().regex(/^[0-9a-f]{24}$/),
        content: Joi.string().required().min(10).max(50000),
        fileUrl: Joi.string().uri().optional()
    }).unknown(false),

    gradeAssignment: Joi.object({
        grade: Joi.number().required().integer().min(0).max(100),
        feedback: Joi.string().optional().max(1000)
    }).unknown(false),

    // GAMIFICATION VALIDATORS
    awardPoints: Joi.object({
        studentId: Joi.string().required().regex(/^[0-9a-f]{24}$/),
        points: Joi.number().required().integer().min(1).max(10000),
        reason: Joi.string().optional().max(200)
    }).unknown(false),

    awardBadge: Joi.object({
        studentId: Joi.string().required().regex(/^[0-9a-f]{24}$/),
        badgeName: Joi.string().required().max(100)
    }).unknown(false),

    // CERTIFICATE VALIDATORS
    generateCert: Joi.object({
        courseId: Joi.string().required().regex(/^[0-9a-f]{24}$/)
    }).unknown(false),

    mintNFT: Joi.object({
        courseId: Joi.string().required().regex(/^[0-9a-f]{24}$/),
        ipfsUrl: Joi.string().required().uri().regex(/^https:\/\/gateway\.pinata\.cloud/),
        certificateData: Joi.object().required()
    }).unknown(false)
};

const validator = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const messages = error.details.map(d => d.message);
            return res.status(400).json({ 
                success: false,
                message: 'Validation error',
                errors: messages
            });
        }
        req.body = value;
        next();
    };
};

module.exports = { validator, schemas };