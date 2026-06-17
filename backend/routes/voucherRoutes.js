const express = require('express');
const router = express.Router();
const { getVouchers, createVoucher, updateVoucher, deleteVoucher, validateVoucher, useVoucher } = require('../controllers/voucherController');

router.route('/').get(getVouchers).post(createVoucher);
router.post('/validate', validateVoucher);       // Phải đặt trước route /:id
router.post('/:id/use', useVoucher);             // Tăng usedCount khi dùng voucher
router.route('/:id').put(updateVoucher).delete(deleteVoucher);

module.exports = router;