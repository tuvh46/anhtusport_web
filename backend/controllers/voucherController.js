const Voucher = require('../models/Voucher');

const getVouchers = async (req, res) => {
    try {
        const vouchers = await Voucher.find({}).sort({ createdAt: -1 });
        res.json(vouchers);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi Server khi lấy vouchers' });
    }
};

const createVoucher = async (req, res) => {
    try {
        const { code, discount, type, uses, expires, category } = req.body;
        const voucherExists = await Voucher.findOne({ code: code.toUpperCase() });
        if (voucherExists) {
            return res.status(400).json({ message: 'Mã voucher này đã tồn tại' });
        }
        const voucher = new Voucher({ code, discount, type, uses, expires, category });
        const createdVoucher = await voucher.save();
        res.status(201).json(createdVoucher);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi Server khi tạo voucher' });
    }
};

const updateVoucher = async (req, res) => {
    try {
        const { code, discount, type, uses, expires, category } = req.body;
        const voucher = await Voucher.findById(req.params.id);
        if (voucher) {
            if (code.toUpperCase() !== voucher.code) {
                const voucherExists = await Voucher.findOne({ code: code.toUpperCase() });
                if (voucherExists) {
                    return res.status(400).json({ message: 'Mã voucher này đã tồn tại' });
                }
            }
            voucher.code = code;
            voucher.discount = discount;
            voucher.type = type;
            voucher.uses = uses;
            voucher.expires = expires;
            voucher.category = category;
            const updatedVoucher = await voucher.save();
            res.json(updatedVoucher);
        } else {
            res.status(404).json({ message: 'Không tìm thấy voucher' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Lỗi Server khi cập nhật voucher' });
    }
};

const deleteVoucher = async (req, res) => {
    try {
        const voucher = await Voucher.findById(req.params.id);
        if (voucher) {
            await voucher.deleteOne();
            res.json({ message: 'Voucher đã được xóa' });
        } else {
            res.status(404).json({ message: 'Không tìm thấy voucher' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Lỗi Server khi xóa voucher' });
    }
};

const validateVoucher = async (req, res) => {
    try {
        const { code } = req.body;
        if (!code) return res.status(400).json({ message: 'Vui lòng nhập mã voucher' });
        const voucher = await Voucher.findOne({ code: code.toUpperCase() });

        if (!voucher) return res.status(404).json({ message: 'Mã voucher không hợp lệ' });
        if (new Date(voucher.expires) < new Date()) return res.status(400).json({ message: 'Mã voucher đã hết hạn' });
        if (voucher.usedCount >= voucher.uses) return res.status(400).json({ message: 'Mã voucher đã hết lượt sử dụng' });

        res.json(voucher);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi Server khi xác thực voucher' });
    }
};

const useVoucher = async (req, res) => {
    try {
        const voucher = await Voucher.findById(req.params.id);
        if (!voucher) {
            return res.status(404).json({ message: 'Không tìm thấy voucher' });
        }
        voucher.usedCount = (voucher.usedCount || 0) + 1;
        await voucher.save();
        res.json({ message: 'Cập nhật lượt dùng thành công', usedCount: voucher.usedCount });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi Server khi cập nhật lượt dùng voucher' });
    }
};

module.exports = { getVouchers, createVoucher, updateVoucher, deleteVoucher, validateVoucher, useVoucher };