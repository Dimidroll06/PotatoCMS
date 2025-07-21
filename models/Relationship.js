const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Relationship = sequelize.define('Relationship', {
        fromCollection: {
            type: DataTypes.STRING,
            allowNull: false
        },
        fromId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        toCollection: {
            type: DataTypes.STRING,
            allowNull: false
        },
        toId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        field: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        tableName: 'relationships',
        indexes: [
            { fields: ['fromCollection', 'fromId'] },
            { fields: ['toCollection', 'toId'] },
            { fields: ['fromCollection', 'fromId', 'field'], unique: false }
        ]
    });

    return Relationship;
}