const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Permission = sequelize.define('Permission', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        action: {
            type: DataTypes.ENUM('create', 'update', 'delete', 'translate'),
            allowNull: false
        },
        collectionName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.STRING
        },
    }, {
        timestamps: false,
        tableName: 'cms_permissions',
        indexes: [
            { fields: ['collectionName', 'action'], unique: true }
        ]
    });

    Permission.associate = function (models) {
        Permission.belongsToMany(models.Role, {
            through: 'cms_RolePermission',
            as: 'roles',
            foreignKey: 'permissionId'
        });
    };

    return Permission;
}