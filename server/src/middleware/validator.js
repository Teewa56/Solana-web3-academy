const Joi = require('joi');

const schemas = {
    // COHORT VALIDATORS
    createCohort: Joi.object({
        name: Joi.string().required().min(3).max(100),
        description: Joi.string().required().min(10).max(500),
        startDate: Joi.date().required(),
        endDate: Joi.date().required().greater(Joi.ref('startDate'))
    }),

    updateCohort: Joi.object({
        name: Joi.string().min(3).max(100),
        description: Joi.string().min(10).max(500),
        status: Joi.string().valid('active', 'completed', 'upcoming')
    }),

    // COURSE VALIDATORS
    createCourse: Joi.object({
        title: Joi.string().required().min(3).max(200),
        description: Joi.string().required().min(10).max(1000),
        chain: Joi.string().required(),
        contractAddress: Joi.string().optional(),
        media: Joi.object({
            text: Joi.string().optional(),
            audio: Joi.string().uri().optional(),
            video: Joi.string().uri().optional()
        }),
        cohort: Joi.string().required()
    }),

    updateCourse: Joi.object({
        title: Joi.string().min(3).max(200),
        description: Joi.string().min(10).max(1000),
        chain: Joi.string(),
        contractAddress: Joi.string().optional(),
        media: Joi.object({
            text: Joi.string().optional(),
            audio: Joi.string().uri().optional(),
            video: Joi.string().uri().optional()
        })
    }),

    // ASSIGNMENT VALIDATORS
    createAssignment: Joi.object({
        title: Joi.string().required().min(3).max(200),
        description: Joi.string().required().min(10).max(1000),
        answer: Joi.string().required().min(10),
        dueDate: Joi.date().required().greater('now'),
        course: Joi.string().required()
    }),

    updateAssignment: Joi.object({
        title: Joi.string().min(3).max(200),
        description: Joi.string().min(10).max(1000),
        answer: Joi.string().min(10),
        dueDate: Joi.date().greater('now'),
        isActive: Joi.boolean()
    }),

    // SUBMISSION VALIDATORS
    submitAssignment: Joi.object({
        assignmentId: Joi.string().required(),
        content: Joi.string().required().min(10),
        fileUrl: Joi.string().uri().optional()
    }),

    gradeAssignment: Joi.object({
        grade: Joi.number().required().min(0).max(100),
        feedback: Joi.string().optional().max(500)
    })
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