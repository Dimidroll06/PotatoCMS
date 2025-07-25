const { QueryTypes } = require('sequelize');
const { sequelize, Collection, CollectionField, Relationship } = require('../models');

const connectItems = async (req, res) => {
    const { collection: fromCollectionLabel, id: fromId, field } = req.params;
    const { ids } = req.body;

    const transaction = await sequelize.transaction();

    try {
        const fromCollection = await Collection.findOne({
            where: { label: fromCollectionLabel.toLowerCase() },
            transaction
        });

        if (!fromCollection) {
            await transaction.rollback();
            return res.status(404).json({ error: `Collection "${fromCollectionLabel}" not found` });
        }

        const fieldDef = await CollectionField.findOne({
            where: {
                name: field,
                collectionId: fromCollection.id
            },
            include: [
                {
                    model: Collection,
                    as: 'targetCollection',
                    attributes: ['name']
                }
            ],
            transaction
        });

        if (!fieldDef || fieldDef.type !== 'relation') {
            await transaction.rollback();
            return res.status(404).json({ error: 'Relation field not found' });
        }

        const toCollectionName = fieldDef.targetCollection.name;

        const targets = await sequelize.query(
            `SELECT id FROM "${toCollectionName}" WHERE id IN (:ids)`,
            {
                replacements: { ids },
                type: QueryTypes.SELECT,
                transaction
            }
        );

        if (targets.length !== ids.length) {
            await transaction.rollback();
            return res.status(404).json({ error: 'One or more target items not found' });
        }

        const relationships = ids.map(toId => ({
            fromCollection: fromCollection.name,
            fromId,
            toCollection: toCollectionName,
            toId,
            field
        }));

        await Relationship.bulkCreate(relationships, {
            transaction,
            ignoreDuplicates: true
        });

        await transaction.commit();
        res.status(201).json({ message: 'Connected', count: relationships.length });
    } catch (error) {
        await transaction.rollback();
        res.status(500).json({ error: error.message });
    }
};

const disconnectItems = async (req, res) => {
    const { collection: fromCollectionLabel, id: fromId, field } = req.params;
    const { ids } = req.body;

    const transaction = await sequelize.transaction();

    try {
        const fromCollection = await sequelize.models.Collection.findOne({
            where: { label: fromCollectionLabel.toLowerCase() },
            transaction
        });

        if (!fromCollection) {
            await transaction.rollback();
            return res.status(404).json({ error: `Collection "${fromCollectionLabel}" not found` });
        }

        const where = {
            fromCollection: fromCollection.name,
            fromId,
            field
        };

        if (ids && Array.isArray(ids) && ids.length > 0) {
            where.toId = ids;
        }

        const result = await Relationship.destroy({ where, transaction });
        await transaction.commit();

        res.json({ message: 'Disconnected', count: result });
    } catch (error) {
        await transaction.rollback();
        res.status(500).json({ error: error.message });
    }
};

module.exports = { connectItems, disconnectItems };