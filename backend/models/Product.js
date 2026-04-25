const mongoose = require('mongoose');

const reviewSchema = mongoose.Schema(
    {
        id: { type: Number, required: true }, // ID duy nhất cho review (từ Date.now() của frontend)
        reviewerId: { type: String, required: true }, // ID của người đánh giá
        name: { type: String, required: true }, // Tên người đánh giá
        isAdmin: { type: Boolean, default: false }, // Cờ admin
        isVerifiedPurchase: { type: Boolean, default: false }, // Đã mua hàng
        rating: { type: Number, required: true, default: 0 },
        comment: { type: String, required: true },
        date: { type: String, required: true }, // Lưu dưới dạng ISO string
        likes: [{ type: String }], // Mảng userId hoặc email
        dislikes: [{ type: String }],
        media: [{ type: String }], // Mảng chứa URL của hình ảnh/video đính kèm
        isEdited: { type: Boolean, default: false }, // Cờ đánh dấu đã chỉnh sửa
        isPinned: { type: Boolean, default: false }, // Cờ ghim bình luận
        reports: [{ 
            reporterId: String, 
            reporterName: String, 
            reason: String, 
            date: String 
        }], // Mảng lưu các báo cáo vi phạm
        replies: [
            {
                id: { type: Number, required: true }, // ID duy nhất cho reply của admin
                authorId: { type: String },
                authorName: { type: String },
                isAdmin: { type: Boolean, default: false },
                text: { type: String, required: true },
                date: { type: String, required: true },
                isEdited: { type: Boolean, default: false },
                likes: [{ type: String }],
                dislikes: [{ type: String }]
            },
        ],
    },
    {
        timestamps: true, // Thêm createdAt và updatedAt cho mỗi review
    }
);

const productSchema = mongoose.Schema(
    {
        name: { type: String, required: true },
        image: { type: String, required: true },
        hoverImage: { type: String },
        description: { type: String, required: true },
        category: { type: String, required: true },
        price: { type: Number, required: true, default: 0 },
        stock: { type: Number, required: true, default: 0 },
        reviews: [reviewSchema], // Mảng các đánh giá
    },
    {
        timestamps: true,
    }
);

const Product = mongoose.model('Product', productSchema);
module.exports = Product;