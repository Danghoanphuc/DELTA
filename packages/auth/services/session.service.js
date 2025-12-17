// packages/auth/services/session.service.js
// ✅ SHARED: Session management service

import Session from "../models/session.model.js";
import { createTokenService } from "./token.service.js";

export class SessionService {
  constructor(config) {
    this.tokenService = createTokenService(config);
    this.config = config;
  }

  /**
   * Create new session with enhanced security tracking
   * ✅ ENHANCED: Track IP, User Agent, and admin metadata
   */
  async createSession(userId, userType, req = null, additionalData = {}) {
    const refreshToken = this.tokenService.generateRefreshToken();
    const expireAt = new Date(Date.now() + this.tokenService.refreshTokenTTL);

    const sessionData = {
      userId,
      userType,
      refreshToken,
      expireAt,
      ...additionalData,
    };

    // ✅ SECURITY: Track request metadata if available
    if (req) {
      sessionData.ipAddress = this.extractClientIP(req);
      sessionData.userAgent = req.headers["user-agent"];
    }

    // ✅ ADMIN SECURITY: Enhanced tracking for admin sessions
    if (userType === "admin") {
      sessionData.adminMetadata = {
        lastActivity: new Date(),
        permissions: additionalData.permissions || [],
        securityLevel: additionalData.securityLevel || "standard",
      };
    }

    // ✅ CLEANUP: Remove old sessions to prevent accumulation
    await this.cleanupOldSessions(userId, userType);

    const session = await Session.create(sessionData);
    return { session, refreshToken };
  }

  /**
   * Find session by refresh token
   * ✅ ENHANCED: Include user type validation
   */
  async findSessionByToken(refreshToken, expectedUserType = null) {
    const query = { refreshToken };

    if (expectedUserType) {
      query.userType = expectedUserType;
    }

    const session = await Session.findOne(query);

    if (!session) {
      return null;
    }

    // ✅ SECURITY: Check if session is expired
    if (session.isExpired()) {
      await this.deleteSession(session._id);
      return null;
    }

    return session;
  }

  /**
   * Refresh session with token rotation
   * ✅ ENHANCED: Implement token rotation for security
   */
  async refreshSession(oldRefreshToken, expectedUserType = null, req = null) {
    const session = await this.findSessionByToken(
      oldRefreshToken,
      expectedUserType
    );

    if (!session) {
      throw new Error("Invalid or expired refresh token");
    }

    // ✅ SECURITY: Generate new tokens (token rotation)
    const newRefreshToken = this.tokenService.generateRefreshToken();
    const newExpireAt = new Date(
      Date.now() + this.tokenService.refreshTokenTTL
    );

    // ✅ SECURITY: Update session with new token and metadata
    const updateData = {
      refreshToken: newRefreshToken,
      expireAt: newExpireAt,
    };

    // ✅ SECURITY: Update IP and User Agent if request available
    if (req) {
      updateData.ipAddress = this.extractClientIP(req);
      updateData.userAgent = req.headers["user-agent"];
    }

    // ✅ ADMIN SECURITY: Update admin activity
    if (session.userType === "admin" && session.adminMetadata) {
      updateData["adminMetadata.lastActivity"] = new Date();
    }

    await Session.findByIdAndUpdate(session._id, updateData);

    return {
      sessionId: session._id,
      userId: session.userId,
      userType: session.userType,
      refreshToken: newRefreshToken,
    };
  }

  /**
   * Delete session
   */
  async deleteSession(sessionId) {
    return await Session.deleteOne({ _id: sessionId });
  }

  /**
   * Delete session by token
   */
  async deleteSessionByToken(refreshToken, userType = null) {
    const query = { refreshToken };
    if (userType) {
      query.userType = userType;
    }
    return await Session.deleteOne(query);
  }

  /**
   * Delete all sessions for user
   * ✅ SECURITY: Useful for password reset, account compromise
   */
  async deleteAllUserSessions(userId, userType = null) {
    const query = { userId };
    if (userType) {
      query.userType = userType;
    }
    return await Session.deleteMany(query);
  }

  /**
   * ✅ SECURITY: Cleanup old sessions to prevent accumulation
   */
  async cleanupOldSessions(userId, userType, keepLatest = 5) {
    return await Session.cleanupOldSessions(userId, userType, keepLatest);
  }

  /**
   * ✅ MAINTENANCE: Cleanup expired sessions
   */
  async cleanupExpiredSessions() {
    return await Session.cleanupExpiredSessions();
  }

  /**
   * ✅ ADMIN SECURITY: Get active admin sessions with metadata
   */
  async getActiveAdminSessions(userId = null) {
    const query = {
      userType: "admin",
      expireAt: { $gt: new Date() },
    };

    if (userId) {
      query.userId = userId;
    }

    return await Session.find(query)
      .populate("userId", "email displayName role")
      .sort({ "adminMetadata.lastActivity": -1 });
  }

  /**
   * ✅ SECURITY: Validate session security (for admin sessions)
   */
  async validateSessionSecurity(sessionId, req) {
    const session = await Session.findById(sessionId);

    if (!session || session.userType !== "admin") {
      return { valid: false, reason: "Session not found or not admin" };
    }

    // ✅ SECURITY: Check IP consistency (optional, can be disabled)
    if (this.config.security?.enforceIPConsistency && session.ipAddress) {
      const currentIP = this.extractClientIP(req);
      if (session.ipAddress !== currentIP) {
        return {
          valid: false,
          reason: "IP address mismatch",
          details: { expected: session.ipAddress, actual: currentIP },
        };
      }
    }

    // ✅ SECURITY: Check User Agent consistency (optional)
    if (
      this.config.security?.enforceUserAgentConsistency &&
      session.userAgent
    ) {
      const currentUA = req.headers["user-agent"];
      if (session.userAgent !== currentUA) {
        return {
          valid: false,
          reason: "User agent mismatch",
          details: { expected: session.userAgent, actual: currentUA },
        };
      }
    }

    return { valid: true };
  }

  /**
   * ✅ UTILITY: Extract client IP address
   */
  extractClientIP(req) {
    return (
      req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      req.headers["x-real-ip"] ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      req.ip ||
      "unknown"
    );
  }
}

// ✅ FACTORY: Create session service instance
export const createSessionService = (config) => new SessionService(config);
