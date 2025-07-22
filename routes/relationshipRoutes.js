const express = require('express');
const {
    validateRelation
} = require('../validators/relationshipValidator');
const {
    connectItems,
    disconnectItems,
} = require('../controllers/relationshipController');
const router = express.Router();

router.post('/:collection/:id/connect/:field', validateRelation, connectItems);
router.delete('/:collection/:id/disconnect/:field', validateRelation, disconnectItems);

module.exports = router;