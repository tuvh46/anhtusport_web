const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors'); // Thư viện cho phép Frontend gọi Backend
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const connectDB = require('./config/db'); // File kết nối MongoDB
const orderRoutes = require('./routes/orderRoutes');
// Import các file Routes (Đường dẫn)
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

// Cấu hình biến môi trường
dotenv.config({ path: path.join(__dirname, '.env') });

// Kết nối Database
connectDB();

const app = express();

// Middleware (BẮT BUỘC PHẢI NẰM TRƯỚC ROUTES)
app.use(cors()); // Bật CORS để cho phép cổng 5500 gọi sang cổng 5000
app.use(express.json()); // Cho phép Server đọc dữ liệu JSON (Email, Mật khẩu)

// Khai báo các Routes chính
app.use('/api/products', productRoutes); // Đường dẫn lấy áo đấu
app.use('/api/users', userRoutes);       // Đường dẫn đăng ký / đăng nhập
app.use('/api/orders', orderRoutes);
app.use('/api/notifications', notificationRoutes); // Sử dụng notificationRoutes
app.use('/api/upload', uploadRoutes);    // API Upload File
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Cấp quyền đọc file tĩnh

// ============ WEBSOCKET SETUP ============
// Tạo HTTP server để hỗ trợ WebSocket
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Lưu danh sách các admin clients đang kết nối
let adminClients = [];

wss.on('connection', (ws, req) => {
    console.log(' Admin kết nối WebSocket');
    
    // Thêm client vào danh sách
    adminClients.push(ws);
    
    ws.on('close', () => {
        console.log(' Client ngừng kết nối');
        adminClients = adminClients.filter(client => client !== ws);
    });

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            if (data.type === 'chat_message' && data.sender === 'user') {
                // Gửi tin nhắn của khách thành thông báo đẩy cho Admin
                adminClients.forEach(client => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({
                            type: 'chat',
                            title: `💬 Nhắn tin: ${data.userName}`,
                            message: data.text,
                            time: new Date().toISOString()
                        }));
                    }
                });
            }
        } catch (e) {}
    });
    
    ws.on('error', (err) => {
        console.error('WebSocket error:', err);
    });
});

// Hàm gửi notification đến tất cả admin clients
function broadcastNotification(notification) {
    adminClients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(notification));
        }
    });
}
app.locals.broadcastNotification = broadcastNotification;

// Chạy Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(` Server đang chạy tại cổng ${PORT}`);
    console.log(` WebSocket sẵn sàng tại ws://localhost:${PORT}`);
});
// Chạy Server