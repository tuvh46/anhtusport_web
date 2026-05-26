const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const Product = require('./models/Product');

dotenv.config({ path: path.join(__dirname, '.env') });
connectDB();

const newProducts = [
    {
        name: 'Áo Sân Nhà Arsenal 2026-27 – Phiên Bản Vô Địch',
        image: '/image/product/home2025-2026.avif',
        hoverImage: '/image/product/home2025-2026(2).avif',
        description: 'Áo thi đấu sân nhà chính thức Arsenal 2026-27. Thiết kế retro lấy cảm hứng từ thời kỳ Invincibles, chất vải Aeroready thoát mồ hôi nhanh, logo Premier League Champions thêu nổi. Phiên bản kỷ niệm chức vô địch 2025-26.',
        category: 'Áo đấu',
        price: 1350000,
        stock: 50,
        reviews: []
    },
    {
        name: 'Áo Sân Khách Arsenal 2025-26 – Away Kit',
        image: '/image/product/away2025-2026.avif',
        hoverImage: '/image/product/away2025-2026(2).avif',
        description: 'Áo thi đấu sân khách chính hãng Arsenal mùa 2025-26. Tông màu trắng kem tinh tế kết hợp chi tiết đỏ đặc trưng. Chất liệu Aeroready giúp cơ thể luôn khô thoáng trong suốt 90 phút.',
        category: 'Áo đấu',
        price: 1250000,
        stock: 35,
        reviews: []
    },
    {
        name: 'Áo Bộ Thứ Ba Arsenal 2025-26 – Third Kit',
        image: '/image/product/thirdaway2025-2026.avif',
        hoverImage: '/image/product/thirdaway2025-2026(2).avif',
        description: 'Áo thi đấu thứ ba của Arsenal mùa 2025-26 với thiết kế độc đáo, phong cách khác biệt. Thường được mặc trong các trận Champions League, tạo dấu ấn riêng biệt trên sân khấu châu Âu.',
        category: 'Áo đấu',
        price: 1150000,
        stock: 30,
        reviews: []
    },
    {
        name: 'Áo Đấu Trẻ Em Arsenal 2025-26 – Kids Kit',
        image: '/image/product/kid1.avif',
        hoverImage: '/image/product/kid2.avif',
        description: 'Bộ áo đấu trẻ em Arsenal chính hãng 2025-26. Chất vải mềm mại, thân thiện với làn da nhạy cảm của trẻ. Thiết kế giống hệt áo đấu của các ngôi sao, phù hợp cho bé từ 5-14 tuổi. Quà tặng ý nghĩa cho fan nhí Arsenal.',
        category: 'Áo đấu',
        price: 850000,
        stock: 40,
        reviews: []
    },
    {
        name: 'Quần Short Thi Đấu Arsenal 2025-26',
        image: '/image/product/Quan_short_Arsenal.avif',
        hoverImage: '/image/product/Quan_short_Arsenal(2).avif',
        description: 'Quần short thi đấu chính hãng Arsenal 2025-26. Chất vải nhẹ thoáng khí, đường may chắc chắn. Logo Arsenal thêu nổi bật ở đùi trái. Có dây rút điều chỉnh vừa vặn theo từng kích cỡ.',
        category: 'Phụ kiện',
        price: 550000,
        stock: 60,
        reviews: []
    },
    {
        name: 'Tất Sân Nhà Arsenal 2025-26 – Home Socks',
        image: '/image/product/Tat_San_Nha_Arsenal_25-26.avif',
        hoverImage: '/image/product/Tat_San_Nha_Arsenal_25-26(2).avif',
        description: 'Tất thi đấu chính hãng Arsenal sân nhà mùa 2025-26. Đệm bàn chân êm ái, chất liệu co giãn 4 chiều ôm sát chân. Thiết kế phối màu đỏ trắng đặc trưng của Pháo Thủ.',
        category: 'Phụ kiện',
        price: 220000,
        stock: 100,
        reviews: []
    },
    {
        name: 'Dép Adilette Shower Arsenal – Chính Hãng',
        image: '/image/product/Dep_Adilette_Shower_Arsenal.avif',
        hoverImage: '/image/product/Dep_Adilette_Shower_Arsenal(2).avif',
        description: 'Dép phòng tắm Adilette Shower phiên bản Arsenal. Đế EVA nhẹ và đàn hồi, quai dép có logo Arsenal nổi bật. Phù hợp đi trong phòng tắm, hồ bơi hoặc dùng sau khi thi đấu. Quà tặng fan Arsenal cực kỳ ý nghĩa.',
        category: 'Phụ kiện',
        price: 420000,
        stock: 45,
        reviews: []
    }
];

const addProducts = async () => {
    try {
        console.log('⏳ Đang thêm sản phẩm mới...');
        
        // Kiểm tra sản phẩm đã tồn tại chưa (tránh trùng lặp)
        let added = 0;
        for (const p of newProducts) {
            const existing = await Product.findOne({ name: p.name });
            if (existing) {
                console.log(`  ⏭️  Bỏ qua (đã tồn tại): ${p.name}`);
                continue;
            }
            await Product.create(p);
            console.log(`  ✅ Đã thêm: ${p.name}`);
            added++;
        }
        
        console.log(`\n🎉 Hoàn tất! Đã thêm ${added} sản phẩm mới.`);
        process.exit(0);
    } catch (err) {
        console.error('❌ Lỗi khi thêm sản phẩm:', err.message);
        process.exit(1);
    }
};

addProducts();
