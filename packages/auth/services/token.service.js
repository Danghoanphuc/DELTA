// packages/auth/services/token.service.js
// ✅ SHARED: Token generation and validation utilities

import jwt from "jsonwebtoken";
import crypto from "crypto";

export class TokenService {
  constructor(config) {
    this.accessTokenSecret = config.accessTokenSecret;
    this.refreshTokenSecret = config.refreshTokenSecret; // ✅ NEW: Separate secret for refresh tokens
    this.accessTokenTTL = config.accessTokenTTL || "30m";
    this.refreshTokenTTL = config.refreshTokenTTL || 14 * 24 * 60 * 60 * 1000; // 14 days
  }

  /**
   * Generate JWT access token
   * ✅ ENHANCED: Include user type and additional claims
   */
  generateAccessToken(userId, userType = "customer", additionalClaims = {}) {
    const payload = {
      userId,
      userType,
      iat: Math.floor(Date.now() / 1000),
      ...additionalClaims,
    };

    return jwt.sign(payload, this.accessTokenSecret, {
      expiresIn: this.accessTokenTTL,
      issuer: "delta-platform",
      audience: `delta-${userType}`,
    });
  }

  /**
   * Generate secure refresh token
   * ✅ ENHANCED: Cryptographically secure random token
   */
  generateRefreshToken() {
    return crypto.randomBytes(64).toString("hex");
  }

  /**
   * Verify JWT access token
   * ✅ ENHANCED: Include audience verification
   */
  verifyAccessToken(token, expectedUserType = null) {
    try {
      const decoded = jwt.verify(token, this.accessTokenSecret, {
        issuer: "delta-platform",
        audience: expectedUserType ? `delta-${expectedUserType}` : undefined,
      });

      // ✅ SECURITY: Validate user type if specified
      if (expectedUserType && decoded.userType !== expectedUserType) {
        throw new Error(
          `Invalid user type. Expected: ${expectedUserType}, Got: ${decoded.userType}`
        );
      }

      return decoded;
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        const expiredError = new Error("Token expired");
        expiredError.name = "TokenExpiredError";
        expiredError.expiredAt = error.expiredAt;
        throw expiredError;
      }

      if (error.name === "JsonWebTokenError") {
        const invalidError = new Error("Invalid token");
        invalidError.name = "InvalidTokenError";
        throw invalidError;
      }

      throw error;
    }
  }

  /**
   * ✅ NEW: Generate signed refresh token (for additional security)
   * This creates a JWT refresh token instead of random string
   */
  generateSignedRefreshToken(userId, userType, sessionId) {
    const payload = {
      userId,
      userType,
      sessionId,
      type: "refresh",
      iat: Math.floor(Date.now() / 1000),
    };

    return jwt.sign(payload, this.refreshTokenSecret, {
      expiresIn: Math.floor(this.refreshTokenTTL / 1000), // Convert to seconds
      issuer: "delta-platform",
      audience: `delta-${userType}-refresh`,
    });
  }

  /**
   * ✅ NEW: Verify signed refresh token
   */
  verifySignedRefreshToken(token, expectedUserType = null) {
    try {
      const decoded = jwt.verify(token, this.refreshTokenSecret, {
        issuer: "delta-platform",
        audience: expectedUserType
          ? `delta-${expectedUserType}-refresh`
          : undefined,
      });

      if (decoded.type !== "refresh") {
        throw new Error("Invalid token type");
      }

      if (expectedUserType && decoded.userType !== expectedUserType) {
        throw new Error(
          `Invalid user type. Expected: ${expectedUserType}, Got: ${decoded.userType}`
        );
      }

      return decoded;
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        const expiredError = new Error("Refresh token expired");
        expiredError.name = "RefreshTokenExpiredError";
        expiredError.expiredAt = error.expiredAt;
        throw expiredError;
      }

      if (error.name === "JsonWebTokenError") {
        const invalidError = new Error("Invalid refresh token");
        invalidError.name = "InvalidRefreshTokenError";
        throw invalidError;
      }

      throw error;
    }
  }

  /**
   * ✅ SECURITY: Extract token from Authorization header
   */
  extractBearerToken(authHeader) {
    if (!authHeader) return null;

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return null;
    }

    return parts[1];
  }

  /**
   * ✅ SECURITY: Extract refresh token from cookies with fallback
   */
  extractRefreshToken(req, cookieName = "refreshToken") {
    // Primary: Get from cookies (parsed by cookie-parser)
    let refreshToken = req.cookies?.[cookieName];

    // Fallback: Parse manually from headers if cookie-parser failed
    if (!refreshToken && req.headers.cookie) {
      const cookies = req.headers.cookie.split(";").reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split("=");
        if (key && value) {
          acc[key] = decodeURIComponent(value);
        }
        return acc;
      }, {});
      refreshToken = cookies[cookieName];
    }

    return refreshToken;
  }

  /**
   * ✅ SECURITY: Generate cookie options based on environment
   */
  getCookieOptions(userType = "customer", customOptions = {}) {
    const isProduction = process.env.NODE_ENV === "production";

    const baseOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: this.refreshTokenTTL,
      path: "/",
    };

    // ✅ ENHANCED SECURITY: Stricter options for admin
    if (userType === "admin") {
      return {
        ...baseOptions,
        sameSite: "strict", // ✅ Stricter CSRF protection for admin
        secure: true, // ✅ Always require HTTPS for admin (even in dev)
        ...customOptions,
      };
    }

    return {
      ...baseOptions,
      ...customOptions,
    };
  }
}

// ✅ FACTORY: Create token service instances
export const createTokenService = (config) => new TokenService(config);
