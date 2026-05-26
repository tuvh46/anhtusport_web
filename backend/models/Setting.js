const mongoose = require('mongoose');

const settingSchema = mongoose.Schema({
    key: { type: String, required: true, unique: true }, // Khóa định danh cài đặt (VD: 'welcome-voucher')
    value: { type: mongoose.Schema.Types.Mixed, required: true } // Giá trị có thể là bất kỳ kiểu dữ liệu nào
}, { timestamps: true });

module.exports = mongoose.model('Setting', settingSchema);
