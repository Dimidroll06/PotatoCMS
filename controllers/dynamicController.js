const { Op, DataTypes } = require('sequelize');
const { buildJoiSchema, getCollectionFields } = require('../validators/dynamicValidator');

const defineModel = (sequelize, collection) => {
    const attributes = {};

    collection.fields.forEach(field => {
        const typeMap = {
            string: DataTypes.STRING,
            text: DataTypes.TEXT,
            boolean: DataTypes.BOOLEAN,
            number: DataTypes.FLOAT,
            date: DataTypes.DATE,
            relation: DataTypes.INTEGER
        };

        attributes[field.name] = {
            type: typeMap[field.type] || DataTypes.STRING,
            allowNull: !field.required,
            defaultValue: field.defaultValue || undefined
        };
    });

    const Model = sequelize.define(collection.name, attributes, {
        tableName: collection.name,
        timestamps: true,
        underscored: false,
        paranoid: false
    });

    return Model;
};

const getModelOr404 = async (sequelize, label, res) => {
    const { Collection, CollectionField } = sequelize.models;

    const collection = await Collection.findOne({
        where: { label: label.toLowerCase() },
        include: [{ model: CollectionField, as: 'fields' }]
    });

    if (!collection) {
        res.status(404).json({ error: `Collection "${label}" not found` });
        return null;
    }

    const modelName = collection.name;

    if (!sequelize.isDefined(modelName)) {
        const model = defineModel(sequelize, collection);
    }

    const model = sequelize.model(modelName);
    return model;
};

const addRelations = async (sequelize, collectionName, item, fieldsToPopulate, options = {}) => {
    const { Relationship, Collection } = sequelize.models;
    const { locale } = options;
    const result = {};

    for (const field of fieldsToPopulate) {
        const relationships = await Relationship.findAll({
            where: {
                fromCollection: collectionName,
                fromId: item.id,
                field
            }
        });

        if (relationships.length === 0) {
            result[field] = [];
            continue;
        }

        const targetIds = relationships.map(r => r.toId);
        const targetCollectionName = relationships[0].toCollection;

        if (!sequelize.isDefined(targetCollectionName)) {
            const targetCollection = await Collection.findOne({
                where: { name: targetCollectionName },
                include: [{ model: sequelize.model('CollectionField'), as: 'fields' }]
            });

            if (!targetCollection) {
                result[field] = [];
                continue;
            }

            const model = defineModel(sequelize, targetCollection);
        }

        const TargetModel = sequelize.model(targetCollectionName);
        const relatedItems = await TargetModel.findAll({
            where: { id: targetIds }
        });

        const enrichedItems = await Promise.all(
            relatedItems.map(async (relatedItems) => {
                let data = relatedItems.toJSON();

                if (locale) {
                    const localized = await getLocalizedFields(sequelize, targetCollectionName, relatedItems.id, locale);
                    if (Object.keys(localized).length > 0) {
                        data.i18n = localized;
                    }
                }

                return data;
            })
        );

        result[field] = enrichedItems;
    }

    return result;
};

const getLocalizedFields = async (sequelize, collectionName, entryId, locale) => {
    const { Translation } = sequelize.models;

    const translations = await Translation.findAll({
        where: {
            collectionName,
            entryId,
            locale
        }
    });

    const localized = {};
    translations.forEach(t => {
        localized[t.field] = t.value;
    });

    return localized;
};

const getAll = async (req, res) => {
    const { label } = req.params;
    const { populate, locale } = req.query;
    const sequelize = req.app.get('sequelize');

    try {
        const Model = await getModelOr404(sequelize, label, res);
        if (!Model) return;

        const fieldsToPopulate = populate ? populate.split(',').map(s => s.trim()) : [];

        const items = await Model.findAll();

        const enrichedItems = await Promise.all(
            items.map(async (item) => {
                let data = item.toJSON();

                if (fieldsToPopulate.length > 0) {
                    const relations = await addRelations(sequelize, Model.name, item, fieldsToPopulate, { locale });
                    data = { ...data, ...relations };
                }

                if (locale) {
                    const localized = await getLocalizedFields(sequelize, Model.name, item.id, locale);
                    if (Object.keys(localized).length > 0) {
                        data.i18n = localized;
                    }
                }

                return data;
            })
        );

        return res.json(enrichedItems);

    } catch (error) {
        console.log(error)
        res.status(500).json({ error: error.message });
    }
};

const getById = async (req, res) => {
    const { label, id } = req.params;
    const { populate, locale } = req.query;
    const sequelize = req.app.get('sequelize');

    try {
        const Model = await getModelOr404(sequelize, label, res);
        if (!Model) return;

        const item = await Model.findByPk(id);
        if (!item) {
            return res.status(404).json({ error: 'Item not found' });
        }

        const fieldsToPopulate = populate ? populate.split(',').map(s => s.trim()) : [];
        let responseData = item.toJSON();

        if (fieldsToPopulate.length > 0) {
            const relations = await addRelations(sequelize, Model.name, item, fieldsToPopulate, { locale });
            responseData = { ...responseData, ...relations };
        }

        if (locale) {
            const localized = await getLocalizedFields(sequelize, Model.name, item.id, locale);
            if (Object.keys(localized).length > 0) {
                responseData.i18n = localized;
            }
        }

        res.json(responseData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const translate = async (req, res) => {
    const { label, id } = req.params;
    const { locale, ...fields } = req.body;
    const sequelize = req.app.get('sequelize');
    const { Translation } = sequelize.models;
    const transaction = await sequelize.transaction();

    if (!locale) {
        return res.status(400).json({
            error: "Locale is required"
        });
    }

    try {
        const collectionData = await getCollectionFields(sequelize, label);
        if (!collectionData) {
            return res.status(404).json({ error: 'Collection not found' });
        }

        const i18nFields = collectionData.fields
            .filter(f => f.localized)
            .map(f => f.name);

        for (const [field, value] of Object.entries(fields)) {
            if (!i18nFields.includes(field)) continue;
            if (typeof value !== 'string') continue;

            await Translation.upsert({
                collectionName: collectionData.collectionName,
                entryId: id,
                field,
                locale,
                value
            }, { transaction });
        }

        await transaction.commit();
        res.json({ message: 'Translations saved' });
    }  catch (error) {
        await transaction.rollback();
        res.status(500).json({ error: error.message });
    }
};

const createItem = async (req, res) => {
        const { label } = req.params;
        const sequelize = req.app.get('sequelize');

        try {
            const Model = await getModelOr404(sequelize, label, res);
            if (!Model) return;

            const collectionData = await getCollectionFields(sequelize, label);
            if (!collectionData) {
                return res.status(404).json({ error: `Collection "${label}" not found` });
            }

            const schema = buildJoiSchema(collectionData.fields);
            const { error, value } = schema.validate(req.body, { abortEarly: false });

            if (error) {
                const messages = error.details.map(d => d.message);
                return res.status(400).json({ error: 'Validation failed', details: messages });
            }

            const newItem = await Model.create(value);
            res.status(201).json(newItem);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    };

    const updateItem = async (req, res) => {
        const { label, id } = req.params;
        const sequelize = req.app.get('sequelize');

        try {
            const Model = await getModelOr404(sequelize, label, res);
            if (!Model) return;

            const item = await Model.findByPk(id);
            if (!item) {
                return res.status(404).json({ error: 'Item not found' });
            }

            const collectionData = await getCollectionFields(sequelize, label);
            if (!collectionData) {
                return res.status(404).json({ error: `Collection "${label}" not found` });
            }

            const updateSchema = buildJoiSchema(collectionData.fields).options({ allowUnknown: true });
            const { error, value } = updateSchema.validate(req.body, { abortEarly: false });

            if (error) {
                const messages = error.details.map(d => d.message);
                return res.status(400).json({ error: 'Validation failed', details: messages });
            }

            await item.update(req.body);
            res.json(item);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    };

    const deleteItem = async (req, res) => {
        const { label, id } = req.params;
        const sequelize = req.app.get('sequelize');

        try {
            const Model = await getModelOr404(sequelize, label, res);
            if (!Model) return;

            const item = await Model.findByPk(id);
            if (!item) {
                return res.status(404).json({ error: 'Item not found' });
            }

            await item.destroy();
            res.json({ message: 'Item deleted' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    };

    module.exports = {
        getAll,
        getById,
        translate,
        createItem,
        updateItem,
        deleteItem,
    }