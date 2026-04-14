const Product = require('../models/Product');

// Lấy tất cả sản phẩm (Trang chủ)
const getProducts = async (req, res) => {
    try {
        const products = await Product.find({});
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi Server' });
    }
};

// Lấy đúng 1 sản phẩm theo ID (Trang Chi tiết)
const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Lỗi Server' });
    }
};

module.exports = { getProducts, getProductById };