const express = require('express');
const router = express.Router();
const { getVouchers, createVoucher, updateVoucher, deleteVoucher, validateVoucher } = require('../controllers/voucherController');

router.route('/').get(getVouchers).post(createVoucher);
router.route('/:id').put(updateVoucher).delete(deleteVoucher);
router.post('/validate', validateVoucher);

module.exports = router;