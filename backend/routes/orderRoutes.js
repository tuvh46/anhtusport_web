const express = require('express');
const router = express.Router();
const { addOrderItems, getMyOrders, getAllOrders, updateOrderToDelivered } = require('../controllers/orderController');

router.post('/', addOrderItems);
router.get('/all', getAllOrders); // Lấy tất cả đơn
router.get('/myorders/:userId', getMyOrders);
router.put('/:id/deliver', updateOrderToDelivered); // Cập nhật giao hàng

module.exports = router;