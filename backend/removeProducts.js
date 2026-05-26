const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const Product = require('./models/Product');

dotenv.config({ path: path.join(__dirname, '.env') });
connectDB();

const namesToDelete = [
    'Áo Sân Nhà Arsenal 2026-27 – Phiên Bản Vô Địch',
    'Áo Sân Khách Arsenal 2025-26 – Away Kit',
    'Áo Bộ Thứ Ba Arsenal 2025-26 – Third Kit',
    'Áo Đấu Trẻ Em Arsenal 2025-26 – Kids Kit',
    'Quần Short Thi Đấu Arsenal 2025-26',
    'Tất Sân Nhà Arsenal 2025-26 – Home Socks',
    'Dép Adilette Shower Arsenal – Chính Hãng'
];

const rollback = async () => {
    try {
        const result = await Product.deleteMany({ name: { $in: namesToDelete } });
        console.log(`✅ Đã xóa ${result.deletedCount} sản phẩm vừa thêm.`);
        process.exit(0);
    } catch (err) {
        console.error('❌ Lỗi:', err.message);
        process.exit(1);
    }
};

rollback();
