const express = require('express');
const router = express.Router();
const { getProducts, getProductById } = require('../controllers/productController');

router.get('/', getProducts);          // Chạy khi gọi /api/products
router.get('/:id', getProductById);    // Chạy khi gọi /api/products/mã-sản-phẩm

module.exports = router;