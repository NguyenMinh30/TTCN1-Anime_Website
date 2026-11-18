// Nạp Model Comment đã định nghĩa ở trên để tương tác với Database
const Comment = require("../models/comment.model");

// exports.createComment: Xuất hàm xử lý việc tạo bình luận mới
// async (req, res): Hàm bất đồng bộ nhận đối tượng yêu cầu (req) và đối tượng phản hồi (res)
exports.createComment = async (req, res) => {

  // 1. LẤY DỮ LIỆU ĐẦU VÀO
  // { content: rawContent }: Lấy giá trị trường 'content' từ body và đổi tên biến thành 'rawContent'
  const { content: rawContent } = req.body;
  // { animeId }: Lấy giá trị tham số trên URL (ví dụ từ /:animeId)
  const { animeId } = req.params;
  // req.user.id: Lấy ID người dùng hiện tại (ID này được middleware 'protect' giải mã từ Token)
  const userId = req.user.id;

  // Kiểm tra nếu biến 'rawContent' không có giá trị (bị rỗng)
  if (!rawContent)
    // res.status(400): Trả về mã lỗi 400 (Dữ liệu không hợp lệ) kèm thông báo lỗi
    return res.status(400).json({ msg: "Bình luận không được trống" });

  // try { ... } catch { ... }: Cấu trúc xử lý lỗi, nếu có lỗi trong khối try, code sẽ nhảy xuống catch
  try {

    // 2. ĐỊNH NGHĨA THUẬT TOÁN LỌC TỪ XẤU
    // sensitiveWords: Một mảng chứa danh sách các từ "nhạy cảm" cần phải che đi
    const sensitiveWords = ["ngu", "xấu", "ghét", "tệ"];

    // new RegExp: Khởi tạo một Biểu thức chính quy (Regular Expression)
    // .join('|'): Biến mảng thành chuỗi "ngu|xấu|ghét|tệ" (dấu | tương đương phép toán HOẶC)
    // 'gi': 'g' (global - tìm tất cả trong câu), 'i' (insensitive - không phân biệt hoa thường)
    const pattern = new RegExp(`(${sensitiveWords.join('|')})`, 'gi');

    // .replace(pattern, callback): Tìm tất cả các đoạn văn bản khớp với 'pattern' và thay thế chúng
    // (match) => '*': Hàm xử lý mỗi khi tìm thấy một từ xấu (match là từ xấu đó)
    // '*'.repeat(match.length): Từ xấu dài bao nhiêu chữ thì tạo ra bấy nhiêu dấu sao (*) tương ứng
    const filteredContent = rawContent.replace(pattern, (match) => '*'.repeat(match.length));

    // 3. TẠO VÀ LƯU DỮ LIỆU
    // new Comment({ ... }): Tạo ra một bản ghi (instance) mới dựa trên bản thiết kế Model
    const newComment = new Comment({
      animeId: animeId,         // Gán mã phim
      user: userId,            // Gán ID người viết
      content: filteredContent, // Gán nội dung ĐÃ ĐƯỢC LÀM SẠCH (không dùng rawContent)
    });

    // await newComment.save(): Đợi hệ thống lưu bản ghi này vào cơ sở dữ liệu MongoDB
    await newComment.save();

    // .populate("user", "username"): Sau khi lưu, lệnh này "điền" thêm thông tin tên người dùng
    // Nó giúp ta trả về kết quả có cả tên người dùng (username) thay vì chỉ có một dãy ID số
    await newComment.populate("user", "username");

    // res.json(newComment): Gửi phản hồi thành công về trình duyệt với dữ liệu bình luận vừa tạo
    res.json(newComment);

  } catch (err) {
    // console.error: In thông báo lỗi ra cửa sổ terminal của Server để lập trình viên theo dõi
    console.error(err.message);
    // res.status(500): Trả về mã lỗi 500 (Lỗi hệ thống phía Server)
    res.status(500).send("Lỗi Server");
  }
};

// exports.getCommentsByAnimeId: Hàm xử lý việc lấy danh sách các bình luận của một phim
exports.getCommentsByAnimeId = async (req, res) => {
  try {
    // Comment.find: Tìm kiếm trong database tất cả các bản ghi có 'animeId' khớp với tham số trên URL
    const comments = await Comment.find({ animeId: req.params.animeId })
      // .populate: Lấy thêm thông tin 'username' từ bảng User tương ứng với mỗi bình luận
      .populate("user", "username")
      // .sort({ createdAt: -1 }): Sắp xếp kết quả, -1 nghĩa là cái nào mới tạo nhất thì hiện lên trước
      .sort({ createdAt: -1 });

    // Trả về danh sách các bình luận tìm được cho phía Client (Frontend)
    res.json(comments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Lỗi Server");
  }
};