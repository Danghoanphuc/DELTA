// apps/admin-backend/src/middleware/error.handler.middleware.ts
import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express"; // <-- SỬA

// Middleware bắt lỗi cuối cùng
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction // (Dù 'next' không dùng, nó vẫn BẮT BUỘC phải có 4 param)
) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Lỗi máy chủ không xác định";

  console.error(`[Admin Error Handler] ${statusCode}: ${message}`, {
    path: req.path,
    // Bỏ stack trace ở production
  });

  res.status(statusCode).json({
    success: false,
    status: statusCode,
    message: message,
  });
};
