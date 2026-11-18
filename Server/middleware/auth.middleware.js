// middleware/auth.middleware.js

const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

/**
 * Middleware bảo vệ route: Kiểm tra Token & xác thực người dùng
 */
exports.protect = async (req, res, next) => {
    let token;

    // Lấy token từ header: "Authorization: Bearer <token>"
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
        return res.status(401).json({
            message: "Không được phép truy cập. Thiếu Token."
        });
    }

    try {
        // Xác thực token
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || "YOUR_STRONG_SECRET_KEY"
        );

        // Lấy user từ DB (token chỉ chứa user.id)
        const user = await User.findById(decoded.id).select("-password");

        if (!user) {
            return res.status(401).json({ message: "User không tồn tại." });
        }

        // Nếu tài khoản bị khóa thì không cho dùng các API cần đăng nhập
        // Tránh trường hợp user đã bị khóa nhưng token cũ vẫn đăng nhập được
        if (user.isBlocked) {
            return res.status(403).json({
                message: "Tài khoản của bạn đã bị khóa."
            });
        }
        req.user = user;        // Lưu user vào request
        req.userRole = user.role; // Lưu role để authorize

        next();
    } catch (error) {
        return res.status(401).json({
            message: "Token không hợp lệ hoặc đã hết hạn."
        });
    }
};

/**
 * Middleware phân quyền: Chỉ cho phép các role cụ thể
 * @param {...string} roles - Danh sách role được phép truy cập
 * Ví dụ: authorize("admin")
 */
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.userRole) {
            return res.status(403).json({
                message: "Không thể xác định quyền truy cập."
            });
        }

        if (!roles.includes(req.userRole)) {
            return res.status(403).json({
                message: `Bạn không có quyền truy cập. Yêu cầu: ${roles.join(", ")}`
            });
        }

        next();
    };
};
/**
 * Middleware kiểm tra quyền xem Premium.
 * Dùng sau protect vì cần req.user.
 * Cho phép:
 * - admin: luôn được xem Premium
 * - user có isVip === true: được xem Premium
 * Không cho:
 * - user thường
 */

exports.vipOnly = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            message: "Bạn cần đăng nhập để xem nôi dung Premium"
        });
    }
    const isAdmin = req.user.role === "admin";
    const isVip = req.user.isVip === true;

    if (!isAdmin && !isVip) {
        return res.status(403).json({
            message: "Bạn cần tài khoản Vip để xem nội dung Premium."
        });
    }
    next();
};