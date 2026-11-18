// models/History.js
const mongoose = require("mongoose"); // Nhập thư viện mongoose để giao tiếp với MongoDB

// Định nghĩa cấu trúc (Schema) cho bảng Lịch sử xem phim
const HistorySchema = new mongoose.Schema({
  // user: Lưu trữ ID của người dùng. 
  // type: mongoose.Schema.Types.ObjectId -> Kiểu dữ liệu là một ID đặc trưng của MongoDB
  // ref: "User" -> Tạo mối liên kết sang bảng người dùng (User)
  // required: true -> Bắt buộc phải có thông tin này mới lưu được
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  // animeId: Lưu ID của bộ phim.
  // ref: "Anime" -> Liên kết sang bảng Anime để lấy các thông tin như tên phim, ảnh bìa...
  animeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Anime",
    required: true,
  },

  // episodeNumber: Lưu số tập phim mà người dùng vừa xem. 
  // type: Number -> Kiểu số
  // default: 1 -> Nếu không nhập gì, mặc định sẽ là tập 1
  episodeNumber: { type: Number, default: 1 },

  // lastWatched: Lưu mốc thời gian xem phim gần nhất. 
  // type: Date -> Kiểu ngày tháng
  // default: Date.now -> Tự động lấy thời gian hiện tại lúc tạo/cập nhật
  lastWatched: { type: Date, default: Date.now },
});

// Xuất model mang tên "History" ra để các file khác sử dụng
module.exports = mongoose.model("History", HistorySchema);