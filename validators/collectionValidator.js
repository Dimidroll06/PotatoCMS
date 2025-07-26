const Joi = require('joi');

const fieldSchema = Joi.object({
    name: Joi.string()
        .required()
        .alphanum
        .max(50)
        .messages({
            'any.required': 'Field name is required',
            'string.base': 'Field name must be a string',
            'string.alphanum': 'Field name must be alphanumeric'
        }),

    type: Joi.string()
        .valid('string', 'text', 'boolean', 'number', 'date', 'relation')
        .required()
        .messages({
            'any.required': 'Field type is required',
            'string.base': 'Field type must be a string',
            'string.valid': 'Field type must be one of: string, text, boolean, number, date, relation'
        }),

    required: Joi.boolean().default(false),

    targetCollectionId: Joi.when('type', {
        is: 'relation',
        then: Joi.number()
            .integer()
            .min(1)
            .required()
            .messages({
                'any.required': 'Target collection ID is required',
                'number.base': 'Target collection ID must be a number',
                'number.integer': 'Target collection ID must be an integer',
                'number.min': 'Target collection ID must be greater than 0'
            }),
        otherwise: Joi.forbidden()
    })
});

const createCollectionSchema = Joi.object({
    name: Joi.string()
        .required()
        .alphanum()
        .max(50)
        .lowercase()
        .messages({
            'any.required': 'Collection name is required',
            'string.base': 'Collection name must be a string',
            'string.alphanum': 'Collection name must be alphanumeric',
            'string.max': 'Collection name must be less than 50 characters'
        }),

    label: Joi.string()
        .alphanum()
        .min(3)
        .max(100)
        .required()
        .messages({
            'any.required': 'Collection label is required',
            'string.base': 'Collection label must be a string',
            'string.alphanum': 'Collection label must be alphanumeric',
            'string.max': 'Collection label must be less than 100 characters',
            'string.min': 'Collection label must be at least 3 characters'
        }),

    fields: Joi.array()
        .items(fieldSchema)
        .min(1)
        .unique('name')
        .required()
        .messages({
            'any.required': 'Fields array is required',
            'array.min': 'Fields array must contain at least 1 item',
            'array.unique': 'Fields array must not contain duplicate field names'
        })
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
        .required()
        .messages({
            'any.required': 'Collection label is required',
            'string.base': 'Collection label must be a string',
            'string.alphanum': 'Collection label must be alphanumeric',
            'string.max': 'Collection label must be less than 100 characters',
            'string.min': 'Collection label must be at least 3 characters'
        }),

    fields: Joi.array()
        .items(fieldSchema)
        .min(1)
        .unique('name')
        .required()
        .messages({
            'array.min': 'Fields array must contain at least 1 item',
            'array.unique': 'Fields array must not contain duplicate field names',
            'any.required': 'Fields array is required'
        })
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
