const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title:     { type: String, required: true },
  description:{ type: String },
  genre:     [String],
  coverUrl:  { type: String }, // ảnh bìa
  isSeries:  { type: Boolean, default: false }, // có episodess không
  // optional: episodes saved in separate collection linked by movieId
}, { timestamps: true });

module.exports = mongoose.model('Movie', movieSchema);