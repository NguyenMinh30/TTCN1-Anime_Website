import React, { useEffect, useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import axios from "axios";
import { MonitorPlay, ChevronLeft, Crown, Lock } from "lucide-react";
import VideoPlayer from "./VideoPlayer";

const isVipUser = () => {
  const role = localStorage.getItem("role");
  const isVip = localStorage.getItem("isVip");

  return role === "vip" || role === "admin" || isVip === "true";
};

function AnimeWatching() {
  const { id, ep } = useParams();
  const episode = ep || 1;

  const [animeData, setAnimeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchAnime = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/animes/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        setAnimeData(res.data);
      } catch (err) {
        console.error("Lỗi tải phim:", err);
        setLoadError("Không tải được phim");
      } finally {
        setLoading(false);
      }
    };

    fetchAnime();
  }, [id, token]);

  useEffect(() => {
    const saveHistory = async () => {
      if (!token || !id) return;

      try {
        await axios.post(
          "http://localhost:5000/api/history",
          {
            animeId: id,
            episodeNumber: parseInt(episode) || 1,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } catch (err) {
        console.error("Lỗi lưu lịch sử:", err);
      }
    };

    saveHistory();
  }, [id, episode, token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0c29] text-white flex items-center justify-center">
        Đang tải phim...
      </div>
    );
  }

  if (loadError || !animeData) {
    return (
      <div className="min-h-screen bg-[#0f0c29] text-white flex items-center justify-center">
        {loadError || "Không tìm thấy phim"}
      </div>
    );
  }

  const isPremium = Boolean(animeData.isPremium);
  const canOpenPremium = isVipUser();

  if (isPremium && !canOpenPremium) {
    return <Navigate to="/premium" replace />;
  }

  const totalEpisodes =
    parseInt(animeData.epCount?.split("/")[1] || animeData.epCount) || 1;

  return (
    <div className="min-h-screen bg-[#0f0c29] text-gray-100 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <Link
          to={`/anime/${id}`}
          className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ChevronLeft size={20} /> Quay lại thông tin phim
        </Link>

        {isPremium && (
          <div className="mb-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/15 border border-yellow-400/40 text-yellow-300 font-bold">
            <Crown size={18} />
            Nội dung Premium dành cho VIP
          </div>
        )}

        <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(168,85,247,0.2)] border border-purple-500/30 mb-8">
          <VideoPlayer
            animeData={animeData}
            episodeNumber={episode}
            autoPlay={true}
          />
        </div>

        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 flex items-center gap-2">
            {animeData.title}
            {isPremium && <Crown size={22} className="text-yellow-300" />}
          </h1>
          <p className="text-purple-400 font-medium">Đang xem: Tập {episode}</p>
        </div>

        <div className="bg-[#151130]/80 p-6 rounded-2xl border border-white/5">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <MonitorPlay size={18} /> Chọn tập khác
          </h3>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-10 gap-2">
            {Array.from({ length: totalEpisodes }, (_, i) => {
              const epNum = i + 1;
              const isActive = epNum === parseInt(episode);

              return (
                <Link
                  key={epNum}
                  to={`/anime-watching/${animeData._id}/${epNum}`}
                  className={`
                    py-2 rounded-lg text-center text-sm font-semibold transition-all
                    ${isActive
                      ? "bg-purple-600 text-white shadow-lg scale-105"
                      : "bg-[#252046] text-gray-400 hover:bg-purple-600/50 hover:text-white"
                    }
                  `}
                >
                  Tập {epNum}
                </Link>
              );
            })}
          </div>
        </div>

        {isPremium && !canOpenPremium && (
          <div className="mt-8 bg-yellow-500/10 border border-yellow-400/30 rounded-2xl p-6 text-yellow-200 flex items-start gap-3">
            <Lock size={22} />
            <div>
              <h3 className="font-bold text-yellow-300">
                Bạn cần tài khoản VIP
              </h3>
              <p className="text-sm text-yellow-100/70">
                Nội dung này chỉ mở cho người dùng VIP.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AnimeWatching;