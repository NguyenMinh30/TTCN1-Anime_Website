const express = require("express");
const router = express.Router();

// Nhập middleware "protect" để bảo vệ các đường dẫn này. 
// Chỉ người dùng đã đăng nhập thành công mới được thực hiện các thao tác lịch sử.
const { protect } = require("../middleware/auth.middleware");

// Nhập file controller chứa các hàm xử lý logic đã viết ở trên.
const historyController = require("../controllers/history.controller");

// Route POST: /api/history/
// Khi người dùng xem một tập phim, hệ thống gửi yêu cầu lên đây để cập nhật lịch sử.
// Luồng đi: Kiểm tra đăng nhập (protect) -> Lưu dữ liệu (updateHistory).
router.post("/", protect, historyController.updateHistory);

// Route GET: /api/history/
// Khi người dùng vào trang "Lịch sử xem", hệ thống gọi vào đây để lấy danh sách phim.
// Luồng đi: Kiểm tra đăng nhập (protect) -> Lấy dữ liệu (getHistory).
router.get("/", protect, historyController.getHistory);

module.exports = router;