const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favorite.controller');

// Import middleware
const authMiddleware = require('../middleware/auth.middleware'); 

// 1. Route Bấm tim
router.post('/toggle', authMiddleware.protect, favoriteController.toggleFavorite);

// 2. Route Lấy danh sách yêu thích
router.get('/my-favorites', authMiddleware.protect, favoriteController.getMyFavorites);

// 3. Route Kiểm tra trạng thái tim
router.get('/check/:animeId', authMiddleware.protect, favoriteController.checkFavoriteStatus);

// 4. Route Top Like (Không cần sửa dòng này)
router.get('/top-liked', favoriteController.getTopLikedAnime);

module.exports = router;