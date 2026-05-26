const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const User = require('./models/User');
const Notification = require('./models/Notification'); // Thêm Notification model
const Order = require('./models/Order');
const Product = require('./models/Product');
const Voucher = require('./models/Voucher'); // Thêm Voucher model

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
        // Xóa tất cả vouchers cũ
        await Voucher.deleteMany({});

        console.log(`Đã xóa ${deletedUsers.deletedCount} khách hàng giả cũ, ${deletedOrders.deletedCount} đơn hàng cũ/rác, tất cả reviews, notifications và vouchers.`);

        // 1. Lấy danh sách TẤT CẢ sản   phẩm (cho Reviews)
        const allProducts = await Product.find();
        if (allProducts.length === 0) {
            console.log('⚠️ Không có sản phẩm nào. Vui lòng chạy file seeder.js trước!');
            process.exit();
        }
        // Lọc sản phẩm còn hàng (cho Orders)
        const stockedProducts = allProducts.filter(p => (p.stock !== undefined ? p.stock > 0 : p.countInStock > 0));
        if (stockedProducts.length === 0) {
            console.log('Không có sản phẩm nào còn hàng để tạo đơn hàng. Vui lòng kiểm tra lại!');
        }

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
        const vnPrefixes = ['03', '05', '07', '08', '09'];
        
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

        // --- TẠO VOUCHER MẶC ĐỊNH ---
        const expiryDate = new Date();
        expiryDate.setFullYear(expiryDate.getFullYear() + 1); // Hết hạn sau 1 năm

        await Voucher.create({
            code: 'ARSENALNEW',
            discount: 10,
            type: 'percent',
            uses: 9999,
            expires: expiryDate,
            category: ''
        });
        console.log('✅ Đã tạo voucher ARSENALNEW mới, hết hạn sau 1 năm.');


        // --- Bắt đầu phần sinh Reviews và Replies ---

        // 4. Sinh dữ liệu đánh giá (Reviews) và phản hồi (Replies)
        console.log(' Đang tạo dữ liệu đánh giá và phản hồi giả...');

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
            console.log(' Không có người dùng nào để tạo đánh giá. Vui lòng kiểm tra lại!');
            process.exit();
        }

        // ============================================================
        // DỮ LIỆU ĐÁNH GIÁ THỦ CÔNG – Mỗi sản phẩm 9-10 review logic
        // Mỗi review: { rating, comment, reply (null = không trả lời), isVerifiedPurchase }
        // ============================================================
        const getProductReviewTemplates = (productName) => {
            const n = productName.toLowerCase();

            // QUAN TRỌNG: Kiểm tra "trẻ em" / "kids" TRƯỚC "sân nhà"
            if (n.includes('trẻ em') || n.includes('kids') || n.includes('kid1')) {
                return [
                    { rating: 5, isVerifiedPurchase: true,
                      comment: "Mua cho con trai 8 tuổi là fan Arsenal nhí. Bé mặc thử lên cực cute, vải mềm mại không kích ứng da của bé. Bé mặc đi học thêm mà bạn bè ai cũng khen. Sẽ mua thêm áo sân khách cho con.",
                      reply: "Gooner nhí 8 tuổi mặc áo Arsenal đến học thêm – quá đáng yêu! Cảm ơn bạn đã chia sẻ. Chúc bé tiếp tục là fan Arsenal trung thành nhé! 🔴⚽" },
                    { rating: 5, isVerifiedPurchase: true,
                      comment: "Quà sinh nhật cho cháu 10 tuổi. Cháu thích Arsenal nên nhận áo xong mừng lắm. Chất vải mềm không thô ráp, không làm ngứa da nhạy cảm của trẻ. Size chart trẻ em của shop ghi rõ và chuẩn.",
                      reply: null },
                    { rating: 4, isVerifiedPurchase: true,
                      comment: "Áo đẹp và chất tốt. Chỉ muốn góp ý là nếu shop có thêm option in tên + số áo cho áo trẻ em thì sẽ càng hoàn hảo hơn. Nhiều phụ huynh như mình muốn in tên con lên áo làm quà đặc biệt.",
                      reply: "Cảm ơn gợi ý rất hay! Dịch vụ in tên cho áo trẻ em là ý tưởng tuyệt vời. Shop sẽ nghiên cứu và triển khai trong thời gian sớm nhất. Bạn theo dõi shop để được ưu tiên đặt trước nhé!" },
                    { rating: 5, isVerifiedPurchase: true,
                      comment: "Con mình 12 tuổi, cao 1m50, chọn size 13-14Y vừa đẹp. Áo chất lượng như áo người lớn nhưng form cắt cho trẻ em thoải mái hơn khi vận động. Bé mặc đi đá bóng với bạn trông rất tự tin.",
                      reply: null },
                    { rating: 3, isVerifiedPurchase: true,
                      comment: "Áo đẹp nhưng mình thấy màu đỏ trên áo trẻ em có vẻ hơi nhạt hơn áo người lớn mình đang có. Không biết có phải do khác batch sản xuất không. Về chất liệu vải thì ổn, bé mặc thoải mái.",
                      reply: "Cảm ơn bạn đã nhận xét tinh tế! Áo trẻ em và người lớn cùng mùa giải sẽ cùng tone màu. Có thể màn hình hoặc ánh sáng chụp ảnh khiến màu trông khác. Bạn có thể inbox hình để shop kiểm tra nhé!" },
                    { rating: 5, isVerifiedPurchase: true,
                      comment: "Mua áo Arsenal nhí cho cả 2 con (5 tuổi và 9 tuổi). Đều vừa size theo chart, vải mềm và thoáng. Hai bé mặc cùng áo đỏ chụp ảnh trông quá cute. Gia đình mình tất cả là fan Arsenal nên rất hài lòng.",
                      reply: "Gia đình Arsenal – điều tuyệt vời nhất! Hai bé mặc áo đỏ chụp cùng nhau chắc cute lắm, cảm ơn gia đình bạn đã ủng hộ! 🔴🔴❤️" },
                    { rating: 4, isVerifiedPurchase: false,
                      comment: "Chất áo ổn, bé thích mặc. Giá áo trẻ em khá cao so với mặt bằng chung nhưng đây là hàng chính hãng nên chấp nhận được. Mua 1 cái vẫn rẻ hơn mua fake nhiều lần.",
                      reply: null },
                    { rating: 5, isVerifiedPurchase: true,
                      comment: "Mua áo để bé mặc đi xem trận Arsenal ở quán cà phê bóng đá. Bé mặc áo đỏ ngồi cổ vũ trông đúng chuẩn fan nhí Arsenal. Chất áo mềm và nhẹ, bé không bị nóng ngồi trong quán suốt trận.",
                      reply: null },
                    { rating: 2, isVerifiedPurchase: true,
                      comment: "Áo giao về màu không đúng – mình đặt áo đỏ sân nhà nhưng nhận được áo trắng ngà (áo thứ 3). Đã inbox shop và được xử lý đổi hàng, nhưng mất thêm 4 ngày chờ đợi. Mong shop kiểm tra kỹ hơn trước khi ship.",
                      reply: "Thật sự rất xin lỗi về sự nhầm lẫn nghiêm trọng này! Đây hoàn toàn là lỗi đóng gói của shop. Chúng mình đã tăng cường kiểm tra 2 lớp trước khi giao hàng. Cảm ơn bạn đã kiên nhẫn xử lý cùng shop!" },
                ];
            }
            if (n.includes('sân khách') || n.includes('away')) {
                return [
                    { rating: 5, isVerifiedPurchase: true,
                      comment: "Áo sân khách mùa này là thiết kế đẹp nhất trong 5 năm trở lại đây theo quan điểm cá nhân mình. Họa tiết tia sét nền xanh hải quân nhìn cực kỳ phong cách và khác biệt. Mình mua để sưu tầm chứ không mặc đi đá bóng, đóng gói rất cẩn thận.",
                      reply: "Cảm ơn bạn, thiết kế mùa này Arsenal dựa trên biểu tượng lịch sử của CLB nên rất đặc biệt. Chúc bạn có bộ sưu tập ngày càng đầy đủ! 🏆" },
                    { rating: 5, isVerifiedPurchase: true,
                      comment: "Chất AEROREADY trên áo sân khách mùa này cải tiến hơn so với mùa trước, mình mặc chạy bộ 7km mà vẫn cảm thấy khô thoáng. Màu xanh đẹp đặc biệt, dưới nắng nhìn rất bắt mắt.",
                      reply: null },
                    { rating: 4, isVerifiedPurchase: true,
                      comment: "Áo đẹp xuất sắc, nhưng màu thực tế hơi tối hơn ảnh chụp trên web một chút. Dưới ánh đèn LED nhà mình thì thấy rõ nhưng ra ngoài dưới nắng lại đẹp đúng chuẩn. Không phải lỗi của shop, chỉ là màn hình mỗi người hiển thị khác nhau thôi.",
                      reply: null },
                    { rating: 5, isVerifiedPurchase: true,
                      comment: "Mình cao 1m80 nặng 78kg thường mặc size XL. Áo sân khách size XL vừa khít, không rộng thùng thình. Họa tiết tia sét ở thân áo khi mặc lên rất sắc nét, không bị kéo méo hay mờ. Shop giao đúng hẹn.",
                      reply: null },
                    { rating: 3, isVerifiedPurchase: true,
                      comment: "Áo đẹp nhưng mình thấy đường viền bo ở cổ áo hơi cứng, mặc mấy buổi đầu bị cộ nhẹ vào cổ. Phải giặt và mặc vài lần mới mềm ra. Chất lượng tổng thể vẫn tốt, chỉ cần thời gian làm quen.",
                      reply: "Cảm ơn bạn đã phản hồi! Phần viền cổ áo vải interlock ban đầu hơi cứng là bình thường, sẽ mềm hơn sau 2-3 lần giặt. Bạn nhớ giặt lộn trái để giữ màu lâu hơn nhé!" },
                    { rating: 5, isVerifiedPurchase: true,
                      comment: "Mua 2 cái: 1 để mặc và 1 để giữ nguyên hộp sưu tập. Nhìn thật sự quá đẳng cấp. Seal hộp đóng gói của shop cũng cẩn thận, tem hãng còn nguyên vẹn. Rất yên tâm về nguồn gốc hàng hóa.",
                      reply: "Bạn là fan cuồng nhiệt thực thụ khi mua 2 cái sưu tầm! Arsenal Store luôn đảm bảo hàng auth 100% với tem và hộp nguyên vẹn. Cảm ơn bạn rất nhiều! ⚡🔵" },
                    { rating: 4, isVerifiedPurchase: true,
                      comment: "Áo được cái nhẹ và thoáng, mặc đi tập bóng cùng hội bạn trông cực xịn. Chỉ muốn góp ý là phần nách áo khi cử động mạnh cảm giác hơi chật, có thể tăng 1 size nếu vai rộng.",
                      reply: null },
                    { rating: 2, isVerifiedPurchase: true,
                      comment: "Áo nhận về có 1 vết sước nhỏ trên logo, nhìn kỹ mới thấy nhưng vẫn buồn. Có thể do vận chuyển. Mình đã báo shop và đang chờ xử lý.",
                      reply: "Rất xin lỗi bạn về sự cố này! Shop đã xem xét và sẽ gửi đổi hàng mới cho bạn trong 24h. Cảm ơn bạn đã kiên nhẫn và thông báo kịp thời!" },
                    { rating: 5, isVerifiedPurchase: true,
                      comment: "Đặt áo sân khách + quần short sân khách thành combo, mặc cả bộ nhìn đúng chuẩn Gunner. Giao hàng 3 ngày về tận Đà Nẵng, đóng gói an toàn. Đây là lần thứ 3 mình mua từ shop và lần nào cũng hài lòng.",
                      reply: "Ba lần mua hàng, ba lần Arsenal Store cảm ơn bạn! Bộ combo sân khách nhìn rất cool, bạn chụp ảnh mặc thử tag shop nhé 📸 ❤️" },
                ];
            }
            if (n.includes('thứ ba') || n.includes('third')) {
                return [
                    { rating: 5, isVerifiedPurchase: true,
                      comment: "Áo thứ 3 mùa này lấy cảm hứng từ Highbury – sân cũ của Arsenal – nên đặc biệt về mặt lịch sử. Thiết kế Art Deco vô cùng tinh tế và khác biệt. Màu trắng ngà hơi cream nhìn sang trọng hơn áo trắng thông thường.",
                      reply: null },
                    { rating: 5, isVerifiedPurchase: true,
                      comment: "Mình là fan cứng từ thời Highbury nên áo này rất có ý nghĩa. Khi cầm trên tay thấy ngay chất lượng, vải dày dặn hơn áo training thông thường. Chữ Arsenal ở lưng áo in rất sắc nét. Đáng từng xu!",
                      reply: "Cảm ơn bạn Gooner lâu năm! Chiếc áo này thật sự là món quà ý nghĩa cho những fan từng chứng kiến thời kỳ Highbury huy hoàng 🏟️❤️" },
                    { rating: 4, isVerifiedPurchase: false,
                      comment: "Áo đẹp nhưng màu trắng ngà này rất dễ bẩn nếu mặc đi đá bóng thật sự. Mình mua để đi chơi hoặc xem trận nên không vấn đề. Ai mua để thi đấu thì nên cân nhắc kỹ.",
                      reply: "Cảm ơn bạn đã chia sẻ rất thực tế! Áo thứ 3 Arsenal thường được dùng cho Champions League nên thiết kế hướng đến mặc trên sân khấu lớn. Đi xem trận hay dạo phố đều rất đẹp bạn nhé!" },
                    { rating: 5, isVerifiedPurchase: true,
                      comment: "Đặt áo cho cả nhóm bạn 5 người, tất cả đều hài lòng. Shop xử lý đơn số lượng nhiều rất nhanh, giao hàng đúng hạn. Size chart chuẩn không cần điều chỉnh. Recommend 100%.",
                      reply: "Ôi 5 người đều mặc áo thứ 3 Arsenal chắc trông rất đẹp! Cảm ơn nhóm bạn đã tin tưởng shop, lần sau nhóm bạn mua nhiều hơn 5 cái inbox shop để được ưu đãi đặc biệt nhé! ⚽❤️" },
                    { rating: 3, isVerifiedPurchase: true,
                      comment: "Nhìn ảnh trên web thì màu trắng ngà này đẹp lắm nhưng ngoài đời thực nhìn hơi 'già' và không phù hợp với mình (mình 20 tuổi). Mình thích hơn áo đỏ sân nhà hoặc áo xanh navy. Về chất liệu áo thì ổn.",
                      reply: null },
                    { rating: 5, isVerifiedPurchase: true,
                      comment: "Mua áo thứ 3 để xem trận Champions League tại nhà cùng bạn bè. Mặc cả trận từ 21h đến 23h vẫn thoải mái, không bí, không ngứa. Fabric AEROREADY thực sự hiệu quả. Cảm ơn shop!",
                      reply: "Arsenal Store cảm ơn bạn đã chọn shop! Chúc đêm xem bóng thật vui, Arsenal sẽ tiến sâu ở Champions League mùa này 🏆⚡" },
                    { rating: 4, isVerifiedPurchase: true,
                      comment: "Áo đẹp, thiết kế Art Deco rất độc đáo. Điểm trừ nhỏ là kích cỡ nhãn mác phía trong cổ áo hơi to và cứng, mặc lâu bị cộ vào gáy. Mình đã cắt nhãn ra và ổn hơn rồi.",
                      reply: null },
                    { rating: 5, isVerifiedPurchase: true,
                      comment: "Lần đầu mua áo đấu chính hãng thay vì hàng fake. Sự khác biệt RẤT RÕ RÀNG: vải mịn hơn, nhẹ hơn, thoát hơi tốt hơn, và đặc biệt huy hiệu Arsenal không bị nhòe hay bong. Đây là tiêu chuẩn mới của mình.",
                      reply: "Một khi đã trải nghiệm hàng auth, không thể quay lại nữa đúng không! Cảm ơn bạn đã ủng hộ chính hãng, chúng mình sẽ cố gắng giữ giá và chất lượng tốt nhất! 💯" },
                    { rating: 2, isVerifiedPurchase: true,
                      comment: "Mình đặt size M nhưng nhận được size S. Khi inbox shop thì được xử lý đổi nhanh trong 2 ngày nhưng vẫn mất thêm thời gian chờ. Áo khi nhận đúng thì đẹp, nhưng lỗi giao hàng nhầm size như thế này cần cải thiện.",
                      reply: "Thật sự rất xin lỗi bạn về sự nhầm lẫn đáng tiếc này! Đây hoàn toàn là lỗi của bên shop trong khâu đóng gói. Shop đã rút kinh nghiệm và tăng cường kiểm tra kép trước khi giao hàng. Cảm ơn bạn đã kiên nhẫn!" },
                    { rating: 5, isVerifiedPurchase: true,
                      comment: "Áo đặc biệt nhất trong bộ sưu tập của mình. Đêm Arsenal thắng PSG ở Champions League mình mặc cái này và như có phép thần ✨. Giao hàng nhanh, đóng gói đẹp, hàng auth 100%. Không có gì để phàn nàn.",
                      reply: null },
                ];
            }
            if (n.includes('sân nhà')) {
                return [
                    { rating: 5, isVerifiedPurchase: true,
                      comment: "Áo sân nhà mùa này thiết kế quá đỉnh, mình đặt trước ngay khi announce. Chất vải AEROREADY mặc vào thoáng hơn hẳn mùa trước, đường thêu huy hiệu Pháo Thủ sắc sảo và nổi bề mặt rõ ràng. Mình cao 1m78 nặng 72kg chọn size L vừa đúng chuẩn, không quá bó không quá rộng. Sẽ mặc đi xem trận Derby sắp tới!",
                      reply: "Cảm ơn bạn đã tin tưởng Arsenal Store! Chúc bạn xem trận thật vui và Arsenal giành chiến thắng nhé 💪🔴⚪" },
                    { rating: 5, isVerifiedPurchase: true,
                      comment: "Mua làm quà sinh nhật cho ông xã là fan Arsenal cuồng nhiệt. Nhận hàng về chồng mình đã mặc ngay và không chịu cởi ra 😂. Chất lượng áo đúng như hình, giao hàng được đóng gói cẩn thận, có túi zip riêng bọc áo rất chuyên nghiệp.",
                      reply: "Cảm ơn bạn đã chia sẻ, chúc ông xã sinh nhật vui vẻ và luôn giữ ngọn lửa Arsenal nha! 🎁🔴" },
                    { rating: 4, isVerifiedPurchase: true,
                      comment: "Áo đẹp, chất chuẩn hàng chính hãng. Chỉ tiếc logo Premier League Champions ở tay áo in hơi nhỏ, nhìn gần mới thấy rõ. Còn lại thì mọi thứ đều ổn, giao đúng size, màu đỏ đúng tone như ảnh web.",
                      reply: null },
                    { rating: 5, isVerifiedPurchase: true,
                      comment: "Đây là chiếc áo đấu thứ 4 mình mua từ shop, lần nào cũng hài lòng. Mùa này kiểu dáng Gothic letter ở thân áo là điểm nhấn siêu đặc biệt. Chất vải mỏng nhẹ nhưng không bị trong suốt, mặc đi dạo phố hay lên sân đều ổn.",
                      reply: "Cảm ơn bạn đã đồng hành cùng Arsenal Store qua 4 mùa giải! Bạn là một Gooner thực thụ 🏆❤️" },
                    { rating: 3, isVerifiedPurchase: true,
                      comment: "Áo nhìn ngoài ổn, nhưng đường may ở cổ áo có 1 đoạn chỉ bị thừa ra ngoài trông hơi xấu. Mình đã cắt đi rồi nhưng vẫn hơi tiếc ở mức giá này.",
                      reply: "Rất xin lỗi bạn về trải nghiệm không tốt này. Lỗi đường may dù nhỏ cũng ảnh hưởng đến chất lượng. Bạn inbox cho shop để được xem xét đổi hoặc bồi thường nhé!" },
                    { rating: 5, isVerifiedPurchase: true,
                      comment: "Size M vừa đẹp với người 1m72, 65kg. Màu đỏ rực đúng tông cờ Arsenal, không phải đỏ nhạt hay cam như một số hàng fake trên thị trường. Logo thêu 3D nổi bật, cầm tay thấy rõ texture. Giao hàng Hà Nội 2 ngày là có hàng.",
                      reply: null },
                    { rating: 2, isVerifiedPurchase: true,
                      comment: "Áo nhận về size L nhưng mặc lên cảm giác nhỏ hơn so với các áo L từ mùa trước. Hỏi shop thì được tư vấn mùa này cut slim hơn, nhưng mình thấy thông tin này nên ghi rõ trên web để tránh mua nhầm.",
                      reply: "Bạn phản hồi rất xác đáng, mùa 2025-26 Arsenal có thay đổi cut về slim-fit hơn. Shop sẽ bổ sung thông tin này vào phần mô tả ngay. Cảm ơn bạn đã nhắc nhở!" },
                    { rating: 5, isVerifiedPurchase: true,
                      comment: "Mình order online lần đầu, ban đầu hơi lo về chất lượng. Nhưng nhận hàng xong hoàn toàn yên tâm – áo xịn, chất đúng Auth, huy hiệu thêu đẹp. Giao hàng nhanh hơn dự kiến 1 ngày. Chắc chắn sẽ quay lại mua thêm áo sân khách.",
                      reply: "Cảm ơn bạn đã tin tưởng mua lần đầu! Shop luôn đảm bảo hàng chính hãng 100%. Hẹn gặp lại bạn ở đơn áo sân khách nhé 😊" },
                    { rating: 4, isVerifiedPurchase: true,
                      comment: "Áo đẹp, nhưng ship hơi lâu – mình đặt thứ 6 mà thứ 4 tuần sau mới nhận được. Shop giải thích do hàng mới về nhiều đơn. Về sản phẩm thì 10/10, chỉ tiếc khâu giao hàng cần cải thiện thêm.",
                      reply: "Bạn thông cảm nhé, đợt đầu mùa giải hàng hot nên đơn xử lý nhiều hơn bình thường. Shop đang tuyển thêm nhân sự để cải thiện tốc độ ship. Mong được phục vụ bạn tốt hơn lần sau!" },
                    { rating: 5, isVerifiedPurchase: true,
                      comment: "Mình đi xem trận Arsenal vs MCI ở quán và một fan MCI hỏi mua áo từ đâu vì nhìn xịn quá 😅. Chất thật sự rất khác hàng chợ, bo viền sắc sảo, số áo Saka in nhiệt chuẩn font. Xứng đáng 5 sao.",
                      reply: null },
                ];
            }
            if (n.includes('quần') || n.includes('short')) {
                return [
                    { rating: 5, isVerifiedPurchase: true,
                      comment: "Quần short Arsenal Originals này mặc đi đá bóng với hội bạn thứ 7 hàng tuần, mặc xong giặt về form không bị biến dạng. Cạp chun co giãn tốt, dây rút điều chỉnh vừa vặn. Túi 2 bên đủ sâu để đựng chìa khóa xe.",
                      reply: null },
                    { rating: 4, isVerifiedPurchase: true,
                      comment: "Quần mặc mát, vải nhẹ thoáng. Chỉ góp ý là túi bên trong không có khóa kéo, để điện thoại đá bóng hơi lo. Nhưng vì form quần cổ điển của Arsenal Originals nên design như thế cũng chấp nhận được.",
                      reply: "Cảm ơn bạn đã góp ý! Thiết kế Originals giữ nguyên form retro nên không có túi zip. Bạn có thể cân nhắc thêm túi chạy ngoài nhỏ để đựng điện thoại khi đá bóng nhé!" },
                    { rating: 5, isVerifiedPurchase: true,
                      comment: "Mua kèm áo sân nhà thành bộ đôi hoàn chỉnh. Màu đỏ-trắng phối với nhau chuẩn combo Gunner. Size L vừa với mình 1m76/70kg. Giao hàng nhanh, đóng gói cẩn thận.",
                      reply: "Bộ áo + quần Gunner nhìn rất ngầu! Cảm ơn bạn đã chọn combo trọn bộ. Lần sau nếu cần tất hoặc dép để hoàn thiện set, shop sẵn sàng tư vấn nhé!" },
                    { rating: 3, isVerifiedPurchase: true,
                      comment: "Quần mặc ổn nhưng ống quần hơi rộng so với sở thích của mình (mình thích slim-fit hơn). Không phải lỗi sản phẩm vì đây là phong cách Arsenal Originals vốn rộng rãi. Người nào thích form retro rộng sẽ yêu cái này.",
                      reply: null },
                    { rating: 5, isVerifiedPurchase: true,
                      comment: "Chất vải nhẹ và thoát mồ hôi cực tốt. Mình hay đi gym buổi sáng trước giờ làm, mặc cái này tập xong mồ hôi khô nhanh không bết dính. Logo Arsenal in sắc và không phai sau nhiều lần giặt máy.",
                      reply: null },
                    { rating: 4, isVerifiedPurchase: false,
                      comment: "Đặt online lần đầu lo về size, nhưng may mà size chart shop chỉ rất chuẩn. Size M vừa với 1m70/62kg. Quần form đẹp, chất vải ổn. Giao hàng về TP.HCM mất 3 ngày.",
                      reply: null },
                    { rating: 5, isVerifiedPurchase: true,
                      comment: "Mình là coachline của đội bóng phong trào, đặt 6 cái cùng lúc. Shop hỗ trợ đơn số lượng nhiệt tình, giao đủ và đúng size. Cả đội mặc đồng phục Arsenal trông rất xịn, lấy le được với đội khác 😄.",
                      reply: "Đội bóng phong trào mà mặc kit Arsenal chính hãng – ngầu quá! Cảm ơn bạn đã tin tưởng shop cho đơn số lượng lớn. Chúc đội bóng thi đấu thắng lợi! ⚽🔴" },
                    { rating: 2, isVerifiedPurchase: true,
                      comment: "Giao hàng chậm hơn dự kiến 4 ngày so với cam kết ban đầu. Sản phẩm thì ổn nhưng đặt để kịp mặc trận thứ 7 mà nhận hàng thứ 3 tuần sau thì không còn ý nghĩa nữa. Mong shop cải thiện thời gian giao hàng.",
                      reply: "Rất xin lỗi bạn về sự chậm trễ không đáng có! Đợt đó shop bị tắc nghẽn đơn do mùa giải mới. Chúng mình đã bổ sung nhân lực kho để không tái diễn. Cảm ơn bạn đã phản hồi!" },
                    { rating: 5, isVerifiedPurchase: true,
                      comment: "Quần short Arsenal mặc đi đá bóng hay đi dạo phố đều hợp. Form rộng thoải mái, không bó bất kỳ chỗ nào. Màu đỏ-trắng đặc trưng của Arsenal Originals rất dễ phối đồ. Đây là quần thể thao yêu thích của mình hiện tại.",
                      reply: null },
                ];
            }
            if (n.includes('tất') || n.includes('sock')) {
                return [
                    { rating: 5, isVerifiedPurchase: true,
                      comment: "Tất Arsenal chính hãng đi khác hẳn hàng chợ – đế dày êm, phần cổ tất dệt chặt không bị tuột xuống khi chạy, logo Arsenal dệt nổi bật không phai. Mình đi đá bóng 90 phút mà tất không bị ướt đẫm như tất thường.",
                      reply: null },
                    { rating: 4, isVerifiedPurchase: true,
                      comment: "Tất đẹp và dày dặn, chỉ hơi dài so với mình (chân size 40). Phần ống tất kéo lên gần đến đầu gối, nếu bạn nào thích tất ngắn thì không phù hợp. Nhưng đây là thiết kế chuẩn của tất bóng đá nên không trừ điểm nhiều.",
                      reply: "Cảm ơn bạn đã nhận xét! Tất bóng đá Arsenal thiết kế dài đến bắp chân để tương thích với shin guards khi thi đấu. Bạn có thể gấp cổ tất xuống cho phù hợp sở thích nhé!" },
                    { rating: 5, isVerifiedPurchase: true,
                      comment: "Mua kèm bộ áo + quần để có full kit Arsenal chuẩn chỉnh. Màu đỏ-trắng của tất ăn khớp hoàn toàn với áo sân nhà. Chất liệu co giãn tốt vừa khít với cổ chân, không bị tuột khi chạy nhanh.",
                      reply: null },
                    { rating: 5, isVerifiedPurchase: true,
                      comment: "Mình đá bóng phong trào mỗi tuần và đã thử nhiều loại tất khác nhau. Tất Arsenal này là top 1 về độ êm chân và chống hôi chân sau khi vận động. Đế tất có lớp đệm nhẹ ở vị trí gót và mũi chân – rất thông minh trong thiết kế.",
                      reply: null },
                    { rating: 3, isVerifiedPurchase: true,
                      comment: "Tất chất lượng ổn nhưng sau 5 lần giặt máy thì phần logo dệt ở cổ chân có hơi nhạt màu hơn ban đầu. Nếu giặt tay nhẹ nhàng có thể sẽ giữ màu lâu hơn. Về độ êm chân thì vẫn tốt.",
                      reply: "Cảm ơn bạn đã chia sẻ kinh nghiệm! Để giữ màu tất lâu hơn, bạn nên giặt lộn trái ở nhiệt độ 30°C, tránh dùng nước tẩy. Nếu cần hướng dẫn chăm sóc chi tiết hơn, inbox shop nhé!" },
                    { rating: 4, isVerifiedPurchase: true,
                      comment: "Mua 3 đôi cho tiết kiệm, mỗi đôi chất lượng như nhau – không có cái nào lỗi hay kém hơn. Giao hàng nhanh, đóng gói sạch sẽ. Chỉ tiếc là shop không có option combo để được giảm giá khi mua nhiều đôi.",
                      reply: "Cảm ơn bạn đã mua 3 đôi và phản hồi! Ý kiến về combo nhiều đôi giảm giá rất hay, shop sẽ xem xét triển khai. Bạn theo dõi fanpage để không bỏ lỡ chương trình khuyến mãi nhé!" },
                    { rating: 5, isVerifiedPurchase: true,
                      comment: "Mua làm quà tặng kèm áo đấu cho em trai dịp sinh nhật. Em mặc thử và thích lắm, đặc biệt khen phần đế êm. Combo áo + tất đóng gói cùng nhau trong túi vải Arsenal trông rất sang.",
                      reply: "Quà tặng fan Arsenal thì không gì phù hợp hơn full kit chính hãng! Chúc em trai bạn sinh nhật vui vẻ ❤️⚽" },
                    { rating: 2, isVerifiedPurchase: true,
                      comment: "Đặt size 42-44 nhưng mặc lên hơi chật so với cổ chân mình (chân bè). Áo sơ đồ size của shop ghi 42-44 fit người 42-43, còn chân 44 nên mua size lên. Thông tin này cần ghi rõ hơn trên trang sản phẩm.",
                      reply: "Cảm ơn bạn đã phản hồi rất cụ thể! Shop sẽ cập nhật thêm lưu ý cho người bàn chân size biên (44) trong phần mô tả sản phẩm ngay. Xin lỗi vì sự bất tiện này!" },
                    { rating: 5, isVerifiedPurchase: true,
                      comment: "Mình là cầu thủ bóng đá nghiệp dư, dùng tất Arsenal thi đấu giải phong trào. Sau 15 trận, tất vẫn giữ form tốt, đế chưa bị mòn hay sờn. So với tất thể thao thông thường cùng giá thì vượt trội hơn nhiều.",
                      reply: null },
                ];
            }
            if (n.includes('dép') || n.includes('adilette') || n.includes('slide')) {
                return [
                    { rating: 5, isVerifiedPurchase: true,
                      comment: "Mình mua dép này sau trận đấu để thay vào phòng thay đồ. Đế EVA đàn hồi cực kỳ, mặc cả tiếng sau trận chân vẫn không mỏi. Quai dép có logo Arsenal nổi bật, nhìn siêu xịn cùng tất dài.",
                      reply: null },
                    { rating: 5, isVerifiedPurchase: true,
                      comment: "Size 42 vừa đúng với chân 42. Dép nhẹ đến mức gần như không cảm thấy đang đi gì, có thể mang đi hồ bơi, phòng tắm hoặc đi chợ thoải mái. Màu đen với logo trắng-đỏ của Arsenal rất đẹp phối trang phục thể thao.",
                      reply: null },
                    { rating: 4, isVerifiedPurchase: true,
                      comment: "Dép đẹp và êm. Chỉ góp ý là quai dép mới đi mấy buổi đầu hơi cứng, có thể gây cọ sát nhẹ ở mu bàn chân. Sau khoảng 1 tuần đi quen thì mềm ra hoàn toàn và rất thoải mái.",
                      reply: "Cảm ơn bạn đã chia sẻ! Đây là đặc điểm của vật liệu EVA mới, cần thời gian làm quen. Bạn có thể thoa chút vaseline lên quai dép để mềm nhanh hơn. Cảm ơn bạn đã kiên nhẫn!" },
                    { rating: 5, isVerifiedPurchase: true,
                      comment: "Mua cặp đôi, mình và người yêu đều là fan Arsenal. Hai đứa mang đi xem trận tại quán bar, cả bàn hỏi mua ở đâu 😎. Chất lượng xứng đáng giá tiền, giao hàng nhanh và đóng gói chỉn chu.",
                      reply: "Cặp đôi Gooner – quá cute! Cảm ơn hai bạn đã ủng hộ shop. Chúc cả hai cổ vũ Arsenal vui vẻ, Gunners We Trust! 🔴⚪⭐" },
                    { rating: 3, isVerifiedPurchase: true,
                      comment: "Dép êm chân nhưng size hơi to hơn thực tế. Mình chân 41 đặt size 41 nhưng mặc lên hơi rộng. Có thể nên đặt giảm 1 size nếu chân bạn nhỏ. Thông tin này nên ghi rõ trên trang sản phẩm.",
                      reply: "Cảm ơn bạn đã phản hồi về size! Dép Adilette thường thiết kế rộng hơn giày thông thường 0.5-1 size. Shop sẽ bổ sung lưu ý này vào mô tả sản phẩm. Bạn có muốn đổi size nhỏ hơn không, inbox shop nhé!" },
                    { rating: 5, isVerifiedPurchase: true,
                      comment: "Dép tắm locker room cho sau trận đấu – mua về sử dụng đúng mục đích này. Đế chống trơn tốt trên nền sàn ướt, logo Arsenal rõ ràng. Đây là item mà hội thể thao ai cũng nên có.",
                      reply: null },
                    { rating: 4, isVerifiedPurchase: false,
                      comment: "Chất lượng dép tốt, mặc êm. Chỉ tiếc là không có option màu trắng (theo áo sân khách) hoặc màu navy (theo áo thứ 3). Nếu shop có thêm màu sẽ đặt thêm ngay.",
                      reply: "Cảm ơn góp ý rất hay! Shop sẽ cố gắng nhập thêm màu variant theo kit sân khách và thứ 3 trong thời gian tới. Bạn theo dõi shop để không bỏ lỡ nhé!" },
                    { rating: 5, isVerifiedPurchase: true,
                      comment: "Mua cả bộ kit (áo + quần + tất + dép), tổng tiền hơi nhiều nhưng đây là đầu tư xứng đáng cho một fan Arsenal chính hãng. Tất cả sản phẩm đều đạt chất lượng như kỳ vọng. Shop giao hàng đúng hạn, cẩn thận.",
                      reply: "Full kit Arsenal chính hãng – bạn là Gunner thực thụ! Cảm ơn bạn đã tin tưởng shop cho cả bộ. Lần sau nếu cần thêm phụ kiện, shop luôn sẵn sàng! 💪🔴" },
                    { rating: 2, isVerifiedPurchase: true,
                      comment: "Dép nhận về có vết xước nhỏ ở đế do va chạm khi vận chuyển. Mình báo shop và shop xử lý đổi hàng trong 3 ngày. Sản phẩm mới nhận ổn hơn. Mong shop kiểm tra kỹ hơn trước khi đóng gói.",
                      reply: "Rất xin lỗi bạn về vấn đề đóng gói! Shop đã cải thiện quy trình kiểm tra hàng trước khi ship sau phản hồi của bạn. Cảm ơn bạn đã kiên nhẫn và hợp tác!" },
                ];
            }
            if (n.includes('mũ') || n.includes('mu') || n.includes('cap') || n.includes('hat')) {
                return [
                    { rating: 5, isVerifiedPurchase: true,
                      comment: "Mũ Arsenal Adidas dùng đi đá golf sáng cuối tuần. Chất vải nhẹ thoáng, vành mũ cong hoàn hảo không bị thẳng hay quá cong. Khóa cài phía sau điều chỉnh dễ dàng, vừa vặn với đầu mình size 58cm.",
                      reply: null },
                    { rating: 5, isVerifiedPurchase: true,
                      comment: "Mua mũ để đội khi đi xem trận ngoài trời. Mũ che nắng tốt, vải thoáng không bị ứ mồ hôi đầu sau buổi ngồi ngoài trời dài. Logo Arsenal thêu sắc nét phía trước rất đẹp.",
                      reply: null },
                    { rating: 4, isVerifiedPurchase: true,
                      comment: "Mũ đẹp và chắc chắn. Chỉ góp ý là màu mũ (xanh navy với đỏ) trông rất đẹp trên ảnh nhưng ngoài đời thực màu navy hơi tối hơn. Không phải lỗi shop, chỉ là màn hình hiển thị khác nhau thôi.",
                      reply: null },
                    { rating: 5, isVerifiedPurchase: true,
                      comment: "Mình có đầu lớn (size 60), điều chỉnh khóa sau vẫn vừa thoải mái. Đây là điểm cộng lớn vì nhiều mũ thể thao không vừa đầu mình. Chất vải nhẹ, phần miếng lót mồ hôi bên trong mũ thấm tốt.",
                      reply: "Cảm ơn bạn đã chia sẻ về size đầu lớn – thông tin này rất hữu ích cho các khách hàng khác có cùng băn khoăn! Shop luôn chọn mũ có dải điều chỉnh rộng để phù hợp nhiều kích cỡ đầu." },
                    { rating: 3, isVerifiedPurchase: false,
                      comment: "Mũ ổn về chất lượng nhưng mình mua size 'one size' mà đầu mình hơi nhỏ, khóa điều chỉnh nhỏ nhất vẫn hơi lỏng chút. Nếu shop có thêm size S/M riêng sẽ tốt hơn. Tuy nhiên đội lâu cũng quen.",
                      reply: null },
                    { rating: 5, isVerifiedPurchase: true,
                      comment: "Mua mũ này để đội mặc đi chơi phố, phối với áo đấu Arsenal. Nhìn rất sporty và thời trang. Kiểu dáng golf cap phù hợp với nhiều phong cách mặc khác nhau, không chỉ riêng thể thao.",
                      reply: null },
                    { rating: 4, isVerifiedPurchase: true,
                      comment: "Giao hàng nhanh về Cần Thơ 2 ngày. Mũ đóng gói trong túi lưới riêng, không bị bẹp hay méo vành. Chất lượng ổn với mức giá. Chỉ tiếc là không có thêm option màu đỏ classic Arsenal.",
                      reply: "Cảm ơn bạn đã phản hồi! Mũ được đóng gói chuyên biệt để giữ form vành chính là điều shop chú ý. Màu đỏ classic là option nhiều khách hỏi, shop sẽ cố gắng nhập thêm trong thời gian tới!" },
                    { rating: 5, isVerifiedPurchase: true,
                      comment: "Mua mũ làm quà cho ba dịp Father's Day vì ba là fan Arsenal từ thời Ian Wright. Ba mặc thử rất vừa và thích, đặc biệt phần lót trong mũ mềm mại. Giao hàng đúng ngày đặt, đóng gói có thêm thiệp cảm ơn của shop.",
                      reply: "Fan Arsenal từ thời Ian Wright – ba bạn thật sự là Gooner gạo cội! Cảm ơn bạn đã chọn shop làm quà tặng ý nghĩa cho ba. Chúc hai cha con tiếp tục cổ vũ Arsenal cùng nhau! ❤️🔴" },
                    { rating: 5, isVerifiedPurchase: true,
                      comment: "Mũ golf Arsenal – item mình tìm kiếm lâu mà không thấy bán nhiều nơi. Shop có và hàng auth thật sự. Đội đi chơi golf sáng, đồng nghiệp tưởng mình mua ở nước ngoài về. Chất lượng đáng đồng tiền bát gạo.",
                      reply: null },
                ];
            }
            // Fallback chung (nếu không khớp danh mục nào)
            return [
                { rating: 5, isVerifiedPurchase: true,
                  comment: "Sản phẩm chất lượng cao, đúng như mô tả, giao hàng nhanh. Sẽ ủng hộ shop dài dài!",
                  reply: "Cảm ơn bạn đã tin tưởng Arsenal Store! Rất mong được phục vụ bạn thêm nhiều lần nữa!" },
                { rating: 4, isVerifiedPurchase: true,
                  comment: "Sản phẩm tốt, chất lượng xứng đáng với giá tiền. Giao hàng đúng hạn, đóng gói cẩn thận.",
                  reply: null },
                { rating: 5, isVerifiedPurchase: true,
                  comment: "Hàng chính hãng 100%, mua lần 2 vẫn hài lòng như lần đầu. Đây là địa chỉ tin cậy cho fan Arsenal.",
                  reply: null },
            ];
        };

        // Shuffle mảng người dùng để phân bổ ngẫu nhiên
        const shuffleArray = (arr) => {
            const a = [...arr];
            for (let i = a.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [a[i], a[j]] = [a[j], a[i]];
            }
            return a;
        };

        for (const product of allProducts) {
            const templates = getProductReviewTemplates(product.name);
            const shuffledReviewers = shuffleArray(customerReviewers);
            const productReviews = [];

            for (let r = 0; r < templates.length; r++) {
                const tpl = templates[r];
                // Mỗi review dùng một người dùng khác nhau (không trùng trong cùng 1 sản phẩm)
                const reviewer = shuffledReviewers[r % shuffledReviewers.length];

                // Random thời gian review trong 90 ngày qua (review sớm hơn thì "cũ hơn")
                const daysAgo = Math.floor(Math.random() * 85) + (r * 2);
                const reviewDate = new Date(Date.now() - Math.min(daysAgo, 90) * 24 * 60 * 60 * 1000);

                // Likes: review tích cực được like nhiều hơn
                const likes = [];
                const dislikes = [];
                for (const otherUser of shuffledReviewers) {
                    if (otherUser._id.toString() !== reviewer._id.toString()) {
                        const likeProb = tpl.rating >= 4 ? 0.2 : (tpl.rating === 3 ? 0.08 : 0.02);
                        if (Math.random() < likeProb) likes.push(otherUser._id.toString());
                        // Chỉ dislike review tiêu cực
                        if (tpl.rating <= 2 && Math.random() < 0.1) dislikes.push(otherUser._id.toString());
                    }
                }

                const review = {
                    id: Date.now() + r * 1000 + Math.floor(Math.random() * 999),
                    reviewerId: reviewer._id.toString(),
                    name: reviewer.name,
                    isAdmin: false,
                    isVerifiedPurchase: tpl.isVerifiedPurchase,
                    rating: tpl.rating,
                    comment: tpl.comment,
                    date: reviewDate.toISOString(),
                    likes: likes,
                    dislikes: dislikes,
                    media: [],
                    isEdited: false,
                    isPinned: false,
                    replies: []
                };

                // Thêm reply của shop nếu có trong template
                if (tpl.reply && adminForReplies) {
                    const replyDate = new Date(reviewDate.getTime() + (Math.floor(Math.random() * 3) + 1) * 24 * 60 * 60 * 1000);
                    review.replies.push({
                        id: Date.now() + r * 1000 + Math.floor(Math.random() * 9000) + 1000,
                        authorId: adminForReplies._id.toString(),
                        authorName: adminForReplies.name,
                        isAdmin: true,
                        text: tpl.reply,
                        date: replyDate.toISOString(),
                        likes: [],
                        dislikes: []
                    });
                }

                productReviews.push(review);
            }

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
