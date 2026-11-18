require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Anime = require('./models/anime.model'); // import model Anime

// Kết nối MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/animeDB';
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.log('❌ MongoDB connection error:', err));

// Đọc file JSON
const filePath = path.join(__dirname, 'animeData.json');
const animeData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

// Thêm dữ liệu vào MongoDB
const importAnime = async () => {
  try {
    await Anime.deleteMany(); // Xóa dữ liệu cũ nếu cần
    const inserted = await Anime.insertMany(animeData);
    console.log(`✅ Đã thêm ${inserted.length} anime vào MongoDB`);
    process.exit();
  } catch (error) {
    console.error('❌ Lỗi import anime:', error);
    process.exit(1);
  }
};

importAnime();
