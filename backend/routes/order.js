const express = require('express');
const router = express.Router();
const { createOrder, getMyOrders, getOrder, getAllOrders, updateOrderStatus, getAdminStats } = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect);
router.post('/', createOrder);
router.get('/my', getMyOrders);
router.get('/admin/all', adminOnly, getAllOrders);
router.get('/admin/stats', adminOnly, getAdminStats);
router.get('/:id', getOrder);
router.put('/:id/status', adminOnly, updateOrderStatus);

module.exports = router;
