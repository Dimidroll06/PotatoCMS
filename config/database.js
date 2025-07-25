const { Sequelize } = require('sequelize');

/**
 * @type {Sequelize}
 */
let sequelize;

const dialect = process.env.DB_DIALECT || 'sqlite';
const storage = process.env.DB_STORAGE;
const host = process.env.DB_HOST;
const port = process.env.DB_PORT;
const username = process.env.DB_USER;
const password = process.env.DB_PASSWORD;
const database = process.env.DB_NAME;

sequelize = new Sequelize({
    dialect,
    storage,
    host,
    port,
    username,
    password,
    database,
    logging: false,
    retry: {
        max: 5,
        match: [
            Sequelize.TimeoutError,
            Sequelize.ConnectionError,
            'SQLITE_BUSY'
        ]
    }
});

const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Успешное подключение к базе данных.');
    } catch (error) {
        console.error('❌ Не удалось подключиться к базе данных:', error);
        process.exit(1);
    }
}

module.exports = { sequelize, testConnection };