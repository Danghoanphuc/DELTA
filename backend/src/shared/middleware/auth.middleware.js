// backend/src/middleware/authMiddleware.js (✅ UPDATED - CONTEXT-AWARE)

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

      // ✅ SỬA: Lấy user đầy đủ (bao gồm cả các ID hồ sơ)
      const user = await User.findById(decodedUser.userId).select(
        "-hashedPassword -verificationToken -verificationTokenExpiresAt"
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
 * Middleware for OPTIONAL authentication
 * (Giữ nguyên)
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      req.user = null;
      return next();
    }

    try {
      const decodedUser = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      const user = await User.findById(decodedUser.userId).select(
        "-hashedPassword -verificationToken -verificationTokenExpiresAt"
      );

      if (user && user.isActive) {
        req.user = user;
      } else {
        req.user = null;
      }
    } catch (err) {
      req.user = null;
    }

    next();
  } catch (error) {
    req.user = null;
    next();
  }
};

/**
 * Middleware to check if the authenticated user is a printer
 * ✅ SỬA LOGIC: Kiểm tra 'printerProfileId' thay vì 'role'
 */
const isPrinter = (req, res, next) => {
  if (req.user && req.user.printerProfileId) {
    next();
  } else {
    res.status(403).json({ message: "Forbidden: Yêu cầu quyền nhà in" });
  }
};

/**
 * Middleware to require authentication with friendly message
 * (Giữ nguyên)
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

export { protect, optionalAuth, isPrinter, requireAuth };
