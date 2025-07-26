const Joi = require('joi');

const registerSchema = Joi.object({
    username: Joi.string()
        .required()
        .min(3)
        .max(20)
        .regex(/^[a-zA-Z0-9_]+$/)
        .messages({
            'regex.base': 'Username must contain only letters, numbers, and underscores',
            'string.min': 'Username must be at least 3 characters long',
            'string.max': 'Username must be at most 20 characters long',
            'string.base': 'Username must be a string',
            'any.required': 'Username is required'
        }),
    
    password: Joi.string()
        .required()
        .min(6)
        .messages({
            'string.min': 'Password must be at least 6 characters long',
            'string.base': 'Password must be a string',
            'any.required': 'Password is required'
        }),
    
    retype_password: Joi.ref('password')
        .messages({
            'any.only': 'Passwords do not match',
            'any.required': 'Retyped password is required'
        }),
})
    .with('password', 'retype_password')
    .unknown(false);

const validateRegister = async (req, res, next) => {
    try {
        await registerSchema.validateAsync(req.body || {});
        next();
    } catch (error) {
        res.status(400).json({
            error: error.details[0].message
        });
    }
};

const loginSchema = Joi.object({
    username: Joi.string()
        .required()
        .messages({
            'string.base': 'Username must be a string',
            'any.required': 'Username is required',
        }),
    
    password: Joi.string()
        .required()
        .messages({
            'string.base': 'Password must be a string',
            'any.required': 'Password is required',
        }),
})
    .unknown(false);

const validateLogin = async (req, res, next) => {
    try {
        await loginSchema.validateAsync(req.body || {});
        next();
    } catch (error) {
        res.status(400).json({
            error: error.details[0].message
        });
    }
};

module.exports = {
    validateRegister,
    validateLogin,
};