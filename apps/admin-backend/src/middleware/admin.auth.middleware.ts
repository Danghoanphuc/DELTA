// apps/admin-backend/src/middleware/admin.auth.middleware.ts
import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express"; // <-- SỬA
import jwt from "jsonwebtoken";
import { Admin, type IAdmin, type AdminRole } from "../models/admin.model.js"; // <-- SỬA
import {
  UnauthorizedException,
  ForbiddenException,
} from "../shared/exceptions.js";

// Gắn thông tin admin vào Request của Express
declare global {
  namespace Express {
    interface Request {
      admin?: IAdmin; // <-- SỬA (Dùng interface)
    }
  }
}

// Middleware 1: Kiểm tra có phải là Admin không
export const isAuthenticatedAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let token: string | undefined;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new UnauthorizedException("Yêu cầu xác thực (Admin)"));
  }

  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret) {
    return next(new Error("Lỗi máy chủ (JWT)"));
  }

  try {
    const decoded: any = jwt.verify(token, secret);

    // ✅ SỬA: Gán kiểu 'IAdmin' cho kết quả query
    const currentAdmin: IAdmin | null = await Admin.findById(decoded.id);

    if (!currentAdmin || !currentAdmin.isActive) {
      return next(new UnauthorizedException("Tài khoản admin không hợp lệ"));
    }

    req.admin = currentAdmin; // Gắn admin (đã có kiểu) vào request
    next();
  } catch (err) {
    return next(new UnauthorizedException("Token không hợp lệ (Admin)"));
  }
};

// Middleware 2: Factory để kiểm tra Role
export const hasRole = (roles: AdminRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // ✅ SỬA: TypeScript giờ đã hiểu 'req.admin.role'
    if (!req.admin || !roles.includes(req.admin.role)) {
      return next(
        new ForbiddenException("Bạn không có quyền thực hiện hành động này")
      );
    }
    next();
  };
};
