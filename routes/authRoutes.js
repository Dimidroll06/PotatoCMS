const express = require('express');
const {
    register,
    login,
    refresh,
    logout,
} = require('../controllers/authController');
const {
    validateRegister,
    validateLogin,
} = require('../validators/authValidator');

const router = express.Router();

router.post('/login', validateLogin, login);
router.post('/refresh', refresh);
router.post('/logout', logout);
if (process.env.REGISTRATION_ENABLED === 'true') {
    router.post('/register', validateRegister, register);
}

module.exports = router;