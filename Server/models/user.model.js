const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Email không hợp lệ"],
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user"
    },

    // Đánh dấu tài khoản Vip
    //true = được xem video Premium
    //false = tài khoản thường, không được xem video Premium
    // Admin vẫn được xem Premium dù isVip là false
    isVip: {
      type: Boolean,
      default: false
    },

    //khoa tai khoan
    isBlocked: {
      type: Boolean,
      default: false
    },
  },
  { timestamps: true }
);

// 🔹 Hash mật khẩu trước khi lưu
userSchema.pre("save", async function (next) {
  // Nếu password không thay đổi thì bỏ qua
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// 🔹 So sánh mật khẩu khi đăng nhập
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
