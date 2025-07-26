const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');

module.exports = (sequelize) => {
    const User = sequelize.define('User', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        roleId: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Roles',
                key: 'id'
            },
            defaultValue: 1
        }
    }, {
        timestamps: true,
        tableName: 'cms_users',
    });

    User.addHook('beforeCreate', (user) => {
        if (user.password) {
            user.password = bcrypt.hashSync(user.password, 10);
        }
    });

    User.prototype.comparePassword = function (password) {
        if (bcrypt.compareSync(password, this.password)) {
            return true;
        } else {
            return false;
        }
    };

    User.associate = (models) => {
        User.belongsTo(models.Role, {
            foreignKey: 'roleId',
            as: 'role',
            onDelete: 'SET DEFAULT'
        });
    }

    return User;
};