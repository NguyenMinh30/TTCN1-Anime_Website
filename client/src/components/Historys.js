import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

function History() {
  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- HELPER: Lấy ID Youtube để tạo ảnh thumbnail ---
  const getThumbnail = (url) => {
    if (!url) return "https://via.placeholder.com/300x200?text=No+Image";
    const regex =
      /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^?&\s]+)/;
    const match = url.match(regex);
    const videoId = match ? match[1] : null;
    return videoId
      ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
      : "https://via.placeholder.com/300x200?text=No+Image";
  };

  // --- HELPER: Tính thời gian ---
  const timeAgo = (dateString) => {
    if (!dateString) return "";
    const now = new Date();
    const past = new Date(dateString);
    const diffInSeconds = Math.floor((now - past) / 1000);

    if (diffInSeconds < 60) return "Vừa xong";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} phút trước`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
    return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
  };

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem("token");
        // Gọi API
        const res = await axios.get("http://localhost:5000/api/history", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setHistoryList(res.data);
      } catch (error) {
        console.error("Lỗi tải lịch sử:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0c29] flex items-center justify-center text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0c29] text-white p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8 border-l-4 border-purple-600 pl-4">
          <div>
            <h1 className="text-3xl font-bold">Lịch Sử Xem</h1>
            <p className="text-gray-400 text-sm mt-1">
              Danh sách các tập phim bạn đang theo dõi
            </p>
          </div>
        </div>

        {historyList.length === 0 ? (
          <div className="text-center py-20 bg-white/5 rounded-lg border border-white/10">
            <p className="text-xl text-gray-400">
              Bạn chưa xem phim nào gần đây.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {historyList.map(
              (item) =>
                // SỬA 1: Dùng item.animeId thay vì item.movie_id
                item.animeId && (
                  <div
                    key={item._id}
                    className="group flex flex-col sm:flex-row bg-[#151130] rounded-xl overflow-hidden hover:bg-[#1a163d] transition-all duration-300 border border-white/5 hover:border-purple-500/50"
                  >
                    {/* Image Thumbnail */}
                    <div className="relative w-full sm:w-48 h-48 sm:h-32 flex-shrink-0">
                      <Link
                        to={`/anime-watching/${item.animeId._id}/${item.episodeNumber}`}
                      >
                        <img
                          // SỬA 2: Tạo ảnh từ URL Youtube vì JSON không có poster_url
                          src={getThumbnail(item.animeId.url)}
                          alt={item.animeId.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {/* Play Icon */}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                            <svg
                              className="w-5 h-5 text-white ml-1"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </div>
                      </Link>
                    </div>

                    {/* Info Content */}
                    <div className="p-4 flex flex-col justify-center flex-grow">
                      <div className="flex justify-between items-start">
                        <div>
                          {/* SỬA 3: Link trỏ về đúng route của bạn (/anime-watching/:id/:ep) */}
                          <Link
                            to={`/anime-watching/${item.animeId._id}/${item.episodeNumber}`}
                          >
                            <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors line-clamp-1">
                              {item.animeId.title}
                            </h3>
                          </Link>

                          <div className="flex items-center gap-2 mt-2 mb-3">
                            <span className="bg-purple-600/20 text-purple-300 text-xs px-2 py-1 rounded border border-purple-500/30">
                              Tập {item.episodeNumber}
                            </span>
                            <span className="text-gray-500 text-xs">•</span>
                            {/* SỬA 4: Dùng lastWatched thay vì last_watched_at */}
                            <span className="text-gray-400 text-xs">
                              {timeAgo(item.lastWatched)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-end mt-auto">
                        <Link
                          to={`/anime-watching/${item.animeId._id}/${item.episodeNumber}`}
                          className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-lg shadow-purple-900/20"
                        >
                          Xem tiếp
                        </Link>
                      </div>
                    </div>
                  </div>
                )
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default History;
