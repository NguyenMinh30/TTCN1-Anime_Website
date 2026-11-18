import React, { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { User, Mail, Lock, Key, Chrome, Facebook, CheckCircle } from "lucide-react";

function Signup() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [signupError, setSignupError] = useState("");

  // Theo dõi giá trị password để so sánh
  const password = watch("password");

  const onSubmit = async (data) => {
    // Reset lỗi cũ
    setSignupError("");

    // Validate thủ công xác nhận mật khẩu (hoặc dùng validate của hook-form)
    if (data["confirm-password"] !== data.password) {
      setSignupError("Mật khẩu xác nhận không khớp!");
      return;
    }

    setIsLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/users/signup", {
        username: data.username,
        email: data.email,
        password: data.password
      });

      // Thông báo thành công (có thể thay bằng Toast notification)
      alert(res.data.message || "Đăng ký thành công!");
      navigate("/login");

    } catch (err) {
      setSignupError(err.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0f0c29] text-white font-sans flex flex-col overflow-hidden">

      {/* 1. BACKGROUND EFFECTS */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[url('https://wallpapers.com/images/hd/purple-anime-scenery-1920-x-1080-r4i6789508587123.jpg')] bg-cover bg-center opacity-20 blur-sm"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0c29] via-[#0f0c29]/90 to-[#1a163d]/80"></div>
      </div>

      {/* 2. HEADER */}
      <header className="relative z-10 w-full py-6 px-6 md:px-12 flex justify-between items-center">
        <Link to="/" className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 tracking-wider hover:opacity-80 transition-opacity">
          ANIME REALM
        </Link>
      </header>

      {/* 3. MAIN CONTENT */}
      <main className="relative z-10 flex-grow flex items-center justify-center p-4 py-10">
        <div className="w-full max-w-lg bg-[#1a163d]/60 backdrop-blur-xl border border-white/10 shadow-[0_0_40px_rgba(139,92,246,0.15)] rounded-2xl p-8 sm:p-10 animation-fade-in-up">

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Tạo Tài Khoản</h1>
            <p className="text-gray-400 text-sm">Tham gia cộng đồng Anime Realm ngay hôm nay!</p>
          </div>

          {/* Error Message Display */}
          {signupError && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm text-center font-medium">
              {signupError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

            {/* Username Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 ml-1">Tên hiển thị</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-purple-400 transition-colors">
                  <User size={18} />
                </div>
                <input
                  {...register("username", { required: true, minLength: 3 })}
                  type="text"
                  placeholder="Chọn tên người dùng"
                  className="w-full pl-10 pr-4 py-3 bg-[#0f0c29]/50 border border-purple-500/30 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-white placeholder-gray-500 transition-all"
                />
              </div>
              {errors.username && <span className="text-red-500 text-xs ml-1">Tên tối thiểu 3 ký tự</span>}
            </div>

            {/* Email Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 ml-1">Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-purple-400 transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  {...register("email", { required: true, pattern: /^\S+@\S+$/i })}
                  type="email"
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-[#0f0c29]/50 border border-purple-500/30 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-white placeholder-gray-500 transition-all"
                />
              </div>
              {errors.email && <span className="text-red-500 text-xs ml-1">Email không hợp lệ</span>}
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 ml-1">Mật khẩu</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-purple-400 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  {...register("password", { required: true, minLength: 6 })}
                  type="password"
                  placeholder="Tối thiểu 6 ký tự"
                  className="w-full pl-10 pr-4 py-3 bg-[#0f0c29]/50 border border-purple-500/30 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-white placeholder-gray-500 transition-all"
                />
              </div>
              {errors.password && <span className="text-red-500 text-xs ml-1">Mật khẩu quá ngắn</span>}
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 ml-1">Xác nhận mật khẩu</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-purple-400 transition-colors">
                  <Key size={18} />
                </div>
                <input
                  {...register("confirm-password", {
                    required: true,
                    validate: (val) => {
                      if (watch('password') != val) {
                        return "Mật khẩu không khớp";
                      }
                    }
                  })}
                  type="password"
                  placeholder="Nhập lại mật khẩu"
                  className="w-full pl-10 pr-4 py-3 bg-[#0f0c29]/50 border border-purple-500/30 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-white placeholder-gray-500 transition-all"
                />
              </div>
              {/* Hiển thị lỗi xác nhận ngay lập tức */}
              {errors["confirm-password"] && <span className="text-red-500 text-xs ml-1">Mật khẩu không khớp</span>}
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start gap-2 pt-2">
              <div className="flex items-center h-5">
                <input
                  id="terms"
                  type="checkbox"
                  {...register("terms", { required: true })}
                  className="w-4 h-4 rounded border-gray-600 bg-[#0f0c29] text-purple-600 focus:ring-purple-500 focus:ring-offset-0 cursor-pointer"
                />
              </div>
              <label htmlFor="terms" className="text-xs text-gray-400 cursor-pointer select-none">
                Tôi đồng ý với <Link to="/policy" className="text-purple-400 hover:underline">Chính sách Cộng đồng</Link> và quy định của Anime Realm.
              </label>
            </div>
            {errors.terms && <span className="text-red-500 text-xs ml-1 block">Bạn phải đồng ý điều khoản</span>}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-purple-900/30 transform transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center mt-6"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                "Đăng Ký Ngay"
              )}
            </button>
          </form>

          {/* Social Login */}
          <div className="mt-8">
            <div className="relative flex items-center justify-center mb-6">
              <div className="absolute inset-x-0 h-px bg-white/10"></div>
              <span className="relative bg-[#1a163d] px-4 text-xs text-gray-400 uppercase tracking-wider">Hoặc đăng ký với</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center gap-2 py-2.5 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:border-white/20 transition-all text-sm font-medium">
                <Chrome size={18} className="text-red-400" /> Google
              </button>
              <button className="flex items-center justify-center gap-2 py-2.5 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:border-white/20 transition-all text-sm font-medium">
                <Facebook size={18} className="text-blue-500" /> Facebook
              </button>
            </div>
          </div>

          {/* Footer Link */}
          <div className="mt-8 text-center text-sm text-gray-400">
            Bạn đã có tài khoản?{' '}
            <Link to="/login" className="text-purple-400 font-bold hover:text-purple-300 hover:underline">
              Đăng Nhập
            </Link>
          </div>

        </div>
      </main>

      {/* 4. FOOTER */}
      <footer className="relative z-10 py-6 text-center text-gray-500 text-xs">
        <p>&copy; 2025 Anime Realm. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Signup;