const express = require('express');
const router = express.Router();
const Anime = require('../models/anime.model');
const { protect } = require("../middleware/auth.middleware");

/* 1. Thêm anime mới */
router.post('/add', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Bạn không có quyền thêm anime.' });
    }

    const anime = new Anime(req.body);
    await anime.save();
    res.status(201).json({ message: '✅ Thêm anime thành công', anime });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* 2. Lấy tất cả anime */
router.get('/', async (req, res) => {
  try {
    const animes = await Anime.find().sort({ createdAt: -1 });
    res.json(animes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* 3. Lấy anime theo category */
router.get('/category/:category', async (req, res) => {
  try {
    const category = req.params.category;
    const animes = await Anime.find({ category });
    res.json(animes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* 4. Lấy anime theo title */
router.get('/title/:title', async (req, res) => {
  try {
    const title = req.params.title;
    const anime = await Anime.findOne({ title });

    if (!anime) return res.status(404).json({ message: '❌ Anime không tìm thấy' });

    res.json(anime);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* 5. Tìm kiếm */
router.get('/search/:keyword', async (req, res) => {
  try {
    const keyword = req.params.keyword;
    const results = await Anime.find({
      $or: [
        { title: { $regex: keyword, $options: "i" } },
        { otherTitle: { $regex: keyword, $options: "i" } }
      ]
    });
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* Lấy danh sách anime Premium
   Route này phục vụ trang /premium ở frontend.
   User thường vẫn xem được danh sách,
   nhưng chưa được xem video nếu không phải VIP.
*/
router.get('/premium/list', async (req, res) => {
  try {
    const animes = await Anime.find({ isPremium: true }).sort({ createdAt: -1 });
    res.json(animes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* Lấy dữ liệu xem video
   Frontend trang xem phim nên gọi:
   GET /api/animes/:id/watch
   Lý do cần route riêng:
   - /api/animes/:id vẫn cho xem thông tin phim.
   - /api/animes/:id/watch mới trả dữ liệu video.
   - Nếu phim Premium thì backend kiểm tra VIP tại đây. */

router.get('/:id/watch', protect, async (req, res) => {
  try {
    const anime = await Anime.findById(req.params.id);

    if (!anime) {
      return res.status(404).json({ message: '❌ Anime không tìm thấy' });
    }

    // Nếu anime là Premium thì chỉ admin hoặc VIP được xem video.
    if (anime.isPremium) {
      const isAdmin = req.user.role === "admin";
      const isVip = req.user.isVip === true;

      if (!isAdmin && !isVip) {
        return res.status(403).json({
          message: "Bạn cần tài khoản VIP để xem nội dung Premium."
        });
      }
    }

    // Trả anime đầy đủ để frontend lấy:
    // videoProvider, muxPlaybackId, videoUrl, posterUrl
    res.json(anime);
  } catch (error) {
    res.status(500).json({ message: 'ID không hợp lệ hoặc lỗi server' });
  }
});

/* 6. Lấy chi tiết anime theo ID (_id) */
router.get('/:id', async (req, res) => {
  try {
    const anime = await Anime.findById(req.params.id);
    if (!anime) return res.status(404).json({ message: '❌ Anime không tìm thấy' });
    res.json(anime);
  } catch (error) {
    res.status(500).json({ message: 'ID không hợp lệ hoặc lỗi server' });
  }
});

/* 7. Like anime */
router.post('/:id/like', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const anime = await Anime.findById(req.params.id);
    if (!anime) return res.status(404).json({ message: '❌ Anime không tồn tại' });

    // Bỏ dislike nếu có
    anime.dislikedBy = anime.dislikedBy.filter(id => id.toString() !== userId.toString());

    // Toggle like
    if (anime.likedBy.some(id => id.toString() === userId.toString())) {
      anime.likedBy = anime.likedBy.filter(id => id.toString() !== userId.toString());
    } else {
      anime.likedBy.push(userId);
    }

    // Update count
    anime.likeCount = anime.likedBy.length;
    anime.dislikeCount = anime.dislikedBy.length;

    await anime.save();
    const updatedAnime = await Anime.findById(req.params.id);
    res.json(updatedAnime);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* 8. Dislike anime */
router.post('/:id/dislike', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const anime = await Anime.findById(req.params.id);
    if (!anime) return res.status(404).json({ message: '❌ Anime không tồn tại' });

    // Bỏ like nếu có
    anime.likedBy = anime.likedBy.filter(id => id.toString() !== userId.toString());

    // Toggle dislike
    if (anime.dislikedBy.some(id => id.toString() === userId.toString())) {
      anime.dislikedBy = anime.dislikedBy.filter(id => id.toString() !== userId.toString());
    } else {
      anime.dislikedBy.push(userId);
    }
    // Update count
    anime.likeCount = anime.likedBy.length;
    anime.dislikeCount = anime.dislikedBy.length;

    await anime.save();
    const updatedAnime = await Anime.findById(req.params.id);
    res.json(updatedAnime);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
