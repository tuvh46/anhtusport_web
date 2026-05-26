const Setting = require('../models/Setting');

// @desc    Lấy giá trị một setting theo key
// @route   GET /api/settings/:key
const getSetting = async (req, res) => {
    try {
        const setting = await Setting.findOne({ key: req.params.key });
        if (!setting) {
            // Trả về giá trị mặc định nếu chưa có trong DB
            const defaults = {
                'welcome-voucher': { discount: 10, code: 'ARSENALNEW' }
            };
            const defaultValue = defaults[req.params.key];
            if (defaultValue) {
                return res.json(defaultValue);
            }
            return res.status(404).json({ message: 'Không tìm thấy cài đặt' });
        }
        res.json(setting.value);
    } catch (error) {
        console.error('Lỗi getSetting:', error);
        res.status(500).json({ message: 'Lỗi máy chủ' });
    }
};

// @desc    Tạo hoặc cập nhật một setting theo key
// @route   POST /api/settings/:key
const upsertSetting = async (req, res) => {
    try {
        const { key } = req.params;
        const value = req.body;

        const setting = await Setting.findOneAndUpdate(
            { key },
            { key, value },
            { new: true, upsert: true, runValidators: true }
        );
        res.status(200).json(setting.value);
    } catch (error) {
        console.error('Lỗi upsertSetting:', error);
        res.status(500).json({ message: 'Lỗi máy chủ' });
    }
};

module.exports = { getSetting, upsertSetting };
