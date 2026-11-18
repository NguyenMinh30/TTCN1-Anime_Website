import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Crown } from "lucide-react";
import AnimeList from "../Animelist";

const GENRES = [
  "Hành Động",
  "Tình Cảm",
  "Giả Tưởng",
  "Hài Hước",
  "Học Đường",
];

const SiteFooter = () => (
  <footer className="mt-auto border-t border-white/10 pt-8 pb-12 px-4 text-center text-white/50 text-sm">
    <p>
      &copy; 2025 Anime Realm. Tất cả bản quyền được bảo lưu. Admin Nguyễn
      Minh, Lê Đạt, Phú Quang.
    </p>
  </footer>
);

const Home = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [isGenreDropdownOpen, setIsGenreDropdownOpen] = useState(false);

  const timerRef = useRef(null);
  const navigate = useNavigate();

  const username = localStorage.getItem("username");
  const role = localStorage.getItem("role");
  const isVip = localStorage.getItem("isVip") === "true";
  const canOpenPremium = role === "vip" || role === "admin" || isVip;

  const isHomePageMode = filterCategory === "all" && searchTerm === "";

  const handleSearchChange = (e) => {
    const value = e.target.value;

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      setSearchTerm(value);
    }, 300);
  };

  const handleCategorySelect = (category) => {
    setFilterCategory(category);
    setIsGenreDropdownOpen(false);
    setSearchTerm("");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    localStorage.removeItem("isVip");
    navigate("/login");
  };

  useEffect(() => {
    let interval = null;

    if (isHomePageMode) {
      const createHeart = () => {
        const heart = document.createElement("div");
        heart.classList.add("heart");
        heart.style.left = Math.random() * 100 + "vw";

        const size = Math.random() * (35 - 15) + 15;
        heart.style.width = size + "px";
        heart.style.height = size + "px";
        heart.style.position = "absolute";
        heart.style.top = "-50px";
        heart.style.background = "rgba(255, 192, 203, 0.5)";
        heart.style.borderRadius = "50%";
        heart.style.animationDuration = Math.random() * (15 - 8) + 8 + "s";

        const container = document.querySelector(".heart-fall-container");

        if (container) container.appendChild(heart);

        heart.addEventListener("animationend", () => heart.remove());
      };

      interval = setInterval(createHeart, 2000);
    }

    return () => {
      if (interval) clearInterval(interval);

      const container = document.querySelector(".heart-fall-container");

      if (container) container.innerHTML = "";
    };
  }, [isHomePageMode]);

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-[#1c1022] font-sans text-white">
      {isHomePageMode && (
        <div className="heart-fall-container fixed inset-0 pointer-events-none z-0"></div>
      )}

      <div className="layout-container flex h-full grow flex-col z-10 relative">
        <header className="flex items-center justify-between border-b border-white/10 px-4 sm:px-6 lg:px-10 py-4 bg-[#1c1022]/90 backdrop-blur-md sticky top-0 z-50 shadow-md">
          <div className="flex items-center gap-8">
            <Link
              to="/"
              className="flex items-center gap-4 text-white hover:opacity-80 transition-opacity"
              onClick={() => {
                setFilterCategory("all");
                setSearchTerm("");
              }}
            >
              <img
                src="/images/logo.jpg"
                alt="Anime Realm"
                className="size-10 sm:size-12 rounded-xl object-cover border border-white/20"
              />
              <h2 className="text-xl sm:text-2xl font-bold hidden sm:block bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Anime Realm
              </h2>
            </Link>

            <nav className="hidden md:flex items-center gap-8 relative">
              <button
                onClick={() => handleCategorySelect("all")}
                className={`text-base font-semibold transition-colors ${filterCategory === "all"
                    ? "text-[#a413ec]"
                    : "text-white/80 hover:text-white"
                  }`}
              >
                Trang chủ
              </button>

              <div
                className="relative group"
                onMouseEnter={() => setIsGenreDropdownOpen(true)}
                onMouseLeave={() => setIsGenreDropdownOpen(false)}
              >
                <button
                  className={`flex items-center gap-1 text-base font-semibold transition-colors ${filterCategory !== "all"
                      ? "text-[#a413ec]"
                      : "text-white/80 hover:text-white"
                    }`}
                >
                  Thể loại <span className="text-xs mt-0.5">▼</span>
                </button>

                {isGenreDropdownOpen && (
                  <div className="absolute top-full left-0 pt-3 w-56 z-50">
                    <div className="bg-[#2a1b3d] border border-white/10 rounded-xl shadow-2xl overflow-hidden py-2 animate-fadeIn ring-1 ring-white/5">
                      <div className="grid grid-cols-1">
                        {GENRES.map((genre) => (
                          <button
                            key={genre}
                            onClick={() => handleCategorySelect(genre)}
                            className={`text-left px-5 py-3 text-base hover:bg-[#a413ec] hover:text-white transition-colors ${filterCategory === genre
                                ? "text-[#a413ec] bg-white/5"
                                : "text-white/80"
                              }`}
                          >
                            {genre}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Link
                to="/premium"
                className={`text-base font-semibold flex items-center gap-1 transition-colors ${canOpenPremium
                    ? "text-yellow-300 hover:text-yellow-200"
                    : "text-white/80 hover:text-yellow-300"
                  }`}
              >
                <Crown size={17} />
                Premium
              </Link>

              <Link
                to="/favorites"
                className="text-white/80 hover:text-white text-base font-semibold flex items-center gap-1"
              >
                Yêu thích
              </Link>

              <Link
                to="/historys"
                className="text-white/80 hover:text-white text-base font-semibold"
              >
                Lịch sử
              </Link>
            </nav>
          </div>

          <div className="flex flex-1 justify-end gap-4 sm:gap-6">
            <div className="flex items-center bg-white/5 rounded-full h-11 px-5 min-w-[160px] sm:w-72 border border-white/10 focus-within:border-[#a413ec] focus-within:bg-white/10 transition-all">
              <span className="text-white/50 mr-3 text-lg">🔍</span>
              <input
                className="bg-transparent border-none text-white placeholder:text-white/50 focus:outline-none w-full text-base"
                placeholder="Tìm kiếm anime..."
                onChange={handleSearchChange}
              />
            </div>

            {username ? (
              <div className="flex items-center gap-4">
                {canOpenPremium && (
                  <span className="hidden lg:inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-400/15 border border-yellow-300/40 text-yellow-200 text-xs font-bold">
                    <Crown size={14} />
                    VIP
                  </span>
                )}

                {role === "admin" && (
                  <Link
                    to="/admin/anime"
                    className="hidden md:block px-4 py-2 bg-yellow-500/10 border border-yellow-500/50 text-yellow-400 rounded-lg hover:bg-yellow-500 hover:text-black font-bold text-sm transition-all"
                  >
                    Trang quản trị
                  </Link>
                )}

                <div className="size-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-base font-bold shadow-lg">
                  {username.charAt(0).toUpperCase()}
                </div>

                <button
                  onClick={handleLogout}
                  className="text-base font-medium text-red-400 hover:text-red-300 transition-colors"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center justify-center bg-[#a413ec] hover:bg-[#9013ec] text-white text-base font-bold px-6 h-11 rounded-full transition-all shadow-lg shadow-purple-500/20"
              >
                Đăng nhập
              </Link>
            )}
          </div>
        </header>

        <main className="flex flex-col gap-8 md:gap-12 mt-8 px-4 md:px-10 lg:px-20 xl:px-40 pb-10">
          {isHomePageMode && (
            <div
              className="rounded-2xl overflow-hidden relative min-h-[400px] sm:min-h-[480px] bg-cover bg-center flex items-end p-6 sm:p-10 shadow-2xl transition-all group"
              style={{
                backgroundImage:
                  "linear-gradient(to top, rgba(28, 16, 34, 1), rgba(28, 16, 34, 0)), url(/images/illustration-anime-city.jpg)",
              }}
            >
              <div className="max-w-2xl relative z-10 animate-slideUp">
                <h1 className="text-4xl sm:text-6xl font-black mb-4 leading-tight drop-shadow-lg">
                  Khám phá thế giới{" "}
                  <span className="text-[#a413ec]">Anime</span>
                </h1>

                <p className="text-white/80 mb-8 text-base sm:text-lg max-w-lg">
                  Trải nghiệm những bộ phim hoạt hình đỉnh cao, cập nhật liên
                  tục mỗi ngày với chất lượng tốt nhất.
                </p>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => window.scrollTo({ top: 650, behavior: "smooth" })}
                    className="bg-[#a413ec] hover:bg-[#b52aff] text-white font-bold py-3.5 px-8 rounded-full transition-transform hover:scale-105 shadow-lg shadow-purple-500/40"
                  >
                    Xem Ngay
                  </button>

                  <Link
                    to="/premium"
                    className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-black font-black py-3.5 px-8 rounded-full transition-transform hover:scale-105 shadow-lg shadow-yellow-500/20"
                  >
                    <Crown size={20} />
                    Premium
                  </Link>
                </div>
              </div>
            </div>
          )}

          <AnimeList searchTerm={searchTerm} filterCategory={filterCategory} />
        </main>

        <SiteFooter />
      </div>
    </div>
  );
};

export default Home;