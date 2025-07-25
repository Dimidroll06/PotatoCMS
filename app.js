const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const passport = require('passport');

/**
 * Создаёт и настраивает базовый сервер express
 * @returns {Promise<express.Express>} express server instance
 */
const createApp = async () => {
    try {
        const app = express();

        // Конфигурация passport
        require('./config/passport')(passport);

        // Middleware
        app.use(cors({
            origin: '*',
            credentials: true,
        }));
        app.use(helmet());
        app.use(morgan('dev'));
        app.use(express.json());
        app.use(express.urlencoded({ extended: true }));

        app.use(cookieParser());
        app.use(passport.initialize());

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