const History = require("../models/history.model"); // Nhập model History đã định nghĩa ở trên để sử dụng.

// Hàm updateHistory: Dùng để lưu lại tập phim người dùng vừa xem
exports.updateHistory = async (req, res) => {
  // bóc tách (destructuring) animeId và episodeNumber từ dữ liệu người dùng gửi lên (req.body).
  const { animeId, episodeNumber } = req.body;

  // Lấy ID người dùng từ req.user.id (thông tin này có được sau khi người dùng đăng nhập thành công qua middleware).
  const userId = req.user.id;

  // Kiểm tra tính hợp lệ: Nếu không có ID phim hoặc số tập phim bị thiếu (undefined).
  if (!animeId || episodeNumber === undefined) {
    // Trả về mã lỗi 400 (Bad Request) và thông báo yêu cầu người dùng gửi đủ thông tin.
    return res.status(400).json({ msg: "Phải có ID phim và số tập" });
  }

  try {
    /* Thuật toán: Upsert (Update + Insert)
       Sử dụng hàm findOneAndUpdate (Tìm và Cập nhật) để tối ưu hiệu năng:
    */
    const historyItem = await History.findOneAndUpdate(
      { user: userId, animeId: animeId }, // Bước 1: Tìm xem User này đã từng xem Anime này chưa?
      {
        episodeNumber: episodeNumber, // Bước 2: Nếu tìm thấy, cập nhật số tập mới.
        lastWatched: Date.now(),      // Cập nhật lại thời gian xem mới nhất.
      },
      {
        new: true,    // Trả về dữ liệu mới nhất sau khi sửa (để hiển thị ngay cho người dùng).
        upsert: true  // QUAN TRỌNG: Nếu tìm KHÔNG THẤY (lần đầu xem phim này), nó sẽ tự tạo bản ghi mới.
      }
    );

    // Gửi kết quả lịch sử đã cập nhật về cho phía giao diện (Frontend).
    res.json(historyItem);
  } catch (err) {
    // Catch dùng để bắt các lỗi phát sinh (ví dụ lỗi kết nối Database).
    console.error(err.message);
    res.status(500).send("Lỗi Server");
  }
};

// Hàm getHistory: Dùng để lấy toàn bộ danh sách các phim đã xem của người dùng
exports.getHistory = async (req, res) => {
  try {
    const userId = req.user.id; // Xác định ID của người dùng đang thực hiện yêu cầu.

    const historyList = await History.find({ user: userId }) // Tìm tất cả bản ghi lịch sử của user này.
      .sort({ lastWatched: -1 }) // Sắp xếp: Thời gian xem gần đây nhất (-1) sẽ hiện lên đầu danh sách.
      /* Populate: Đây là kỹ thuật "điền đầy dữ liệu". 
         Thay vì chỉ nhận về một dãy ID Anime, hàm này sẽ tự động tra cứu sang bảng Anime 
         để lấy thêm tiêu đề (title), đường dẫn (url), ảnh poster và slug về đây.
      */
      .populate("animeId", "title url posterUrl slug");

    res.json(historyList); // Gửi danh sách đã "đầy đủ thông tin" về cho người dùng.
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Lỗi Server");
  }
};