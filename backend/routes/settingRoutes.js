const express = require('express');
const router = express.Router();
const { getSetting, upsertSetting } = require('../controllers/settingController');

// GET  /api/settings/:key  — Lấy cài đặt theo key (VD: welcome-voucher)
router.get('/:key', getSetting);

// POST /api/settings/:key  — Tạo hoặc cập nhật cài đặt theo key
router.post('/:key', upsertSetting);

module.exports = router;
