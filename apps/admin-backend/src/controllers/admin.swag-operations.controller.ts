// src/controllers/admin.swag-operations.controller.ts
// ✅ Admin Swag Operations Controller - Fulfillment Management

import { Request, Response } from "express";
import { SwagOperationsService } from "../services/admin.swag-operations.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const swagOpsService = new SwagOperationsService();

// Helper to convert ObjectId to string
const getAdminId = (req: Request): string => {
  return req.admin?._id?.toString() || "";
};

export class SwagOperationsController {
  /**
   * Get dashboard stats
   */
  getDashboardStats = asyncHandler(async (req: Request, res: Response) => {
    const stats = await swagOpsService.getDashboardStats();
    res.json({ success: true, data: stats });
  });

  /**
   * Get all swag orders (from all organizations)
   */
  getOrders = asyncHandler(async (req: Request, res: Response) => {
    const { status, organization, page, limit, search, dateFrom, dateTo } =
      req.query;

    const result = await swagOpsService.getOrders({
      status: status as string,
      organizationId: organization as string,
      page: parseInt(page as string) || 1,
      limit: parseInt(limit as string) || 20,
      search: search as string,
      dateFrom: dateFrom as string,
      dateTo: dateTo as string,
    });

    res.json({ success: true, data: result });
  });

  /**
   * Get single order detail
   */
  getOrder = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const order = await swagOpsService.getOrderDetail(id);
    res.json({ success: true, data: { order } });
  });

  /**
   * Update order status (Processing, Kitting, etc.)
   */
  updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, note } = req.body;
    const adminId = getAdminId(req);

    const order = await swagOpsService.updateOrderStatus(
      id,
      status,
      adminId,
      note
    );
    res.json({ success: true, data: { order } });
  });

  /**
   * Update shipment status for a recipient
   */
  updateShipmentStatus = asyncHandler(async (req: Request, res: Response) => {
    const { orderId, recipientId } = req.params;
    const { status, trackingNumber, trackingUrl, carrier } = req.body;
    const adminId = getAdminId(req);

    const order = await swagOpsService.updateShipmentStatus(
      orderId,
      recipientId,
      { status, trackingNumber, trackingUrl, carrier },
      adminId
    );
    res.json({ success: true, data: { order } });
  });

  /**
   * Bulk update shipments (mark multiple as shipped)
   */
  bulkUpdateShipments = asyncHandler(async (req: Request, res: Response) => {
    const { orderId } = req.params;
    const { recipientIds, status, trackingNumbers, carrier } = req.body;
    const adminId = getAdminId(req);

    const result = await swagOpsService.bulkUpdateShipments(
      orderId,
      recipientIds,
      status,
      trackingNumbers || {},
      adminId,
      carrier
    );
    res.json({ success: true, data: result });
  });

  /**
   * Get all organizations (for filter dropdown)
   */
  getOrganizations = asyncHandler(async (req: Request, res: Response) => {
    const organizations = await swagOpsService.getOrganizations();
    res.json({ success: true, data: { organizations } });
  });

  /**
   * Get inventory overview (all organizations)
   */
  getInventoryOverview = asyncHandler(async (req: Request, res: Response) => {
    const { organizationId, lowStockOnly } = req.query;

    const result = await swagOpsService.getInventoryOverview({
      organizationId: organizationId as string,
      lowStockOnly: lowStockOnly === "true",
    });
    res.json({ success: true, data: result });
  });

  /**
   * Update inventory item
   */
  updateInventoryItem = asyncHandler(async (req: Request, res: Response) => {
    const { itemId } = req.params;
    const { quantity, operation, note } = req.body;
    const adminId = getAdminId(req);

    const item = await swagOpsService.updateInventoryItem(
      itemId,
      { quantity, operation },
      adminId,
      note
    );
    res.json({ success: true, data: { item } });
  });

  /**
   * Get fulfillment queue (orders ready to process)
   */
  getFulfillmentQueue = asyncHandler(async (req: Request, res: Response) => {
    const queue = await swagOpsService.getFulfillmentQueue();
    res.json({ success: true, data: queue });
  });

  /**
   * Start processing an order
   */
  startProcessing = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const adminId = getAdminId(req);

    const order = await swagOpsService.startProcessing(id, adminId);
    res.json({ success: true, data: { order } });
  });

  /**
   * Mark order as kitting complete
   */
  completeKitting = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const adminId = getAdminId(req);

    const order = await swagOpsService.completeKitting(id, adminId);
    res.json({ success: true, data: { order } });
  });

  /**
   * Generate shipping labels
   */
  generateShippingLabels = asyncHandler(async (req: Request, res: Response) => {
    const { orderId } = req.params;
    const { recipientIds, carrier } = req.body;

    const labels = await swagOpsService.generateShippingLabels(
      orderId,
      recipientIds,
      carrier
    );
    res.json({ success: true, data: { labels } });
  });

  /**
   * Get order activity log
   */
  getOrderActivityLog = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const logs = await swagOpsService.getOrderActivityLog(id);
    res.json({ success: true, data: { logs } });
  });

  /**
   * Get available carriers
   */
  getCarriers = asyncHandler(async (req: Request, res: Response) => {
    const carriers = swagOpsService.getCarriers();
    res.json({ success: true, data: { carriers } });
  });

  /**
   * Create shipment with carrier
   */
  createShipment = asyncHandler(async (req: Request, res: Response) => {
    const { orderId, recipientId } = req.params;
    const { carrier } = req.body;
    const adminId = getAdminId(req);

    const result = await swagOpsService.createShipmentWithCarrier(
      orderId,
      recipientId,
      carrier,
      adminId
    );
    res.json({ success: true, data: result });
  });

  /**
   * Get tracking info
   */
  getTrackingInfo = asyncHandler(async (req: Request, res: Response) => {
    const { orderId, recipientId } = req.params;
    const tracking = await swagOpsService.getTrackingInfo(orderId, recipientId);
    res.json({ success: true, data: tracking });
  });

  /**
   * Export orders to CSV
   */
  exportOrders = asyncHandler(async (req: Request, res: Response) => {
    const { dateFrom, dateTo, organization } = req.query;

    const csv = await swagOpsService.exportOrders({
      dateFrom: dateFrom as string,
      dateTo: dateTo as string,
      organizationId: organization as string,
    });

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=swag-orders-${Date.now()}.csv`
    );
    res.send("\uFEFF" + csv); // BOM for Excel UTF-8
  });
}

export const swagOperationsController = new SwagOperationsController();
