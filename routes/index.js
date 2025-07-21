const express = require('express');
const router = express.Router();

const collectionRouter = require('./collectionRoutes');

router.use('/collections', collectionRouter);

router.use((req, res) => {
    res.status(404).json({ error: 'route undefined' });
});

module.exports = router;