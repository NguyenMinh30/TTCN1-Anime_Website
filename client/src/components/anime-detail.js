import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Play, Clock, Calendar, Film, Layers, MonitorPlay,
  ThumbsUp, ThumbsDown, Heart, Crown, Lock,
} from "lucide-react";
import CommentSection from "./CommentSection";
import axios from "axios";

const API_URL = "http://localhost:5000";

const PLACEHOLDER_IMG =
  "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22300%22%20height%3D%22400%22%20viewBox%3D%220%200%20300%20400%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%232a1b3d%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20fill%3D%22%23a413ec%22%20font-family%3D%22sans-serif%22%20font-size%3D%2220%22%20font-weight%3D%22bold%22%3EANIME%20REALM%3C%2Ftext%3E%3C%2Fsvg%3E";

// === ĐOẠN SỬA 1: BỔ SUNG REGEX NHẬN ĐIỆN ARCHIVE TOÀN DIỆN ===
const getArchiveThumbnail = (videoUrl) => {
  if (!videoUrl || typeof videoUrl !== "string") return "";
  if (videoUrl.includes("archive.org")) {
    // Hỗ trợ bóc tách ID từ mọi dạng link: items, download, details, embed...
    const match = videoUrl.match(/(?:download|details|embed|items|services\/img)\/([^/?#\s]+)/i);
    if (match && match[1]) {
      return `https://archive.org/services/img/${match[1]}`;
    }
  }
  return "";
};

// === ĐOẠN SỬA 2: ĐỒNG BỘ CÁCH LẤY POSTER CHUẨN XÁC ===
const getPosterUrl = (anime) => {
  if (!anime) return PLACEHOLDER_IMG;

  let url = anime.posterUrl || anime.thumbnail || anime.image || anime.coverImage || "";

  if (url.includes("default_placeholder.jpg") || url.includes("via.placeholder.com")) {
    url = "";
  }

  // 1. Tự lấy ảnh từ Archive.org nếu có video URL
  const videoLink = anime.videoUrl || anime.url || "";
  const archiveThumb = getArchiveThumbnail(videoLink);
  if (!url && archiveThumb) {
    return archiveThumb;
  }

  // 2. Tự lấy ảnh Mux
  if (!url && anime.muxPlaybackId) {
    return `https://image.mux.com/${anime.muxPlaybackId}/thumbnail.png`;
  }

  // 3. Sử dụng link poster nếu admin nhập thủ công
  if (url && url.trim() !== "") {
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) return url;
    if (url.startsWith("/images/")) return url;
    return `${API_URL}${url}`;
  }

  // 4. Lấy ảnh Youtube cũ
  if (videoLink.includes("youtube.com") || videoLink.includes("youtu.be")) {
    const match = videoLink.match(/(?:youtube\.com\/.*v=|youtu\.be\/)([^?&\s]+)/);
    if (match && match[1]) {
      return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
    }
  }

  return archiveThumb || PLACEHOLDER_IMG;
};

function AnimeDetail() {
  const { id } = useParams();

  const [animeData, setAnimeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isFavorite, setIsFavorite] = useState(false);

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  const role = localStorage.getItem("role");
  const isVip = localStorage.getItem("isVip") === "true";

  const canOpenPremium = role === "vip" || role === "admin" || isVip;

  useEffect(() => {
    const checkFavorite = async () => {
      if (!token) return;
      try {
        const res = await axios.get(`http://localhost:5000/api/favorites/check/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsFavorite(res.data.isFavorite);
      } catch (err) {
        console.error("Lỗi check favorite:", err);
      }
    };
    checkFavorite();
  }, [id, token]);

  useEffect(() => {
    const fetchAnime = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/animes/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error("Không tìm thấy anime hoặc dữ liệu không hợp lệ");

        const data = await res.json();
        data.likes = Array.isArray(data.likes) ? data.likes : [];
        data.dislikes = Array.isArray(data.dislikes) ? data.dislikes : [];
        data.likedBy = Array.isArray(data.likedBy) ? data.likedBy : [];
        data.dislikedBy = Array.isArray(data.dislikedBy) ? data.dislikedBy : [];

        setAnimeData(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAnime();
  }, [id, token]);

  const handleToggleFavorite = async () => {
    if (!token) return alert("Vui lòng đăng nhập để sử dụng tính năng này!");
    try {
      const res = await axios.post(
        "http://localhost:5000/api/favorites/toggle",
        { animeId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsFavorite(res.data.isFavorite);
    } catch (err) {
      console.error(err);
      alert("Lỗi khi cập nhật yêu thích");
    }
  };

  const handleLike = async () => {
    if (!token) return alert("Vui lòng đăng nhập để like");
    try {
      const res = await fetch(`http://localhost:5000/api/animes/${id}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Like thất bại");

      const data = await res.json();
      data.likedBy = Array.isArray(data.likedBy) ? data.likedBy : [];
      data.dislikedBy = Array.isArray(data.dislikedBy) ? data.dislikedBy : [];
      setAnimeData((prev) => ({ ...prev, ...data }));
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const handleDislike = async () => {
    if (!token) return alert("Vui lòng đăng nhập để dislike");
    try {
      const res = await fetch(`http://localhost:5000/api/animes/${id}/dislike`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Dislike thất bại");

      const data = await res.json();
      data.likedBy = Array.isArray(data.likedBy) ? data.likedBy : [];
      data.dislikedBy = Array.isArray(data.dislikedBy) ? data.dislikedBy : [];
      setAnimeData((prev) => ({ ...prev, ...data }));
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0c29] flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-purple-500"></div>
      </div>
    );
  }

  if (error || !animeData) {
    return (
      <div className="min-h-screen bg-[#0f0c29] flex justify-center items-center">
        <div className="text-red-500 border border-red-500 px-6 py-4 rounded-xl bg-red-500/10">
          Error: {error || "Not found"}
        </div>
      </div>
    );
  }

  const posterUrl = getPosterUrl(animeData);
  const isPremium = Boolean(animeData.isPremium);
  const totalEpisodes = animeData.epCount ? animeData.epCount.split("/")[1] || animeData.epCount : "??";
  const watchUrl = `/anime-watching/${animeData._id}/1`;

  const handlePremiumClick = (e) => {
    if (isPremium && !canOpenPremium) {
      e.preventDefault();
      alert("Bạn cần tài khoản VIP để xem nội dung Premium.");
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0f0c29] text-gray-100 font-sans pb-20">
      <div
        className="fixed inset-0 bg-cover bg-center opacity-20 blur-3xl scale-110 z-0 pointer-events-none"
        style={{ backgroundImage: `url("${posterUrl}")` }}
      />

      <div className="fixed inset-0 bg-gradient-to-t from-[#0f0c29] via-[#0f0c29]/90 to-[#0f0c29]/60 z-0" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex flex-col md:flex-row gap-8 lg:gap-12 mb-12">
          <div className="flex-shrink-0 w-full md:w-72 lg:w-80 flex flex-col gap-4">
            <div className="relative aspect-[2/3] rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(168,85,247,0.3)] border border-white/10 group bg-[#2a1b3d]">

              {/* === ĐOẠN SỬA 3: CẬP NHẬT THẺ IMG CHI TIẾT KÈM XỬ LÝ ẢNH MỜ === */}
              <img
                src={posterUrl}
                alt={animeData.title}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = PLACEHOLDER_IMG;
                }}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />

              {isPremium && (
                <div className="absolute top-3 left-3 z-10 bg-yellow-400 text-black rounded-full px-3 py-1 text-xs font-black flex items-center gap-1 shadow-lg">
                  <Crown size={14} />
                  VIP
                </div>
              )}

              <Link
                to={watchUrl}
                onClick={handlePremiumClick}
                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              >
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                  {isPremium && !canOpenPremium ? (
                    <Lock className="text-white" />
                  ) : (
                    <Play fill="white" className="ml-1" />
                  )}
                </div>
              </Link>
            </div>

            <div className="flex gap-3">
              <Link
                to={watchUrl}
                onClick={handlePremiumClick}
                className={`flex-1 py-3.5 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 transform active:scale-95 transition-all ${isPremium && !canOpenPremium
                  ? "bg-yellow-500/20 border border-yellow-400/40 text-yellow-200"
                  : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500"
                  }`}
              >
                {isPremium && !canOpenPremium ? (
                  <>
                    <Lock size={20} /> CẦN VIP
                  </>
                ) : (
                  <>
                    <MonitorPlay size={20} /> XEM NGAY
                  </>
                )}
              </Link>

              <button
                onClick={handleToggleFavorite}
                className={`px-4 rounded-xl border-2 transition-all duration-300 flex items-center justify-center shadow-lg transform active:scale-95 ${isFavorite
                  ? "bg-red-600 border-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]"
                  : "bg-white/5 border-white/20 text-white/80 hover:bg-white/10 hover:border-red-400 hover:text-red-400"
                  }`}
                title={isFavorite ? "Bỏ thích" : "Thêm vào yêu thích"}
              >
                <Heart
                  size={24}
                  fill={isFavorite ? "currentColor" : "none"}
                  className={isFavorite ? "animate-pulse" : ""}
                />
              </button>
            </div>

            {isPremium && !canOpenPremium && (
              <div className="bg-yellow-500/10 border border-yellow-400/30 rounded-xl p-4 text-yellow-100 text-sm">
                <div className="font-bold text-yellow-300 flex items-center gap-2 mb-1">
                  <Crown size={16} />
                  Nội dung Premium
                </div>
                Bạn cần tài khoản VIP để xem bộ phim này.
              </div>
            )}
          </div>

          <div className="flex-1 space-y-6">
            <div>
              <h1 className="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-purple-200 leading-tight mb-2 flex items-center gap-3">
                {animeData.title}
                {isPremium && (
                  <Crown
                    size={32}
                    className="text-yellow-300 flex-shrink-0"
                  />
                )}
              </h1>

              <p className="text-lg text-purple-400 font-medium italic">
                {animeData.otherTitle}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-lg border border-white/10 backdrop-blur-sm">
                <Film size={18} className="text-pink-400" />
                <span className="font-medium">
                  {animeData.category || "N/A"}
                </span>
              </div>

              <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-lg border border-white/10 backdrop-blur-sm">
                <Calendar size={18} className="text-blue-400" />
                <span>{animeData.releaseYear || "N/A"}</span>
              </div>

              <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-lg border border-white/10 backdrop-blur-sm">
                <Layers size={18} className="text-green-400" />
                <span>{animeData.epCount || "??"} Tập</span>
              </div>

              <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-lg border border-white/10 backdrop-blur-sm">
                <Clock size={18} className="text-yellow-400" />
                <span>{animeData.status || "N/A"}</span>
              </div>

              {isPremium && (
                <div className="flex items-center gap-2 bg-yellow-500/10 px-4 py-2 rounded-lg border border-yellow-400/30 backdrop-blur-sm text-yellow-200 font-bold">
                  <Crown size={18} />
                  <span>Premium</span>
                </div>
              )}
            </div>

            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
              <h3 className="text-xl font-bold text-white mb-3 border-l-4 border-purple-500 pl-3">
                Nội Dung
              </h3>

              <p className="text-gray-300 leading-relaxed text-justify">
                {animeData.summary || "Đang cập nhật nội dung..."}
              </p>
            </div>

            <div className="flex gap-4 mt-2">
              <button
                onClick={handleLike}
                className={`flex items-center gap-1 px-4 py-2 rounded-xl border font-semibold ${(animeData.likedBy || []).some(
                  (like) => like.toString() === userId
                )
                  ? "bg-purple-600 border-purple-400 text-white"
                  : "bg-white/5 border-white/10 text-white/70"
                  }`}
              >
                <ThumbsUp size={18} /> {(animeData.likedBy || []).length}
              </button>

              <button
                onClick={handleDislike}
                className={`flex items-center gap-1 px-4 py-2 rounded-xl border font-semibold ${(animeData.dislikedBy || []).some(
                  (dis) => dis.toString() === userId
                )
                  ? "bg-red-600 border-red-400 text-white"
                  : "bg-white/5 border-white/10 text-white/70"
                  }`}
              >
                <ThumbsDown size={18} />{" "}
                {(animeData.dislikedBy || []).length}
              </button>
            </div>
          </div>
        </div>

        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1.5 h-8 bg-purple-500 rounded-full"></div>
            <h2 className="text-2xl font-bold text-white">Danh Sách Tập</h2>
          </div>

          <div className="bg-[#151130]/80 p-6 rounded-2xl border border-white/5 shadow-inner">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3">
              {Array.from({ length: parseInt(totalEpisodes) || 1 }, (_, i) => (
                <Link
                  key={i}
                  to={`/anime-watching/${animeData._id}/${i + 1}`}
                  onClick={handlePremiumClick}
                  className={`flex items-center justify-center py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 border ${isPremium && !canOpenPremium
                    ? "bg-yellow-500/10 text-yellow-200 border-yellow-400/20 hover:bg-yellow-500/20"
                    : "bg-[#252046] text-gray-400 border-transparent hover:bg-purple-600 hover:text-white hover:border-purple-400 hover:shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                    }`}
                >
                  {isPremium && !canOpenPremium ? (
                    <Lock size={14} className="mr-1" />
                  ) : null}
                  Tập {i + 1}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8">
          <CommentSection animeId={id} />
        </div>
      </div>
    </div>
  );
}

export default AnimeDetail;