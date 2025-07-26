const { Role, Permission } = require('../models');
const rbac = async (collection, action, req) => {
    let userRole;
    if (!req.user) {
        userRole = await Role.findOne({
            where: {
                name: 'default',
            }
        });
    } else {
        userRole = await Role.findByPk(req.user.roleId);
    }

    if (userRole?.name === 'admin') {
        return true;
    }

    const permission = await Permission.findOne({
        where: { collectionName: collection, action },
        include: [{
            model: Role,
            where: { id: userRole.id },
            through: { attributes: [] },
            as: 'roles'
        }]
    });

    if (!permission) {
        return false;
    }

    return true;
};

module.exports = rbac;