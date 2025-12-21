// apps/admin-backend/src/controllers/admin-auth.controller.ts
// ✅ STANDARDIZED: Admin authentication using shared auth package

import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { Admin } from "../models/admin.model.js";
import { ApiResponse } from "../shared/utils/index.js";
import { API_CODES } from "../shared/constants/index.js";
import { config } from "../config/env.config.js";
import {
  ValidationException,
  UnauthorizedException,
  ForbiddenException,
} from "../shared/exceptions.js";
import { Logger } from "../shared/utils/index.js";

const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days
const ACCESS_TOKEN_TTL = "15m"; // 15 minutes

// Simple in-memory session store (for production, use Redis)
const sessions = new Map<string, { adminId: string; expireAt: Date }>();

export class AdminAuthController {
  constructor() {}

  /**
   * Generate JWT access token
   */
  private generateAccessToken(adminId: string): string {
    return jwt.sign({ adminId }, config.auth.jwtSecret, {
      expiresIn: ACCESS_TOKEN_TTL,
    });
  }

  /**
   * Generate refresh token
   */
  private generateRefreshToken(): string {
    return crypto.randomBytes(64).toString("hex");
  }

  /**
   * ✅ Admin sign in
   */
  signIn = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        throw new ValidationException("Email và mật khẩu là bắt buộc");
      }

      // Find admin with password field
      const admin = await Admin.findOne({ email }).select("+password");

      if (!admin) {
        Logger.warn(`[AdminAuth] Login failed - email not found: ${email}`);
        throw new UnauthorizedException("Email hoặc mật khẩu không đúng");
      }

      // Check if admin is active
      if (!admin.isActive) {
        Logger.warn(`[AdminAuth] Login failed - account inactive: ${email}`);
        throw new ForbiddenException("Tài khoản đã bị vô hiệu hóa");
      }

      // Verify password
      const isPasswordValid = await admin.comparePassword(password);
      if (!isPasswordValid) {
        Logger.warn(`[AdminAuth] Login failed - wrong password: ${email}`);
        throw new UnauthorizedException("Email hoặc mật khẩu không đúng");
      }

      // Generate tokens
      const accessToken = this.generateAccessToken(admin._id.toString());
      const refreshToken = this.generateRefreshToken();

      // Store session
      sessions.set(refreshToken, {
        adminId: admin._id.toString(),
        expireAt: new Date(Date.now() + REFRESH_TOKEN_TTL),
      });

      // Update last login
      admin.lastLoginAt = new Date();
      await admin.save();

      // Set refresh token cookie
      res.cookie("adminRefreshToken", refreshToken, {
        httpOnly: true,
        secure: config.env === "production",
        sameSite: config.env === "production" ? "none" : "lax",
        maxAge: REFRESH_TOKEN_TTL,
        path: "/",
      });

      Logger.success(`[AdminAuth] Login success: ${email}`);

      // Return response
      res.status(API_CODES.SUCCESS).json(
        ApiResponse.success(
          {
            accessToken,
            admin: {
              _id: admin._id,
              email: admin.email,
              displayName: admin.displayName,
              role: admin.role,
              permissions: this.getAdminPermissions(admin.role),
            },
          },
          `Chào mừng ${admin.displayName}!`
        )
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * ✅ Refresh access token
   */
  refresh = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refreshToken = req.cookies?.adminRefreshToken;

      if (!refreshToken) {
        throw new UnauthorizedException("Không có refresh token");
      }

      // Find session
      const session = sessions.get(refreshToken);
      if (!session || session.expireAt < new Date()) {
        sessions.delete(refreshToken);
        throw new UnauthorizedException("Phiên đăng nhập đã hết hạn");
      }

      // Find admin
      const admin = await Admin.findById(session.adminId);
      if (!admin || !admin.isActive) {
        sessions.delete(refreshToken);
        throw new UnauthorizedException("Tài khoản không hợp lệ");
      }

      // Generate new access token
      const accessToken = this.generateAccessToken(admin._id.toString());

      Logger.debug(`[AdminAuth] Token refreshed for: ${admin.email}`);

      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success({ accessToken }, "Token đã được làm mới"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * ✅ Sign out
   */
  signOut = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refreshToken = req.cookies?.adminRefreshToken;

      if (refreshToken) {
        sessions.delete(refreshToken);
      }

      res.clearCookie("adminRefreshToken", {
        httpOnly: true,
        secure: config.env === "production",
        sameSite: config.env === "production" ? "none" : "lax",
        path: "/",
      });

      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success(null, "Đăng xuất thành công"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * ✅ Get current admin info
   */
  getMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Get admin from request (set by auth middleware)
      const adminId = (req as any).adminId;

      if (!adminId) {
        throw new UnauthorizedException("Chưa đăng nhập");
      }

      const admin = await Admin.findById(adminId);
      if (!admin) {
        throw new UnauthorizedException("Tài khoản không tồn tại");
      }

      res.status(API_CODES.SUCCESS).json(
        ApiResponse.success({
          admin: {
            _id: admin._id,
            email: admin.email,
            displayName: admin.displayName,
            role: admin.role,
            permissions: this.getAdminPermissions(admin.role),
          },
        })
      );
    } catch (error) {
      next(error);
    }
  };

  getActiveSessions = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // For now, return empty - implement later with Redis
      res.status(API_CODES.SUCCESS).json(ApiResponse.success({ sessions: [] }));
    } catch (error) {
      next(error);
    }
  };

  revokeSession = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { sessionId } = req.params;
      sessions.delete(sessionId);
      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success(null, "Phiên làm việc đã được thu hồi"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * ✅ UTILITY: Get admin permissions based on role
   */
  private getAdminPermissions(role: string): string[] {
    const permissions: Record<string, string[]> = {
      super_admin: ["*"],
      admin: [
        "users.read",
        "users.write",
        "orders.read",
        "orders.write",
        "products.read",
        "products.write",
        "analytics.read",
        "settings.read",
        "settings.write",
      ],
      moderator: [
        "users.read",
        "orders.read",
        "products.read",
        "analytics.read",
      ],
    };

    return permissions[role] || [];
  }

  /**
   * ✅ UTILITY: Get security level based on role
   */
  private getSecurityLevel(role: string): "standard" | "elevated" | "super" {
    const levels: Record<string, "standard" | "elevated" | "super"> = {
      super_admin: "super",
      admin: "elevated",
      moderator: "standard",
    };

    return levels[role] || "standard";
  }
}
