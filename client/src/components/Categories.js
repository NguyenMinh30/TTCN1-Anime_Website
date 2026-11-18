import React, { useEffect, useMemo, useState } from "react";
import { Crown, Lock, Play } from "lucide-react";
import VideoPlayer from "./VideoPlayer";

const isVipUser = () => {
    const role = localStorage.getItem("role");
    const isVip = localStorage.getItem("isVip");

    return role === "vip" || role === "admin" || isVip === "true";
};

const SAMPLE_ANIME_DATA = {
    "Hành Động": [
        {
            title: "Naruto",
            videoProvider: "local",
            videoUrl: "",
            posterUrl: "/images/default_placeholder.jpg",
            isPremium: false,
        },
        {
            title: "Phù thủy kiếm băng sẽ thống trị thế giới",
            videoProvider: "mux",
            muxPlaybackId: "",
            posterUrl: "/images/default_placeholder.jpg",
            isPremium: true,
        },
        {
            title: "Re: Creator",
            videoProvider: "local",
            videoUrl: "",
            posterUrl: "/images/default_placeholder.jpg",
            isPremium: false,
        },
    ],
    "Tình Cảm": [
        {
            title: "Irozuku Sekai no Ashita kara",
            videoProvider: "local",
            videoUrl: "",
            posterUrl: "/images/default_placeholder.jpg",
            isPremium: false,
        },
        {
            title: "Masamune Báo Thù",
            videoProvider: "local",
            videoUrl: "",
            posterUrl: "/images/default_placeholder.jpg",
            isPremium: true,
        },
    ],
    "Giả Tưởng": [
        {
            title: "Hội Pháp Sư - Fairy Tail",
            videoProvider: "local",
            videoUrl: "",
            posterUrl: "/images/default_placeholder.jpg",
            isPremium: false,
        },
        {
            title: "Pokemon XY",
            videoProvider: "local",
            videoUrl: "",
            posterUrl: "/images/default_placeholder.jpg",
            isPremium: false,
        },
    ],
    "Hài Hước": [
        {
            title: "One Punch Man",
            videoProvider: "local",
            videoUrl: "",
            posterUrl: "/images/default_placeholder.jpg",
            isPremium: false,
        },
        {
            title: "Doraemon S12",
            videoProvider: "local",
            videoUrl: "",
            posterUrl: "/images/default_placeholder.jpg",
            isPremium: false,
        },
    ],
    "Học Đường": [
        {
            title: "Chào mừng đến với lớp học đề cao thực lực S3",
            videoProvider: "local",
            videoUrl: "",
            posterUrl: "/images/default_placeholder.jpg",
            isPremium: true,
        },
        {
            title: "Lớp học ám sát",
            videoProvider: "local",
            videoUrl: "",
            posterUrl: "/images/default_placeholder.jpg",
            isPremium: false,
        },
    ],
};

const getAllLinks = () => {
    let allLinks = [];

    for (const category in SAMPLE_ANIME_DATA) {
        allLinks = allLinks.concat(
            SAMPLE_ANIME_DATA[category].map((item) => ({
                ...item,
                category,
            }))
        );
    }

    return allLinks;
};

const CommentContent = () => {
    return (
        <div className="comment-section">
            <h3>Bình luận của người xem</h3>
            <div className="comment-list">
                <p>Chưa có bình luận nào. Hãy là người đầu tiên!</p>
            </div>
        </div>
    );
};

const Categories = ({ filterCategory, searchTerm }) => {
    const [playingAnime, setPlayingAnime] = useState(null);
    const canOpenPremium = isVipUser();

    useEffect(() => {
        setPlayingAnime(null);
    }, [filterCategory]);

    const rawLinks = useMemo(() => {
        if (filterCategory === "all") return getAllLinks();

        return SAMPLE_ANIME_DATA[filterCategory] || [];
    }, [filterCategory]);

    const links = rawLinks.filter((item) =>
        (item.title || "").toLowerCase().includes((searchTerm || "").toLowerCase())
    );

    const displayCategory =
        filterCategory === "all" ? "TẤT CẢ THỂ LOẠI" : filterCategory;

    const handleCardClick = (anime) => {
        if (anime.isPremium && !canOpenPremium) {
            alert("Bạn cần tài khoản VIP để xem nội dung Premium.");
            return;
        }

        setPlayingAnime(anime);

        if (window.history.length > 1) {
            window.history.replaceState(null, null, window.location.pathname);
        }
    };

    if (links.length === 0 && !playingAnime) {
        return (
            <div className="no-result">
                <h2>😥 Không tìm thấy kết quả cho: "{searchTerm}"</h2>
            </div>
        );
    }

    return (
        <div className="main-content-wrapper">
            {playingAnime && (
                <div className="video-player-container">
                    <h3 className="video-title">
                        Đang Phát: {playingAnime.title}
                        {playingAnime.isPremium && (
                            <span className="inline-flex ml-2 items-center gap-1 text-yellow-300">
                                <Crown size={16} />
                                Premium
                            </span>
                        )}
                    </h3>

                    <div className="w-full bg-black rounded-xl overflow-hidden aspect-video">
                        <VideoPlayer animeData={playingAnime} autoPlay={true} />
                    </div>

                    <button
                        className="close-video-btn"
                        onClick={() => setPlayingAnime(null)}
                    >
                        Đóng Video X
                    </button>
                </div>
            )}

            {playingAnime && <CommentContent />}

            {!playingAnime && (
                <>
                    <h2 className="section-title-alt youtube-title">
                        DANH SÁCH ANIME {displayCategory.toUpperCase()}
                    </h2>

                    <div className="anime-grid-container youtube-grid">
                        {links.map((anime, index) => (
                            <div
                                key={`${anime.title}-${index}`}
                                className="anime-card-hay youtube-link-card"
                                onClick={() => handleCardClick(anime)}
                            >
                                <div className="card-image-wrapper">
                                    <img
                                        src={anime.posterUrl || "/images/default_placeholder.jpg"}
                                        alt={anime.title}
                                        className="card-image-hay"
                                    />

                                    <span className="episode-badge">
                                        {anime.isPremium ? "VIP" : "VIDEO"}
                                    </span>

                                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                                        {anime.isPremium && !canOpenPremium ? (
                                            <Lock className="text-yellow-300" size={32} />
                                        ) : (
                                            <Play className="text-white" size={34} fill="white" />
                                        )}
                                    </div>

                                    {anime.isPremium && (
                                        <span className="absolute top-2 left-2 bg-yellow-400 text-black text-xs font-black rounded-full px-2 py-1 flex items-center gap-1">
                                            <Crown size={12} />
                                            VIP
                                        </span>
                                    )}
                                </div>

                                <div className="card-info">
                                    <h3 className="card-title">{anime.title}</h3>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default Categories;