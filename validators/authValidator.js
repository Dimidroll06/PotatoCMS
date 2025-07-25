const Joi = require('joi');

const registerSchema = Joi.object({
    username: Joi.string()
        .required()
        .min(3)
        .max(20)
        .regex(/^[a-zA-Z0-9_]+$/),
    
    password: Joi.string()
        .required()
        .min(6),
    
    retype_password: Joi.ref('password')
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
        .required(),
    
    password: Joi.string()
        .required()
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