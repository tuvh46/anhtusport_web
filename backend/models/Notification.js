const mongoose = require('mongoose');

const notificationSchema = mongoose.Schema({
    type: { type: String, required: true }, // 'order', 'review', 'reply', 'customer_reply_to_admin'
    title: { type: String, required: true },
    message: { type: String, required: true },
    time: { type: String, required: true }, // Lưu dưới dạng ISO string
    isRead: { type: Boolean, required: true, default: false },
    targetUrl: { type: String }, // Link để admin click vào xem
    productId: { type: String }, // ID sản phẩm liên quan (nếu có)
    orderId: { type: String }, // ID đơn hàng liên quan (nếu có)
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false }, // ID người dùng nhận thông báo (nếu là thông báo cá nhân)
    author: { type: String }, // Tên người gửi thông báo (ví dụ: "Cửa hàng", "Tên khách hàng")
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);