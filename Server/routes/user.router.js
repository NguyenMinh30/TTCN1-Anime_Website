const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const { verifyToken, verifyAdmin } = require("../middleware/auth.middleware");
const sendEmail = require("../utils/sendEmail");
// Import middleware Admin
const authAdmin = require("../middleware/admin.middleware");

// Signup admin
router.post("/signup", async (req, res) => {
  const ADMIN_EMAILS = [
    "quangklvn2k4@gmail.com",
    "nminh174904@gmail.com"
  ];

  let { username, email, password } = req.body;

  try {
    // chuẩn hoá email
    email = email.trim().toLowerCase();

    if (!username || !email || !password) {
      return res.status(400).json({ message: "Thiếu thông tin đăng ký" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Mật khẩu phải ít nhất 6 ký tự" });
    }

    // logic check tồn tại
    const exist = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (exist) {
      return res
        .status(400)
        .json({ message: "Username hoặc email đã tồn tại" });
    }

    // set role
    const role = ADMIN_EMAILS.includes(email) ? "admin" : "user";

    // tạo user
    const newUser = new User({ username, email, password, role });
    await newUser.save();

    res.status(201).json({
      message: "Đăng ký thành công!",
      user: {
        username,
        email,
        role,
      },
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// Login
router.post("/login", async (req, res) => {
  let { email, password } = req.body;

  try {
    //chuẩn hoá email khi login 
    email = email.trim().toLowerCase();

    if (!email || !password)
      return res.status(400).json({ message: "Thiếu email hoặc mật khẩu" });

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Email không tồn tại" });
    }

    // Kiểm tra xem tài khoản có bị khóa không
    if (user.isBlocked) {
      return res.status(403).json({ message: "Tài khoản của bạn đã bị khóa do vi phạm chính sách!" });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(400).json({ message: "Mật khẩu không đúng" });
    }

    //  Tao token
    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        role: user.role,
      },
      process.env.JWT_SECRET || "YOUR_STRONG_SECRET_KEY",
      { expiresIn: "7d" }
    );

    res.json({
      message: "Đăng nhập thành công",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// API: Lấy danh sách tất cả user
router.get("/", authAdmin, async (req, res) => {
  try {
    const users = await User.find().select("-password"); // Lấy hết user nhưng giấu mật khẩu đi
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
});

// API: Khóa / Mở khóa tài khoản (Có gửi mail thông báo)
router.put("/block/:id", authAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    // Đảo ngược trạng thái khóa
    user.isBlocked = !user.isBlocked;
    await user.save();

    // --- LOGIC MỚI: GỬI MAIL NẾU TÀI KHOẢN BỊ KHÓA ---
    if (user.isBlocked) {
      const subject = "Thông báo: Tài khoản Anime Realm của bạn đã bị KHÓA";
      const text = `Xin chào ${user.username},\n\nTài khoản của bạn đã bị khóa vĩnh viễn do vi phạm Chính sách cộng đồng.\nNếu có thắc mắc, vui lòng liên hệ Admin.\n\nTrân trọng,\nAnime Realm Team.`;

      // Gửi mail (không cần await để admin không phải chờ lâu)
      sendEmail(user.email, subject, text);
    }
    // ------------------------------------------------

    res.status(200).json({
      message: user.isBlocked ? "Đã khóa và gửi mail thông báo!" : "Đã mở khóa tài khoản!",
      isBlocked: user.isBlocked
    });

  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
});
module.exports = router;
