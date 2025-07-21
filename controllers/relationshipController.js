const { QueryTypes } = require('sequelize');

const connectItems = async (req, res) => {
    const sequelize = req.app.get('sequelize');
    const { Collection, CollectionField, Relationship } = sequelize.models;
    const { collection: fromCollection, id: fromId, field } = req.params;
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: 'Ids must be a non-empty array' });
    }

    const transaction = await sequelize.transaction();
    try {
        const fieldDef = await CollectionField.findOne({
            where: { name: field, targetCollectionId: Collection.id },
            include: [{ model: Collection, as: 'targetCollection' }]
        });

        if (!fieldDef) {
            return res.status(404).json({ error: 'Field not found or not a relation' });
        }

        const toCollection = fieldDef.targetCollection.name;

        const targets = await sequelize.query(
            `SELECT id FROM "${toCollection}" WHERE id IN (?)`,
            { replacements: [ids], type: QueryTypes.SELECT, transaction }
        );

        if (targets.length !== ids.length) {
            return res.status(404).json({ error: 'One or more target items not found' });
        }

        const relationships = ids.map(toId => ({
            fromCollection,
            fromId,
            toCollection,
            toId,
            field
        }));

        await Relationship.bulkCreate(relationships, { transaction, ignoreDuplicates: true });

        await transaction.commit();
        res.status(201).json({ message: 'Connected', count: relationships.length });
    } catch (error) {
        await transaction.rollback();
        res.status(500).json({ error: error.message });
    }
}

const disconnectItems = async (req, res) => {
    const sequelize = req.app.get('sequelize');
    const { Relationship } = sequelize.models;
    const { collection: fromCollection, id: fromId, field } = req.params;
    const { ids } = req.body;

    const transaction = await sequelize.transaction();
    try {
        const where = {
            fromCollection,
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
}

module.exports = {
    connectItems,
    disconnectItems
}