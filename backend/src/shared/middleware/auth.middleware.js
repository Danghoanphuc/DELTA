// backend/src/middleware/authMiddleware.js (ĐÃ CẬP NHẬT - THÊM optionalAuth)

import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

/**
 * Middleware to authenticate requests using JWT
 * Verifies access token from Authorization header
 * Attaches user to req.user if valid
 * REQUIRED authentication - returns 401 if no/invalid token
 */
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Chưa xác thực: Không có token" });
    }

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

      req.user = user;
      next();
    } catch (err) {
      console.error("Lỗi xác thực JWT:", err.message);
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
 * ✨ NEW: Middleware for OPTIONAL authentication
 * Allows requests to pass through with OR without a token
 * - If token exists and is valid → attaches user to req.user
 * - If no token or invalid token → req.user = null (guest user)
 *
 * Use this for endpoints that work for both guests and authenticated users
 * Example: View products, chat with AI, browse catalog
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    // No token? That's fine, continue as guest
    if (!token) {
      req.user = null;
      return next();
    }

    // Token exists? Try to verify it
    try {
      const decodedUser = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      const user = await User.findById(decodedUser.userId).select(
        "-hashedPassword"
      );

      if (user && user.isActive) {
        req.user = user; // Attach user if valid
      } else {
        req.user = null; // Invalid user, continue as guest
      }
    } catch (err) {
      // Token invalid or expired? Continue as guest
      console.log("Optional auth: Invalid token, continuing as guest");
      req.user = null;
    }

    next();
  } catch (error) {
    console.error("Lỗi trong middleware optionalAuth:", error);
    // Even if error, continue as guest
    req.user = null;
    next();
  }
};

/**
 * Middleware to check if the authenticated user is a printer
 * Must be used AFTER 'protect' or 'optionalAuth' middleware
 */
const isPrinter = (req, res, next) => {
  if (req.user && req.user.role === "printer") {
    next();
  } else {
    res.status(403).json({ message: "Forbidden: Yêu cầu quyền nhà in" });
  }
};

/**
 * ✨ NEW: Middleware to require authentication with friendly message
 * Returns JSON response asking user to login
 * Use this for endpoints that absolutely need authentication
 */
const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Vui lòng đăng nhập để thực hiện chức năng này",
      requiresAuth: true,
      redirectTo: "/signin",
    });
  }
  next();
};

// Export tất cả middleware
export { protect, optionalAuth, isPrinter, requireAuth };
