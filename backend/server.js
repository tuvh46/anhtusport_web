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
const voucherRoutes = require('./routes/voucherRoutes'); // Thêm route voucher
const settingRoutes = require('./routes/settingRoutes'); // Route cài đặt hệ thống
const standingRoutes = require('./routes/standingRoutes'); // Route BXH Ngoại Hạng Anh

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
app.use('/api/vouchers', voucherRoutes); // Sử dụng voucherRoutes
app.use('/api/settings', settingRoutes); // Route cài đặt hệ thống (welcome-voucher, v.v.)
app.use('/api/upload', uploadRoutes);    // API Upload File
app.use('/api/standings', standingRoutes); // API BXH Ngoại Hạng Anh
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Cấp quyền đọc file tĩnh
app.use('/video', express.static(path.join(__dirname, '../video'))); // Serve video assets
app.use('/banner', express.static(path.join(__dirname, '../banner'))); // Serve banner images
app.use('/logo', express.static(path.join(__dirname, '../logo'))); // Serve logo images
app.use(express.static(path.join(__dirname, '../frontend'))); // Serve frontend static files
app.use('/frontend', express.static(path.join(__dirname, '../frontend'))); // Support /frontend/* URLs if needed

// ============ WEBSOCKET SETUP ============
// Tạo HTTP server để hỗ trợ WebSocket
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Lưu danh sách các admin clients đang kết nối và map user clients
const Setting = require('./models/Setting'); // Maybe needed or already imported? Wait, Message should be imported.
const Message = require('./models/Message');

// Lưu danh sách các admin clients đang kết nối và map user clients
let adminClients = [];
const userClients = new Map(); // key: userId/sessionid -> ws

wss.on('connection', (ws, req) => {
    console.log('Một kết nối WebSocket mới được thiết lập.');
    
    ws.on('close', () => {
        console.log('Client ngừng kết nối');
        adminClients = adminClients.filter(client => client !== ws);
        for (let [uid, client] of userClients.entries()) {
            if (client === ws) {
                userClients.delete(uid);
                console.log(`User ${uid} đã ngắt kết nối chat.`);
                break;
            }
        }
    });

    ws.on('message', async (message) => {
        try {
            const data = JSON.parse(message);
            
            // Xử lý xác thực vai trò
            if (data.type === 'auth_admin') {
                ws.isAdmin = true;
                if (!adminClients.includes(ws)) {
                    adminClients.push(ws);
                }
                console.log('Admin WebSocket đã được xác thực thành công.');
                
                // Gửi toàn bộ lịch sử chat từ DB cho admin mới kết nối
                try {
                    const messages = await Message.find().sort({ createdAt: 1 });
                    const historyMap = new Map();
                    messages.forEach(msg => {
                        if (!historyMap.has(msg.userId)) {
                            historyMap.set(msg.userId, { userName: msg.userName, messages: [] });
                        }
                        historyMap.get(msg.userId).messages.push(msg);
                    });
                    
                    const historyData = [];
                    for (let [userId, session] of historyMap.entries()) {
                        historyData.push({ userId, userName: session.userName, messages: session.messages });
                    }
                    ws.send(JSON.stringify({ type: 'chat_history', data: historyData }));
                } catch (err) {
                    console.error("Lỗi lấy lịch sử chat:", err);
                }
            } 
            else if (data.type === 'auth_user') {
                ws.isAdmin = false;
                ws.userId = data.userId;
                ws.userName = data.userName;
                userClients.set(data.userId, ws);
                console.log(`Khách hàng ${data.userName} (${data.userId}) kết nối WebSocket chat.`);
                
                // Gửi lại lịch sử chat cho khách hàng từ DB
                try {
                    const messages = await Message.find({ userId: data.userId }).sort({ createdAt: 1 });
                    if (messages.length > 0) {
                        ws.send(JSON.stringify({ type: 'user_chat_history', messages: messages }));
                    }
                } catch (err) {
                    console.error("Lỗi lấy lịch sử chat khách hàng:", err);
                }
            }
            
            // Xử lý tin nhắn chat thời gian thực
            else if (data.type === 'chat_message') {
                const payload = {
                    type: 'chat_message',
                    sender: data.sender, // 'user' hoặc 'admin'
                    userId: data.userId,
                    userName: data.userName,
                    text: data.text,
                    time: new Date().toISOString()
                };

                // Lưu vào MongoDB
                try {
                    await Message.create({
                        userId: data.userId,
                        userName: data.userName,
                        sender: data.sender,
                        text: data.text,
                        time: payload.time
                    });
                } catch (err) {
                    console.error("Lỗi lưu tin nhắn:", err);
                }

                if (data.sender === 'user') {
                    // Chuyển tiếp tin nhắn của khách tới toàn bộ Admin clients
                    adminClients.forEach(client => {
                        if (client.readyState === WebSocket.OPEN) {
                            client.send(JSON.stringify(payload));
                            
                            // Gửi kèm notification toast
                            client.send(JSON.stringify({
                                type: 'chat',
                                title: `💬 Nhắn tin: ${data.userName}`,
                                message: data.text,
                                time: payload.time
                            }));
                        }
                    });
                } 
                else if (data.sender === 'admin') {
                    // Admin trả lời -> Chuyển tiếp tới đúng khách hàng
                    const targetClient = userClients.get(data.userId);
                    if (targetClient && targetClient.readyState === WebSocket.OPEN) {
                        targetClient.send(JSON.stringify(payload));
                    }
                    
                    // Đồng bộ tin nhắn này tới toàn bộ các kết nối Admin khác để cùng theo dõi cuộc chat
                    adminClients.forEach(client => {
                        if (client.readyState === WebSocket.OPEN) {
                            client.send(JSON.stringify(payload));
                        }
                    });
                }
            }
        } catch (e) {
            console.error("Lỗi xử lý WebSocket message:", e);
        }
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