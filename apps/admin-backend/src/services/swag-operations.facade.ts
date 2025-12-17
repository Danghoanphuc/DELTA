// src/services/swag-operations.facade.ts
// ✅ SwagOperations Facade - Backward Compatible API
// Tuân thủ Facade Pattern - Cung cấp interface đơn giản cho hệ thống phức tạp

import {
  SwagOrderRepository,
  swagOrderRepository,
} from "../repositories/swag-order.repository.js";
import InventoryRepository, {
  inventoryRepository,
} from "../repositories/inventory.repository.js";
import {
  OrganizationRepository,
  organizationRepository,
} from "../repositories/organization.repository.js";

import { DashboardService } from "./swag-ops/dashboard.service.js";
import { OrderService } from "./swag-ops/order.service.js";
import { ShipmentService } from "./swag-ops/shipment.service.js";
import { InventoryService } from "./swag-ops/inventory.service.js";
import { FulfillmentService } from "./swag-ops/fulfillment.service.js";

import {
  OrderFilters,
  ShipmentUpdate,
  InventoryFilters,
  InventoryUpdateRequest,
} from "../interfaces/swag-operations.interface.js";

/**
 * SwagOperationsFacade - Facade Pattern
 * Cung cấp backward-compatible API cho controller hiện tại
 * Delegate sang các services chuyên biệt
 */
export class SwagOperationsFacade {
  private readonly dashboardService: DashboardService;
  private readonly orderService: OrderService;
  private readonly shipmentService: ShipmentService;
  private readonly inventoryService: InventoryService;
  private readonly fulfillmentService: FulfillmentService;
  private readonly orgRepo: OrganizationRepository;

  constructor(
    orderRepo: SwagOrderRepository = swagOrderRepository,
    invRepo: InventoryRepository = inventoryRepository,
    orgRepo: OrganizationRepository = organizationRepository
  ) {
    this.dashboardService = new DashboardService(orderRepo, orgRepo);
    this.orderService = new OrderService(orderRepo);
    this.shipmentService = new ShipmentService(orderRepo);
    this.inventoryService = new InventoryService(invRepo);
    this.fulfillmentService = new FulfillmentService(orderRepo);
    this.orgRepo = orgRepo;
  }

  // === Dashboard ===
  async getDashboardStats() {
    return this.dashboardService.getStats();
  }

  // === Orders ===
  async getOrders(filters: OrderFilters) {
    return this.orderService.getOrders(filters);
  }

  async getOrderDetail(orderId: string) {
    return this.orderService.getOrderDetail(orderId);
  }

  async updateOrderStatus(
    orderId: string,
    status: string,
    adminId: string,
    note?: string
  ) {
    return this.orderService.updateOrderStatus(orderId, status, adminId, note);
  }

  async getOrderActivityLog(orderId: string) {
    return this.orderService.getActivityLog(orderId);
  }

  async exportOrders(filters: {
    dateFrom?: string;
    dateTo?: string;
    organizationId?: string;
  }) {
    return this.orderService.exportToCSV(filters);
  }

  // === Shipments ===
  getCarriers() {
    return this.shipmentService.getCarriers();
  }

  async updateShipmentStatus(
    orderId: string,
    recipientId: string,
    update: ShipmentUpdate,
    adminId: string
  ) {
    return this.shipmentService.updateShipmentStatus(
      orderId,
      recipientId,
      update,
      adminId
    );
  }

  async bulkUpdateShipments(
    orderId: string,
    recipientIds: string[],
    status: string,
    trackingNumbers: Record<string, string>,
    adminId: string,
    carrier?: string
  ) {
    return this.shipmentService.bulkUpdateShipments(
      orderId,
      recipientIds,
      status,
      trackingNumbers,
      adminId,
      carrier
    );
  }

  async createShipmentWithCarrier(
    orderId: string,
    recipientId: string,
    carrier: string,
    adminId: string
  ) {
    return this.shipmentService.createShipmentWithCarrier(
      orderId,
      recipientId,
      carrier,
      adminId
    );
  }

  async getTrackingInfo(orderId: string, recipientId: string) {
    return this.shipmentService.getTrackingInfo(orderId, recipientId);
  }

  async generateShippingLabels(
    orderId: string,
    recipientIds: string[],
    carrier?: string
  ) {
    return this.shipmentService.generateShippingLabels(
      orderId,
      recipientIds,
      carrier
    );
  }

  // === Inventory ===
  async getInventoryOverview(filters: InventoryFilters) {
    return this.inventoryService.getOverview(filters);
  }

  async updateInventoryItem(
    itemId: string,
    update: InventoryUpdateRequest,
    adminId: string,
    note?: string
  ) {
    return this.inventoryService.updateItem(itemId, update, adminId, note);
  }

  // === Fulfillment ===
  async getFulfillmentQueue() {
    return this.fulfillmentService.getQueue();
  }

  async startProcessing(orderId: string, adminId: string) {
    return this.fulfillmentService.startProcessing(orderId, adminId);
  }

  async completeKitting(orderId: string, adminId: string) {
    return this.fulfillmentService.completeKitting(orderId, adminId);
  }

  // === Organizations ===
  async getOrganizations() {
    return this.orgRepo.findActive();
  }
}

// Export singleton instance for backward compatibility
export const swagOperationsService = new SwagOperationsFacade();
