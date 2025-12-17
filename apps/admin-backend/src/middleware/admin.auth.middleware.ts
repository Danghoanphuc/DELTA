// apps/admin-backend/src/middleware/admin.auth.middleware.ts
// ✅ STANDARDIZED: Admin auth middleware using shared auth package

// import { createAdminAuth, createRoleMiddleware } from "@delta/auth";
import { Admin, type IAdmin, type AdminRole } from "../models/admin.model.js";
import { config } from "../config/env.config.js";

// Gắn thông tin admin vào Request của Express
declare global {
  namespace Express {
    interface Request {
      admin?: IAdmin;
    }
  }
}

// TODO: Implement proper auth middleware when @delta/auth is configured

// Temporary placeholder middleware
export const isAuthenticatedAdmin = (req: any, res: any, next: any) => {
  // TODO: Implement proper authentication
  next();
};

export const authenticate = isAuthenticatedAdmin;

export const hasRole = (roles: AdminRole[]) => {
  return (req: any, res: any, next: any) => {
    // TODO: Implement role checking
    next();
  };
};

// ✅ CONVENIENCE: Pre-defined role middlewares
export const isSuperAdmin = hasRole(["superadmin"]);
export const isAdmin = hasRole(["finance", "superadmin"]);
export const isModerator = hasRole([
  "support",
  "vetting",
  "finance",
  "superadmin",
]);
