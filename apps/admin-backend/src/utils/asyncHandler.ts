// apps/admin-backend/src/utils/asyncHandler.ts
import { type Request, type Response, type NextFunction } from "express";

/**
 * Wrapper cho các hàm async controller để tự động bắt lỗi
 * và chuyển cho error handler (tránh dùng try...catch lặp đi lặp lại)
 */
export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
