// backend/src/middleware/authMiddleware.js (ĐÃ SỬA)

import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

/**
 * Middleware to authenticate requests using JWT (RENAMED from isAuthenticated)
 * Verifies access token from Authorization header
 * Attaches user to req.user if valid
 */
const protect = async (req, res, next) => {
  // <-- Đổi tên thành protect
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Chưa xác thực: Không có token" });
    }

    // Verify token using async/await for cleaner error handling
    try {
      const decodedUser = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

      const user = await User.findById(decodedUser.userId).select(
        "-hashedPassword"
      );

      if (!user) {
        return res.status(404).json({ message: "Không tìm thấy người dùng" });
      }

      if (!user.isActive) {
        return res.status(403).json({ message: "Tài khoản đã bị vô hiệu hóa" });
      }

      req.user = user; // Gắn user vào request
      next(); // Chuyển tiếp
    } catch (err) {
      console.error("Lỗi xác thực JWT:", err.message);
      // Phân biệt lỗi token hết hạn và lỗi khác
      if (err.name === "TokenExpiredError") {
        return res
          .status(401)
          .json({ message: "Unauthorized: Token đã hết hạn" });
      }
      return res.status(403).json({ message: "Forbidden: Token không hợp lệ" });
    }
  } catch (error) {
    console.error("Lỗi trong middleware protect:", error);
    return res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
  }
};

/**
 * Middleware to check if the authenticated user is a printer
 * Must be used AFTER 'protect' middleware
 */
const isPrinter = (req, res, next) => {
  // Kiểm tra req.user đã được protect gắn vào chưa và role có đúng không
  if (req.user && req.user.role === "printer") {
    next(); // Là printer, cho đi tiếp
  } else {
    res.status(403).json({ message: "Forbidden: Yêu cầu quyền nhà in" }); // Không phải printer
  }
};

// --- SỬA DÒNG EXPORT ---
// Export cả protect và isPrinter
export { protect, isPrinter };
