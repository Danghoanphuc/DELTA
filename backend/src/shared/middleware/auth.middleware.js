// backend/src/shared/middleware/auth.middleware.js
// ✅ UPDATED: Added ensureCustomerProfile call, updated isPrinter logic

import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ensureCustomerProfile } from "./ensure-customer-profile.middleware.js";

/**
 * Middleware to authenticate requests using JWT
 * Verifies access token from Authorization header
 * Attaches user to req.user if valid
 * REQUIRED authentication - returns 401 if no/invalid token
 */
const protect = async (req, res, next) => {
  try {
    // Extract token from Authorization header
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
      // Verify JWT token
      const decodedUser = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

      // Fetch full user (excluding sensitive fields)
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

      // Attach user to request
      req.user = user;

      // ✅ NEW: Ensure user has CustomerProfile (for legacy users)
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
 * Middleware for OPTIONAL authentication
 * Allows both authenticated and guest users
 * Sets req.user to null if not authenticated
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    // No token provided - continue as guest
    if (!token) {
      req.user = null;
      return next();
    }

    try {
      // Verify token
      const decodedUser = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      const user = await User.findById(decodedUser.userId).select(
        "-hashedPassword -verificationToken -verificationTokenExpiresAt"
      );

      if (user && user.isActive) {
        req.user = user;
        // ✅ NEW: Ensure CustomerProfile for authenticated users
        await ensureCustomerProfile(req, res, () => {});
      } else {
        req.user = null;
      }
    } catch (err) {
      // Token invalid or expired - continue as guest
      req.user = null;
    }

    next();
  } catch (error) {
    // Any error - continue as guest
    req.user = null;
    next();
  }
};

/**
 * Middleware to check if the authenticated user is a printer
 * Uses printerProfileId instead of role field
 * Must be used after protect() middleware
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
 * Middleware to require authentication with friendly message
 * Similar to protect() but with more user-friendly response
 * Useful for features that require login but should guide users
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
 * Middleware to check if user is verified
 * Must be used after protect() middleware
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

export { protect, optionalAuth, isPrinter, requireAuth, isVerified };
