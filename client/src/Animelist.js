import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_URL = "http://localhost:5000";

// Ảnh SVG mặc định nhúng trực tiếp (Không bao giờ bị lỗi mạng hay mất file)
const PLACEHOLDER_IMG =
  "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22300%22%20height%3D%22400%22%20viewBox%3D%220%200%20300%20400%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%232a1b3d%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20fill%3D%22%23a413ec%22%20font-family%3D%22sans-serif%22%20font-size%3D%2220%22%20font-weight%3D%22bold%22%3EANIME%20REALM%3C%2Ftext%3E%3C%2Fsvg%3E";

const getPosterUrl = (anime) => {
  if (!anime) return PLACEHOLDER_IMG;

  let url = anime.posterUrl || anime.thumbnail || anime.image || anime.coverImage || "";

  // Bỏ qua ảnh placeholder cũ nếu có
  if (url.includes("default_placeholder.jpg")) {
    url = "";
  }

  // 1. Ưu tiên 1: Link ảnh trực tiếp
  if (url) {
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    if (url.startsWith("/images/")) return url;
    return `${API_URL}${url}`;
  }

  // 2. Ưu tiên 2: Lấy ảnh Mux
  if (anime.muxPlaybackId) {
    return `https://image.mux.com/${anime.muxPlaybackId}/thumbnail.png`;
  }

  // 3. Ưu tiên 3: Lấy ảnh Archive.org hoặc YouTube từ link video
  const link = anime.videoUrl || anime.url || "";

  if (link.includes("archive.org")) {
    const match = link.match(/archive\.org\/(?:download|embed|details)\/([^/?#]+)/);
    if (match && match[1]) {
      return `https://archive.org/services/img/${match[1]}`;
    }
  }

  if (link.includes("youtube.com") || link.includes("youtu.be")) {
    const match = link.match(/(?:youtube\.com\/.*v=|youtu\.be\/)([^?&\s]+)/);
    if (match && match[1]) {
      return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
    }
  }

  return PLACEHOLDER_IMG;
};

const AnimeList = ({ searchTerm = "", filterCategory = "all", onlyPremium }) => {
  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch("http://localhost:5000/api/animes")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAnimeList(data);
        } else {
          setAnimeList([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Không thể tải danh sách anime.");
        setAnimeList([]);
        setLoading(false);
      });
  }, []);

  const handleLike = async (animeId) => {
    if (!token) return alert("Vui lòng đăng nhập để like");
    try {
      const res = await fetch(`http://localhost:5000/api/animes/${animeId}/like`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const updatedAnime = await res.json();
      setAnimeList((prev) =>
        prev.map((a) => (a._id === updatedAnime._id ? updatedAnime : a))
      );
    } catch (err) {
      console.error("Like error", err);
    }
  };

  const handleDislike = async (animeId) => {
    if (!token) return alert("Vui lòng đăng nhập để dislike");
    try {
      const res = await fetch(`http://localhost:5000/api/animes/${animeId}/dislike`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const updatedAnime = await res.json();
      setAnimeList((prev) =>
        prev.map((a) => (a._id === updatedAnime._id ? updatedAnime : a))
      );
    } catch (err) {
      console.error("Dislike error", err);
    }
  };

  const filteredAnime = animeList.filter((anime) => {
    const title = (anime.title || "").toLowerCase();
    const search = searchTerm.toLowerCase().trim();
    const matchSearch = search === "" || title.includes(search);

    const filter = filterCategory.toLowerCase();
    let matchCategory = filter === "all";
    if (!matchCategory && anime.category) {
      if (Array.isArray(anime.category)) {
        matchCategory = anime.category.some((cat) => cat.toLowerCase() === filter);
      } else {
        matchCategory = anime.category.toLowerCase() === filter;
      }
    }

    const isPremiumFilm = anime.isPremium === true;
    const matchPremium = onlyPremium ? isPremiumFilm : !isPremiumFilm;

    return matchSearch && matchCategory && matchPremium;
  });

  const getSectionTitle = () => {
    if (searchTerm) return `Kết quả tìm kiếm cho: "${searchTerm}"`;
    if (filterCategory !== "all") return `Thể loại: ${filterCategory}`;
    return "Anime Mới Cập Nhật";
  };

  if (loading)
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#a413ec]"></div>
      </div>
    );

  if (error)
    return (
      <div className="text-red-400 text-center py-10 bg-white/5 rounded-xl">
        {error}
      </div>
    );

  return (
    <div className="w-full">
      <div className="flex items-center gap-3 pb-6 pt-2">
        <div className="w-1.5 h-6 bg-[#a413ec] rounded-full"></div>
        <h2 className="text-white text-xl sm:text-2xl font-bold tracking-wide">
          {getSectionTitle()}
        </h2>
        <span className="text-white/40 text-sm font-normal ml-auto">
          {filteredAnime.length} kết quả
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
        {filteredAnime.map((anime) => (
          <div key={anime._id} className="group flex flex-col w-full h-full">
            <Link
              to={`/anime/${anime._id}`}
              className="cursor-pointer hover:-translate-y-1 transition-transform duration-300"
            >
              <div className="relative w-full aspect-[3/4] overflow-hidden rounded-xl bg-[#2a1b3d] shadow-lg border border-white/5">
                <img
                  src={getPosterUrl(anime)}
                  alt={anime.title}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = PLACEHOLDER_IMG;
                  }}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>

              <div className="px-1 pt-3 h-14 overflow-hidden">
                <h3 className="text-white text-base sm:text-lg font-bold line-clamp-2 group-hover:text-[#a413ec]">
                  {anime.title}
                </h3>
              </div>
            </Link>

            <div className="flex items-center justify-between px-1 pt-1">
              <button
                onClick={() => handleLike(anime._id)}
                className="flex items-center gap-1 text-sm text-white/70 hover:text-purple-400"
              >
                👍 {anime.likedBy?.length || 0}
              </button>

              <button
                onClick={() => handleDislike(anime._id)}
                className="flex items-center gap-1 text-sm text-white/70 hover:text-red-400"
              >
                👎 {anime.dislikedBy?.length || 0}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnimeList;