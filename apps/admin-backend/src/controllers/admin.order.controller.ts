import { type Request, type Response, type NextFunction } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import * as orderService from "../services/admin.order.service.js";
import { ValidationException } from "../shared/exceptions.js";
import { type IAdmin } from "../models/admin.model.js";
import { type IOrderListQuery } from "../interfaces/order.interface.js";

const getAuthenticatedAdmin = (req: Request): IAdmin => {
  const admin = req.admin;
  if (!admin) {
    throw new ValidationException("Yêu cầu đăng nhập Admin.");
  }
  return admin;
};

export const listOrders = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const result = await orderService.getAllOrders(
      req.query as unknown as IOrderListQuery
    );
    res.status(200).json({
      success: true,
      data: result,
    });
  }
);

export const getOrderDetails = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const order = await orderService.getOrderDetails(req.params.id);
    res.status(200).json({
      success: true,
      data: order,
    });
  }
);

export const forceUpdateOrderStatus = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { status, adminNote } = req.body as {
      status?: string;
      adminNote?: string;
    };

    if (!status || typeof status !== "string") {
      throw new ValidationException("Thiếu trường 'status'.");
    }

    const normalizedStatusInput = status.trim();
    if (!normalizedStatusInput) {
      throw new ValidationException("Trạng thái không được để trống.");
    }

    const admin = getAuthenticatedAdmin(req);

    const sanitizedAdminNote =
      typeof adminNote === "string" && adminNote.trim().length > 0
        ? adminNote.trim()
        : undefined;

    const updatedOrder = await orderService.forceUpdateStatus(
      req.params.id,
      normalizedStatusInput,
      admin,
      sanitizedAdminNote,
      {
        ipAddress: req.ip,
        userAgent: req.get("user-agent") ?? undefined,
      }
    );

    res.status(200).json({
      success: true,
      message: "Cập nhật trạng thái đơn hàng thành công.",
      data: updatedOrder,
    });
  }
);

export const assignShipper = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { shipperId } = req.body as { shipperId?: string };

    if (!shipperId || typeof shipperId !== "string") {
      throw new ValidationException("Thiếu trường 'shipperId'.");
    }

    const admin = getAuthenticatedAdmin(req);

    const updatedOrder = await orderService.assignShipperToOrder(
      req.params.id,
      shipperId.trim(),
      admin,
      {
        ipAddress: req.ip,
        userAgent: req.get("user-agent") ?? undefined,
      }
    );

    res.status(200).json({
      success: true,
      message: "Đã gán shipper cho đơn hàng.",
      data: updatedOrder,
    });
  }
);

export const unassignShipper = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const admin = getAuthenticatedAdmin(req);

    const updatedOrder = await orderService.unassignShipperFromOrder(
      req.params.id,
      admin,
      {
        ipAddress: req.ip,
        userAgent: req.get("user-agent") ?? undefined,
      }
    );

    res.status(200).json({
      success: true,
      message: "Đã gỡ shipper khỏi đơn hàng.",
      data: updatedOrder,
    });
  }
);
