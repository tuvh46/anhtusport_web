const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const User = require('./models/User');
const Notification = require('./models/Notification'); // Thêm Notification model
const Order = require('./models/Order');
const Product = require('./models/Product');

// Nạp biến môi trường
dotenv.config({ path: path.join(__dirname, '.env') });

// Kết nối Database
connectDB();

const importMockData = async () => {
    try {
        console.log('⏳ Đang tạo dữ liệu khách hàng và đơn hàng giả...');

        // 0. Làm sạch dữ liệu: Tìm và xóa khách hàng giả cũ cùng toàn bộ đơn hàng của họ
        const fakeUsers = await User.find({ email: { $regex: '^khachhang' } });
        const existingAdmin = await User.findOne({ isAdmin: true }); // Tìm admin thật
        const fakeUserIds = fakeUsers.map(u => u._id);

        const deletedOrders = await Order.deleteMany({ 
            $or: [
                { user: { $in: fakeUserIds } },
                { user: null }, 
                { user: { $exists: false } }, 
                { totalPrice: 0 }
            ] 
        });
        const deletedUsers = await User.deleteMany({ _id: { $in: fakeUserIds } });
        // Xóa tất cả reviews cũ của sản phẩm
        await Product.updateMany({}, { $set: { reviews: [] } });
        // Xóa tất cả notifications cũ
        await Notification.deleteMany({});
        console.log(`Đã xóa ${deletedUsers.deletedCount} khách hàng giả cũ, ${deletedOrders.deletedCount} đơn hàng cũ/rác, tất cả reviews và notifications.`);

        // 1. Lấy danh sách TẤT CẢ sản phẩm (cho Reviews)
        const allProducts = await Product.find();
        if (allProducts.length === 0) {
            console.log('⚠️ Không có sản phẩm nào. Vui lòng chạy file seeder.js trước!');
            process.exit();
        }
        // Lọc sản phẩm còn hàng (cho Orders)
        const stockedProducts = allProducts.filter(p => (p.stock !== undefined ? p.stock > 0 : p.countInStock > 0));
        if (stockedProducts.length === 0) {
            console.log('⚠️ Không có sản phẩm nào còn hàng để tạo đơn hàng. Vui lòng kiểm tra lại!');
        }

        // Dữ liệu địa chỉ mẫu chuẩn Việt Nam
        const citiesData = {
            'Hà Nội': {
                'Quận Đống Đa': ['Phường Ngã Tư Sở', 'Phường Ô Chợ Dừa', 'Phường Trung Liệt'],
                'Quận Cầu Giấy': ['Phường Dịch Vọng', 'Phường Quan Hoa', 'Phường Trung Hòa'],
                'Quận Thanh Xuân': ['Phường Thanh Xuân Bắc', 'Phường Thanh Xuân Nam', 'Phường Thượng Đình']
            },
            'Hồ Chí Minh': {
                'Quận 1': ['Phường Bến Nghé', 'Phường Bến Thành', 'Phường Phạm Ngũ Lão'],
                'Quận 3': ['Phường 1', 'Phường 2', 'Phường 3'],
                'Quận Bình Thạnh': ['Phường 1', 'Phường 3', 'Phường 5']
            },
            'Đà Nẵng': {
                'Quận Hải Châu': ['Phường Hải Châu 1', 'Phường Hải Châu 2', 'Phường Thạch Thang'],
                'Quận Sơn Trà': ['Phường An Hải Bắc', 'Phường An Hải Tây', 'Phường An Hải Đông']
            }
        };
        const streetNames = ['Đường Nguyễn Trãi', 'Đường Lê Lợi', 'Đường Trần Hưng Đạo', 'Đường Hai Bà Trưng', 'Đường Phan Đình Phùng', 'Đường Lý Thường Kiệt', 'Đường Hoàng Diệu', 'Đường Quang Trung'];

        // 2. Tạo 20 khách hàng giả
        const usersToInsert = [];
        const vnPrefixes = ['03', '05', '07', '08', '09']; // Các đầu số di động chuẩn ở VN
        
        // Từ điển tên người Việt Nam
        const lastNames = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý'];
        const maleMiddleNames = ['Văn', 'Hữu', 'Công', 'Quang', 'Minh', 'Xuân', 'Đình', 'Đức', 'Ngọc', 'Hải'];
        const femaleMiddleNames = ['Thị', 'Ngọc', 'Thu', 'Phương', 'Thanh', 'Hồng', 'Mỹ', 'Thúy', 'Lan', 'Bích'];
        const maleFirstNames = ['Dũng', 'Hùng', 'Mạnh', 'Thắng', 'Đạt', 'Tuấn', 'Kiên', 'Cường', 'Khoa', 'Thành', 'Long', 'Phúc', 'Bảo', 'Phong', 'Quân'];
        const femaleFirstNames = ['Hoa', 'Hương', 'Linh', 'Trang', 'Nga', 'Anh', 'Nhung', 'Trà', 'My', 'Vy', 'Yến', 'Hà', 'Nhi', 'Ly', 'Dung'];

        for (let i = 1; i <= 20; i++) {
            const prefix = vnPrefixes[Math.floor(Math.random() * vnPrefixes.length)];
            const suffix = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
            
            // Sinh ngẫu nhiên giới tính và tên
            const isMale = Math.random() > 0.5;
            const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
            const middleName = isMale ? maleMiddleNames[Math.floor(Math.random() * maleMiddleNames.length)] : femaleMiddleNames[Math.floor(Math.random() * femaleMiddleNames.length)];
            const firstName = isMale ? maleFirstNames[Math.floor(Math.random() * maleFirstNames.length)] : femaleFirstNames[Math.floor(Math.random() * femaleFirstNames.length)];
            const fullName = `${lastName} ${middleName} ${firstName}`;

            // Sinh địa chỉ ngẫu nhiên cho khách hàng
            const cityNames = Object.keys(citiesData);
            const randomCity = cityNames[Math.floor(Math.random() * cityNames.length)];
            const districtNames = Object.keys(citiesData[randomCity]);
            const randomDistrict = districtNames[Math.floor(Math.random() * districtNames.length)];
            const wards = citiesData[randomCity][randomDistrict];
            const randomWard = wards[Math.floor(Math.random() * wards.length)];
            const randomStreet = streetNames[Math.floor(Math.random() * streetNames.length)];
            const houseNumber = Math.floor(Math.random() * 200) + 1;

            const uniqueId = Date.now() + i; // Sinh ID độc nhất để tránh trùng lặp email
            usersToInsert.push({
                name: fullName,
                email: `khachhang${uniqueId}@gmail.com`,
                password: 'password123', // Mật khẩu giả
                phone: `${prefix}${suffix}`,
                address: `Số ${houseNumber} ${randomStreet}, ${randomWard}, ${randomDistrict}, ${randomCity}`,
                isAdmin: false
            });
        }
        
        const createdUsers = await User.insertMany(usersToInsert); // Tạo 20 khách hàng giả
        console.log(`Đã tạo ${createdUsers.length} khách hàng giả.`);

        // 3. Tạo các đơn hàng ngẫu nhiên từ tháng 1 đến tháng 4
        const ordersToInsert = [];
        // Phân bổ trạng thái ngẫu nhiên (nhiều đơn đã giao hơn)
        const statuses = ['delivered', 'delivered', 'delivered', 'delivered', 'delivered', 'delivered', 'shipping', 'shipping', 'pending', 'cancelled'];
        
        // Sử dụng năm hiện tại (hoặc có thể tuỳ chỉnh năm)
        const currentYear = new Date().getFullYear(); 

        for (const user of createdUsers) {
            // Mỗi khách hàng mua 1 - 4 đơn
            const numOrders = Math.floor(Math.random() * 4) + 1; 
            
            for (let j = 0; j < numOrders; j++) {
                // Random tháng 1, 2, 3, 4 (chỉ số 0 đến 3 trong object Date)
                const month = Math.floor(Math.random() * 4); 
                const day = Math.floor(Math.random() * 28) + 1;
                const orderDate = new Date(currentYear, month, day, Math.floor(Math.random() * 23), Math.floor(Math.random() * 59));
                
                const orderItems = [];
                const numItems = Math.floor(Math.random() * 3) + 1;
                let totalPrice = 0;
                
                for (let k = 0; k < numItems; k++) {
                    const randomProduct = stockedProducts[Math.floor(Math.random() * stockedProducts.length)]; // Chỉ chọn sản phẩm còn hàng
                    const qty = Math.floor(Math.random() * 2) + 1;
                    
                    orderItems.push({
                        id: randomProduct._id,
                        name: randomProduct.name,
                        image: randomProduct.image,
                        price: randomProduct.price,
                        qty: qty,
                        size: ['S', 'M', 'L', 'XL'][Math.floor(Math.random() * 4)]
                    });
                    
                    totalPrice += randomProduct.price * qty;
                }

                // Tách địa chỉ của khách hàng để điền vào đơn hàng
                const addressParts = user.address.split(', ');
                const orderCity = addressParts.pop(); // Lấy thành phố ra
                const orderAddress = addressParts.join(', '); // Phần còn lại là địa chỉ

                // Số điện thoại dự phòng (nếu User Schema không lưu phone dẫn đến bị undefined)
                const fallbackPhone = `${vnPrefixes[Math.floor(Math.random() * vnPrefixes.length)]}${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`;

                // 10% cơ hội khách hàng có thêm ghi chú
                const notes = ['Giao vào giờ hành chính', 'Gọi trước khi giao nhé', 'Vui lòng giao cho bảo vệ', 'Giao ngoài giờ hành chính', 'Đóng gói cẩn thận giúp mình'];
                const orderNote = Math.random() < 0.1 ? notes[Math.floor(Math.random() * notes.length)] : '';

                ordersToInsert.push({
                    user: user._id,
                    orderItems: orderItems,
                    shippingAddress: {
                        fullname: user.name,
                        phone: user.phone || fallbackPhone,
                        address: orderAddress,
                        city: orderCity
                    },
                    paymentMethod: 'COD',
                    totalPrice: totalPrice,
                    shippingFee: 30000,
                    discount: 0,
                    note: orderNote,
                    status: statuses[Math.floor(Math.random() * statuses.length)],
                    createdAt: orderDate,
                    updatedAt: orderDate
                });
            }
        }

        // Chèn vào Database
        await Order.insertMany(ordersToInsert);
        console.log(`Đã tạo ${ordersToInsert.length} đơn hàng giả rải rác trong tháng 1, 2, 3 và 4.`);

        // --- Bắt đầu phần sinh Reviews và Replies ---

        // 4. Sinh dữ liệu đánh giá (Reviews) và phản hồi (Replies)
        console.log('⏳ Đang tạo dữ liệu đánh giá và phản hồi giả...');

        const allReviewers = [...createdUsers];
        const customerReviewers = [...createdUsers];
        let adminForReplies = existingAdmin;

        if (existingAdmin) {
            allReviewers.push(existingAdmin);
        } else {
            // Nếu chưa có admin thật, tạo một admin tạm thời từ fake user đầu tiên
            if (createdUsers.length > 0) {
                createdUsers[0].isAdmin = true;
                createdUsers[0].name = 'Admin Cửa Hàng';
                createdUsers[0].email = 'admin@sportstore.com';
                await createdUsers[0].save();
                adminForReplies = createdUsers[0];
            }
        }
        
        // Nếu vẫn không có reviewer nào, dừng lại
        if (allReviewers.length === 0) {
            console.log('⚠️ Không có người dùng nào để tạo đánh giá. Vui lòng kiểm tra lại!');
            process.exit();
        }

        const reviewCommentsPositive = [
            "Sản phẩm quá tuyệt vời, y hình, chất liệu tốt, đáng tiền!",
            "Áo đấu đẹp xuất sắc, mình rất ưng ý. Giao hàng nhanh chóng.",
            "Chất vải mát, thấm hút mồ hôi tốt. Mặc đi đá bóng hay đi chơi đều ok.",
            "Không thể đòi hỏi gì hơn, sản phẩm đúng chuẩn Auth, lên form cực đẹp.",
            "Sản phẩm chất lượng cao, đúng như mô tả. Sẽ ủng hộ shop dài dài."
        ];
        const reviewCommentsNeutral = [
            "Sản phẩm tạm ổn, chưa thực sự nổi bật nhưng chấp nhận được.",
            "Giá hơi cao một chút, nhưng chất lượng cũng tương xứng.",
            "Giao hàng hơi lâu, nhưng sản phẩm thì cũng ổn áp.",
            "Màu sắc bên ngoài có vẻ hơi khác so với ảnh một chút, nhưng vẫn đẹp.",
            "Chưa có gì để phàn nàn, nhưng cũng chưa có gì đặc biệt."
        ];
        const reviewCommentsNegative = [
            "Sản phẩm không như mong đợi, chất liệu hơi tệ, vải mỏng.",
            "Hình ảnh và thực tế khác xa nhau, thất vọng.",
            "Áo bị lỗi đường chỉ, không xứng đáng với giá tiền.",
            "Giao hàng cực kỳ chậm, đóng gói sơ sài, sản phẩm bị nhàu nát.",
            "Sản phẩm kém chất lượng, sẽ không mua lại lần nữa."
        ];

        const adminReplies = [
            "Cảm ơn quý khách đã tin tưởng và ủng hộ sản phẩm của cửa hàng! Rất mong quý khách sẽ tiếp tục đồng hành cùng Arsenal Store.",
            "Arsenal Store rất vui khi sản phẩm đã làm hài lòng quý khách. Đừng quên theo dõi các chương trình ưu đãi mới nhất nhé!",
            "Chúng tôi chân thành cảm ơn đánh giá của quý khách và sẽ cố gắng cải thiện chất lượng dịch vụ hơn nữa.",
            "Xin lỗi quý khách về sự bất tiện này, chúng tôi sẽ kiểm tra lại vấn đề và liên hệ hỗ trợ trong thời gian sớm nhất.",
            "Cửa hàng đã tiếp nhận phản hồi của quý khách và đang tiến hành xử lý. Mong quý khách thông cảm."
        ];

        // Dữ liệu test Notifications Nhóm 1: User hỏi User
        const group1Questions = [
            "Bạn ơi cho mình hỏi bạn cao nặng bao nhiêu mà mặc áo size L vừa đẹp vậy ạ?",
            "Áo sân khách màu đen này giặt máy giặt mấy cái logo in nổi có bị bong tróc không bạn?",
            "Bạn mặc đi đá bóng thực tế rồi thấy vải có thoáng mồ hôi không, hay bị bí ạ?",
            "Màu đỏ ở ngoài nhìn có bị chói quá không bạn, hay giống màu đỏ bã trầu nguyên bản?",
            "Shop giao hàng cho bạn về TP.HCM mất khoảng mấy ngày vậy?",
            "Cái form áo dạo phố này mặc phối với quần jean nhìn có hợp không bạn ơi, xin review chân thật!",
            "Bạn mua loại này là form Player (ôm bó) hay form Fan (rộng rãi) thế ạ?"
        ];
        
        // Dữ liệu test Notifications Nhóm 2: User hỏi Admin
        const group2Questions = [
            "Shop ơi, áo đấu sân nhà size M chừng nào mới có hàng lại vậy ạ? Mình đợi lâu quá.",
            "Admin ơi, mình lỡ đặt nhầm size S bị chật, giờ mọc còn nguyên tem mác đổi sang size M được không? Phí ship đổi hàng tính sao shop?",
            "Mình đang ở Quận 1, đặt hỏa tốc thì trong chiều nay có nhận được luôn để tối mặc đi xem bóng đá không shop?",
            "Shop có nhận in tên với số áo của Saka hay Odegaard chuẩn font mùa giải năm nay luôn không ạ?",
            "Mình mua 1 áo đấu với 1 quần short tập luyện có được freeship hay tặng kèm móc khóa gì không shop ơi?",
            "Admin cho mình xin thêm ảnh thật chụp cam thường của cái áo khoác Anthem đen được không, ảnh web hơi khó nhìn chất vải.",
            "Cái quần short tập luyện này có túi zip kéo khóa ở hai bên không shop, mình hay mang điện thoại đi tập sợ rớt.",
            "Áo đấu có logo in nhiệt này thì lúc ủi (là) quần áo có cần phải lộn trái hay lót giấy không shop?"
        ];

        const mediaImageUrls = [
            'https://images.unsplash.com/photo-1549298916-b41f75e717d3?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGFyc2VuYWwlMjB8ZWtpdHxlbnwwfHwwfHw%3D',
            'https://images.unsplash.com/photo-1621243851576-928929837a76?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            'https://images.unsplash.com/photo-1579738012629-873099710777?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            'https://images.unsplash.com/photo-1621243851576-928929837a76?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            'https://images.unsplash.com/photo-1635319857900-54911d279316?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
        ];

        for (const product of allProducts) { // Lặp qua TẤT CẢ sản phẩm để tạo reviews
            const numReviews = Math.floor(Math.random() * 15) + 5; // 5 đến 20 reviews
            const productReviews = [];

            for (let r = 0; r < numReviews; r++) {
                const reviewer = customerReviewers[Math.floor(Math.random() * customerReviewers.length)]; // Chỉ khách hàng đánh giá
                
                // Logic ưu tiên 4, 5 sao
                let rating;
                const rand = Math.random();
                if (rand < 0.65) rating = 5; // 65% là 5 sao
                else if (rand < 0.95) rating = 4; // 30% là 4 sao (0.65 -> 0.95)
                else rating = Math.floor(Math.random() * 3) + 1; // 5% còn lại là 1, 2, 3 sao

                let comment = '';
                let isGroup1Question = false;
                let isGroup2Question = false;

                // Hàm hỗ trợ kiểm tra tên sản phẩm
                const productName = product.name.toLowerCase();
                const isShirt = productName.includes('áo') || productName.includes('a?o');
                const isPant = productName.includes('quần');
                const isSandal = productName.includes('dép') || productName.includes('dacp');

                // Lọc câu hỏi nhóm 1 theo sản phẩm
                let validGroup1Questions = group1Questions.filter(q => {
                    const qLower = q.toLowerCase();
                    if (qLower.includes('áo') || qLower.includes('size l') || qLower.includes('form')) return isShirt;
                    if (qLower.includes('quần')) return isPant;
                    if (qLower.includes('dép')) return isSandal;
                    return true; // Các câu hỏi chung
                });
                if (validGroup1Questions.length === 0) validGroup1Questions = group1Questions;

                // Lọc câu hỏi nhóm 2 theo sản phẩm
                let validGroup2Questions = group2Questions.filter(q => {
                    const qLower = q.toLowerCase();
                    if (qLower.includes('áo') || qLower.includes('size s') || qLower.includes('in tên')) return isShirt;
                    if (qLower.includes('quần short') || qLower.includes('túi zip')) return isPant;
                    if (qLower.includes('dép')) return isSandal;
                    return true; // Các câu hỏi chung
                });
                if (validGroup2Questions.length === 0) validGroup2Questions = group2Questions;

                let isVerifiedPurchase = false;

                // 30% cơ hội review này là câu hỏi từ Group 1 hoặc Group 2
                if (Math.random() < 0.3) {
                    rating = 0; // Câu hỏi không cần đánh giá sao
                    isVerifiedPurchase = false; // Câu hỏi thường đến từ người chưa mua
                    if (Math.random() < 0.5) {
                        comment = validGroup1Questions[Math.floor(Math.random() * validGroup1Questions.length)];
                        isGroup1Question = true;
                    } else {
                        comment = validGroup2Questions[Math.floor(Math.random() * validGroup2Questions.length)];
                        isGroup2Question = true;
                    }
                } else {
                    isVerifiedPurchase = true; // Đánh giá thực tế (có sao) thì bắt buộc phải là người đã mua
                    if (rating === 5) comment = reviewCommentsPositive[Math.floor(Math.random() * reviewCommentsPositive.length)];
                    else if (rating >= 3) comment = reviewCommentsNeutral[Math.floor(Math.random() * reviewCommentsNeutral.length)];
                    else comment = reviewCommentsNegative[Math.floor(Math.random() * reviewCommentsNegative.length)];
                }

                // Random media
                const media = []; // Tạm thời xóa ảnh khỏi đánh giá

                // Random likes/dislikes
                const likes = [];
                const dislikes = [];
                for (const otherUser of allReviewers) {
                    if (otherUser._id.toString() !== reviewer._id.toString()) {
                        if (Math.random() < 0.1) likes.push(otherUser._id.toString());
                        if (Math.random() < 0.05) dislikes.push(otherUser._id.toString());
                    }
                }

                const reviewDate = new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000); // Trong vòng 90 ngày

                const review = {
                    id: Date.now() + r + Math.floor(Math.random() * 1000), // ID duy nhất
                    reviewerId: reviewer._id.toString(),
                    name: reviewer.name,
                    isAdmin: false, // Reviewer luôn là khách hàng
                    isVerifiedPurchase: isVerifiedPurchase, // Chỉ những review thật mới là đã mua hàng
                    rating: rating,
                    comment: comment,
                    date: reviewDate.toISOString(),
                    likes: likes,
                    dislikes: dislikes,
                    media: media,
                    isEdited: Math.random() < 0.05, // 5% đã chỉnh sửa
                    isPinned: Math.random() < 0.02 && !!adminForReplies, // 2% admin ghim
                    replies: []
                };

                // Sinh replies cho review này
                if (isGroup1Question) {
                    // Nếu là Group 1, tạo 1 reply từ khách hàng khác
                    let replyAuthor = customerReviewers[Math.floor(Math.random() * customerReviewers.length)];
                    while(replyAuthor._id.toString() === reviewer._id.toString()) {
                        replyAuthor = customerReviewers[Math.floor(Math.random() * customerReviewers.length)];
                    }

                    const group1Replies = {
                        "Bạn ơi cho mình hỏi bạn cao nặng bao nhiêu mà mặc áo size L vừa đẹp vậy ạ?": "Mình cao 1m75 nặng 68kg mặc vừa in nha bạn ơi!",
                        "Áo sân khách màu đen này giặt máy giặt mấy cái logo in nổi có bị bong tróc không bạn?": "Mình lộn trái giặt máy thấy vẫn oke bạn ạ, nhưng giặt tay chắc sẽ bền hơn.",
                        "Bạn mặc đi đá bóng thực tế rồi thấy vải có thoáng mồ hôi không, hay bị bí ạ?": "Vải rất thoáng nhé, đá xong mồ hôi khô nhanh lắm, không bị bết rít.",
                        "Màu đỏ ở ngoài nhìn có bị chói quá không bạn, hay giống màu đỏ bã trầu nguyên bản?": "Màu đỏ thẫm đẹp lắm bạn, giống màu cờ Arsenal chứ không chói đâu.",
                        "Shop giao hàng cho bạn về TP.HCM mất khoảng mấy ngày vậy?": "Tầm 2-3 ngày là shop giao tới TP.HCM rồi nha bạn, nhanh lắm.",
                        "Cái form áo dạo phố này mặc phối với quần jean nhìn có hợp không bạn ơi, xin review chân thật!": "Mặc phối với quần jean hoặc quần đùi đều đẹp, lên form rất ok.",
                        "Bạn mua loại này là form Player (ôm bó) hay form Fan (rộng rãi) thế ạ?": "Mình mua form Fan mặc đi chơi cho thoải mái bạn ạ."
                    };
                    const replyText = group1Replies[comment] || "Chào bạn, theo mình thì sản phẩm rất ổn nhé, bạn nên tham khảo nha!";

                    review.replies.push({
                        id: Date.now() + r + Math.floor(Math.random() * 10000),
                        authorId: replyAuthor._id.toString(),
                        authorName: replyAuthor.name,
                        isAdmin: false,
                        text: replyText,
                        date: new Date(reviewDate.getTime() + Math.floor(Math.random() * 2) * 24 * 60 * 60 * 1000).toISOString(), 
                        likes: [], dislikes: []
                    });
                } else if (isGroup2Question) {
                    // Nếu là Group 2, tạo 1 reply từ admin
                    if (adminForReplies) {
                        review.replies.push({
                            id: Date.now() + r + Math.floor(Math.random() * 10000),
                            authorId: adminForReplies._id.toString(),
                            authorName: adminForReplies.name,
                            isAdmin: true,
                            text: "Dạ shop chào bạn ạ. Cảm ơn bạn đã quan tâm đến sản phẩm. Bạn vui lòng kiểm tra inbox để shop hỗ trợ chi tiết hơn nhé!",
                            date: new Date(reviewDate.getTime() + Math.floor(Math.random() * 2) * 24 * 60 * 60 * 1000).toISOString(), 
                            likes: [], dislikes: []
                        });
                    }
                } else if (Math.random() < 0.3) {
                    // Bình thường có 30% cơ hội có 1 phản hồi từ admin
                    if (adminForReplies) {
                        review.replies.push({
                            id: Date.now() + r + Math.floor(Math.random() * 10000),
                            authorId: adminForReplies._id.toString(),
                            authorName: adminForReplies.name,
                            isAdmin: true,
                            text: adminReplies[Math.floor(Math.random() * adminReplies.length)],
                            date: new Date(reviewDate.getTime() + Math.floor(Math.random() * 5) * 24 * 60 * 60 * 1000).toISOString(), // Sau ngày review
                            likes: [], dislikes: []
                        });
                    }
                }
                productReviews.push(review);
            }

            // Cập nhật reviews vào sản phẩm
            product.reviews = productReviews;
            await product.save();
        }
        console.log(`Đã tạo đánh giá và phản hồi giả cho ${allProducts.length} sản phẩm.`);

        console.log('Hoàn tất việc tạo dữ liệu mẫu!');
        process.exit();
    } catch (error) {
        console.error('Lỗi khi seed data:', error);
        process.exit(1);
    }
};

importMockData();
