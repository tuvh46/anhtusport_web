const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Lấy chuỗi kết nối từ file .env
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`✅ MongoDB đã kết nối: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ Lỗi kết nối: ${error.message}`);
        process.exit(1); // Dừng server nếu không kết nối được DB
    }
};

module.exports = connectDB;