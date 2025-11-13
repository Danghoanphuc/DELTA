// apps/admin-backend/src/controllers/admin.auth.controller.ts
import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express"; // <-- SỬA
import * as adminAuthService from "../services/admin.auth.service.js";
import { recordAdminAuditLog } from "../services/admin.audit-log.service.js";

export const signIn = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // ✅ SỬA: Ép kiểu cho req.body
    const { email, password } = req.body as any;
    const { token, admin } = await adminAuthService.signIn(email, password);

    res.status(200).json({
      success: true,
      token,
      data: { admin },
    });
  } catch (error: any) {
    next(error); // Chuyển lỗi cho error handler
  }
};

export const getMe = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Middleware 'isAuthenticatedAdmin' đã chạy và gắn 'req.admin'
    res.status(200).json({
      success: true,
      data: {
        admin: req.admin, // ✅ SỬA: 'req.admin' giờ đã có kiểu
      },
    });
  } catch (error) {
    next(error);
  }
};

export const signOut = (req: Request, res: Response) => {
  if (req.admin) {
    void recordAdminAuditLog({
      action: "ADMIN_SIGN_OUT",
      actor: req.admin,
      targetType: "Admin",
      targetId: req.admin._id.toString(),
    });
  }
  res.status(200).json({ success: true, message: "Đã đăng xuất" });
};

export const requestPasswordReset = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body as any;
    const result = await adminAuthService.requestPasswordReset(
      email,
      req.ip,
      req.get("user-agent")
    );
    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token, password } = req.body as any;
    const result = await adminAuthService.resetPassword(
      token,
      password,
      req.ip,
      req.get("user-agent")
    );

    res.status(200).json({
      success: true,
      message: "Đặt lại mật khẩu thành công",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const updatePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { currentPassword, newPassword } = req.body as any;
    if (!req.admin) {
      throw new Error("Thiếu thông tin admin hiện tại");
    }

    const result = await adminAuthService.updatePassword(
      req.admin._id.toString(),
      currentPassword,
      newPassword,
      req.ip,
      req.get("user-agent")
    );

    res.status(200).json({
      success: true,
      message: "Cập nhật mật khẩu thành công",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};