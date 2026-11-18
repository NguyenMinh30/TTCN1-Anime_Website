require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/user.model');
const Movie = require('../models/movie.model');
const Episode = require('../models/episode.model');
const Comment = require('../models/comment.model');
const Favorite = require('../models/favorite.model');

const MONGO = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/animeDB';

async function seed() {
  await mongoose.connect(MONGO);

  // Xóa (nếu muốn reset)
  await User.deleteMany({});
  await Movie.deleteMany({});
  await Episode.deleteMany({});
  await Comment.deleteMany({});
  await Favorite.deleteMany({});

  // Tạo users
  const u1 = await User.create({ username: 'admin', email: 'admin@local', password: 'admin123', role: 'admin' });
  const u2 = await User.create({ username: 'user1', email: 'user1@local', password: 'user123', role: 'user' });

  // Tạo movies
  const m1 = await Movie.create({ title: 'Naruto', description: 'Ninja anime', genre: ['Action'], videoLink: 'http://example.com/naruto' });
  const m2 = await Movie.create({ title: 'One Piece', description: 'Pirate anime', genre: ['Adventure'], videoLink: 'http://example.com/onepiece' });

  // Tạo episodes
  const e1 = await Episode.create({ movieId: m1._id, episodeNumber: 1, title: 'Tập 1', videoUrl: 'http://example.com/naruto-ep1' });

  // Tạo comment
  await Comment.create({ userId: u2._id, movieId: m1._id,text : 'Hay quá!', rating: 5 });

  // Tạo favorite
  await Favorite.create({ userId: u2._id, movieId: m1._id });

  console.log('Seed finished');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
