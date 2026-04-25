# AnhTu Store - Website Bán Áo Đấu Arsenal

Đây là một dự án website thương mại điện tử đầy đủ chức năng, mô phỏng cửa hàng trực tuyến của Arsenal, được xây dựng với Node.js/Express cho backend và giao diện sử dụng HTML, Tailwind CSS và Vanilla JavaScript.

## Công nghệ sử dụng

-   **Backend**:
    -   **Node.js**: Môi trường chạy JavaScript phía server.
    -   **Express.js**: Framework xây dựng API.
    -   **MongoDB**: Cơ sở dữ liệu NoSQL để lưu trữ dữ liệu sản phẩm, người dùng, đơn hàng.
    -   **Mongoose**: ODM để tương tác với MongoDB.
    -   **JSON Web Token (JWT)**: Để xác thực người dùng.
    -   **WebSocket (ws)**: Để xây dựng tính năng thông báo real-time và live chat.
    -   **Bcrypt.js**: Để mã hóa mật khẩu.
    -   **Multer**: Để xử lý upload file (hình ảnh/video).
-   **Frontend**:
    -   **HTML5**: Cấu trúc trang web.
    -   **Tailwind CSS**: Framework CSS để xây dựng giao diện nhanh chóng.
    -   **Vanilla JavaScript**: Xử lý logic phía client, tương tác với API.

## Hướng dẫn cài đặt và khởi chạy

### 1. Yêu cầu

Đảm bảo đã cài đặt các phần mềm sau trên máy tính:
-   [Node.js](https://nodejs.org/) (phiên bản 16.x trở lên)
-   [npm](https://www.npmjs.com/) (thường đi kèm với Node.js)
-   [MongoDB](https://www.mongodb.com/try/download/community) (cài đặt và chạy dịch vụ MongoDB trên máy của bạn)

### 2. Cài đặt

**Bước 1: Clone repository về máy**
```bash
git clone <your-repository-url>
cd sport_web_store
```

**Bước 2: Cài đặt các dependencies cho Backend**
```bash
cd backend
npm install
```
*Lưu ý: Frontend không cần cài đặt vì sử dụng CDN và Vanilla JS.*

### 3. Cấu hình biến môi trường

**Bước 1: Tạo file `.env` trong thư mục `backend`**
Tạo một file mới có tên là `.env` trong thư mục `backend` (ngang hàng với file `server.js`).

**Bước 2: Thêm các biến môi trường cần thiết vào file `.env`**
```env
# Cổng chạy server backend
PORT=5000

# Chuỗi kết nối tới MongoDB (thay <your_database_name> bằng tên database của bạn)
MONGO_URI=mongodb://localhost:27017/anhtu-sport-store

# Khóa bí mật để tạo JWT
JWT_SECRET=your_super_secret_key_123
```

### 4. Khởi tạo dữ liệu (Seeding)

Để website có dữ liệu mẫu để trải nghiệm, hãy chạy các script sau từ thư mục `backend`.

**Bước 1: Bơm dữ liệu sản phẩm**
Script này sẽ xóa toàn bộ sản phẩm cũ và thêm các sản phẩm mới từ file `data/products.js`.
```bash
node seeder.js
```

**Bước 2: Bơm dữ liệu đơn hàng, người dùng và đánh giá giả**
Script này sẽ tạo ra các khách hàng, đơn hàng, đánh giá và phản hồi giả để làm cho website sống động hơn.
```bash
node seedOrders.js
```

### 5. Khởi chạy ứng dụng

**Bước 1: Chạy Server Backend**
Mở một terminal trong thư mục `backend` và chạy lệnh:
```bash
npm run dev
```
Server sẽ khởi động tại `http://localhost:5000`.

**Bước 2: Mở giao diện Frontend**
-   Mở thư mục `frontend` trong trình soạn thảo code của bạn (ví dụ: VS Code).
-   Sử dụng một extension live server (như "Live Server" trong VS Code) để mở file `index.html`.
-   Trang web sẽ thường được mở tại địa chỉ như `http://127.0.0.1:5500/frontend/index.html`.

**Bây giờ bạn đã có thể truy cập và trải nghiệm trang web!**

## Cấu trúc thư mục

```
sport_web_store/
├── backend/
│   ├── config/         # Cấu hình (VD: kết nối DB)
│   ├── controllers/    # Logic xử lý các request
│   ├── data/           # Dữ liệu mẫu
│   ├── models/         # Định nghĩa Schema cho MongoDB
│   ├── routes/         # Định nghĩa các API endpoints
│   ├── uploads/        # Thư mục chứa file được upload
│   ├── .env            # Biến môi trường (cần tự tạo)
│   ├── package.json
│   └── server.js       # File khởi động server
│
└── frontend/
    ├── css/
    ├── image/
    ├── banner/
    ├── admin.html
    ├── index.html
    ├── product.html
    └── script.js       # Logic chính của frontend
```

## Tính năng chính

-   **Xác thực người dùng**: Đăng ký, đăng nhập (local & Google/Facebook), quản lý profile, đổi mật khẩu.
-   **Quản lý sản phẩm**: Hiển thị danh sách, chi tiết sản phẩm, tìm kiếm, lọc.
-   **Giỏ hàng**: Thêm, xóa, cập nhật số lượng sản phẩm.
-   **Thanh toán**: Mô phỏng quy trình thanh toán và tạo đơn hàng.
-   **Hệ thống Đánh giá & Phản hồi**:
    -   Viết đánh giá, cho điểm sao.
    -   Đính kèm hình ảnh/video.
    -   Trả lời bình luận (cho cả khách hàng và admin).
    -   Tương tác (thích/không thích).
    -   Chỉnh sửa, xóa, báo cáo vi phạm, ghim bình luận.
-   **Thông báo Real-time (WebSocket)**:
    -   Admin nhận thông báo tức thì khi có đơn hàng mới, đánh giá mới, báo cáo...
    -   Khách hàng nhận thông báo khi có người trả lời bình luận, cửa hàng phản hồi...
-   **Live Chat**: Khách hàng chat trực tiếp với Admin.
-   **Admin Panel**:
    -   Quản lý đơn hàng (cập nhật trạng thái).
    -   Quản lý sản phẩm (thêm/sửa/xóa).
    -   Quản lý người dùng.
    -   Xem thống kê, biểu đồ doanh thu.
-   **Các tính năng khác**: Yêu thích sản phẩm, so sánh sản phẩm, mã giảm giá, hệ thống khách hàng VIP.