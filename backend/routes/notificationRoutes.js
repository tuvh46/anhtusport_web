const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');

// 1. Frontend gọi cái này để LẤY danh sách thông báo
router.get('/', async (req, res) => {
    try {
        const userId = req.query.userId;

        let query = {};
        if (userId) {
            // Nếu có userId -> Lấy thông báo của userId đó
            query = { userId: userId };
        } else {
            // Nếu không có userId (từ Admin) -> Lấy thông báo không có userId (của Admin)
            query = { userId: { $exists: false } };
        }

        const notifications = await Notification.find(query).sort({ createdAt: -1 }).limit(10);
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi lấy thông báo' });
    }
});

// 2. Frontend gọi cái này để GỬI thông báo mới (Khi có người comment)
router.post('/emit', async (req, res) => {
    try {
        const newNotif = new Notification(req.body);
        const savedNotif = await newNotif.save(); // Lưu vào database, bao gồm cả trường 'author' nếu có trong req.body

        // Sau khi lưu, phát thông báo qua WebSocket (nếu có admin đang kết nối)
        req.app.locals.broadcastNotification(savedNotif);
        res.status(201).json(newNotif);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi tạo thông báo' });
    }
});

// 3. Admin bấm vào chuông -> Đánh dấu tất cả là đã đọc
router.put('/mark-read', async (req, res) => {
    try {
        await Notification.updateMany({ isRead: false }, { isRead: true });
        res.json({ message: 'Đã đánh dấu đọc' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi update thông báo' });
    }
});

// 4. Đánh dấu 1 thông báo là đã đọc (Khi user click vào xem)
router.put('/:id/read', async (req, res) => {
    try {
        await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
        res.json({ message: 'Đã đánh dấu đọc' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi update thông báo' });
    }
});

// 5. Xóa các thông báo đã đọc
router.delete('/clear-read', async (req, res) => {
    try {
        const userId = req.query.userId;
        let query = { isRead: true };
        if (userId) {
            query.userId = userId;
        } else {
            query.userId = { $exists: false }; // Thông báo của Admin
        }
        await Notification.deleteMany(query);
        res.json({ message: 'Đã xóa thông báo đã đọc' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi xóa thông báo' });
    }
});

// 6. Xóa nhiều thông báo theo ID (Xóa đã chọn)
router.post('/bulk-delete', async (req, res) => {
    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: 'Không có ID nào được cung cấp' });
        }
        await Notification.deleteMany({ _id: { $in: ids } });
        res.json({ message: 'Đã xóa các thông báo được chọn' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi xóa thông báo' });
    }
});

module.exports = router;