import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Crown } from "lucide-react";

const API_URL = "http://localhost:5000";

const emptyForm = {
  title: "",
  otherTitle: "",
  category: "",
  videoProvider: "mux", // Mặc định chọn provider là Mux
  muxPlaybackId: "",
  muxAssetId: "",
  videoUrl: "",
  videoFile: null,
  posterUrl: "",
  url: "",
  summary: "",
  status: "",
  epCount: "",
  isPremium: false,
};

const inputClass =
  "w-full px-4 py-2 rounded-xl bg-black/40 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500";

const AdminAnime = () => {
  const [animeList, setAnimeList] = useState([]);
  const [userList, setUserList] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const getToken = () => localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const axiosAuth = axios.create({
    baseURL: API_URL,
  });

  axiosAuth.interceptors.request.use((config) => {
    const token = getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  });

  const handleAuthError = (err) => {
    if (err.response?.status === 401) {
      alert("Phiên đăng nhập đã hết hạn hoặc token không hợp lệ. Vui lòng đăng nhập lại.");
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      localStorage.removeItem("role");
      navigate("/login");
      return true;
    }

    if (err.response?.status === 403) {
      alert("Tài khoản của bạn không có quyền Admin.");
      navigate("/");
      return true;
    }

    return false;
  };

  /**
   * Đóng gói dữ liệu Form để gửi lên Server
   */
  const buildFormData = () => {
    const formData = new FormData();

    formData.append("title", form.title);
    formData.append("otherTitle", form.otherTitle);
    formData.append("category", form.category);
    formData.append("videoProvider", form.videoProvider);
    formData.append("muxPlaybackId", form.muxPlaybackId);
    formData.append("muxAssetId", form.muxAssetId);
    formData.append("videoUrl", form.videoUrl);
    formData.append("posterUrl", form.posterUrl);

    // Gán trường url tương ứng với provider được chọn (Mux dùng PlaybackId, Local/Archive dùng videoUrl)
    formData.append(
      "url",
      form.videoProvider === "mux" ? form.muxPlaybackId : form.videoUrl
    );

    formData.append("summary", form.summary);
    formData.append("status", form.status);
    formData.append("epCount", form.epCount);
    formData.append("isPremium", form.isPremium);

    // Nếu chọn local và có đính kèm file video từ máy
    if (form.videoProvider === "local" && form.videoFile) {
      formData.append("video", form.videoFile);
    }

    return formData;
  };

  const fetchAnime = async () => {
    try {
      const res = await axiosAuth.get("/api/admin/anime");

      const fixed = res.data.map((a) => ({
        ...a,
        likeCount: a.likeCount || 0,
        dislikeCount: a.dislikeCount || 0,
      }));

      setAnimeList(fixed);
    } catch (err) {
      if (!handleAuthError(err)) {
        console.error(err);
        alert("Lỗi lấy danh sách anime");
      }
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axiosAuth.get("/api/users");
      setUserList(res.data);
    } catch (err) {
      if (!handleAuthError(err)) {
        console.error("Lỗi lấy danh sách user", err);
      }
    }
  };

  const handleBlockUser = async (userId) => {
    if (!window.confirm("Bạn có chắc chắn muốn Khóa/Mở khóa người này?")) {
      return;
    }

    try {
      const res = await axiosAuth.put(`/api/users/block/${userId}`);
      alert(res.data.message);
      fetchUsers();
    } catch (err) {
      if (!handleAuthError(err)) {
        alert("Lỗi khi thực hiện thao tác");
      }
    }
  };

  const handleToggleVip = async (userId) => {
    if (!window.confirm("Bạn muốn nâng/hủy VIP cho người dùng này?")) {
      return;
    }

    try {
      const res = await axiosAuth.put(`/api/users/vip/${userId}`);
      alert(res.data.message || "Đã cập nhật VIP");
      fetchUsers();
    } catch (err) {
      if (!handleAuthError(err)) {
        alert("Backend chưa có API cập nhật VIP: PUT /api/users/vip/:userId");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      return alert("Cần nhập tên anime");
    }

    // Kiểm tra dữ liệu tương ứng với từng provider
    if (form.videoProvider === "mux" && !form.muxPlaybackId.trim()) {
      return alert("Cần nhập Mux Playback ID");
    }

    if (form.videoProvider === "archive" && !form.videoUrl.trim()) {
      return alert("Cần nhập Video URL từ Archive.org");
    }

    if (form.videoProvider === "local" && !form.videoUrl.trim() && !form.videoFile) {
      return alert("Cần nhập Video URL hoặc chọn file video từ máy");
    }

    try {
      setLoading(true);

      const res = await axiosAuth.post("/api/admin/anime", buildFormData(), {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setAnimeList((prev) => [
        { ...res.data, likeCount: 0, dislikeCount: 0 },
        ...prev,
      ]);

      setForm(emptyForm);
      alert("Thêm anime thành công");
    } catch (err) {
      if (!handleAuthError(err)) {
        console.error(err);
        alert(err.response?.data?.message || "Thêm anime thất bại");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xoá anime này?")) return;

    try {
      await axiosAuth.delete(`/api/admin/anime/${id}`);
      setAnimeList((prev) => prev.filter((a) => a._id !== id));
    } catch (err) {
      if (!handleAuthError(err)) {
        alert("Xóa anime thất bại");
      }
    }
  };

  useEffect(() => {
    const token = getToken();

    if (!token) {
      navigate("/login");
      return;
    }

    if (role !== "admin") {
      alert("Bạn cần đăng nhập bằng tài khoản Admin.");
      navigate("/");
      return;
    }

    fetchAnime();
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalLike = useMemo(
    () => animeList.reduce((sum, a) => sum + (a.likeCount || 0), 0),
    [animeList]
  );

  const totalDislike = useMemo(
    () => animeList.reduce((sum, a) => sum + (a.dislikeCount || 0), 0),
    [animeList]
  );

  const sortedByLike = useMemo(
    () =>
      [...animeList].sort(
        (a, b) => (b.likeCount || 0) - (a.likeCount || 0)
      ),
    [animeList]
  );

  return (
    <div className="min-h-screen bg-[#0f0c29] text-white px-6 py-10">
      <div className="max-w-5xl mx-auto space-y-10">
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
          Admin • Quản lý Anime
        </h1>

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
            <p className="text-white/60 text-sm">Tổng Like</p>
            <p className="text-4xl font-extrabold text-purple-400">
              👍 {totalLike}
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
            <p className="text-white/60 text-sm">Tổng Dislike</p>
            <p className="text-4xl font-extrabold text-red-400">
              👎 {totalDislike}
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white/5 border border-white/10 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <input
            className={inputClass}
            placeholder="Tên anime *"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />

          <input
            className={inputClass}
            placeholder="Tên khác"
            value={form.otherTitle}
            onChange={(e) => setForm({ ...form, otherTitle: e.target.value })}
          />

          <input
            className={inputClass}
            placeholder="Thể loại, ví dụ: Action, Romance"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />

          {/* ========================================================= */}
          {/* MENU CHỌN NGUỒN PHÁT (VIDEO PROVIDER): THÊM ARCHIVE.ORG   */}
          {/* ========================================================= */}
          <select
            className={inputClass}
            value={form.videoProvider}
            onChange={(e) =>
              setForm({
                ...form,
                videoProvider: e.target.value,
                videoUrl: "",
                muxPlaybackId: "",
                muxAssetId: "",
                videoFile: null,
              })
            }
          >
            <option className="bg-[#0f0c29]" value="mux">
              Mux
            </option>
            <option className="bg-[#0f0c29]" value="archive">
              Archive
            </option>
            <option className="bg-[#0f0c29]" value="local">
              Local / Upload từ máy
            </option>
          </select>

          {/* ========================================================= */}
          {/* HIỂN THỊ CÁC Ô INPUT TƯƠNG ỨNG VỚI NGUỒN PHÁT ĐƯỢC CHỌN   */}
          {/* ========================================================= */}
          {form.videoProvider === "mux" ? (
            /* TRƯỜNG HỢP 1: Mux */
            <>
              <input
                className={inputClass}
                placeholder="Mux Playback ID *"
                value={form.muxPlaybackId}
                onChange={(e) =>
                  setForm({ ...form, muxPlaybackId: e.target.value })
                }
              />

              <input
                className={inputClass}
                placeholder="Mux Asset ID"
                value={form.muxAssetId}
                onChange={(e) =>
                  setForm({ ...form, muxAssetId: e.target.value })
                }
              />
            </>
          ) : form.videoProvider === "archive" ? (
            /* TRƯỜNG HỢP 2: Archive.org (Nhập URL link MP4 hoặc link Embed) */
            <input
              className={`${inputClass} md:col-span-2`}
              placeholder="Video URL từ Archive * (ví dụ: https://archive.org/download/.../video.mp4)"
              value={form.videoUrl}
              onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
            />
          ) : (
            /* TRƯỜNG HỢP 3: Local / Upload từ máy */
            <>
              <input
                className={inputClass}
                placeholder="Video URL, ví dụ: /video/anime-01.mp4 hoặc https://..."
                value={form.videoUrl}
                onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
              />

              <input
                className={inputClass}
                type="file"
                accept="video/*"
                onChange={(e) =>
                  setForm({
                    ...form,
                    videoFile: e.target.files?.[0] || null,
                    videoUrl: "",
                  })
                }
              />
            </>
          )}

          <input
            className={inputClass}
            placeholder="Poster URL"
            value={form.posterUrl}
            onChange={(e) => setForm({ ...form, posterUrl: e.target.value })}
          />

          <input
            className={inputClass}
            placeholder="Số tập"
            value={form.epCount}
            onChange={(e) => setForm({ ...form, epCount: e.target.value })}
          />

          <input
            className={inputClass}
            placeholder="Trạng thái"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          />

          <label className="md:col-span-2 flex items-center gap-3 bg-yellow-400/10 border border-yellow-400/30 rounded-xl px-4 py-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isPremium}
              onChange={(e) =>
                setForm({ ...form, isPremium: e.target.checked })
              }
              className="size-5"
            />
            <span className="font-bold text-yellow-200 flex items-center gap-2">
              <Crown size={18} />
              Đánh dấu anime này là Premium / VIP
            </span>
          </label>

          <textarea
            className={`${inputClass} md:col-span-2 h-24`}
            placeholder="Mô tả"
            value={form.summary}
            onChange={(e) => setForm({ ...form, summary: e.target.value })}
          />

          <button
            disabled={loading}
            className="md:col-span-2 bg-purple-600 hover:bg-purple-500 py-3 rounded-xl font-bold disabled:opacity-60"
          >
            {loading ? "Đang thêm..." : "➕ Thêm Anime"}
          </button>
        </form>

        <div className="bg-white/5 border border-white/10 rounded-2xl">
          {animeList.map((anime) => (
            <div
              key={anime._id}
              className="flex justify-between items-center px-6 py-4 border-b border-white/10"
            >
              <div>
                <span className="font-bold">{anime.title}</span>

                {anime.isPremium && (
                  <span className="ml-2 inline-flex items-center gap-1 text-xs bg-yellow-400 text-black rounded-full px-2 py-1 font-black">
                    <Crown size={12} />
                    VIP
                  </span>
                )}

                <p className="text-xs text-white/45 mt-1">
                  Provider: {anime.videoProvider || "chưa có"}{" "}
                  {anime.muxPlaybackId
                    ? `• Mux: ${anime.muxPlaybackId}`
                    : anime.videoUrl
                      ? `• URL: ${anime.videoUrl}`
                      : ""}
                </p>
              </div>

              <button
                onClick={() => handleDelete(anime._id)}
                className="bg-red-600 px-3 py-1 rounded-lg text-sm"
              >
                Xoá
              </button>
            </div>
          ))}
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-4">
            📊 Thống kê Anime theo Like
          </h2>

          {sortedByLike.map((anime, index) => (
            <div
              key={anime._id}
              className="flex items-center justify-between py-2 border-b border-white/10 text-sm"
            >
              <span className="w-8 text-white/50">#{index + 1}</span>
              <span className="flex-1 truncate">
                {anime.title}
                {anime.isPremium && (
                  <span className="ml-2 text-yellow-300">VIP</span>
                )}
              </span>
              <span className="w-20 text-purple-400 text-right">
                👍 {anime.likeCount}
              </span>
              <span className="w-20 text-red-400 text-right">
                👎 {anime.dislikeCount}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto mt-10 bg-white/5 border border-white/10 rounded-2xl p-6">
        <h2 className="text-xl font-bold mb-4 text-white">
          Quản lý Người dùng
        </h2>

        <div className="space-y-4">
          {userList.map((user) => (
            <div
              key={user._id}
              className="flex items-center justify-between border-b border-white/10 pb-2"
            >
              <div>
                <p className="font-bold text-purple-400 flex items-center gap-2">
                  {user.username}
                  {(user.isVip || user.role === "vip") && (
                    <span className="inline-flex items-center gap-1 bg-yellow-400 text-black rounded-full px-2 py-0.5 text-xs font-black">
                      <Crown size={12} />
                      VIP
                    </span>
                  )}
                </p>

                <p className="text-sm text-gray-400">{user.email}</p>

                <p className="text-xs text-gray-500">
                  Trạng thái:{" "}
                  {user.isBlocked ? "🔴 Đã khóa" : "🟢 Hoạt động"}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleToggleVip(user._id)}
                  className={`px-3 py-1 rounded text-sm font-bold ${user.isVip || user.role === "vip"
                    ? "bg-yellow-500 text-black hover:bg-yellow-400"
                    : "bg-yellow-500/20 text-yellow-300 border border-yellow-400/40 hover:bg-yellow-500 hover:text-black"
                    }`}
                >
                  {user.isVip || user.role === "vip" ? "Hủy VIP" : "Nâng VIP"}
                </button>

                <button
                  onClick={() => handleBlockUser(user._id)}
                  className={`px-3 py-1 rounded text-sm font-bold ${user.isBlocked
                    ? "bg-green-600 hover:bg-green-500"
                    : "bg-red-600 hover:bg-red-500"
                    }`}
                >
                  {user.isBlocked ? "Mở khóa" : "Khóa"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminAnime;