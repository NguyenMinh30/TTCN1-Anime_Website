const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "../videos");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const safeName = file.originalname.replace(/\s+/g, "-");
        const fileName = Date.now() + "-" + safeName;
        cb(null, fileName);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("video/")) {
        cb(null, true);
    } else {
        cb(new Error("Chỉ được upload file video"));
    }
};

const uploadVideo = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 1024
    }
});

module.exports = uploadVideo;