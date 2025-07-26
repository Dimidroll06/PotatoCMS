const { Role, Permission, User } = require('../models');

const startup = async () => {
    try {

        const [defaultRole, adminRole] = await Promise.all([
            Role.findOrCreate({
                where: { name: 'default' },
                defaults: { description: 'Read only' }
            }),
            Role.findOrCreate({
                where: { name: 'admin' },
                defaults: { description: 'Full access' }
            })
        ]);

        const [defaultRoleObj, adminRoleObj] = [defaultRole[0], adminRole[0]];


        const usersCount = await User.count();
        if (usersCount === 0) {
            console.log('Создание начального администратора...');

            await User.create({
                username: 'admin',
                password: 'admin',
                roleId: adminRoleObj.id
            });
        }

    } catch (error) {
        console.error('Ошибка при первоначальной настройке приложения:', error);
    }
}

module.exports = startup;