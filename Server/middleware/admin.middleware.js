const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Không có token, truy cập bị từ chối" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Chỉ cho phép admin
    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Bạn không phải Admin!" });
    }

    req.user = decoded; // gắn user để dùng nếu cần
    next();

  } catch (err) {
    console.error("Admin Auth Error:", err);
    res.status(401).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
  }
};
