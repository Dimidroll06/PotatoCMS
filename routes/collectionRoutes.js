const express = require('express');
const {
    validateCreateCollection,
    validateUpdateCollection,
} = require('../validators/collectionValidator');
const {
    getAllCollections,
    getCollectionById,
    createCollection,
    updateCollection,
    deleteCollection,
} = require('../controllers/collectionController');
const router = express.Router();

router.get('/', getAllCollections);
router.get('/:id', getCollectionById);
router.post('/', validateCreateCollection, createCollection);
router.put('/:id', validateUpdateCollection, updateCollection);
router.delete('/:id', deleteCollection);

module.exports = router;