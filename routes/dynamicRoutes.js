const express = require('express');
const router = express.Router();

const {
    getAll,
    getById,
    translate,
    createItem,
    updateItem,
    deleteItem,
} = require('../controllers/dynamicController');

router.get('/:label', getAll);
router.get('/:label/:id', getById);
router.post('/:label/:id/translate', translate);
router.post('/:label', createItem);
router.put('/:label/:id', updateItem);
router.delete('/:label/:id', deleteItem);

module.exports = router;