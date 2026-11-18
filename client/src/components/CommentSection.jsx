import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const CommentSection = ({ animeId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");
  const isLoggedIn = !!token;

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/comments/${animeId}`);
        if (!res.ok) throw new Error("Lỗi tải bình luận");

        const data = await res.json();
        setComments(data);
      } catch (err) {
        console.error(err);
        setError("Không thể tải bình luận.");
      } finally {
        setLoading(false);
      }
    };

    if (animeId) fetchComments();
  }, [animeId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch(`http://localhost:5000/api/comments/${animeId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ content: newComment }),
      });

      const savedComment = await res.json();

      if (res.ok) {
        setComments([savedComment, ...comments]);
        setNewComment("");
      } else {
        alert(savedComment.msg || "Có lỗi xảy ra");
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi kết nối server");
    } finally {
      setSubmitting(false);
    }
  };

  // Helper: Format thời gian
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  return (
    <div className="mt-8 bg-[#1f152b]/50 p-4 sm:p-6 rounded-xl border border-white/5">
      <h3 className="text-xl font-bold text-white mb-6 border-l-4 border-[#a413ec] pl-3">
        Bình luận ({comments.length})
      </h3>

      {/* --- FORM NHẬP (Chỉ hiện khi đã đăng nhập) --- */}
      <div className="mb-8">
        {isLoggedIn ? (
          <form onSubmit={handleSubmit} className="relative">
            <textarea
              className="w-full bg-[#2a1b3d] text-white p-4 rounded-lg border border-white/10 focus:border-[#a413ec] focus:outline-none transition-colors min-h-[100px]"
              placeholder="Bạn nghĩ gì về phim này?"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={submitting}
            />
            <div className="flex justify-end mt-2">
              <button
                type="submit"
                disabled={submitting || !newComment.trim()}
                className={`
                  px-6 py-2 rounded-lg font-bold text-white transition-all
                  ${submitting || !newComment.trim()
                    ? "bg-gray-600 cursor-not-allowed"
                    : "bg-[#a413ec] hover:bg-[#8b0ec9] shadow-lg hover:shadow-[#a413ec]/50"}
                `}
              >
                {submitting ? "Đang gửi..." : "Gửi bình luận"}
              </button>
            </div>
          </form>
        ) : (
          <div className="bg-[#2a1b3d] p-6 rounded-lg text-center border border-dashed border-white/20">
            <p className="text-white/70 mb-2">Bạn muốn tham gia thảo luận?</p>
            <Link
              to="/login"
              className="inline-block text-[#a413ec] font-bold hover:underline"
            >
              Đăng nhập ngay
            </Link>
          </div>
        )}
      </div>

      {/* --- DANH SÁCH BÌNH LUẬN --- */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center text-white/50 py-4">Đang tải bình luận...</div>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment._id} className="flex gap-3 sm:gap-4 p-4 rounded-lg bg-[#2a1b3d] border border-white/5 hover:border-white/10 transition-colors">
              {/* Avatar (Tự tạo từ chữ cái đầu của tên) */}
              <div className="shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-[#a413ec] to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-inner">
                {comment.user?.username?.charAt(0).toUpperCase() || "?"}
              </div>

              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1">
                  <span className="font-bold text-white text-base sm:text-lg">
                    {/* Hiển thị tên user đã được Populate */}
                    {comment.user?.username || "Người dùng ẩn danh"}
                  </span>
                  <span className="text-xs text-white/40">
                    {formatDate(comment.createdAt)}
                  </span>
                </div>

                <p className="text-white/80 leading-relaxed text-sm sm:text-base whitespace-pre-wrap">
                  {comment.content}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-white/40 py-8 italic">
            Chưa có bình luận nào. Hãy là người đầu tiên!
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentSection;