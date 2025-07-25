const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Collection = sequelize.define('Collection', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        label: {
            type: DataTypes.STRING,
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        updatedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    }, {
        timestamps: true,
        tableName: 'cms_collections',
    });

    Collection.associate = (models) => {
        Collection.hasMany(models.CollectionField, {
            foreignKey: 'collectionId',
            as: 'fields',
            onDelete: 'CASCADE'
        });
    };

    return Collection;
};