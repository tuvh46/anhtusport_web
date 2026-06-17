const express = require('express');
const router = express.Router();
const { getProducts, getProductById, updateProductReviews, createProduct, updateProduct, deleteProduct, crawlProducts } = require('../controllers/productController');

router.get('/', getProducts);
router.post('/crawl', crawlProducts);
router.get('/:id', getProductById);
router.put('/:id/reviews', updateProductReviews);
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

module.exports = router;