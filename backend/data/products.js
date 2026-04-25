const products = [
    {
        name: 'Áo đấu sân nhà',
        image: 'image/product/home2025-2026.avif',
        hoverImage: 'image/product/home2025-2026(2).avif',
        description: 'Thân áo màu đỏ. Tay áo màu trắng. Cho đến nay, vẫn mãi trường tồn. Nếu bạn nhìn kỹ chiếc áo đấu chính hãng Arsenal này từ adidas, bạn sẽ thấy DNA của câu lạc bộ không chỉ dừng lại ở những gam màu. Những chữ A phong cách Gothic, lặp lại ở cả mặt trước và sau, gợi nhớ huy hiệu cổ điển của đội bóng, tạo nên điểm nhấn mà tất cả người hâm mộ sẽ yêu thích. Chiếc áo bóng đá nhẹ này được tạo ra để mang đến hiệu suất tối ưu, giúp các cầu thủ viết nên lịch sử của chính họ.',
        category: 'Kits',
        price: 2500000,
        stock: 8
    },
    {
        name: 'Áo Đấu Sân Khách 25/26',
        image: 'image/product/away2025-2026.avif',
        hoverImage: 'image/product/away2025-2026(2).avif',
        description: 'Nhìn lại lịch sử của Arsenal, bạn sẽ thấy tia sét luôn là một biểu tượng quen thuộc. Chiếc áo đấu bóng đá adidas này mang biểu tượng huyền thoại trở lại đầy ấn tượng với họa tiết xanh nhạt và xanh hải quân hiện đại phủ toàn thân. Công nghệ AEROREADY thấm hút ẩm cùng chất vải interlock mềm mại giúp người hâm mộ luôn cảm thấy thoải mái khi cổ vũ cho câu lạc bộ yêu thích.',
        category: 'Kits',
        price: 3000000,
        stock: 15
    },
    {
        name: 'Áo Đấu thứ ba 25/26',
        image: 'image/product/thirdaway2025-2026.avif',
        hoverImage: 'image/product/thirdaway2025-2026(2).avif',
        description: 'Hai mươi năm sau mùa giải cuối cùng của Arsenal tại Highbury, mẫu áo đấu bóng đá adidas này như một lời tri ân đầy tinh tế đến nét đẹp Art Deco từng hiện hữu nơi khán đài phía Đông lịch sử. Từ màu sắc trắng ngà, đồ hoạ tinh xảo bao phủ toàn bộ, đến chiếc huy hiệu cổ điển ở gáy, chiếc áo này được thiết kế để trở thành món đồ yêu thích của mọi thế hệ người hâm mộ. Công nghệ AEROREADY kiểm soát độ ẩm và chất vải mềm mại đảm bảo bạn sẽ luôn thoải mái khi dành những khoảnh khắc tri ân đầy ý nghĩa.',
        category: 'Kits',
        price: 2200000,
        stock: 15
    },
     {
        name: 'Quần short tập luyện',
        image: 'image/product/Quan_short_Arsenal.avif',
        hoverImage: 'image/product/Quan_short_Arsenal(2).avif',
        description: 'Hòa mình vào tinh thần bóng đá với mẫu Quần short Arsenal FC Originals. Lấy cảm hứng từ di sản của môn thể thao vua, chiếc quần này mang nét cổ điển của phong cách thể thao vào tủ đồ hằng ngày của bạn. Dù bạn đang cổ vũ đội bóng trên khán đài hay tận hưởng một ngày dạo chơi thoải mái, chiếc quần được thiết kế để bạn luôn tự tin và phong cách. Dáng rộng rãi mang lại sự thoải mái khi vận động, trong khi dây rút cho phép điều chỉnh vừa vặn chắc chắn..',
        category: 'Kits',
        price: 1100000,
        stock: 10
    },
     {
        name: 'Tất sân nhà Arsenal 2025-2026',
        image: 'image/product/Tat_San_Nha_Arsenal_25-26.avif',
        hoverImage: 'image/product/Tat_San_Nha_Arsenal_25-26(2).avif',
        description: 'Đôi tất Arsenal kiểm soát ẩm cho cảm giác thoải mái và khẳng định niềm tự hào.',
        category: 'sportwear',
        price: 750000,
        stock: 0 
    },
    {
        name: 'Dép Adilette Shower Arsenal',
        image: 'image/product/Dep_Adilette_Shower_Arsenal.avif',
        hoverImage: 'image/product/Dep_Adilette_Shower_Arsenal(2).avif',
        description: 'Dép xỏ chân cổ điển dành cho người hâm mộ Arsenal.',
        category: 'sportwear',
        price: 750000,
        stock: 0 
    },
    {
        name: 'Áo đấu sân nhà Arsenal trẻ em 2025-2026',
        image: 'image/product/kid1.avif',
        hoverImage: 'image/product/kid2.avif',
        description: 'Nhìn lại lịch sử của Arsenal, bạn sẽ thấy tia sét luôn là một biểu tượng quen thuộc. Chiếc áo đấu bóng đá adidas này mang biểu tượng huyền thoại trở lại đầy ấn tượng với họa tiết xanh nhạt và xanh hải quân hiện đại phủ toàn thân. Công nghệ AEROREADY thấm hút ẩm cùng chất vải interlock mềm mại giúp người hâm mộ luôn cảm thấy thoải mái khi cổ vũ cho câu lạc bộ yêu thích.',
        category: 'kits',
        price: 1500000,
        stock: 0 
    },
    {
        name: 'Mũ Lưỡi Trai Arsenal',
        image: 'image/product/mu1.webp',
        hoverImage: 'image/product/mu1(2).webp',
        description: 'Hãy cùng chào đón chiếc mũ golf Arsenal adidas, người bạn đồng hành mới của bạn trong những ngày nắng đẹp trên sân golf. Nhẹ nhàng và tinh tế, chiếc mũ có chất liệu mềm mại mang lại sự thoải mái tối đa, vành mũ cong sẵn giúp chắn nắng và khóa cài phía sau giúp vừa vặn hoàn hảo. Hình thêu khẩu pháo tương phản ở phía trước sẽ giúp bạn thu hút mọi ánh nhìn ở bất cứ nơi nào bạn đến chơi golf.',
        category: 'Accessory',
        price: 450000,
        stock: 25
    },
];

module.exports = products;
