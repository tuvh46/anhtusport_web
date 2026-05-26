# 🏆 AnhTu Sport - Website Bán Đồ Thể Thao

Đây là dự án website thương mại điện tử đầy đủ chức năng, mô phỏng cửa hàng thể thao trực tuyến **AnhTu Sport**, được xây dựng với **Node.js/Express** cho backend và giao diện sử dụng **HTML, Tailwind CSS và Vanilla JavaScript**.

---

## 🚀 Công nghệ sử dụng

### Backend
| Công nghệ | Mô tả |
|---|---|
| **Node.js** | Môi trường chạy JavaScript phía server |
| **Express.js** | Framework xây dựng RESTful API |
| **MongoDB** | Cơ sở dữ liệu NoSQL |
| **Mongoose** | ODM để tương tác với MongoDB |
| **JSON Web Token (JWT)** | Xác thực và phân quyền người dùng |
| **WebSocket (ws)** | Thông báo real-time & live chat |
| **Bcrypt.js** | Mã hóa mật khẩu |
| **Multer** | Xử lý upload hình ảnh/video |
| **Dotenv** | Quản lý biến môi trường |
| **CORS** | Cho phép frontend gọi API backend |

### Frontend
| Công nghệ | Mô tả |
|---|---|
| **HTML5** | Cấu trúc trang web |
| **Tailwind CSS** | Framework CSS (qua CDN) |
| **Vanilla JavaScript** | Xử lý logic phía client, gọi API |

---

## ✨ Tính năng chính

### 👤 Người dùng
- **Đăng ký / Đăng nhập** với JWT, mã hóa mật khẩu bằng Bcrypt
- **Quản lý hồ sơ**: cập nhật thông tin, đổi mật khẩu, upload avatar
- **Giỏ hàng**: thêm, xóa, cập nhật số lượng sản phẩm
- **Thanh toán**: quy trình đặt hàng và tạo đơn hàng
- **Yêu thích sản phẩm**: lưu sản phẩm yêu thích
- **So sánh sản phẩm**
- **Mã giảm giá (Voucher)**
- **Hệ thống khách hàng VIP**

### 🛍️ Sản phẩm
- Hiển thị danh sách, chi tiết sản phẩm
- Tìm kiếm, lọc theo danh mục, giá, kích cỡ
- Upload hình ảnh/video sản phẩm

### ⭐ Đánh giá & Bình luận
- Viết đánh giá, cho điểm sao
- Đính kèm hình ảnh/video trong đánh giá
- Trả lời bình luận (khách hàng & admin)
- Tương tác: thích / không thích
- Chỉnh sửa, xóa, báo cáo vi phạm, ghim bình luận

### 🔔 Thông báo Real-time (WebSocket)
- Admin nhận thông báo tức thì khi có đơn hàng mới, đánh giá mới, báo cáo vi phạm
- Khách hàng nhận thông báo khi có người trả lời bình luận hoặc cửa hàng phản hồi

### 💬 Live Chat
- Khách hàng chat trực tiếp với Admin
- Lưu lịch sử chat vào MongoDB
- Admin xem và trả lời tất cả cuộc hội thoại

### 🛠️ Admin Panel
- Quản lý đơn hàng (cập nhật trạng thái)
- Quản lý sản phẩm (thêm / sửa / xóa)
- Quản lý người dùng
- Quản lý voucher & cài đặt hệ thống
- Xem thống kê, biểu đồ doanh thu

---

## 📁 Cấu trúc thư mục

```
sport_web_store/
├── backend/
│   ├── config/
│   │   └── db.js               # Kết nối MongoDB
│   ├── controllers/
│   │   ├── orderController.js
│   │   ├── productController.js
│   │   ├── userController.js
│   │   ├── voucherController.js
│   │   └── settingController.js
│   ├── data/                   # Dữ liệu mẫu
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Order.js
│   │   ├── Notification.js
│   │   ├── Message.js
│   │   ├── Voucher.js
│   │   └── Setting.js
│   ├── routes/
│   │   ├── userRoutes.js
│   │   ├── productRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── notificationRoutes.js
│   │   ├── uploadRoutes.js
│   │   ├── voucherRoutes.js
│   │   └── settingRoutes.js
│   ├── uploads/                # File upload từ người dùng
│   ├── addProducts.js          # Script thêm sản phẩm
│   ├── removeProducts.js       # Script xóa sản phẩm
│   ├── seeder.js               # Seed dữ liệu sản phẩm
│   ├── seedOrders.js           # Seed dữ liệu đơn hàng/người dùng giả
│   ├── .env                    # Biến môi trường (tự tạo)
│   └── server.js               # File khởi động server
│
├── frontend/
│   ├── image/                  # Hình ảnh frontend
│   ├── index.html              # Trang chủ
│   ├── product.html            # Trang sản phẩm
│   ├── checkout.html           # Trang thanh toán
│   ├── login.html              # Đăng nhập
│   ├── register.html           # Đăng ký
│   ├── profile.html            # Hồ sơ người dùng
│   ├── favorites.html          # Sản phẩm yêu thích
│   ├── admin.html              # Trang quản trị
│   ├── blog.html               # Trang blog
│   ├── blog-detail.html        # Chi tiết bài viết
│   ├── about.html              # Giới thiệu
│   ├── guide.html              # Hướng dẫn mua hàng
│   └── script.js               # Logic chính của frontend
│
├── banner/                     # Ảnh banner trang chủ
├── video/                      # Video quảng cáo
├── package.json
└── README.md
```

---

## ⚙️ Hướng dẫn cài đặt và khởi chạy

### 1. Yêu cầu

Đảm bảo đã cài đặt các phần mềm sau:
- [Node.js](https://nodejs.org/) (phiên bản 16.x trở lên)
- [npm](https://www.npmjs.com/) (đi kèm với Node.js)
- [MongoDB](https://www.mongodb.com/try/download/community) (chạy dịch vụ MongoDB trên máy)

### 2. Clone repository

```bash
git clone https://github.com/tuvh46/anhtusport_web.git
cd anhtusport_web
```

### 3. Cài đặt dependencies

```bash
npm install
```

### 4. Cấu hình biến môi trường

Tạo file `.env` trong thư mục `backend/`:

```env
# Cổng chạy server backend
PORT=5000

# Chuỗi kết nối MongoDB
MONGO_URI=mongodb://localhost:27017/anhtu-sport-store

# Khóa bí mật để tạo JWT
JWT_SECRET=your_super_secret_key_123
```

### 5. Khởi tạo dữ liệu mẫu (Seeding)

Chạy từ thư mục gốc của dự án:

```bash
# Seed dữ liệu sản phẩm
node backend/seeder.js

# Seed dữ liệu đơn hàng, người dùng và đánh giá giả
node backend/seedOrders.js
```

### 6. Khởi chạy ứng dụng

```bash
# Chạy ở chế độ development (tự động reload)
npm run dev

# Hoặc chạy ở chế độ production
npm start
```

Server sẽ khởi động tại: **http://localhost:5000**

### 7. Mở giao diện Frontend

Mở trình duyệt và truy cập:
```
http://localhost:5000
```
Hoặc dùng **Live Server** (VS Code extension) để mở file `frontend/index.html`.

---

## 🔗 API Endpoints

| Method | Endpoint | Mô tả |
|---|---|---|
| POST | `/api/users/register` | Đăng ký tài khoản |
| POST | `/api/users/login` | Đăng nhập |
| GET | `/api/products` | Lấy danh sách sản phẩm |
| GET | `/api/products/:id` | Lấy chi tiết sản phẩm |
| POST | `/api/orders` | Tạo đơn hàng |
| GET | `/api/orders` | Lấy danh sách đơn hàng |
| GET | `/api/vouchers` | Lấy danh sách voucher |
| GET | `/api/notifications` | Lấy thông báo |
| POST | `/api/upload` | Upload file |

---

## 📝 Ghi chú

- File `backend/.env` **không được** commit lên GitHub vì chứa thông tin nhạy cảm.
- Thư mục `node_modules/` **không được** commit lên GitHub.
- WebSocket chạy cùng cổng với HTTP server (port 5000).

---

## 👨‍💻 Tác giả

**AnhTu Sport** - [GitHub](https://github.com/tuvh46/anhtusport_web)
