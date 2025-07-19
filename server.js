require('dotenv').config();
const createApp = require('./app');
const PORT = process.env.PORT || 3000;

/**
 * Запускает CMS на заданном порту
 */
const startServer = async () => {
    const app = await createApp();

    app.listen(PORT, () => {
        console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
    });
};

startServer();