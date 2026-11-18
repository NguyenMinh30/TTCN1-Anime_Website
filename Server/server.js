require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const connectDB = require('./config/db');

const app = express();

// Kết nối MongoDB
connectDB();

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// import routes
const userRouter = require('./routes/user.router');
const favoriteRouter = require('./routes/favorite.router');
const animeRouter = require('./routes/anime.router');
const commentRouter = require('./routes/comment.router');
const historyRouter = require('./routes/history.router');

// cấu hình thư mục video
const videoFolder = path.join(__dirname, 'videos');

console.log('Server dirname:', __dirname);
console.log('Video folder:', videoFolder);
console.log('Video folder exists:', fs.existsSync(videoFolder));
console.log(
  'video_vay_cuoi.mp4 exists:',
  fs.existsSync(path.join(videoFolder, 'video_vay_cuoi.mp4'))
);

app.use('/video', express.static(videoFolder));

// Route test video
app.get('/check-video', (req, res) => {
  const files = fs.existsSync(videoFolder)
    ? fs.readdirSync(videoFolder)
    : [];

  const filePath = path.join(videoFolder, 'video_vay_cuoi.mp4');

  res.json({
    serverDirname: __dirname,
    videoFolder,
    videoFolderExists: fs.existsSync(videoFolder),
    filesInVideoFolder: files,
    filePath,
    fileExists: fs.existsSync(filePath),
  });
});
// sử dụng routes
app.use('/api/users', userRouter);
app.use('/api/favorites', favoriteRouter);
app.use('/api/animes', animeRouter);
app.use('/api/comments', commentRouter);
app.use('/api/history', historyRouter);
app.use('/api/admin/anime', require('./routes/adminAnime.routes'));

// Route test nhanh
app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});