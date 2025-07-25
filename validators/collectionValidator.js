const Joi = require('joi');

const fieldSchema = Joi.object({
    name: Joi.string()
        .required()
        .alphanum
        .message('Field name must be alphanumeric and start with a letter')
        .max(50),

    type: Joi.string()
        .valid('string', 'text', 'boolean', 'number', 'date', 'relation')
        .required(),

    required: Joi.boolean().default(false),

    targetCollectionId: Joi.when('type', {
        is: 'relation',
        then: Joi.number().integer().min(1).required(),
        otherwise: Joi.forbidden()
    })
});

const createCollectionSchema = Joi.object({
    name: Joi.string()
        .required()
        .alphanum()
        .message('Collection name must be alphanumeric and start with a letter')
        .max(50)
        .lowercase(),

    label: Joi.string()
        .alphanum()
        .min(3)
        .max(100)
        .required(),

    fields: Joi.array()
        .items(fieldSchema)
        .min(1)
        .unique('name')
        .required()
});

const validateCreateCollection = (req, res, next) => {
    if (!req.body) return res.status(400).json({ error: 'Body not present' });
    const { error } = createCollectionSchema.validate(req.body, { abortEarly: false });

    if (error) {
        const messages = error.details.map(d => d.message).join(', ');
        return res.status(400).json({ error: 'Validation failed', details: messages });
    }

    next();
};

const updateCollectionSchema = Joi.object({
    label: Joi.string()
        .alphanum()
        .min(3)
        .max(100)
        .required(),

    fields: Joi.array()
        .items(fieldSchema)
        .min(1)
        .unique('name')
        .required()
});

const validateUpdateCollection = (req, res, next) => {
    if (!req.body) return res.status(400).json({ error: 'Body not present' });
    const { error } = updateCollectionSchema.validate(req.body, { abortEarly: false });

    if (error) {
        const messages = error.details.map(d => d.message).join(', ');
        return res.status(400).json({ error: 'Validation failed', details: messages });
    }

    next();
};

module.exports = {
    validateCreateCollection,
    validateUpdateCollection,
}
