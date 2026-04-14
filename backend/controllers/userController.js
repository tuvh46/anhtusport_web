const User = require('../models/User');
const bcrypt = require('bcryptjs');

// 1. Hàm Xử lý Đăng ký
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        // Kiểm tra xem email đã tồn tại chưa
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'Email này đã được sử dụng!' });
        }

        // Tạo user mới
        const user = await User.create({ name, email, password });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin
            });
        } else {
            res.status(400).json({ message: 'Dữ liệu không hợp lệ!' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Lỗi Server' });
    }
};

// 2. Hàm Xử lý Đăng nhập (Giải quyết lỗi 404 của bạn)
const authUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Tìm user theo email
        const user = await User.findOne({ email });

        // Kiểm tra mật khẩu (Bcrypt sẽ so sánh mật khẩu bạn nhập với mật khẩu mã hóa trong DB)
        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                message: 'Đăng nhập thành công'
            });
        } else {
            res.status(401).json({ message: 'Email hoặc mật khẩu không chính xác!' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Lỗi Server' });
    }
};

module.exports = { registerUser, authUser };