const express = require('express');
const {
    register,
    login,
    refresh,
    logout,
} = require('../controllers/authController');
const router = express.Router();

router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);
if (process.env.REGISTRATION_ENABLED === 'true') {
    router.post('/register', register);
}

module.exports = router;