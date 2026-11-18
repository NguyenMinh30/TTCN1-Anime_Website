const Favorite = require('../models/favorite.model');
const Anime = require('../models/anime.model'); // Đảm bảo dòng này có

// 1. Hàm Toggle Like (Bấm tim / Bỏ tim)
exports.toggleFavorite = async (req, res) => {
  try {
    const { animeId } = req.body;
    const userId = req.user.id; 

    // Kiểm tra xem user đã like chưa
    const existingFav = await Favorite.findOne({ user: userId, animeId: animeId });

    if (existingFav) {
      // Nếu có rồi -> Xóa (Unlike)
      await Favorite.findOneAndDelete({ user: userId, animeId: animeId });
      
      // Giảm likeCount bên bảng Anime
      await Anime.findByIdAndUpdate(animeId, { $inc: { likeCount: -1 } });
      
      return res.json({ isFavorite: false, message: 'Đã xóa khỏi yêu thích' });
    } else {
      // Nếu chưa có -> Thêm mới (Like)
      const newFav = new Favorite({
        user: userId,
        animeId: animeId,
        status: 'Watching'
      });
      await newFav.save();

      // Tăng likeCount bên bảng Anime
      await Anime.findByIdAndUpdate(animeId, { $inc: { likeCount: 1 } });

      return res.json({ isFavorite: true, message: 'Đã thêm vào yêu thích' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// 2. Hàm lấy danh sách phim TÔI đã like
exports.getMyFavorites = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const favorites = await Favorite.find({ user: userId });
    const animeIds = favorites.map(fav => fav.animeId);

    const myAnimes = await Anime.find({ _id: { $in: animeIds } })
      .select('title url category episode likeCount'); 

    res.json(myAnimes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// 3. Hàm kiểm tra trạng thái tim
exports.checkFavoriteStatus = async (req, res) => {
  try {
    const { animeId } = req.params;
    const userId = req.user.id;
    
    const existingFav = await Favorite.findOne({ user: userId, animeId: animeId });
    res.json({ isFavorite: !!existingFav }); 
  } catch (error) {
    res.status(500).json({ message: 'Lỗi' });
  }
};

// 4. Hàm lấy Top Like (Code cũ của bạn)
exports.getTopLikedAnime = async (req, res) => {
  try {
    const topAnimes = await Anime.find({})
      .sort({ likeCount: -1 }) 
      .limit(10)
      .select('title url likeCount category');
    res.json(topAnimes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Lỗi Server');
  }
};

// (Giữ lại các hàm cũ như updateWatchlist, removeFromWatchlist ở dưới nếu bạn vẫn dùng chức năng đó)
exports.updateWatchlist = async (req, res) => {
    // ... code cũ ...
};
exports.removeFromWatchlist = async (req, res) => {
    // ... code cũ ...
};
exports.getWatchlist = async (req, res) => {
    // ... code cũ ...
};