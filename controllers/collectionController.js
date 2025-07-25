const { DataTypes, Op } = require('sequelize');
const { sequelize, Collection, CollectionField, Relationship } = require('../models');

const TYPE_MAP = {
    string: DataTypes.STRING,
    text: DataTypes.TEXT,
    boolean: DataTypes.BOOLEAN,
    number: DataTypes.FLOAT,
    date: DataTypes.DATE,
    relation: DataTypes.INTEGER
};

const getAllCollections = async (req, res) => {

    try {
        const collections = await Collection.findAll({
            include: [{ model: CollectionField, as: 'fields' }]
        });
        res.json(collections);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const getCollectionById = async (req, res) => {
    const { id } = req.params;

    try {
        const collection = await Collection.findByPk(id, {
            include: [{ model: CollectionField, as: 'fields' }]
        });
        if (!collection) return res.status(404).json({ error: 'Collection not found' });

        res.json(collection);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const createCollection = async (req, res) => {
    const { name, label, fields } = req.body;

    const transaction = await sequelize.transaction();
    const queryInterface = sequelize.getQueryInterface();

    try {
        const allCollections = await Collection.findAll({ raw: true });
        const collectionNameMap = Object.fromEntries(
            allCollections.map(c => [c.id, c.name])
        );
        const collection = await Collection.create({ name, label }, { transaction });

        const fieldRecords = await CollectionField.bulkCreate(
            fields.map(f => ({ ...f, collectionId: collection.id })),
            { transaction }
        );

        const attributes = {};
        const foreignKeys = {};
        fields.forEach(field => {
            if (field.type === 'relation' && field.targetCollectionId) {
                const targetName = collectionNameMap[field.targetCollectionId];
                if (!targetName) throw new Error(`Target collection not found for ID: ${field.targetCollectionId}`);

                foreignKeys[field.name] = {
                    type: TYPE_MAP[field.type],
                    allowNull: !field.required,
                    references: {
                        model: targetName,
                        key: 'id'
                    }
                };
            } else {
                attributes[field.name] = {
                    type: TYPE_MAP[field.type],
                    allowNull: !field.required
                };
            }
        });

        await queryInterface.createTable(name, {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            ...attributes,
            ...foreignKeys,
            createdAt: DataTypes.DATE,
            updatedAt: DataTypes.DATE
        }, { transaction });

        await transaction.commit();
        res.status(201).json(collection);

    } catch (error) {
        await transaction.rollback();
        res.status(500).json({ error: error.message });
    }

}

const updateCollection = async (req, res) => {
    const { id } = req.params;
    const { label, fields } = req.body;

    const transaction = await sequelize.transaction();
    const queryInterface = sequelize.getQueryInterface();

    try {
        const allCollections = await Collection.findAll({ raw: true });
        const collectionNameMap = Object.fromEntries(
            allCollections.map(c => [c.id, c.name])
        );

        const collection = await Collection.findByPk(id, { transaction });
        if (!collection) return res.status(404).json({ error: 'Collection not found' });

        await collection.update({ label }, { transaction });

        const currentFields = await CollectionField.findAll({
            where: { collectionId: id },
            transaction
        });

        const currentFieldMap = Object.fromEntries(
            currentFields.map(f => [f.name, f])
        );

        const newFieldMap = Object.fromEntries(
            fields.map(f => [f.name, f])
        );

        for (const fieldName in currentFieldMap) {
            if (!newFieldMap[fieldName]) {
                await queryInterface.removeColumn(collection.name, fieldName, { transaction });

                if (currentFieldMap[fieldName].type === 'relation') {
                    await Relationship.destroy({
                        where: {
                            fromCollection: collection.name,
                            field: fieldName
                        },
                        transaction
                    });
                }

                await CollectionField.destroy({
                    where: { id: currentFieldMap[fieldName].id },
                    transaction
                });
            }
        }

        for (const field of fields) {
            if (field.type === 'relation' && field.targetCollectionId) {
                const targetName = collectionNameMap[field.targetCollectionId];
                if (!targetName) throw new Error(`Target collection not found for ID: ${field.targetCollectionId}`);

                if (!currentFieldMap[field.name]) {
                    await queryInterface.addColumn(collection.name, field.name, {
                        type: TYPE_MAP[field.type],
                        allowNull: !field.required,
                        references: {
                            model: targetName,
                            key: 'id'
                        }
                    }, { transaction });

                    await CollectionField.create({
                        ...field,
                        collectionId: collection.id
                    }, { transaction });
                } else {
                    await queryInterface.changeColumn(collection.name, field.name, {
                        type: TYPE_MAP[field.type],
                        allowNull: !field.required,
                        references: {
                            model: targetName,
                            key: 'id'
                        }
                    }, { transaction });

                    await CollectionField.update({
                        ...field
                    }, {
                        where: { id: currentFieldMap[field.name].id },
                        transaction
                    });
                }
            } else {
                if (!currentFieldMap[field.name]) {
                    await queryInterface.addColumn(collection.name, field.name, {
                        type: TYPE_MAP[field.type],
                        allowNull: !field.required
                    }, { transaction });

                    await CollectionField.create({
                        ...field,
                        collectionId: collection.id
                    }, { transaction });
                } else {
                    await queryInterface.changeColumn(collection.name, field.name, {
                        type: TYPE_MAP[field.type],
                        allowNull: !field.required
                    }, { transaction });

                    await CollectionField.update({
                        ...field
                    }, {
                        where: { id: currentFieldMap[field.name].id },
                        transaction
                    })
                }

            }
        }

        await transaction.commit();
        res.json(await Collection.findByPk(id, {
            include: [{ model: CollectionField, as: 'fields' }]
        }));

    } catch (error) {
        console.error(error);
        await transaction.rollback();
        res.status(500).json({ error: error.message });
    }

}

const deleteCollection = async (req, res) => {
    const { id } = req.params;

    const transaction = await sequelize.transaction();
    const queryInterface = sequelize.getQueryInterface();

    try {
        const collection = await Collection.findByPk(id, { transaction });
        if (!collection) return res.status(404).json({ error: 'Collection not found' });

        await Relationship.destroy({
            where: {
                [Op.or]: [
                    { fromCollection: collection.name },
                    { toCollection: collection.name }
                ]
            },
            transaction
        });

        await CollectionField.destroy({
            where: { collectionId: collection.id },
            transaction
        });

        await queryInterface.dropTable(collection.name, { transaction });

        await collection.destroy({ transaction });

        await transaction.commit();
        res.json({ message: 'Collection deleted' });
    } catch (error) {
        console.error(error)
        await transaction.rollback();
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    getAllCollections,
    getCollectionById,
    createCollection,
    updateCollection,
    deleteCollection,
};