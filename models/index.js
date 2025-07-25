const { sequelize } = require('../config/database');
const fs = require('fs');
const path = require('path');

const modelFiles = fs.readdirSync(__dirname).filter(file => {
    return file !== 'index.js' && file.endsWith('.js');
});

const models = {};

// Инициализация моделей
modelFiles.forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize);
    models[model.name] = model;
});

// Вызов ассоциаций
Object.values(models).forEach(model => {
    if (model.associate) {
        model.associate(models);
    }
});

module.exports = { ...models, sequelize };