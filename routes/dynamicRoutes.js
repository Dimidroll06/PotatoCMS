const express = require('express');
const router = express.Router();

const {
    getAll,
    getById,
    createItem,
    updateItem,
    deleteItem,
} = require('../controllers/dynamicController');

router.get('/:label', getAll);
router.get('/:label/:id', getById);
router.post('/:label', createItem);
router.put('/:label/:id', updateItem);
router.delete('/:label/:id', deleteItem);

module.exports = router;