const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

/**
 * Создаёт и настраивает базовый сервер express
 * @returns {Promise<express.Express>} express server instance
 */
const createApp = async () => {
    try {
        const app = express();

        // Middleware
        app.use(cors());
        app.use(helmet());
        app.use(morgan('dev'));
        app.use(express.json());
        app.use(express.urlencoded({ extended: true }));


        // Роуты
        const routesUrl = process.env.ROUTES_URL || '/api';
        const router = require('./routes/index');
        app.use(routesUrl, router);

        return app;
    } catch (error) {
        console.log('Произошла непредвиденная ошибка');
        console.error(error);
        process.exit(1);
    }
};

module.exports = createApp;