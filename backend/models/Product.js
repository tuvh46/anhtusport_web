const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Vui lòng nhập tên sản phẩm'],
        trim: true
    },
    price: {
        type: Number,
        required: [true, 'Vui lòng nhập giá sản phẩm'],
        default: 0
    },
    description: {
        type: String,
        required: [true, 'Vui lòng nhập mô tả']
    },
    image: {
        type: String, // Chúng ta sẽ lưu URL ảnh ở đây
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['Kits', 'Training', 'Lifestyle', 'Accessories'] // Chỉ cho phép các loại này
    },
    countInStock: {
        type: Number,
        required: true,
        default: 0
    }
}, {
    timestamps: true // Tự động tạo thời gian CreateAt và UpdateAt
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;