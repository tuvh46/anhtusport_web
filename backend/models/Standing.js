const mongoose = require('mongoose');

const standingSchema = new mongoose.Schema({
    // Mã mùa giải, ví dụ: '2526', '2425', '2324'
    seasonKey: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    // Nhãn hiển thị, ví dụ: 'Mùa 2025-26 · Vòng 38'
    label: {
        type: String,
        required: true
    },
    // Năm bắt đầu mùa giải (dùng để gọi API football-data.org)
    seasonYear: {
        type: Number,
        required: true
    },
    // Mảng các đội bóng theo thứ tự BXH
    // Mỗi phần tử: [pos, name, W, D, L, GF, GA, pts, zone, form]
    teams: {
        type: [[mongoose.Schema.Types.Mixed]],
        required: true
    },
    // Nguồn dữ liệu: 'api', 'fallback', 'manual'
    source: {
        type: String,
        default: 'fallback'
    },
    // Thời điểm cập nhật gần nhất từ API
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Standing', standingSchema);
