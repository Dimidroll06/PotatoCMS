const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Translation = sequelize.define('Translation', {
        collectionName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        entryId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        field: {
            type: DataTypes.STRING,
            allowNull: false
        },
        locale: {
            type: DataTypes.STRING(5),
            allowNull: false
        },
        value: {
            type: DataTypes.TEXT,
            allowNull: false
        }
    }, {
        indexes: [
            { fields: ['collectionName', 'entryId', 'field', 'locale'], unique: true },
            { fields: ['collectionName', 'entryId'] }
        ]
    });

    return Translation;
}