const mongoose = require('mongoose');

const episodeSchema = new mongoose.Schema({
  movieId: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
  title:   { type: String },
  episodeNumber: { type: Number },
  videoUrl: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Episode', episodeSchema);