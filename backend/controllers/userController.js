const User = require('../models/User');
const Order = require('../models/Order');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Hàm Helper tạo Token dùng chung
const generateToken = (id) => {
    const secret = process.env.JWT_SECRET || 'mysecretkey';
    return jwt.sign({ id }, secret, { expiresIn: '30d' });
};

// 1. Hàm Xử lý Đăng ký
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const normalizedEmail = email ? email.toLowerCase().trim() : '';
        
        // Kiểm tra xem email đã tồn tại chưa
        const userExists = await User.findOne({ email: normalizedEmail });
        if (userExists) {
            return res.status(400).json({ message: 'Email này đã được sử dụng!' });
        }

        // Tạo user mới
        const user = await User.create({ name, email: normalizedEmail, password });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                phone: user.phone || '',
                address: user.address || '',
                avatar: user.avatar || '',
                token: generateToken(user._id)
            });
        } else {
            res.status(400).json({ message: 'Dữ liệu không hợp lệ!' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Lỗi Server' });
    }
};

// 2. Hàm Xử lý Đăng nhập
const authUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const normalizedEmail = email ? email.toLowerCase().trim() : '';
        const jwtSecret = process.env.JWT_SECRET;

        if (!jwtSecret) {
            return res.status(500).json({ message: 'Thiếu cấu hình JWT_SECRET trên server' });
        }

        // Tìm user theo email
        const user = await User.findOne({ email: normalizedEmail });

        // Kiểm tra mật khẩu (Bcrypt sẽ so sánh mật khẩu bạn nhập với mật khẩu mã hóa trong DB)
        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                phone: user.phone || '',
                address: user.address || '',
                avatar: user.avatar || '',
                token: generateToken(user._id) // Trả về token
            });
        } else {
            res.status(401).json({ message: 'Email hoặc mật khẩu không chính xác!' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Lỗi Server' });
    }
};

// 3. Hàm lấy danh sách tất cả users (Dùng cho Admin)
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}, { password: 0 }); // Lấy tất cả users, bỏ qua field password
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi Server', error: error.message });
    }
};

// 4. Hàm xóa user (Admin sử dụng)
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            // Xóa luôn toàn bộ đơn hàng của khách hàng này để làm sạch Database
            await Order.deleteMany({ user: user._id });
            
            await user.deleteOne();
            res.json({ message: 'Tài khoản đã được xóa' });
        } else {
            res.status(404).json({ message: 'Không tìm thấy tài khoản' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Lỗi Server khi xóa tài khoản' });
    }
};

// 5. Cập nhật thông tin profile (SĐT, Địa chỉ, Avatar)
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            user.name = req.body.name || user.name;
            user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;
            user.address = req.body.address !== undefined ? req.body.address : user.address;
            
            if (req.body.avatar) {
                user.avatar = req.body.avatar === 'REMOVE' ? '' : req.body.avatar;
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                isAdmin: updatedUser.isAdmin,
                phone: updatedUser.phone,
                address: updatedUser.address,
                avatar: updatedUser.avatar,
                token: generateToken(updatedUser._id)
            });
        } else {
            res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Lỗi Server khi cập nhật thông tin', error: error.message });
    }
};

// 6. Đổi mật khẩu
const updateUserPassword = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        // Kiểm tra xem mật khẩu cũ có đúng không
        if (user && (await bcrypt.compare(req.body.oldPassword, user.password))) {
            user.password = req.body.newPassword; // Sẽ tự động mã hóa nhờ middleware ở Model
            await user.save();
            res.json({ message: 'Đổi mật khẩu thành công' });
        } else {
            res.status(401).json({ message: 'Mật khẩu cũ không chính xác' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Lỗi Server khi đổi mật khẩu' });
    }
};
// 7. Lấy avatar của Admin cho khung chat
const getAdminAvatar = async (req, res) => {
    try {
        const admin = await User.findOne({ isAdmin: true });
        if (admin && admin.avatar) {
            res.json({ avatar: admin.avatar });
        } else {
            // Trả về logo mặc định nếu không có avatar
            res.json({ avatar: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/53/Arsenal_FC.svg/1200px-Arsenal_FC.svg.png' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Lỗi Server' });
    }
};

module.exports = { registerUser, authUser, getAllUsers, deleteUser, updateUserProfile, updateUserPassword, getAdminAvatar };