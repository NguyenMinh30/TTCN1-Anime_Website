import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Crown, Lock, Play, Search } from "lucide-react";

const API_URL = "http://localhost:5000";

const PLACEHOLDER_IMG =
    "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22300%22%20height%3D%22400%22%20viewBox%3D%220%200%20300%20400%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%232a1b3d%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20fill%3D%22%23a413ec%22%20font-family%3D%22sans-serif%22%20font-size%3D%2220%22%20font-weight%3D%22bold%22%3EANIME%20REALM%3C%2Ftext%3E%3C%2Fsvg%3E";

const isVipUser = () => {
    const role = localStorage.getItem("role");
    const isVip = localStorage.getItem("isVip");
    return role === "vip" || role === "admin" || isVip === "true";
};

// Hàm lấy ảnh Archive thông minh (hỗ trợ mọi định dạng đường dẫn Archive.org)
const getArchiveThumbnail = (videoUrl) => {
    if (!videoUrl || typeof videoUrl !== "string") return "";
    if (videoUrl.includes("archive.org")) {
        const match = videoUrl.match(/(?:download|details|embed|items|services\/img)\/([^/?#\s]+)/i);
        if (match && match[1]) {
            return `https://archive.org/services/img/${match[1]}`;
        }
    }
    return "";
};

const getPosterUrl = (anime) => {
    if (!anime) return PLACEHOLDER_IMG;

    let url = anime.posterUrl || anime.thumbnail || anime.image || anime.coverImage || "";

    if (url.includes("default_placeholder.jpg") || url.includes("via.placeholder.com")) {
        url = "";
    }

    // 1. Tự động lấy ảnh từ Archive.org nếu là nguồn Archive
    const videoLink = anime.videoUrl || anime.url || "";
    const archiveThumb = getArchiveThumbnail(videoLink);
    if (!url && archiveThumb) {
        return archiveThumb;
    }

    // 2. Tự động lấy ảnh Mux
    if (!url && anime.muxPlaybackId) {
        return `https://image.mux.com/${anime.muxPlaybackId}/thumbnail.png`;
    }

    // 3. Sử dụng Poster URL nếu có nhập thủ công
    if (url && url.trim() !== "") {
        if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) return url;
        if (url.startsWith("/images/")) return url;
        return `${API_URL}${url}`;
    }

    // 4. Fallback tự động lấy ảnh YouTube nếu có
    if (videoLink.includes("youtube.com") || videoLink.includes("youtu.be")) {
        const match = videoLink.match(/(?:youtube\.com\/.*v=|youtu\.be\/)([^?&\s]+)/);
        if (match && match[1]) {
            return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
        }
    }

    return archiveThumb || PLACEHOLDER_IMG;
};

function Premium() {
    const [animeList, setAnimeList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const token = localStorage.getItem("token");
    const canWatch = isVipUser();

    useEffect(() => {
        const fetchPremiumAnime = async () => {
            try {
                const res = await axios.get("http://localhost:5000/api/animes", {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                });

                const list = Array.isArray(res.data) ? res.data : [];
                setAnimeList(list.filter((anime) => anime.isPremium));
            } catch (err) {
                console.error("Lỗi tải danh sách Premium:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchPremiumAnime();
    }, [token]);

    const filteredList = useMemo(() => {
        const keyword = searchTerm.trim().toLowerCase();
        if (!keyword) return animeList;
        return animeList.filter((anime) =>
            String(anime.title || "").toLowerCase().includes(keyword)
        );
    }, [animeList, searchTerm]);

    return (
        <div className="min-h-screen bg-[#0f0c29] text-white px-4 md:px-10 py-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8 rounded-3xl border border-yellow-400/30 bg-gradient-to-br from-yellow-500/15 via-purple-700/20 to-black/20 p-6 md:p-10 shadow-2xl">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="size-12 rounded-2xl bg-yellow-400/20 border border-yellow-300/40 flex items-center justify-center">
                            <Crown className="text-yellow-300" size={28} />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-5xl font-black text-yellow-200">
                                Premium Anime
                            </h1>
                            <p className="text-white/60 mt-1">
                                Khu vực dành riêng cho tài khoản VIP.
                            </p>
                        </div>
                    </div>

                    {!canWatch && (
                        <div className="mt-6 bg-black/30 border border-yellow-400/30 rounded-2xl p-5 flex items-start gap-3 text-yellow-100">
                            <Lock size={22} className="text-yellow-300 mt-0.5" />
                            <div>
                                <p className="font-bold text-yellow-200">
                                    Tài khoản của bạn chưa phải VIP
                                </p>
                                <p className="text-sm text-yellow-100/70 mt-1">
                                    Bạn vẫn có thể xem danh sách Premium, nhưng cần nâng VIP để mở video.
                                </p>
                            </div>
                        </div>
                    )}

                    {canWatch && (
                        <div className="mt-6 bg-green-500/10 border border-green-400/30 rounded-2xl p-5 text-green-200">
                            Bạn đang dùng tài khoản VIP/Admin và có thể xem toàn bộ nội dung Premium.
                        </div>
                    )}
                </div>

                <div className="mb-8 flex items-center bg-white/5 rounded-2xl h-12 px-5 border border-white/10 focus-within:border-yellow-400/60 transition-all">
                    <Search size={20} className="text-white/40 mr-3" />
                    <input
                        className="bg-transparent border-none text-white placeholder:text-white/40 focus:outline-none w-full"
                        placeholder="Tìm anime Premium..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {loading ? (
                    <div className="text-center text-white/60 py-20">
                        Đang tải danh sách Premium...
                    </div>
                ) : filteredList.length === 0 ? (
                    <div className="text-center text-white/60 py-20 border border-white/10 rounded-3xl bg-white/5">
                        Chưa có anime Premium nào.
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                        {filteredList.map((anime) => (
                            <Link
                                key={anime._id}
                                to={`/anime/${anime._id}`}
                                className="group rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:border-yellow-400/60 transition-all hover:-translate-y-1 shadow-xl"
                            >
                                <div className="relative aspect-[2/3] overflow-hidden bg-[#2a1b3d]">
                                    <img
                                        src={getPosterUrl(anime)}
                                        alt={anime.title}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = PLACEHOLDER_IMG;
                                        }}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />

                                    <div className="absolute top-2 left-2 flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold bg-yellow-400 text-black">
                                        <Crown size={13} />
                                        VIP
                                    </div>

                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        {canWatch ? (
                                            <div className="size-12 bg-yellow-400 text-black rounded-full flex items-center justify-center">
                                                <Play fill="black" />
                                            </div>
                                        ) : (
                                            <div className="size-12 bg-black/70 border border-yellow-400/50 text-yellow-300 rounded-full flex items-center justify-center">
                                                <Lock />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="p-3">
                                    <h3 className="font-bold text-sm line-clamp-2 group-hover:text-yellow-200 transition-colors">
                                        {anime.title}
                                    </h3>
                                    <p className="text-xs text-white/45 mt-1">
                                        {anime.category || "Premium"}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Premium;