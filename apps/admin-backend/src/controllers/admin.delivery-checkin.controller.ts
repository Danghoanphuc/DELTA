// src/controllers/admin.delivery-checkin.controller.ts
// ✅ Admin Delivery Check-in Controller

import { Request, Response } from "express";
import { DeliveryCheckinService } from "../services/admin.delivery-checkin.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const deliveryCheckinService = new DeliveryCheckinService();

export class DeliveryCheckinController {
  /**
   * Get all delivery check-ins with filters
   * @route GET /api/admin/delivery-checkins
   */
  getCheckins = asyncHandler(async (req: Request, res: Response) => {
    const {
      page,
      limit,
      orderType,
      status,
      shipperId,
      customerId,
      startDate,
      endDate,
      search,
    } = req.query;

    const result = await deliveryCheckinService.getCheckins({
      page: parseInt(page as string) || 1,
      limit: parseInt(limit as string) || 20,
      orderType: orderType as string,
      status: status as string,
      shipperId: shipperId as string,
      customerId: customerId as string,
      startDate: startDate as string,
      endDate: endDate as string,
      search: search as string,
    });

    res.json({ success: true, data: result });
  });

  /**
   * Get delivery check-in statistics
   * @route GET /api/admin/delivery-checkins/stats
   */
  getStats = asyncHandler(async (req: Request, res: Response) => {
    const stats = await deliveryCheckinService.getStats();
    res.json({ success: true, data: stats });
  });

  /**
   * Get check-ins within geographic bounds
   * @route GET /api/admin/delivery-checkins/bounds
   */
  getCheckinsByBounds = asyncHandler(async (req: Request, res: Response) => {
    const { minLng, minLat, maxLng, maxLat, orderType, customerId } = req.query;

    const bounds = {
      minLng: parseFloat(minLng as string),
      minLat: parseFloat(minLat as string),
      maxLng: parseFloat(maxLng as string),
      maxLat: parseFloat(maxLat as string),
    };

    const checkins = await deliveryCheckinService.getCheckinsByBounds(bounds, {
      orderType: orderType as string,
      customerId: customerId as string,
    });

    res.json({ success: true, data: { checkins } });
  });

  /**
   * Get single check-in detail
   * @route GET /api/admin/delivery-checkins/:id
   */
  getCheckin = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const checkin = await deliveryCheckinService.getCheckinById(id);
    res.json({ success: true, data: { checkin } });
  });

  /**
   * Get check-ins for a specific order
   * @route GET /api/admin/delivery-checkins/order/:orderId
   */
  getCheckinsByOrder = asyncHandler(async (req: Request, res: Response) => {
    const { orderId } = req.params;
    const { orderType } = req.query;

    const checkins = await deliveryCheckinService.getCheckinsByOrder(
      orderId,
      orderType as string
    );

    res.json({ success: true, data: { checkins } });
  });

  /**
   * Get check-ins by shipper
   * @route GET /api/admin/delivery-checkins/shipper/:shipperId
   */
  getCheckinsByShipper = asyncHandler(async (req: Request, res: Response) => {
    const { shipperId } = req.params;
    const { page, limit, orderType } = req.query;

    const result = await deliveryCheckinService.getCheckinsByShipper(
      shipperId,
      {
        page: parseInt(page as string) || 1,
        limit: parseInt(limit as string) || 20,
        orderType: orderType as string,
      }
    );

    res.json({ success: true, data: result });
  });

  /**
   * Delete a check-in (admin only)
   * @route DELETE /api/admin/delivery-checkins/:id
   */
  deleteCheckin = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const adminId = req.admin?._id?.toString() || "";

    await deliveryCheckinService.deleteCheckin(id, adminId);

    res.json({ success: true, message: "Đã xóa check-in thành công" });
  });
}

export const deliveryCheckinController = new DeliveryCheckinController();
