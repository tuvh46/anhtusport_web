const mongoose = require('mongoose');

const messageSchema = mongoose.Schema({
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    sender: { type: String, required: true, enum: ['user', 'admin'] },
    text: { type: String, required: true },
    time: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
