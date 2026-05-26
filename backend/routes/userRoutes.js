const express = require('express');
const router = express.Router();
const { registerUser, authUser, getAllUsers, deleteUser, updateUserProfile, updateUserPassword, getAdminAvatar } = require('../controllers/userController');

// GET /api/users/admin-avatar - Lấy avatar của admin
router.get('/admin-avatar', getAdminAvatar);

// POST /api/users - Đăng ký
router.post('/', registerUser);
// POST /api/users/login - Đăng nhập
router.post('/login', authUser);
// GET /api/users - Lấy danh sách tất cả users (Dùng cho Admin)
router.get('/', getAllUsers);

// PUT /api/users/:id - Cập nhật thông tin profile
router.put('/:id', updateUserProfile);
// PUT /api/users/:id/password - Cập nhật mật khẩu
router.put('/:id/password', updateUserPassword);

router.delete('/:id', deleteUser); // Xóa user

module.exports = router;