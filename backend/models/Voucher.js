const mongoose = require('mongoose');

const voucherSchema = mongoose.Schema({
    code: { type: String, required: true, unique: true, uppercase: true },
    discount: { type: Number, required: true },
    type: { type: String, required: true, enum: ['percent', 'fixed'] }, // 'percent' or 'fixed'
    uses: { type: Number, required: true }, // Total available uses
    usedCount: { type: Number, default: 0 },
    expires: { type: Date, required: true },
    category: { type: String, required: false, default: '' } // Apply to specific category
}, { timestamps: true });

module.exports = mongoose.model('Voucher', voucherSchema);