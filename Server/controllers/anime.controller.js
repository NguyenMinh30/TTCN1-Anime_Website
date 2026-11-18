const Anime = require('../models/anime.model');
const mongoose = require('mongoose');

/* =======================
   GET ALL ANIME
======================= */
const getAllAnime = async (req, res) => {
  try {
    const animes = await Anime.find().sort({ createdAt: -1 });
    res.json(animes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =======================
   GET ANIME BY ID
======================= */
const getAnimeById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: 'ID không hợp lệ' });

    const anime = await Anime.findById(id);
    if (!anime) return res.status(404).json({ message: 'Anime không tồn tại' });

    res.json(anime);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =======================
   CREATE ANIME (ADMIN)
======================= */
const createAnime = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Không có quyền Admin' });
    }

    const newAnime = new Anime(req.body);
    const savedAnime = await newAnime.save();
    res.status(201).json(savedAnime);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/* =======================
   DELETE ANIME (ADMIN)
======================= */
const deleteAnime = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Không có quyền Admin' });
    }

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: 'ID không hợp lệ' });

    const deleted = await Anime.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Anime không tồn tại' });

    res.json({ message: 'Xóa anime thành công' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =======================
   LIKE ANIME
======================= */
const likeAnime = async (req, res) => {
  try {
    const { animeId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(animeId))
      return res.status(400).json({ message: "ID không hợp lệ" });

    const anime = await Anime.findById(animeId);
    if (!anime) return res.status(404).json({ message: "Anime không tồn tại" });

    // Bỏ dislike nếu đã dislike
    anime.dislikedBy = anime.dislikedBy.filter(id => id.toString() !== userId.toString());

    // Toggle like
    if (anime.likedBy.some(id => id.toString() === userId.toString())) {
      anime.likedBy = anime.likedBy.filter(id => id.toString() !== userId.toString());
    } else {
      anime.likedBy.push(userId);
    }

    await anime.save();

    // Trả về toàn bộ anime object (để frontend cập nhật state ngay)
    const updatedAnime = await Anime.findById(animeId);
    res.json(updatedAnime);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =======================
   DISLIKE ANIME
======================= */
const dislikeAnime = async (req, res) => {
  try {
    const { animeId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(animeId))
      return res.status(400).json({ message: "ID không hợp lệ" });

    const anime = await Anime.findById(animeId);
    if (!anime) return res.status(404).json({ message: "Anime không tồn tại" });

    // Bỏ like nếu đã like
    anime.likedBy = anime.likedBy.filter(id => id.toString() !== userId.toString());

    // Toggle dislike
    if (anime.dislikedBy.some(id => id.toString() === userId.toString())) {
      anime.dislikedBy = anime.dislikedBy.filter(id => id.toString() !== userId.toString());
    } else {
      anime.dislikedBy.push(userId);
    }

    await anime.save();

    const updatedAnime = await Anime.findById(animeId);
    res.json(updatedAnime);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllAnime,
  getAnimeById,
  createAnime,
  deleteAnime,
  likeAnime,
  dislikeAnime
};
