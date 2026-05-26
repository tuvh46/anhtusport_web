const Order = require('../models/Order');
const Product = require('../models/Product');

// 1. Tạo đơn hàng mới
const addOrderItems = async (req, res) => {
    try {
        const { orderItems, shippingAddress, paymentMethod, totalPrice, user } = req.body;

        if (orderItems && orderItems.length === 0) {
            return res.status(400).json({ message: 'Không có sản phẩm nào trong đơn hàng' });
        }

        // 1. Kiểm tra tồn kho cho tất cả sản phẩm trong đơn hàng
        for (const item of orderItems) {
            const product = await Product.findById(item.id);
            if (!product) {
                return res.status(404).json({ message: `Không tìm thấy sản phẩm: ${item.name}` });
            }
            if (product.stock < item.qty) {
                return res.status(400).json({
                    message: `Sản phẩm "${item.name}" không đủ số lượng tồn kho. Hiện tại trong kho chỉ còn ${product.stock} sản phẩm.`
                });
            }
        }

        // 2. Thực hiện trừ số lượng tồn kho
        for (const item of orderItems) {
            const product = await Product.findById(item.id);
            product.stock -= item.qty;
            await product.save();
        }

        // 3. Lưu đơn hàng mới vào Database
        const order = new Order({
            user, orderItems, shippingAddress, paymentMethod, totalPrice
        });

        const createdOrder = await order.save();
        res.status(201).json(createdOrder);
    } catch (error) {
        console.error("Lỗi tạo đơn hàng:", error);
        res.status(500).json({ message: 'Lỗi Server khi tạo đơn hàng' });
    }
};

// 2. Lấy danh sách đơn hàng của 1 User cụ thể (NEW)
const getMyOrders = async (req, res) => {
    try {
        // Tìm trong DB tất cả đơn hàng có mã user khớp với mã gửi lên
        const orders = await Order.find({ user: req.params.userId });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy lịch sử đơn hàng' });
    }
};

// Lấy toàn bộ đơn hàng (Chỉ dành cho Admin)
const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find({}).populate('user', 'name email');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy danh sách đơn hàng' });
    }
};

// Cập nhật trạng thái đơn hàng (Admin)
const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['pending', 'shipping', 'delivered', 'cancelled'];
        
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
        }

        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
        }

        order.status = status;
        if (status === 'delivered') {
            order.isDelivered = true;
        } else {
            order.isDelivered = false; // Đồng bộ trạng thái isDelivered
        } 

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi cập nhật trạng thái đơn hàng' });
    }
};

module.exports = { addOrderItems, getMyOrders, getAllOrders, updateOrderStatus };