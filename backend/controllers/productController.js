const Product = require('../models/Product');
const Notification = require('../models/Notification');
const User = require('../models/User');

// Lấy tất cả sản phẩm
const getProducts = async (req, res) => {
    try {
        const products = await Product.find({});
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi Server khi lấy sản phẩm' });
    }
};

// Lấy sản phẩm theo ID
const getProductById = async (req, res) => {
    try {
        // Thêm .lean() để dễ dàng thêm field ảo vào object trả về
        const product = await Product.findById(req.params.id).lean();
        if (product) {
            // Lấy danh sách avatar của tất cả users để gán vào review
            const users = await User.find({}, '_id email name avatar').lean();
            
            if (product.reviews && product.reviews.length > 0) {
                product.reviews = product.reviews.map(rev => {
                    const user = users.find(u => String(u._id) === String(rev.reviewerId) || u.email === rev.reviewerId || u.name === rev.name);
                    if (user && user.avatar) rev.avatar = user.avatar;
                    
                    if (rev.replies && rev.replies.length > 0) {
                        rev.replies = rev.replies.map(rep => {
                            const repUser = users.find(u => String(u._id) === String(rep.authorId) || u.email === rep.authorId || u.name === rep.authorName);
                            if (repUser && repUser.avatar) rep.avatar = repUser.avatar;
                            return rep;
                        });
                    }
                    return rev;
                });
            }
            res.json(product);
        } else {
            res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Lỗi Server khi lấy sản phẩm theo ID' });
    }
};

// Cập nhật đánh giá sản phẩm (bao gồm thêm, sửa, xóa, vote, reply)
const updateProductReviews = async (req, res) => {
    try {
        const { reviews } = req.body;
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
        }

        // Kiểm tra xem có review mới được thêm vào không
        const oldReviewsCount = product.reviews ? product.reviews.length : 0;
        const newReviewsCount = reviews ? reviews.length : 0;
        let newReviewAdded = false;
        let latestReview = null;

        if (newReviewsCount > oldReviewsCount) {
            newReviewAdded = true;
            latestReview = reviews[0]; // Giả định review mới nhất luôn ở đầu mảng
        }

        product.reviews = reviews;
        const updatedProduct = await product.save();

        // Nếu có review mới, tạo thông báo cho Admin
        if (newReviewAdded && latestReview) {
            let notifTitle = 'Đánh giá sản phẩm mới';
            let notifMessage = `Khách hàng ${latestReview.name || 'ẩn danh'} vừa đánh giá ${latestReview.rating} sao cho sản phẩm: ${product.name}`;
            
            if (latestReview.rating <= 2) {
                notifTitle = '🚨 CẢNH BÁO ĐÁNH GIÁ THẤP';
                notifMessage = `Khẩn cấp: ${latestReview.name || 'ẩn danh'} vừa đánh giá ${latestReview.rating} sao cho sản phẩm ${product.name}! Cần xử lý ngay.`;
            }
            try {
                const notif = new Notification({
                    type: 'review',
                    title: notifTitle,
                    message: notifMessage,
                    time: latestReview.date || new Date().toISOString(),
                    targetUrl: `product.html?id=${product._id}#review-section`,
                    isRead: false
                });
                await notif.save();
            } catch (notifErr) {
                console.error("Lỗi tạo thông báo:", notifErr);
            }
            
            // Phát notification qua WebSocket
            req.app.locals.broadcastNotification({
                type: 'review',
                title: notifTitle,
                message: notifMessage,
                time: latestReview.date || new Date().toISOString(),
                targetUrl: `/product.html?id=${product._id}#review-${latestReview.id}`,
                author: latestReview.name || 'ẩn danh'
            });
        }

        res.json(updatedProduct);
    } catch (error) {
        console.error("Lỗi khi cập nhật đánh giá sản phẩm:", error);
        res.status(500).json({ message: 'Lỗi Server khi cập nhật đánh giá sản phẩm' });
    }
};

// Trả lời đánh giá (Admin)
const replyReview = async (req, res) => {
    try {
        const { productId, reviewId, reply } = req.body;
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
        }

        // Tìm review cần trả lời
        const review = product.reviews.find(r => r.id === reviewId);
        if (!review) {
            return res.status(404).json({ message: 'Không tìm thấy đánh giá' });
        }

        // Cập nhật reply
        review.reply = reply;
        review.replyDate = new Date().toISOString();
        const updatedProduct = await product.save();

        // Tạo thông báo cho Khách hàng
        const notif = new Notification({
            type: 'reply',
            userId: review.userId, // ID người dùng nhận thông báo
            title: 'Shop đã phản hồi',
            message: `Quản trị viên đã trả lời đánh giá của bạn tại ${product.name}`,
            time: new Date().toISOString(),
            targetUrl: `/product.html?id=${product._id}#review-${review.id}`,
            author: 'Quản trị viên'
        });
        await notif.save();

        // Phát thông báo qua WebSocket
        req.app.locals.broadcastNotification(notif);

        res.json(updatedProduct);
    } catch (error) {
        console.error("Lỗi khi trả lời đánh giá:", error);
        res.status(500).json({ message: 'Lỗi Server khi trả lời đánh giá' });
    }
};

const createProduct = async (req, res) => {
    try {
        const product = new Product(req.body);
        const createdProduct = await product.save();
        res.status(201).json(createdProduct);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi Server khi tạo sản phẩm', error: error.message });
    }
};

const updateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            product.name = req.body.name || product.name;
            product.price = req.body.price || product.price;
            product.description = req.body.description || product.description;
            product.image = req.body.image || product.image;
            product.hoverImage = req.body.hoverImage || product.hoverImage;
            product.category = req.body.category || product.category;
            product.stock = req.body.stock !== undefined ? req.body.stock : product.stock;

            const updatedProduct = await product.save();
            res.json(updatedProduct);
        } else {
            res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Lỗi Server khi cập nhật sản phẩm', error: error.message });
    }
};

module.exports = { getProducts, getProductById, updateProductReviews, replyReview, createProduct, updateProduct };
