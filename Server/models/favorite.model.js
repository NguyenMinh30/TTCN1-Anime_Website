// models/favorite.model.js (Tối ưu)

const mongoose = require('mongoose');

const FavoriteSchema = new mongoose.Schema({
  user: {
    // ID của người dùng
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  animeId: {
    // ID của phim/anime (sử dụng String để nhất quán)
    type: String,
    required: true,
    unique: false
  },
  status: {
    // Trạng thái theo dõi phim (Watchlist functionality)
    type: String,
    enum: ['Watching', 'Completed', 'Plan to Watch', 'Dropped', 'On Hold'],
    default: 'Plan to Watch'
  }
}, { timestamps: true }); // timestamps: true thêm createdAt và updatedAt

// Đảm bảo mỗi user chỉ có 1 record cho 1 anime
FavoriteSchema.index({ user: 1, animeId: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', FavoriteSchema);