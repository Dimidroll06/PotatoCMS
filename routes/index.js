const express = require('express');
const router = express.Router();

router.use((req, res) => {
    res.status(404).json({ error: 'route undefined' });
});

module.exports = router;