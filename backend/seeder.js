const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const Product = require('./models/Product');
const products = require('./data/products');

// Nạp biến môi trường
dotenv.config({ path: path.join(__dirname, '.env') });

// Kết nối Database
connectDB();
const importData = async () => {
    try {
        // 1. Xóa sạch dữ liệu cũ trong bảng Product (để không bị trùng lặp khi chạy nhiều lần)
        await Product.deleteMany();
        console.log(' Đã xóa sạch toàn bộ sản phẩm cũ trong Database!');

        // 2. Chèn mảng sản phẩm mẫu vào Database
        await Product.insertMany(products);

        console.log(' Dữ liệu sản phẩm MỚI đã được bơm thành công!');
        process.exit(); // Thoát script sau khi xong
    } catch (error) {
        console.error(` Lỗi khi bơm dữ liệu: ${error.message}`);
        process.exit(1);
    }
};

importData();