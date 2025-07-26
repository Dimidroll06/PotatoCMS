const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Role = sequelize.define('Role', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        description: {
            type: DataTypes.STRING
        }
    }, {
        timestamps: false,
        tableName: 'cms_roles',
    });

    Role.associate = (models) => {
        Role.hasMany(models.User, { foreignKey: 'roleId' });
        Role.belongsToMany(models.Permission, {
            through: 'cms_RolePermission',
            as: 'permissions',
            foreignKey: 'roleId'
        });
    };

    return Role;
};