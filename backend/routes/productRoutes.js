const express = require('express');
const router = express.Router();
const { getProducts, getProductById, updateProductReviews, createProduct, updateProduct } = require('../controllers/productController');

// @desc    Lấy tất cả sản phẩm
// @route   GET /api/products
router.get('/', getProducts);
// @desc    Lấy sản phẩm theo ID
// @route   GET /api/products/:id
router.get('/:id', getProductById);
// @desc    Cập nhật đánh giá sản phẩm
// @route   PUT /api/products/:id/reviews
router.put('/:id/reviews', updateProductReviews);

router.post('/', createProduct);
router.put('/:id', updateProduct);

module.exports = router;