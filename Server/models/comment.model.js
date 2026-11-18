// models/Comment.js
// const: Khai báo một hằng số (biến không thay đổi giá trị)
// require('mongoose'): Nạp thư viện Mongoose để thao tác với cơ sở dữ liệu MongoDB
const mongoose = require('mongoose');

// new mongoose.Schema({ ... }): Khởi tạo một đối tượng "Lược đồ" (Schema) mới
// Đây là bản thiết kế quy định các trường (cột) dữ liệu mà một bình luận phải có
const CommentSchema = new mongoose.Schema({

  // animeId: Tên trường lưu mã định danh của phim
  // type: String -> Kiểu dữ liệu là chuỗi văn bản
  // required: true -> Bắt buộc phải có, không được để trống trường này
  animeId: { type: String, required: true },

  // user: Tên trường lưu thông tin người viết bình luận
  // mongoose.Schema.Types.ObjectId: Kiểu dữ liệu là một ID đặc biệt của MongoDB
  // ref: 'User' -> Tham chiếu (liên kết) tới bảng (model) có tên là 'User'
  // required: true -> Bắt buộc phải biết ai là người đã viết bình luận này
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // content: Tên trường lưu nội dung văn bản của bình luận
  // type: String -> Kiểu dữ liệu là chuỗi văn bản
  // required: true -> Bắt buộc phải có nội dung chữ trong bình luận
  content: { type: String, required: true },

  // createdAt: Tên trường lưu thời điểm (ngày, giờ) bình luận được tạo
  // type: Date -> Kiểu dữ liệu ngày tháng
  // default: Date.now -> Nếu không nhập, hệ thống sẽ tự động lấy thời gian hiện tại
  createdAt: { type: Date, default: Date.now }
});

// module.exports: Xuất (export) đối tượng này ra để các file khác có thể nạp vào sử dụng
// mongoose.model('Comment', ...): Tạo ra một Model thực tế từ Schema trên để thao tác dữ liệu
module.exports = mongoose.model('Comment', CommentSchema);