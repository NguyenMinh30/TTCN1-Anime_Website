import React from 'react';
import { useNavigate } from 'react-router-dom';

const Policy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0f0c29] text-white px-6 py-10 flex justify-center">
      <div className="max-w-4xl w-full bg-white/5 border border-white/10 rounded-2xl p-8 shadow-2xl">
        
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent mb-4">
            CHÍNH SÁCH CỘNG ĐỒNG
          </h1>
          <p className="text-gray-400">Quy định chung dành cho thành viên Anime Website</p>
        </div>

        {/* Nội dung chính sách */}
        <div className="space-y-8">
          
          {/* Mục 1 */}
          <section>
            <h3 className="text-xl font-bold text-purple-400 mb-3 border-l-4 border-purple-500 pl-3">
              1. Quyền lợi của thành viên
            </h3>
            <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
              <li>Được tham gia bình luận, đánh giá các bộ Anime yêu thích.</li>
              <li>Được lưu Anime vào danh sách yêu thích cá nhân.</li>
              <li>Được bảo vệ thông tin tài khoản theo quy định bảo mật.</li>
            </ul>
          </section>

          {/* Mục 2 */}
          <section>
            <h3 className="text-xl font-bold text-red-400 mb-3 border-l-4 border-red-500 pl-3">
              2. Các hành vi bị nghiêm cấm
            </h3>
            <div className="bg-red-900/20 p-4 rounded-lg border border-red-500/30">
              <p className="text-red-200 font-bold mb-2">Tài khoản sẽ bị KHÓA VĨNH VIỄN nếu vi phạm:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
                <li>Sử dụng ngôn từ thù địch, xúc phạm, phân biệt vùng miền/giới tính.</li>
                <li>Spam bình luận quảng cáo, link độc hại hoặc nội dung không liên quan.</li>
                <li>Giả mạo Admin hoặc lừa đảo người dùng khác.</li>
                <li>Đăng tải nội dung đồi trụy, vi phạm pháp luật.</li>
              </ul>
            </div>
          </section>

          {/* Mục 3 */}
          <section>
            <h3 className="text-xl font-bold text-blue-400 mb-3 border-l-4 border-blue-500 pl-3">
              3. Quy trình xử lý vi phạm
            </h3>
            <p className="text-gray-300 leading-relaxed">
              Hệ thống kiểm duyệt và Admin có toàn quyền quyết định ẩn bình luận hoặc khóa tài khoản mà không cần báo trước nếu phát hiện vi phạm nghiêm trọng. Mọi khiếu nại vui lòng liên hệ Email hỗ trợ.
            </p>
          </section>

        </div>

        {/* Nút quay lại */}
        <div className="mt-12 text-center">
          <button 
            onClick={() => navigate("/")}
            className="px-8 py-3 bg-purple-600 hover:bg-purple-700 rounded-full font-bold transition-all transform hover:scale-105 shadow-lg shadow-purple-900/50"
          >
            Đã Hiểu & Quay Về Trang Chủ
          </button>
        </div>

      </div>
    </div>
  );
};

export default Policy;