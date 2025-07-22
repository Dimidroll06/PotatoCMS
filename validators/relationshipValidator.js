const Joi = require('joi');

const relationPayloadSchema = Joi.object({
    ids: Joi.array()
        .items(Joi.number().integer().min(1))
        .min(1)
        .required()
        .unique()
        .messages({
            'array.base': 'Ids must be an array of numbers',
            'array.min': 'At least one ID must be provided',
            'any.required': 'Field "ids" is required'
        })
});

const validateRelation = (req, res, next) => {
    if (!req.body) return res.status(400).json({ error: 'Body not present' });
    const { error } = relationPayloadSchema.validate(req.body, { abortEarly: false });

    if (error) {
        const messages = error.details.map(d => d.message).join(', ');
        return res.status(400).json({ error: 'Validation failed', details: messages });
    }

    next();
};

module.exports = {
    validateRelation
}
