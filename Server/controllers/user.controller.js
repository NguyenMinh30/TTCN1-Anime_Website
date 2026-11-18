const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// -------------------- HELPER --------------------
const createToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || "YOUR_STRONG_SECRET_KEY",
    { expiresIn: "1d" }
  );
};

// -------------------- AUTH --------------------

// 1. Register user
const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existUser = await User.findOne({ email });
    if (existUser)
      return res.status(400).json({ message: "Email đã tồn tại" });

    // 🔥 Tự set admin nếu email trùng
    const role = email === "quangklvn2k4@gmail.com" ? "admin" : "user";

    const user = new User({
      username,
      email,
      password,   // ⚠ KHÔNG HASH TẠI ĐÂY — model tự hash
      role,
    });

    const savedUser = await user.save();
    const token = createToken(savedUser._id, savedUser.role);

    const { password: _, ...userWithoutPassword } = savedUser.toObject();
    res.status(201).json({ ...userWithoutPassword, token });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. Login user
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Email hoặc mật khẩu không đúng" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Email hoặc mật khẩu không đúng" });

    const token = createToken(user._id, user.role);
    const { password: _, ...userWithoutPassword } = user.toObject();

    res.json({ ...userWithoutPassword, token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// -------------------- USER MANAGEMENT --------------------

// 3. Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 4. Get user by ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User không tồn tại" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 5. Update user
const updateUser = async (req, res) => {
  try {
    const { username, email, role, password } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User không tồn tại" });

    if (username) user.username = username;
    if (email) user.email = email;

    // 🔥 CHỈ ADMIN MỚI ĐƯỢC ĐỔI ROLE
    if (role && req.user.role === "admin") {
      user.role = role;
    }

    // 🔥 Đổi mật khẩu thì hash lại
    if (password) {
      user.password = password; // Model sẽ tự hash
    }

    const updatedUser = await user.save();
    const { password: _, ...userWithoutPassword } = updatedUser.toObject();
    res.json(userWithoutPassword);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 6. Delete user
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User không tồn tại" });
    res.json({ message: "Xoá user thành công" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};
