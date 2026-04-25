const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Đảm bảo thư mục uploads tồn tại
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, uploadDir);
    },
    filename(req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 20000000 }, // Giới hạn 20MB / file
    fileFilter: function(req, file, cb) {
        const filetypes = /jpg|jpeg|png|gif|mp4|webm|avi|mov|avif/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (extname && mimetype) return cb(null, true);
        cb('Chỉ cho phép tải lên hình ảnh và video!');
    }
});

router.post('/', upload.array('media', 5), (req, res) => {
    if (!req.files) return res.status(400).send({ message: 'Không có file nào được tải lên' });
    const fileUrls = req.files.map(file => `/uploads/${file.filename}`);
    res.json(fileUrls);
});

module.exports = router;