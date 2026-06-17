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
                notifTitle = ' CẢNH BÁO ĐÁNH GIÁ THẤP';
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

const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            await product.deleteOne();
            res.json({ message: 'Sản phẩm đã được xóa thành công' });
        } else {
            res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Lỗi Server khi xóa sản phẩm', error: error.message });
    }
};

const https = require('https');

// Helper to fetch content of a URL
function fetchUrl(url) {
    return new Promise((resolve, reject) => {
        https.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        }, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => { resolve(data); });
        }).on('error', (err) => { reject(err); });
    });
}

// Helper to classify products into logical Vietnamese categories
function getCategoryByName(name) {
    const norm = name.toLowerCase();
    
    // 1. Giày & Dép (Slides, Sandals, Dép, Giày)
    if (norm.includes('dép') || norm.includes('giày') || /slide|sandal|shoe/i.test(norm)) {
        return 'Giày & Dép';
    }
    
    // 2. Quần (Shorts, Pants, Trousers, Quần)
    if (norm.includes('quần') || /short|pant|trouser/i.test(norm)) {
        return 'Quần';
    }
    
    // 3. Áo đấu (Shirt, Jersey, Jacket, Hoodie, Coat, Top, Áo, Kit)
    if (norm.includes('áo') || /shirt|jersey|jacket|hoodie|coat|top|kit/i.test(norm)) {
        return 'Áo đấu';
    }
    
    // 4. Phụ kiện (Socks, Cap, Backpack, Football, Ball, Scarf, Bottle, Gloves, Beanie, Tất, Mũ, Balo, Bóng)
    if (norm.includes('tất') || norm.includes('mũ') || norm.includes('balo') || norm.includes('bóng') || norm.includes('găng') || /sock|cap|backpack|ball|football|scarf|bottle|glove|beanie/i.test(norm)) {
        return 'Phụ kiện';
    }
    
    return 'Phụ kiện'; // Fallback
}

// Helper to verify CDN image exists with fallback suffixes
function getWorkingCdnUrl(sku) {
    const skuLower = sku.toLowerCase();
    return new Promise((resolve) => {
        const f1Url = `https://i1.adis.ws/i/ArsenalDirect/${skuLower}_f1.jpg`;
        const b1Url = `https://i1.adis.ws/i/ArsenalDirect/${skuLower}_b1.jpg`;
        
        const req = https.request(f1Url, { method: 'HEAD' }, (res) => {
            if (res.statusCode === 200) {
                resolve({ image: f1Url, hoverImage: b1Url });
            } else {
                // Fallback suffix
                const fUrl = `https://i1.adis.ws/i/ArsenalDirect/${skuLower}_f.jpg`;
                const bUrl = `https://i1.adis.ws/i/ArsenalDirect/${skuLower}_b.jpg`;
                resolve({ image: fUrl, hoverImage: bUrl });
            }
        });
        req.on('error', () => {
            resolve({ 
                image: `https://i1.adis.ws/i/ArsenalDirect/${skuLower}_f.jpg`, 
                hoverImage: `https://i1.adis.ws/i/ArsenalDirect/${skuLower}_b.jpg` 
            });
        });
        req.setTimeout(1500, () => {
            req.destroy();
            resolve({ 
                image: `https://i1.adis.ws/i/ArsenalDirect/${skuLower}_f1.jpg`, 
                hoverImage: `https://i1.adis.ws/i/ArsenalDirect/${skuLower}_b1.jpg` 
            });
        });
        req.end();
    });
}

// Crawl and sync products from Arsenal Direct
const crawlProducts = async (req, res) => {
    try {
        const urls = [
            'https://arsenaldirect.arsenal.com/Football-Shirts-and-Kit/Home/c/home-kit',
            'https://arsenaldirect.arsenal.com/Football-Shirts-and-Kit/Away/c/away-kit',
            'https://arsenaldirect.arsenal.com/Football-Shirts-and-Kit/Third/c/third-kit'
        ];

        let allExtracted = [];

        for (const url of urls) {
            try {
                const html = await fetchUrl(url);
                const impressionsMatch = html.match(/['"]impressions['"]\s*:\s*\[([\s\S]*?)\]/);
                
                if (impressionsMatch) {
                    const rawItems = impressionsMatch[1].split(/},\s*\{|\}\s*,\s*\{/);
                    for (const item of rawItems) {
                        const nameMatch = item.match(/['"]?name['"]?\s*:\s*['"]([^'"]+)['"]/);
                        const idMatch = item.match(/['"]?id['"]?\s*:\s*['"]([^'"]+)['"]/);
                        const priceMatch = item.match(/['"]?price['"]?\s*:\s*([\d.]+)/);
                        const gbpMatch = item.match(/['"]?gbp_price['"]?\s*:\s*([\d.]+)/);
                        const brandMatch = item.match(/['"]?brand['"]?\s*:\s*['"]([^'"]+)['"]/);
                        
                        if (nameMatch && idMatch) {
                            const name = nameMatch[1];
                            const id = idMatch[1];
                            const priceUsd = priceMatch ? parseFloat(priceMatch[1]) : 0;
                            const priceGbp = gbpMatch ? parseFloat(gbpMatch[1]) : 0;
                            const brand = brandMatch ? brandMatch[1] : 'Adidas';
                            
                            allExtracted.push({ name, id, priceUsd, priceGbp, brand });
                        }
                    }
                }
            } catch (err) {
                console.error(`Lỗi fetch ${url}:`, err.message);
            }
        }

        // Apply strict filters:
        // 1. Only seasons from 2023 to present (contains 23, 24, 25, 26, 27)
        // 2. Exclude casual t-shirts/tees/polos (contains t-shirt, tee, polo, retro, casual, cotton, graphic, signature)
        const yearRegex = /\b(20)?(23|24|25|26|27)\b|23\/24|24\/25|25\/26|26\/27/i;
        const casualRegex = /\b(t-shirt|tee|polo|retro|casual|cotton|graphic|signature)\b/i;

        const filtered = allExtracted.filter(p => {
            const hasYear = yearRegex.test(p.name);
            const isCasual = casualRegex.test(p.name);
            return hasYear && !isCasual;
        });

        // De-duplicate by ID
        const uniqueMap = new Map();
        filtered.forEach(p => {
            uniqueMap.set(p.id, p);
        });

        // Resolve all images concurrently
        const uniqueValues = Array.from(uniqueMap.values());
        console.log(`Verifying ${uniqueValues.length} images concurrently...`);
        const resolvedImages = await Promise.all(uniqueValues.map(p => getWorkingCdnUrl(p.id)));

        let addedCount = 0;
        let updatedCount = 0;

        for (let i = 0; i < uniqueValues.length; i++) {
            const p = uniqueValues[i];
            const { image, hoverImage } = resolvedImages[i];

            // Price conversion:
            // 1. If GBP price is present, convert from GBP to VND (1 GBP = 32000 VND)
            // 2. If USD price is actually a pre-converted VND amount (e.g. > 10000), use directly
            // 3. Otherwise convert standard USD to VND (1 USD = 25000 VND)
            let finalPrice;
            if (p.priceGbp > 0) {
                finalPrice = Math.round(p.priceGbp * 32000);
            } else if (p.priceUsd > 10000) {
                finalPrice = Math.round(p.priceUsd);
            } else if (p.priceUsd > 0) {
                finalPrice = Math.round(p.priceUsd * 25000);
            } else {
                finalPrice = 2200000;
            }
            
            // Category mapping using smart classifier
            const category = getCategoryByName(p.name);

            const description = `${p.name} - Sản phẩm thi đấu chính thức từ bộ sưu tập Arsenal Direct của ${p.brand}. Thiết kế ôm dáng thể thao năng động, chất liệu polyester cao cấp thoáng mát, mang lại trải nghiệm chuyên nghiệp cho người hâm mộ.`;

            const productData = {
                name: p.name,
                image: image,
                hoverImage: hoverImage,
                description: description,
                category: category,
                price: finalPrice,
                stock: Math.floor(Math.random() * 21) + 10, // Random stock 10-30
            };

            const existing = await Product.findOne({ name: p.name });
            if (existing) {
                existing.price = productData.price;
                existing.image = productData.image;
                existing.hoverImage = productData.hoverImage;
                existing.category = productData.category;
                await existing.save();
                updatedCount++;
            } else {
                await Product.create(productData);
                addedCount++;
            }
        }

        res.json({
            success: true,
            message: `Đồng bộ thành công! Đã thêm mới ${addedCount} sản phẩm, cập nhật ${updatedCount} sản phẩm.`,
            count: addedCount + updatedCount,
            added: addedCount,
            updated: updatedCount
        });

    } catch (error) {
        console.error("Lỗi khi đồng bộ sản phẩm:", error);
        res.status(500).json({ success: false, message: 'Lỗi Server khi đồng bộ sản phẩm', error: error.message });
    }
};

module.exports = { getProducts, getProductById, updateProductReviews, replyReview, createProduct, updateProduct, deleteProduct, crawlProducts };

