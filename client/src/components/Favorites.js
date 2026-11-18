import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

// Hàm xử lý ảnh thumbnail (tránh lỗi ảnh YouTube)
const getThumbnail = (url) => {
  if (!url) return "https://via.placeholder.com/150";
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  const videoId = match ? match[1] : null;
  return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : url;
};

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  // Gọi API lấy danh sách phim yêu thích
  useEffect(() => {
    fetchMyFavorites();
  }, []);

  const fetchMyFavorites = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
          setLoading(false);
          return;
      }

      // Gọi API lấy danh sách
      const res = await axios.get('http://localhost:5000/api/favorites/my-favorites', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFavorites(res.data);
    } catch (error) {
      console.error("Lỗi lấy danh sách:", error);
    } finally {
      setLoading(false);
    }
  };

  // Hàm HỦY LƯU (Xóa phim)
  const handleRemoveFavorite = async (e, animeId) => {
    e.preventDefault(); // Chặn không cho chuyển trang khi bấm Xóa
    
    // Hỏi xác nhận (nếu thấy phiền thì xóa dòng if này đi)
    if (!window.confirm("Bạn muốn xóa phim này khỏi danh sách yêu thích?")) return;

    try {
      const token = localStorage.getItem('token');
      
      // Gọi API Toggle để xóa
      await axios.post('http://localhost:5000/api/favorites/toggle', 
        { animeId }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Cập nhật giao diện ngay lập tức (Loại bỏ phim vừa xóa khỏi danh sách đang hiện)
      setFavorites(favorites.filter(anime => anime._id !== animeId));
      
    } catch (error) {
        alert("Có lỗi khi xóa!");
    }
  };

  return (
    <div className="min-h-screen bg-[#1c1022] text-white p-4 md:p-10 pt-24">
      <h1 className="text-3xl font-bold mb-8 text-center flex items-center justify-center gap-3">
        <span className="text-red-500 text-4xl">❤️</span>
        <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
          Tủ Phim Của Tôi
        </span>
      </h1>

      {loading ? (
        <div className="text-center mt-10">Đang tải danh sách...</div>
      ) : favorites.length === 0 ? (
        // Giao diện khi chưa có phim nào
        <div className="text-center flex flex-col items-center mt-10 opacity-70">
           <div className="text-6xl mb-4">📂</div>
           <p className="text-xl mb-4">Bạn chưa lưu bộ phim nào cả.</p>
           <Link to="/" className="bg-[#a413ec] px-6 py-2 rounded-full font-bold hover:bg-[#b52aff] transition-all text-white no-underline">
             Khám phá Anime ngay
           </Link>
        </div>
      ) : (
        // Giao diện lưới phim
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {favorites.map((anime) => (
            <Link to={`/anime/${anime._id}`} key={anime._id} className="group block relative no-underline">
              
              {/* Khung ảnh */}
              <div className="overflow-hidden rounded-xl aspect-[2/3] shadow-lg border border-white/10 relative">
                <img 
                  src={getThumbnail(anime.url)} 
                  alt={anime.title} 
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  onError={(e) => {e.target.src = 'https://via.placeholder.com/150'}}
                />
                
                {/* Lớp phủ đen mờ khi hover */}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors"></div>

                {/* --- NÚT XÓA (X) --- */}
                <button 
                    onClick={(e) => handleRemoveFavorite(e, anime._id)}
                    className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 shadow-md z-10 cursor-pointer"
                    title="Bỏ thích phim này"
                >
                    ✕
                </button>
              </div>

              {/* Tên phim */}
              <h3 className="mt-3 text-center text-sm font-semibold truncate group-hover:text-[#a413ec] transition-colors text-white/90">
                {anime.title}
              </h3>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;