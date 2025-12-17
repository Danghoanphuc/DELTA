// packages/auth/middleware/auth.middleware.js
// ✅ SHARED: Authentication middleware for both Customer and Admin

import { createTokenService } from "../services/token.service.js";
import { createSessionService } from "../services/session.service.js";

/**
 * ✅ FACTORY: Create authentication middleware
 * @param {Object} config - Configuration object
 * @param {Function} getUserById - Function to get user by ID
 * @param {string} userType - "customer" or "admin"
 */
export function createAuthMiddleware(
  config,
  getUserById,
  userType = "customer"
) {
  const tokenService = createTokenService(config);
  const sessionService = createSessionService(config);

  /**
   * ✅ PROTECT: Require valid JWT token
   */
  const protect = async (req, res, next) => {
    try {
      const authHeader = req.headers["authorization"];
      const token = tokenService.extractBearerToken(authHeader);

      if (!token) {
        return res.status(401).json({
          success: false,
          message: "Chưa xác thực: Không có token",
          requiresAuth: true,
        });
      }

      try {
        // ✅ SECURITY: Verify token with user type validation
        const decoded = tokenService.verifyAccessToken(token, userType);

        // ✅ SECURITY: Get user and validate
        const user = await getUserById(decoded.userId);

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

        // ✅ ADMIN SECURITY: Additional validation for admin users
        if (userType === "admin") {
          // Validate admin-specific requirements
          if (
            !user.role ||
            !["admin", "super_admin", "moderator"].includes(user.role)
          ) {
            return res.status(403).json({
              success: false,
              message: "Không có quyền admin",
            });
          }

          // ✅ SECURITY: Optional session security validation
          if (config.security?.validateSessionSecurity && decoded.sessionId) {
            const validation = await sessionService.validateSessionSecurity(
              decoded.sessionId,
              req
            );
            if (!validation.valid) {
              return res.status(403).json({
                success: false,
                message: `Phiên làm việc không hợp lệ: ${validation.reason}`,
                securityViolation: true,
              });
            }
          }
        }

        req.user = user;
        req.userType = userType;
        req.tokenPayload = decoded;

        next();
      } catch (err) {
        console.error(`JWT verification error (${userType}):`, err.message);

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
      console.error(`Error in protect middleware (${userType}):`, error);
      return res.status(500).json({
        success: false,
        message: "Lỗi máy chủ nội bộ",
      });
    }
  };

  /**
   * ✅ OPTIONAL AUTH: Allow both authenticated and guest users
   */
  const optionalAuth = async (req, res, next) => {
    try {
      const authHeader = req.headers["authorization"];
      const token = tokenService.extractBearerToken(authHeader);

      // No token - continue as guest
      if (!token) {
        req.user = null;
        req.userType = null;
        return next();
      }

      try {
        const decoded = tokenService.verifyAccessToken(token, userType);
        const user = await getUserById(decoded.userId);

        if (user && user.isActive) {
          req.user = user;
          req.userType = userType;
          req.tokenPayload = decoded;
        } else {
          req.user = null;
          req.userType = null;
        }
      } catch (err) {
        // ✅ IMPORTANT: For expired tokens, return 401 to trigger refresh
        if (err.name === "TokenExpiredError") {
          return res.status(401).json({
            success: false,
            message: "Token đã hết hạn",
            requiresRefresh: true,
          });
        }

        // Invalid token - continue as guest
        req.user = null;
        req.userType = null;
      }

      next();
    } catch (error) {
      req.user = null;
      req.userType = null;
      next(error);
    }
  };

  /**
   * ✅ REFRESH TOKEN: Handle token refresh
   */
  const refreshToken = async (req, res, next) => {
    try {
      const refreshToken = tokenService.extractRefreshToken(req);

      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          message: "Không có refresh token. Vui lòng đăng nhập lại.",
        });
      }

      try {
        // ✅ SECURITY: Refresh session with token rotation
        const refreshResult = await sessionService.refreshSession(
          refreshToken,
          userType,
          req
        );

        // ✅ SECURITY: Generate new access token
        const user = await getUserById(refreshResult.userId);
        if (!user || !user.isActive) {
          throw new Error("User not found or inactive");
        }

        const newAccessToken = tokenService.generateAccessToken(
          refreshResult.userId,
          userType,
          { sessionId: refreshResult.sessionId }
        );

        // ✅ SECURITY: Set new refresh token cookie
        const cookieOptions = tokenService.getCookieOptions(userType);
        res.cookie("refreshToken", refreshResult.refreshToken, cookieOptions);

        res.status(200).json({
          success: true,
          data: { accessToken: newAccessToken },
          message: "Token đã được làm mới",
        });
      } catch (error) {
        console.error(`Refresh token error (${userType}):`, error.message);

        // ✅ SECURITY: Clear invalid refresh token
        res.clearCookie(
          "refreshToken",
          tokenService.getCookieOptions(userType)
        );

        return res.status(401).json({
          success: false,
          message: "Refresh token không hợp lệ. Vui lòng đăng nhập lại.",
        });
      }
    } catch (error) {
      console.error(`Error in refresh middleware (${userType}):`, error);
      return res.status(500).json({
        success: false,
        message: "Lỗi máy chủ nội bộ",
      });
    }
  };

  return {
    protect,
    optionalAuth,
    refreshToken,
    tokenService,
    sessionService,
  };
}

/**
 * ✅ ROLE-BASED ACCESS CONTROL: Generic role checker
 */
export function createRoleMiddleware(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Yêu cầu đăng nhập",
        requiresAuth: true,
      });
    }

    const userRole = req.user.role;
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Yêu cầu quyền ${allowedRoles.join(" hoặc ")}`,
        requiredRoles: allowedRoles,
        userRole,
      });
    }

    next();
  };
}
