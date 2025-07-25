const express = require('express');
const router = express.Router();

const collectionRouter = require('./collectionRoutes');
const relationshipRouter = require('./relationshipRoutes');
const authRouter = require('./authRoutes');
const dynamicRouter = require('./dynamicRoutes');

router.use('/collections', collectionRouter);
router.use('/relationships', relationshipRouter);
router.use('/auth', authRouter);
router.use('/data', dynamicRouter);

router.use((req, res) => {
    res.status(404).json({ error: 'route undefined' });
});

module.exports = router;