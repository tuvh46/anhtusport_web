const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors'); // Thư viện cho phép Frontend gọi Backend
const connectDB = require('./config/db'); // File kết nối MongoDB
const orderRoutes = require('./routes/orderRoutes');
// Import các file Routes (Đường dẫn)
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');

// Cấu hình biến môi trường
dotenv.config();

// Kết nối Database
connectDB();

const app = express();

// Middleware (BẮT BUỘC PHẢI NẰM TRƯỚC ROUTES)
app.use(cors()); // Bật CORS để cho phép cổng 5500 gọi sang cổng 5000
app.use(express.json()); // Cho phép Server đọc dữ liệu JSON (Email, Mật khẩu)

// Khai báo các Routes chính
app.use('/api/products', productRoutes); // Đường dẫn lấy áo đấu
app.use('/api/users', userRoutes);       // Đường dẫn đăng ký / đăng nhập
app.use('/api/orders', orderRoutes);
// Chạy Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại cổng ${PORT}`);
});