const express = require('express');
const {
    connectItems,
    disconnectItems,
} = require('../controllers/relationshipController');
const router = express.Router();

router.post('/:collection/:id/connect/:field', connectItems);
router.delete('/:collection/:id/disconnect/:field', disconnectItems);

module.exports = router;