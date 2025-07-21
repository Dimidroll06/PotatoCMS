const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const setupDatabase = require('./config/database');
const collectionRoutes = require('./routes/collectionRoutes');

/**
 * Создаёт и настраивает базовый сервер express
 * @returns {Promise<express.Express>} express server instance
 */
const createApp = async () => {
    const app = express();

    // Middleware
    app.use(cors());
    app.use(helmet());
    app.use(morgan('dev'));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Подключение к БД
    const sequelize = await setupDatabase();
    app.set('sequelize', sequelize); // делаем sequelize доступным в роутах

    // Роуты
    const routesUrl = process.env.ROUTES_URL || '/api';
    const router = require('./routes/index');
    app.use(routesUrl, router);

    return app;
};

module.exports = createApp;