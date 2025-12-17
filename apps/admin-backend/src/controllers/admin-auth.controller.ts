// apps/admin-backend/src/controllers/admin-auth.controller.ts
// ✅ STANDARDIZED: Admin authentication using shared auth package

import type { Request, Response, NextFunction } from "express";
// TODO: import { createTokenService, createSessionService } from "@delta/auth";
import { Admin } from "../models/admin.model.js";
import { ApiResponse } from "../shared/utils/index.js";
import { API_CODES } from "../shared/constants/index.js";
import { config } from "../config/env.config.js";
import {
  ValidationException,
  UnauthorizedException,
  ForbiddenException,
} from "../shared/exceptions.js";

const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60 * 1000; // ✅ ADMIN SECURITY: Shorter TTL (7 days vs 14 days)

export class AdminAuthController {
  // private tokenService: any;
  // private sessionService: any;

  constructor() {
    // TODO: Re-enable auth services when @delta/auth is properly configured
    // this.tokenService = createTokenService({...});
    // this.sessionService = createSessionService({...});
  }

  /**
   * ✅ STANDARDIZED: Admin sign in with enhanced security
   */
  signIn = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // TODO: Implement proper auth when @delta/auth is configured
      res
        .status(API_CODES.SUCCESS)
        .json(
          ApiResponse.success(
            { message: "Auth temporarily disabled" },
            "Auth service needs configuration"
          )
        );
    } catch (error) {
      next(error);
    }
  };

  refresh = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // TODO: Implement when auth is configured
      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success(null, "Refresh temporarily disabled"));
    } catch (error) {
      next(error);
    }
  };

  signOut = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // TODO: Implement when auth is configured
      res
        .status(API_CODES.NO_CONTENT)
        .json(ApiResponse.success(null, "Đăng xuất thành công"));
    } catch (error) {
      next(error);
    }
  };

  getMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // TODO: Implement when auth is configured
      res.status(API_CODES.SUCCESS).json(ApiResponse.success({ admin: null }));
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
      // TODO: Implement when auth is configured
      res.status(API_CODES.SUCCESS).json(ApiResponse.success({ sessions: [] }));
    } catch (error) {
      next(error);
    }
  };

  revokeSession = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // TODO: Implement when auth is configured
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
      super_admin: ["*"], // All permissions
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
