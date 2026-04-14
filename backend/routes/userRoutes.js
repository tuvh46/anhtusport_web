const express = require('express');
const router = express.Router();
const { registerUser, authUser } = require('../controllers/userController');

// Đường dẫn Đăng ký (POST /api/users)
router.post('/', registerUser);

// Đường dẫn Đăng nhập (POST /api/users/login) -
router.post('/login', authUser);

module.exports = router;