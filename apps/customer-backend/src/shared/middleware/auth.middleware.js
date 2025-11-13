// backend/src/shared/middleware/auth.middleware.js
// ✅ FIXED: Sửa lỗi logic 'optionalAuth' không 'await' đúng 'ensureCustomerProfile'

import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ensureCustomerProfile } from "./ensure-customer-profile.middleware.js";

/**
 * (Hàm 'protect' giữ nguyên)
 */
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Chưa xác thực: Không có token",
        requiresAuth: true,
      });
    }

    try {
      const decodedUser = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      const user = await User.findById(decodedUser.userId).select(
        "-hashedPassword -verificationToken -verificationTokenExpiresAt"
      );

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy người dùng",
        });
      }

      if (!user.isActive) {
        return res.status(403).json({
          success: false,
          message: "Tài khoản đã bị vô hiệu hóa",
        });
      }

      req.user = user;

      // Logic đúng: truyền 'next' và return
      await ensureCustomerProfile(req, res, next);
    } catch (err) {
      console.error("JWT verification error:", err.message);
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Token đã hết hạn",
          requiresRefresh: true,
        });
      }
      return res.status(403).json({
        success: false,
        message: "Token không hợp lệ",
      });
    }
  } catch (error) {
    console.error("Error in protect middleware:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi máy chủ nội bộ",
    });
  }
};

/**
 * ✅ SỬA LỖI TẠI ĐÂY
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    // 1. Không có token - tiếp tục với req.user = null
    if (!token) {
      req.user = null;
      return next(); // Dừng và đi tiếp
    }

    try {
      // 2. Có token, xác thực
      const decodedUser = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      const user = await User.findById(decodedUser.userId).select(
        "-hashedPassword -verificationToken -verificationTokenExpiresAt"
      );

      if (user && user.isActive) {
        req.user = user;
        // ✅ SỬA LỖI: Truyền 'next' thật sự vào đây và 'return'
        // Giống hệt như logic của 'protect'
        return await ensureCustomerProfile(req, res, next);
      } else {
        // Token hợp lệ, user không active
        req.user = null;
      }
    } catch (err) {
      // Token không hợp lệ hoặc hết hạn
      req.user = null;
    }

    // 3. Chỉ gọi next() ở đây nếu token không hợp lệ / user không active
    next();
  } catch (error) {
    // Lỗi bất ngờ
    req.user = null;
    next(error); // Chuyển lỗi cho error handler
  }
};

/**
 * (Hàm 'isPrinter' giữ nguyên)
 */
const isPrinter = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Yêu cầu đăng nhập",
      requiresAuth: true,
    });
  }

  if (req.user.printerProfileId) {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: "Forbidden: Yêu cầu quyền nhà in",
      requiresPrinterAccount: true,
    });
  }
};

/**
 * (Hàm 'isAdmin' giữ nguyên)
 */
const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Yêu cầu đăng nhập",
      requiresAuth: true,
    });
  }

  if (req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: "Forbidden: Yêu cầu quyền Admin",
      requiresAdmin: true,
    });
  }
};

/**
 * (Hàm 'requireAuth' giữ nguyên)
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

/**
 * (Hàm 'isVerified' giữ nguyên)
 */
const isVerified = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Yêu cầu đăng nhập",
      requiresAuth: true,
    });
  }

  if (!req.user.isVerified) {
    return res.status(403).json({
      success: false,
      message: "Vui lòng xác thực email trước khi tiếp tục",
      requiresVerification: true,
    });
  }

  next();
};

export { protect, optionalAuth, isPrinter, isAdmin, requireAuth, isVerified };
