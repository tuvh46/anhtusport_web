const express = require('express');
const router = express.Router();
const { addOrderItems, getMyOrders, getAllOrders, updateOrderStatus } = require('../controllers/orderController');

router.post('/', addOrderItems);
router.get('/all', getAllOrders);
router.get('/myorders/:userId', getMyOrders); // Lấy đơn hàng của tôi
router.put('/:id/status', updateOrderStatus); // Cập nhật trạng thái (mới - cho admin)

module.exports = router;