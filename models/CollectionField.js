const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const CollectionField = sequelize.define('CollectionField', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        type: {
            type: DataTypes.ENUM('string', 'text', 'boolean', 'number', 'date'),
            allowNull: false,
        },
        required: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        updatedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    });

    CollectionField.associate = (models) => {
        CollectionField.belongsTo(models.Collection, {
            foreignKey: 'collectionId',
            as: 'collection',
        });
    };

    return CollectionField;
};