// src/controllers/admin.analytics.controller.ts
// ✅ Admin Analytics Controller

import { Request, Response } from "express";
import { analyticsService } from "../services/admin.analytics.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export class AnalyticsController {
  /**
   * Get order trends
   */
  getOrderTrends = asyncHandler(async (req: Request, res: Response) => {
    const { from, to, organizationId, groupBy } = req.query;

    const dateRange =
      from && to
        ? { from: new Date(from as string), to: new Date(to as string) }
        : undefined;

    const trends = await analyticsService.getOrderTrends({
      dateRange,
      organizationId: organizationId as string,
      groupBy: (groupBy as "day" | "week" | "month") || "day",
    });

    res.json({ success: true, data: trends });
  });

  /**
   * Get fulfillment metrics
   */
  getFulfillmentMetrics = asyncHandler(async (req: Request, res: Response) => {
    const { from, to, organizationId } = req.query;

    const dateRange =
      from && to
        ? { from: new Date(from as string), to: new Date(to as string) }
        : undefined;

    const metrics = await analyticsService.getFulfillmentMetrics({
      dateRange,
      organizationId: organizationId as string,
    });

    res.json({ success: true, data: metrics });
  });

  /**
   * Get top organizations
   */
  getTopOrganizations = asyncHandler(async (req: Request, res: Response) => {
    const { from, to, limit } = req.query;

    const dateRange =
      from && to
        ? { from: new Date(from as string), to: new Date(to as string) }
        : undefined;

    const orgs = await analyticsService.getTopOrganizations(
      parseInt(limit as string) || 10,
      dateRange
    );

    res.json({ success: true, data: orgs });
  });

  /**
   * Get status distribution
   */
  getStatusDistribution = asyncHandler(async (req: Request, res: Response) => {
    const { from, to } = req.query;

    const dateRange =
      from && to
        ? { from: new Date(from as string), to: new Date(to as string) }
        : undefined;

    const distribution = await analyticsService.getStatusDistribution(
      dateRange
    );

    res.json({ success: true, data: distribution });
  });

  /**
   * Get carrier performance
   */
  getCarrierPerformance = asyncHandler(async (req: Request, res: Response) => {
    const { from, to } = req.query;

    const dateRange =
      from && to
        ? { from: new Date(from as string), to: new Date(to as string) }
        : undefined;

    const performance = await analyticsService.getCarrierPerformance(dateRange);

    res.json({ success: true, data: performance });
  });

  /**
   * Get inventory alerts
   */
  getInventoryAlerts = asyncHandler(async (req: Request, res: Response) => {
    const alerts = await analyticsService.getInventoryAlerts();
    res.json({ success: true, data: alerts });
  });
}

export const analyticsController = new AnalyticsController();
