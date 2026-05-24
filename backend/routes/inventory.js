const express = require('express');
const router = express.Router();
const { getInventory, createInventoryItem, updateInventoryItem, deleteInventoryItem, getLowStockItems } = require('../controllers/inventoryController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', protect, getInventory);
router.get('/low-stock', protect, adminOnly, getLowStockItems);
router.post('/', protect, adminOnly, createInventoryItem);
router.put('/:id', protect, adminOnly, updateInventoryItem);
router.delete('/:id', protect, adminOnly, deleteInventoryItem);

module.exports = router;
