const mongoose = require("mongoose");

const animeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  otherTitle: String,
  category: { type: [String], default: [] },
  url: String,

  /**
   * Danh sách các nhà cung cấp nguồn video được chấp nhận:
   * - local: Upload trực tiếp lên server
   * - mux: Phát qua dịch vụ Mux
   * - archive: Phát qua lưu trữ Archive.org
   * - external: Nhúng từ link bên ngoài khác
   */
  videoProvider: {
    type: String,
    enum: ["local", "mux", "archive", "external"],
    default: "local"
  },

  // Mã Playback ID dành cho Mux (<mux-player playback-id="...">)
  muxPlaybackId: {
    type: String,
    default: ""
  },

  // Mã Asset ID dành cho Mux (quản lý ở Backend/Admin)
  muxAssetId: {
    type: String,
    default: ""
  },

  // Đường dẫn URL file video local hoặc đường dẫn Archive.org
  videoUrl: {
    type: String,
    default: ""
  },

  // Ảnh bìa thumbnail phim
  posterUrl: {
    type: String,
    default: "/images/default_placeholder.jpg"
  },

  summary: String,
  status: String,
  epCount: String,
  releaseYear: String,

  // Phim dành riêng cho VIP
  isPremium: {
    type: Boolean,
    default: false
  },

  // Đếm lượt Like & Dislike
  likeCount: {
    type: Number,
    default: 0
  },

  dislikeCount: {
    type: Number,
    default: 0
  },

  likedBy: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "User",
    default: []
  },

  dislikedBy: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "User",
    default: []
  }
}, {
  // Tự động tạo thời gian createdAt và updatedAt
  timestamps: true
});

module.exports = mongoose.model("Anime", animeSchema);