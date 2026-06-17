/**
 * Script thêm sản phẩm Arsenal mới từ bộ sưu tập Adidas Vietnam 2025-26
 * Nguồn dữ liệu: adidas.com.vn/vi/arsenal — Cập nhật 28/05/2026
 * 
 * Cách sử dụng:
 *   node backend/seedAdidasArsenal.js
 * 
 * LƯU Ý: 
 *   - Script sẽ BỎ QUA sản phẩm đã tồn tại (tránh trùng lặp)
 *   - Giá lấy từ adidas.com.vn chính hãng
 *   - Ảnh cần được tải thủ công từ adidas.com.vn và đặt vào /frontend/image/product/adidas/
 *   - Chạy xong cần restart server hoặc refresh trang để thấy sản phẩm mới
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const Product = require('./models/Product');

dotenv.config({ path: path.join(__dirname, '.env') });
connectDB();

// ═══════════════════════════════════════════════════════
// SẢN PHẨM TỪ ADIDAS.COM.VN — BỘ SƯU TẬP ARSENAL 25/26
// Giá: VND niêm yết tại adidas.com.vn
// ═══════════════════════════════════════════════════════

const adidasProducts = [
    // ─────────── ÁO ĐẤU (JERSEYS) ───────────
    {
        name: 'Áo Đấu Sân Nhà Arsenal 25/26 – Authentic',
        image: '/image/product/adidas/home_authentic.avif',
        hoverImage: '/image/product/adidas/home_authentic_back.avif',
        description: 'Phiên bản Authentic — áo đấu chính xác như cầu thủ mặc trên sân. Công nghệ HEAT.RDY tối ưu hóa làm mát, form slim-fit ôm dáng. Họa tiết chữ "A" Gothic lặp lại trên toàn bộ thân áo, lấy cảm hứng từ huy hiệu cổ điển Arsenal. Chất liệu 100% Polyester tái chế.',
        category: 'Áo đấu',
        price: 3000000,
        stock: 20,
        reviews: []
    },
    {
        name: 'Áo Đấu Sân Nhà Arsenal 25/26 – Fan Version',
        image: '/image/product/adidas/home_fan.avif',
        hoverImage: '/image/product/adidas/home_fan_back.avif',
        description: 'Phiên bản Fan — thiết kế giống áo đấu sân nhà với tông đỏ Better Scarlet và tay áo trắng truyền thống. Công nghệ AEROREADY thấm hút mồ hôi, form dáng thoải mái regular-fit phù hợp mặc hàng ngày. Họa tiết chữ "A" Gothic tinh tế.',
        category: 'Áo đấu',
        price: 2200000,
        stock: 40,
        reviews: []
    },
    {
        name: 'Áo Đấu Sân Khách Arsenal 25/26 – Fan Version',
        image: '/image/product/adidas/away_fan.avif',
        hoverImage: '/image/product/adidas/away_fan_back.avif',
        description: 'Áo đấu sân khách Arsenal 25/26 với tông màu xanh navy hiện đại kết hợp họa tiết tia sét độc đáo. Công nghệ AEROREADY thoáng khí, thiết kế regular-fit. Biểu tượng pháo thủ thêu nổi trên ngực trái.',
        category: 'Áo đấu',
        price: 2200000,
        stock: 35,
        reviews: []
    },
    {
        name: 'Áo Đấu Sân Khách Arsenal 25/26 – Authentic',
        image: '/image/product/adidas/away_authentic.avif',
        hoverImage: '/image/product/adidas/away_authentic_back.avif',
        description: 'Phiên bản Authentic áo sân khách Arsenal 25/26. Công nghệ HEAT.RDY cao cấp, form slim-fit chuyên dụng thi đấu. Thiết kế navy với pattern tia sét lấp lánh, chi tiết logo ép nhiệt giảm trọng lượng.',
        category: 'Áo đấu',
        price: 3000000,
        stock: 15,
        reviews: []
    },
    {
        name: 'Áo Đấu Thứ Ba Arsenal 25/26 – Fan Version',
        image: '/image/product/adidas/third_fan.avif',
        hoverImage: '/image/product/adidas/third_fan_back.avif',
        description: 'Áo đấu thứ ba Arsenal mùa 25/26 với phong cách sáng tạo, khác biệt. Thường được mặc trong các trận Champions League. Công nghệ AEROREADY, thiết kế regular-fit thoải mái.',
        category: 'Áo đấu',
        price: 2200000,
        stock: 30,
        reviews: []
    },
    {
        name: 'Áo Đấu Sân Nhà Arsenal 25/26 Nữ',
        image: '/image/product/adidas/home_women.avif',
        hoverImage: '/image/product/adidas/home_women_back.avif',
        description: 'Áo đấu sân nhà Arsenal 25/26 phiên bản nữ. Thiết kế tôn dáng với form dáng phù hợp vóc dáng nữ giới. Công nghệ AEROREADY, họa tiết chữ "A" Gothic đỏ trắng truyền thống.',
        category: 'Áo đấu',
        price: 2200000,
        stock: 25,
        reviews: []
    },

    // ─────────── TRANG PHỤC TẬP LUYỆN (TRAINING) ───────────
    {
        name: 'Áo Tập Arsenal 25/26 – Training Jersey',
        image: '/image/product/adidas/training_jersey.avif',
        hoverImage: '/image/product/adidas/training_jersey_back.avif',
        description: 'Áo tập luyện chính hãng Arsenal 25/26, phiên bản giống cầu thủ mặc trên sân tập London Colney. Công nghệ AEROREADY thoáng khí, thiết kế slim-fit năng động. Logo adidas và Arsenal thêu nổi.',
        category: 'Áo đấu',
        price: 1800000,
        stock: 30,
        reviews: []
    },
    {
        name: 'Áo Khoác Anthem Arsenal Z.N.E. 25/26',
        image: '/image/product/adidas/anthem_jacket.avif',
        hoverImage: '/image/product/adidas/anthem_jacket_back.avif',
        description: 'Áo khoác Anthem Z.N.E. chính hãng Arsenal 25/26 — mẫu áo cầu thủ mặc khi bước ra sân trước trận đấu. Chất liệu cao cấp có lớp lót mềm mại, khóa kéo toàn thân, túi có dây kéo. Phong cách thanh lịch phù hợp đi chơi lẫn sân vận động.',
        category: 'Áo đấu',
        price: 2300000,
        stock: 20,
        reviews: []
    },
    {
        name: 'Áo Hoodie Arsenal Essentials 25/26',
        image: '/image/product/adidas/hoodie.avif',
        hoverImage: '/image/product/adidas/hoodie_back.avif',
        description: 'Áo hoodie Arsenal Essentials 25/26 dành cho người hâm mộ. Chất liệu cotton pha mềm mại ấm áp, mũ trùm đầu có dây rút. Biểu tượng Arsenal thêu nổi trên ngực. Phong cách casual lý tưởng cho ngày lạnh.',
        category: 'Áo đấu',
        price: 1900000,
        stock: 25,
        reviews: []
    },

    // ─────────── QUẦN (BOTTOMS) ───────────
    {
        name: 'Quần Tập Luyện Arsenal 25/26 – Training Pants',
        image: '/image/product/adidas/training_pants.avif',
        hoverImage: '/image/product/adidas/training_pants_back.avif',
        description: 'Quần tập luyện chính hãng Arsenal 25/26 với thiết kế slim-fit ôm chân. Chất liệu nhẹ co giãn 4 chiều, công nghệ AEROREADY. Khóa kéo ở cổ chân tiện lợi, túi khóa kéo an toàn. Phù hợp tập luyện và đi chơi.',
        category: 'Phụ kiện',
        price: 1600000,
        stock: 30,
        reviews: []
    },

    // ─────────── PHỤ KIỆN (ACCESSORIES) ───────────
    {
        name: 'Balo Arsenal FC 25/26 – Backpack',
        image: '/image/product/adidas/backpack.avif',
        hoverImage: '/image/product/adidas/backpack_side.avif',
        description: 'Balo Arsenal FC chính hãng adidas. Ngăn chính rộng rãi đựng đồ tập, ngăn laptop riêng biệt, túi phụ bên hông. Logo Arsenal in nổi phía trước. Dây đeo vai có đệm êm, chất liệu chống nước nhẹ.',
        category: 'Phụ kiện',
        price: 1200000,
        stock: 35,
        reviews: []
    },
    {
        name: 'Mũ Bóng Chày Arsenal FC 25/26 – Cap',
        image: '/image/product/adidas/cap.avif',
        hoverImage: '/image/product/adidas/cap_side.avif',
        description: 'Mũ lưỡi trai Arsenal FC chính hãng adidas. Thiết kế 6 panel cổ điển, logo Arsenal thêu nổi phía trước. Khóa điều chỉnh phía sau phù hợp mọi kích cỡ đầu. Chất liệu cotton thoáng khí.',
        category: 'Phụ kiện',
        price: 600000,
        stock: 50,
        reviews: []
    },
    {
        name: 'Găng Tay Thủ Môn Arsenal Predator 25/26',
        image: '/image/product/adidas/goalkeeper_gloves.avif',
        hoverImage: '/image/product/adidas/goalkeeper_gloves_back.avif',
        description: 'Găng tay thủ môn Predator phiên bản Arsenal 25/26. Lớp đệm URG 2.0 giúp bắt bóng chắc chắn, mặt lưng có đệm EVA bảo vệ. Quai dán cổ tay Velcro điều chỉnh độ vừa vặn. Màu đỏ đặc trưng Arsenal.',
        category: 'Phụ kiện',
        price: 1500000,
        stock: 15,
        reviews: []
    },
    {
        name: 'Bóng Đá Arsenal FC adidas 25/26',
        image: '/image/product/adidas/ball.avif',
        hoverImage: '/image/product/adidas/ball_back.avif',
        description: 'Bóng đá Arsenal FC chính hãng adidas mùa 2025-26. Vỏ bóng TPU bền bỉ, đường may máy chính xác. In logo Arsenal và adidas nổi bật. Phù hợp để sưu tầm và đá trên sân cỏ nhân tạo.',
        category: 'Phụ kiện',
        price: 800000,
        stock: 40,
        reviews: []
    },
    {
        name: 'Tất Sân Khách Arsenal 25/26 – Away Socks',
        image: '/image/product/adidas/away_socks.avif',
        hoverImage: '/image/product/adidas/away_socks_back.avif',
        description: 'Tất thi đấu sân khách Arsenal 25/26. Đệm bàn chân êm ái, chất liệu co giãn 4 chiều ôm sát chân. Phối màu navy đồng bộ với áo đấu sân khách. Cổ cao chuẩn thi đấu chuyên nghiệp.',
        category: 'Phụ kiện',
        price: 350000,
        stock: 60,
        reviews: []
    },
];

// ═══════════════════════════════════════════════════════
// THỰC HIỆN SEED
// ═══════════════════════════════════════════════════════

const seedAdidasProducts = async () => {
    try {
        console.log('═══════════════════════════════════════════════════');
        console.log('  🏟️  ADIDAS x ARSENAL — Seed sản phẩm từ adidas.com.vn');
        console.log('═══════════════════════════════════════════════════\n');

        let added = 0;
        let skipped = 0;

        for (const product of adidasProducts) {
            // Kiểm tra sản phẩm đã tồn tại chưa (theo tên)
            const existing = await Product.findOne({ name: product.name });
            if (existing) {
                console.log(`  ⏭️  Bỏ qua (đã có): ${product.name}`);
                skipped++;
                continue;
            }

            await Product.create(product);
            const priceFormatted = product.price.toLocaleString('vi-VN');
            console.log(`   Đã thêm: ${product.name}  — ${priceFormatted}₫`);
            added++;
        }

        console.log('\n═══════════════════════════════════════════════════');
        console.log(`  Kết quả: ${added} sản phẩm mới, ${skipped} bỏ qua`);
        console.log('═══════════════════════════════════════════════════');

        if (added > 0) {
            console.log('\n  ⚠️  QUAN TRỌNG: Hãy tải ảnh sản phẩm từ adidas.com.vn');
            console.log('     và đặt vào: frontend/image/product/adidas/');
            console.log('     Xem danh sách file ảnh cần tải ở bên dưới:\n');

            const imageFiles = new Set();
            adidasProducts.forEach(p => {
                imageFiles.add(p.image.replace('/image/product/adidas/', ''));
                if (p.hoverImage) imageFiles.add(p.hoverImage.replace('/image/product/adidas/', ''));
            });
            imageFiles.forEach(f => console.log(`     📷 ${f}`));
        }

        process.exit(0);
    } catch (err) {
        console.error('\n  ❌ Lỗi:', err.message);
        process.exit(1);
    }
};

seedAdidasProducts();
