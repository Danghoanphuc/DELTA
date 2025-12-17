// src/services/swag-ops/order.service.ts
// ✅ Order Service - Single Responsibility: Order CRUD & Status Management

import mongoose from "mongoose";
import { Logger } from "../../shared/utils/logger.js";
import { SwagOrderRepository } from "../../repositories/swag-order.repository.js";
import {
  OrderFilters,
  ORDER_STATUS,
} from "../../interfaces/swag-operations.interface.js";

export class OrderService {
  constructor(private readonly orderRepo: SwagOrderRepository) {}

  async getOrders(filters: OrderFilters) {
    const { status, organizationId, page, limit, search, dateFrom, dateTo } =
      filters;

    const query: any = {};

    if (status && status !== "all") {
      query.status = status;
    }

    if (organizationId) {
      query.organization = new mongoose.Types.ObjectId(organizationId);
    }

    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } },
      ];
    }

    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    const result = await this.orderRepo.findWithPagination(query, page, limit);

    return {
      orders: result.data,
      pagination: result.pagination,
    };
  }

  async getOrderDetail(orderId: string) {
    const order = await this.orderRepo.findByIdWithPopulate(orderId);
    if (!order) {
      throw new Error("Order not found");
    }
    return order;
  }

  async updateOrderStatus(
    orderId: string,
    status: string,
    adminId: string,
    note?: string
  ) {
    const order = await this.orderRepo.findByIdForUpdate(orderId);
    if (!order) throw new Error("Order not found");

    const previousStatus = order.status;
    order.status = status;

    // Add to activity log
    if (!order.activityLog) order.activityLog = [];
    order.activityLog.push({
      action: "status_changed",
      from: previousStatus,
      to: status,
      by: adminId,
      at: new Date(),
      note,
    });

    // Update timestamps based on status
    if (status === ORDER_STATUS.PROCESSING) {
      order.processedAt = new Date();
    } else if (status === ORDER_STATUS.SHIPPED) {
      order.shippedAt = new Date();
    } else if (status === ORDER_STATUS.DELIVERED) {
      order.completedAt = new Date();
    }

    await order.save();

    Logger.info(
      `[OrderService] Order ${order.orderNumber} status changed: ${previousStatus} → ${status}`
    );

    return order;
  }

  async getActivityLog(orderId: string) {
    const order = await this.orderRepo.findById(orderId);
    return order?.activityLog || [];
  }

  async exportToCSV(filters: {
    dateFrom?: string;
    dateTo?: string;
    organizationId?: string;
  }): Promise<string> {
    const query: any = {};

    if (filters.dateFrom || filters.dateTo) {
      query.createdAt = {};
      if (filters.dateFrom) query.createdAt.$gte = new Date(filters.dateFrom);
      if (filters.dateTo) query.createdAt.$lte = new Date(filters.dateTo);
    }

    if (filters.organizationId) {
      query.organization = new mongoose.Types.ObjectId(filters.organizationId);
    }

    const result = await this.orderRepo.findWithPagination(query, 1, 10000, {
      createdAt: -1,
    });

    const headers = [
      "Mã đơn",
      "Tên đơn",
      "Tổ chức",
      "Bộ quà",
      "Số người nhận",
      "Trạng thái",
      "Tổng tiền",
      "Ngày tạo",
      "Ngày thanh toán",
      "Ngày gửi",
    ];

    const rows = result.data.map((order: any) => [
      order.orderNumber,
      `"${(order.name || "").replace(/"/g, '""')}"`,
      `"${(order.organization?.businessName || "").replace(/"/g, '""')}"`,
      `"${(order.swagPack?.name || order.packSnapshot?.name || "").replace(
        /"/g,
        '""'
      )}"`,
      order.totalRecipients,
      order.status,
      order.pricing?.total || 0,
      order.createdAt ? new Date(order.createdAt).toISOString() : "",
      order.paidAt ? new Date(order.paidAt).toISOString() : "",
      order.shippedAt ? new Date(order.shippedAt).toISOString() : "",
    ]);

    return [headers.join(","), ...rows.map((row: any) => row.join(","))].join(
      "\n"
    );
  }
}
