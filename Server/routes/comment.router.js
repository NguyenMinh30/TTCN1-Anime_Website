// Nạp thư viện Express để tạo hệ thống định tuyến (Routing)
const express = require("express");
// Khởi tạo một đối tượng router từ Express
const router = express.Router();

// { protect }: Sử dụng kỹ thuật Destructuring để lấy hàm 'protect' từ file middleware
// middleware này dùng để kiểm tra xem người dùng đã đăng nhập (có token) chưa
const { protect } = require("../middleware/auth.middleware");

// Nạp file controller chứa các hàm xử lý logic thực tế cho bình luận
const commentController = require("../controllers/comment.controller");

// router.post: Định nghĩa một đường dẫn nhận yêu cầu kiểu POST (thường dùng để gửi dữ liệu mới)
// "/:animeId": Đường dẫn có tham số biến đổi (animeId), ví dụ: /api/comments/naruto-001
// protect: Chạy hàm kiểm tra đăng nhập trước, nếu ổn mới cho chạy tiếp hàm 'createComment'
router.post("/:animeId", protect, commentController.createComment);

// router.get: Định nghĩa đường dẫn nhận yêu cầu kiểu GET (thường dùng để lấy/đọc dữ liệu)
// Đường dẫn này không có 'protect', nghĩa là khách chưa đăng nhập vẫn xem được bình luận
router.get("/:animeId", commentController.getCommentsByAnimeId);

// Xuất router để file server chính (server.js/app.js) có thể sử dụng
module.exports = router;