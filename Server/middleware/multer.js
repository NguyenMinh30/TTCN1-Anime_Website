const multer = require("multer");
const path = require("path");
const fs = require("fs");

// 1. Hàm đảm bảo thư mục tồn tại (Tự động tạo nếu chưa có)
const ensureDir = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

// 2. Cấu hình nơi lưu trữ (Storage)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let uploadPath = "./uploads/"; // Thư mục gốc

        // Phân loại thư mục dựa trên loại file hoặc tên trường (fieldname)
        if (file.fieldname === "video" || file.fieldname === "episode") {
            uploadPath += "videos/"; // Lưu vào uploads/videos
        } else {
            uploadPath += "images/"; // Lưu vào uploads/images (mặc định)
        }

        ensureDir(uploadPath); // Tạo thư mục nếu chưa có
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        // Đổi tên file: tên-gốc + thời-gian-hiện-tại + đuôi-file
        // Ví dụ: naruto-17150000.jpg
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    },
});

// 3. Bộ lọc file (File Filter) - Kiểm tra định dạng cho phép
const fileFilter = (req, file, cb) => {
    if (file.fieldname === "video" || file.fieldname === "episode") {
        // --- CHỈ CHO PHÉP VIDEO ---
        const filetypes = /mp4|mkv|avi|webm/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error("Lỗi: Chỉ cho phép tải lên Video (mp4, mkv, avi, webm)!"));
        }
    } else {
        // --- CHỈ CHO PHÉP ẢNH ---
        const filetypes = /jpeg|jpg|png|webp|gif/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error("Lỗi: Chỉ cho phép tải lên Ảnh (jpeg, jpg, png, webp)!"));
        }
    }
};

// 4. Khởi tạo Multer
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 500 // Giới hạn 500MB (Phù hợp cho video ngắn/demo)
    },
    fileFilter: fileFilter
});

module.exports = upload;