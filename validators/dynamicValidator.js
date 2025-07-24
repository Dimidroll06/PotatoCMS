const Joi = require('joi');

const buildJoiSchema = (fields) => {
    const schema = {};

    fields.forEach(field => {
        let joiType;

        switch (field.type) {
            case 'string':
                joiType = Joi.string();
                break;
            case 'text':
                joiType = Joi.string();
                break;
            case 'number':
                joiType = Joi.number();
                break;
            case 'boolean':
                joiType = Joi.boolean();
                break;
            case 'date':
                joiType = Joi.date();
                break;
            case 'relation':
                // Все связи должны добавляться с помощью reltionship контроллера
                return;
            default:
                joiType = Joi.any();
        }

        if (field.required) {
            joiType = joiType.required();
        } else {
            joiType = joiType.optional().allow(null);
        }

        schema[field.name] = joiType;
    });

    return Joi.object(schema).unknown(false);
};

const getCollectionFields = async (sequelize, label) => {
    const { Collection, CollectionField } = sequelize.models;

    const collection = await Collection.findOne({
        where: { label: label.toLowerCase() },
        include: [{ model: CollectionField, as: 'fields' }]
    });

    if (!collection) return null;

    return {
        collectionName: collection.name,
        fields: collection.fields.map(f => f.toJSON())
    };
};

module.exports = { buildJoiSchema, getCollectionFields };