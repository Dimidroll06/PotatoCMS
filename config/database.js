const { Sequelize } = require('sequelize');

/**
 * Инициализирует базу данных, а так же проверяет её доступность
 * @returns {Promise<Sequelize>} sequelizeInstance
 */
const setupDatabase = async () => {
    // Конфиг базы данных. Стандартно стоит sqlite для облегченного тестирования.
    const dialect = process.env.DB_DIALECT || 'sqlite';
    const storage = process.env.DB_STORAGE;
    const host = process.env.DB_HOST;
    const port = process.env.DB_PORT;
    const username = process.env.DB_USER;
    const password = process.env.DB_PASSWORD;
    const database = process.env.DB_NAME;

    const sequelize = new Sequelize({
        dialect,
        storage,
        host,
        port,
        username,
        password,
        database,
        logging: false,
    });

    // Проверка на подключение, дабы не произошла непредвиденная ошибка при неправильной настроке БД.
    try {
        await sequelize.authenticate();
        console.log('✅ Успешное подключение к базе данных.');
        return sequelize;
    } catch (error) {
        console.error('❌ Не удалось подключиться к базе данных:', error.message);
        process.exit(1);
    }
};

module.exports = setupDatabase;