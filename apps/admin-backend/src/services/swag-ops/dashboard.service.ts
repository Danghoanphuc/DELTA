// src/services/swag-ops/dashboard.service.ts
// ✅ Dashboard Service - Single Responsibility: Dashboard Stats

import { Logger } from "../../shared/utils/logger.js";
import { SwagOrderRepository } from "../../repositories/swag-order.repository.js";
import { OrganizationRepository } from "../../repositories/organization.repository.js";
import {
  DashboardStats,
  ORDER_STATUS,
} from "../../interfaces/swag-operations.interface.js";

export class DashboardService {
  constructor(
    private readonly orderRepo: SwagOrderRepository,
    private readonly orgRepo: OrganizationRepository
  ) {}

  async getStats(): Promise<DashboardStats> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
      const [
        totalOrders,
        pendingOrders,
        processingOrders,
        shippedToday,
        totalOrganizations,
        ordersByStatus,
        revenueResult,
        attentionNeeded,
      ] = await Promise.all([
        this.orderRepo.count(),
        this.orderRepo.count({
          status: { $in: [ORDER_STATUS.PAID, ORDER_STATUS.PENDING_PAYMENT] },
        }),
        this.orderRepo.count({
          status: { $in: [ORDER_STATUS.PROCESSING, ORDER_STATUS.KITTING] },
        }),
        this.orderRepo.count({
          status: ORDER_STATUS.SHIPPED,
          "recipientShipments.shippedAt": { $gte: today },
        }),
        this.orgRepo.count(),
        this.orderRepo.aggregate([
          { $group: { _id: "$status", count: { $sum: 1 } } },
        ]),
        this.orderRepo.aggregate([
          {
            $match: {
              status: { $nin: [ORDER_STATUS.CANCELLED, ORDER_STATUS.DRAFT] },
            },
          },
          { $group: { _id: null, total: { $sum: "$pricing.total" } } },
        ]),
        this.orderRepo.count({
          $or: [
            { status: ORDER_STATUS.FAILED },
            {
              status: ORDER_STATUS.PENDING_INFO,
              createdAt: {
                $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
              },
            },
          ],
        }),
      ]);

      return {
        totalOrders,
        pendingOrders,
        processingOrders,
        shippedToday,
        totalOrganizations,
        totalRevenue: revenueResult[0]?.total || 0,
        attentionNeeded,
        ordersByStatus: ordersByStatus.reduce((acc: any, item: any) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
      };
    } catch (error: any) {
      Logger.error(`[DashboardService] Error getting stats: ${error.message}`);
      return {
        totalOrders: 0,
        pendingOrders: 0,
        processingOrders: 0,
        shippedToday: 0,
        totalOrganizations: 0,
        totalRevenue: 0,
        attentionNeeded: 0,
        ordersByStatus: {},
      };
    }
  }
}
