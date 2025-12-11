// src/modules/swag-orders/swag-order.service.js
// ✅ Swag Order Service - Business logic for Send Swag Flow

import { SwagOrderRepository } from "./swag-order.repository.js";
import {
  SwagOrder,
  SWAG_ORDER_STATUS,
  SHIPMENT_STATUS,
} from "./swag-order.model.js";
import { SwagPack } from "../swag-packs/swag-pack.model.js";
import { Recipient } from "../recipients/recipient.model.js";
import {
  NotFoundException,
  ValidationException,
  ForbiddenException,
} from "../../shared/exceptions/index.js";
import { Logger } from "../../shared/utils/index.js";
import crypto from "crypto";

export class SwagOrderService {
  constructor() {
    this.swagOrderRepository = new SwagOrderRepository();
  }

  /**
   * Create a new swag order (Send Swag Flow)
   */
  async createOrder(organizationId, userId, data) {
    Logger.debug(`[SwagOrderSvc] Creating order for org: ${organizationId}`);

    const {
      name,
      swagPackId,
      recipientIds,
      shippingMethod,
      scheduledSendDate,
      notifyRecipients,
      customMessage,
    } = data;

    // Validate pack
    const pack = await SwagPack.findById(swagPackId);
    if (!pack) throw new NotFoundException("Swag Pack", swagPackId);
    if (pack.organization.toString() !== organizationId.toString()) {
      throw new ForbiddenException("Bạn không có quyền sử dụng bộ quà này");
    }
    if (pack.status !== "active") {
      throw new ValidationException("Bộ quà chưa được kích hoạt");
    }

    // Validate recipients
    if (!recipientIds || recipientIds.length === 0) {
      throw new ValidationException("Vui lòng chọn ít nhất 1 người nhận");
    }

    const recipients = await Recipient.find({
      _id: { $in: recipientIds },
      organization: organizationId,
      status: "active",
    });

    if (recipients.length !== recipientIds.length) {
      throw new ValidationException("Một số người nhận không hợp lệ");
    }

    // Generate order number
    const orderNumber = await SwagOrder.generateOrderNumber();

    // Check if any item needs size selection
    const needsSizeSelection = pack.items.some(
      (item) => item.sizeOptions?.enabled
    );

    // Create recipient shipments
    const recipientShipments = recipients.map((recipient) => {
      const needsInfo = needsSizeSelection || !recipient.address?.street;

      return {
        recipient: recipient._id,
        recipientInfo: {
          firstName: recipient.firstName,
          lastName: recipient.lastName,
          email: recipient.email,
          phone: recipient.phone,
        },
        shippingAddress: recipient.address || {},
        selfServiceToken: needsInfo
          ? crypto.randomBytes(32).toString("hex")
          : null,
        selfServiceExpiry: needsInfo
          ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          : null, // 7 days
        selfServiceCompleted: !needsInfo,
        personalization: {
          name: `${recipient.firstName} ${recipient.lastName}`,
        },
      };
    });

    // Create order
    const order = await this.swagOrderRepository.create({
      organization: organizationId,
      createdBy: userId,
      orderNumber,
      name: name || `Gửi quà - ${pack.name}`,
      swagPack: pack._id,
      packSnapshot: {
        name: pack.name,
        items: pack.items.map((item) => ({
          product: item.product,
          productName: item.productName,
          productImage: item.productImage,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          hasSize: item.sizeOptions?.enabled || false,
          personalized: item.customization?.personalized || false,
        })),
        unitPrice: pack.pricing?.unitPrice || 0,
      },
      recipientShipments,
      shippingMethod: shippingMethod || "standard",
      scheduledSendDate: scheduledSendDate ? new Date(scheduledSendDate) : null,
      sendImmediately: !scheduledSendDate,
      notifyRecipients: notifyRecipients !== false,
      customMessage,
      // ✅ FIX: Đơn hàng B2B được tạo là đã submit, chờ admin xử lý
      // Nếu cần người nhận điền thông tin → PENDING_INFO (admin vẫn thấy)
      // Nếu không → PENDING_PAYMENT (sẵn sàng xử lý)
      status: needsSizeSelection
        ? SWAG_ORDER_STATUS.PENDING_INFO
        : SWAG_ORDER_STATUS.PENDING_PAYMENT,
      submittedAt: new Date(), // Đánh dấu đã submit ngay khi tạo
    });

    // Calculate pricing
    order.calculatePricing();
    await order.save();

    // Update pack stats
    pack.totalOrdered += recipients.length;
    pack.lastOrderedAt = new Date();
    await pack.save();

    Logger.success(`[SwagOrderSvc] Created order: ${order.orderNumber}`);

    // TODO: Send self-service emails to recipients who need to fill info
    if (notifyRecipients !== false) {
      // await this.sendSelfServiceEmails(order);
    }

    return order;
  }

  /**
   * Get orders list
   */
  async getOrders(organizationId, options = {}) {
    return await this.swagOrderRepository.findByOrganization(
      organizationId,
      options
    );
  }

  /**
   * Get single order
   */
  async getOrder(organizationId, orderId) {
    const order = await this.swagOrderRepository.findById(orderId);
    if (!order) throw new NotFoundException("Swag Order", orderId);
    if (order.organization.toString() !== organizationId.toString()) {
      throw new ForbiddenException("Bạn không có quyền truy cập đơn hàng này");
    }
    return order;
  }

  /**
   * Update order
   */
  async updateOrder(organizationId, orderId, data) {
    const order = await this.getOrder(organizationId, orderId);

    if (!["draft", "pending_info"].includes(order.status)) {
      throw new ValidationException("Không thể chỉnh sửa đơn hàng đã xử lý");
    }

    const allowedFields = [
      "name",
      "description",
      "shippingMethod",
      "scheduledSendDate",
      "customMessage",
    ];
    allowedFields.forEach((field) => {
      if (data[field] !== undefined) order[field] = data[field];
    });

    await order.save();
    return order;
  }

  /**
   * Add recipients to order
   */
  async addRecipients(organizationId, orderId, recipientIds) {
    const order = await this.getOrder(organizationId, orderId);

    if (!["draft", "pending_info"].includes(order.status)) {
      throw new ValidationException(
        "Không thể thêm người nhận vào đơn hàng đã xử lý"
      );
    }

    const recipients = await Recipient.find({
      _id: { $in: recipientIds },
      organization: organizationId,
      status: "active",
    });

    const existingIds = order.recipientShipments.map((s) =>
      s.recipient.toString()
    );
    const newRecipients = recipients.filter(
      (r) => !existingIds.includes(r._id.toString())
    );

    const needsSizeSelection = order.packSnapshot.items.some(
      (item) => item.hasSize
    );

    newRecipients.forEach((recipient) => {
      const needsInfo = needsSizeSelection || !recipient.address?.street;

      order.recipientShipments.push({
        recipient: recipient._id,
        recipientInfo: {
          firstName: recipient.firstName,
          lastName: recipient.lastName,
          email: recipient.email,
          phone: recipient.phone,
        },
        shippingAddress: recipient.address || {},
        selfServiceToken: needsInfo
          ? crypto.randomBytes(32).toString("hex")
          : null,
        selfServiceExpiry: needsInfo
          ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          : null,
        selfServiceCompleted: !needsInfo,
      });
    });

    order.calculatePricing();
    await order.save();

    return order;
  }

  /**
   * Remove recipient from order
   */
  async removeRecipient(organizationId, orderId, recipientId) {
    const order = await this.getOrder(organizationId, orderId);

    if (!["draft", "pending_info"].includes(order.status)) {
      throw new ValidationException(
        "Không thể xóa người nhận khỏi đơn hàng đã xử lý"
      );
    }

    order.recipientShipments = order.recipientShipments.filter(
      (s) => s.recipient.toString() !== recipientId
    );

    order.calculatePricing();
    await order.save();

    return order;
  }

  /**
   * Submit order for processing
   */
  async submitOrder(organizationId, orderId) {
    const order = await this.getOrder(organizationId, orderId);

    if (!["draft", "pending_info"].includes(order.status)) {
      throw new ValidationException("Đơn hàng đã được gửi");
    }

    // Check all recipients have completed info
    const pendingInfo = order.recipientShipments.filter(
      (s) => !s.selfServiceCompleted
    );
    if (pendingInfo.length > 0) {
      throw new ValidationException(
        `Còn ${pendingInfo.length} người nhận chưa điền thông tin`
      );
    }

    order.status = SWAG_ORDER_STATUS.PENDING_PAYMENT;
    order.submittedAt = new Date();
    await order.save();

    Logger.success(`[SwagOrderSvc] Order submitted: ${order.orderNumber}`);
    return order;
  }

  /**
   * Process payment and start fulfillment
   */
  async processPayment(organizationId, orderId, paymentInfo) {
    const order = await this.getOrder(organizationId, orderId);

    if (order.status !== SWAG_ORDER_STATUS.PENDING_PAYMENT) {
      throw new ValidationException(
        "Đơn hàng không ở trạng thái chờ thanh toán"
      );
    }

    order.paymentStatus = "paid";
    order.paymentMethod = paymentInfo.method;
    order.paymentIntentId = paymentInfo.paymentIntentId;
    order.paidAt = new Date();
    order.status = SWAG_ORDER_STATUS.PROCESSING;
    order.processedAt = new Date();

    // Update all shipments to processing
    order.recipientShipments.forEach((shipment) => {
      shipment.shipmentStatus = SHIPMENT_STATUS.PROCESSING;
    });

    await order.save();

    Logger.success(
      `[SwagOrderSvc] Payment processed for order: ${order.orderNumber}`
    );
    return order;
  }

  /**
   * Update shipment status (for admin/fulfillment)
   */
  async updateShipmentStatus(
    organizationId,
    orderId,
    recipientId,
    status,
    trackingInfo = {}
  ) {
    const order = await this.getOrder(organizationId, orderId);

    const shipment = order.recipientShipments.find(
      (s) => s.recipient.toString() === recipientId
    );
    if (!shipment) throw new NotFoundException("Shipment", recipientId);

    shipment.shipmentStatus = status;
    if (trackingInfo.trackingNumber)
      shipment.trackingNumber = trackingInfo.trackingNumber;
    if (trackingInfo.trackingUrl)
      shipment.trackingUrl = trackingInfo.trackingUrl;
    if (trackingInfo.carrier) shipment.carrier = trackingInfo.carrier;
    if (status === "shipped") shipment.shippedAt = new Date();
    if (status === "delivered") shipment.deliveredAt = new Date();

    order.recalculateStats();

    // Check if all delivered
    if (order.stats.delivered === order.totalRecipients) {
      order.status = SWAG_ORDER_STATUS.DELIVERED;
      order.completedAt = new Date();
    } else if (order.stats.shipped > 0) {
      order.status = SWAG_ORDER_STATUS.SHIPPED;
    }

    await order.save();
    return order;
  }

  /**
   * Cancel order
   */
  async cancelOrder(organizationId, orderId, reason) {
    const order = await this.getOrder(organizationId, orderId);

    if (["shipped", "delivered", "cancelled"].includes(order.status)) {
      throw new ValidationException("Không thể hủy đơn hàng này");
    }

    order.status = SWAG_ORDER_STATUS.CANCELLED;
    order.recipientShipments.forEach((s) => {
      s.shipmentStatus = SHIPMENT_STATUS.FAILED;
      s.failureReason = reason || "Đơn hàng đã bị hủy";
    });

    await order.save();

    // TODO: Process refund if paid

    Logger.success(`[SwagOrderSvc] Order cancelled: ${order.orderNumber}`);
    return order;
  }

  /**
   * Get order by self-service token (for recipient portal)
   */
  async getOrderBySelfServiceToken(token) {
    const order = await this.swagOrderRepository.findBySelfServiceToken(token);
    if (!order)
      throw new NotFoundException("Token không hợp lệ hoặc đã hết hạn");

    const shipment = order.recipientShipments.find(
      (s) => s.selfServiceToken === token
    );
    if (!shipment) throw new NotFoundException("Không tìm thấy thông tin");

    return { order, shipment };
  }

  /**
   * Complete self-service (recipient fills their info)
   */
  async completeSelfService(token, data) {
    const { order, shipment } = await this.getOrderBySelfServiceToken(token);

    const { shippingAddress, sizeSelections, personalization } = data;

    // Update shipment
    const shipmentIndex = order.recipientShipments.findIndex(
      (s) => s.selfServiceToken === token
    );

    if (shippingAddress) {
      order.recipientShipments[shipmentIndex].shippingAddress = {
        ...order.recipientShipments[shipmentIndex].shippingAddress,
        ...shippingAddress,
      };
    }

    if (sizeSelections) {
      order.recipientShipments[shipmentIndex].sizeSelections = new Map(
        Object.entries(sizeSelections)
      );
    }

    if (personalization) {
      order.recipientShipments[shipmentIndex].personalization = {
        ...order.recipientShipments[shipmentIndex].personalization,
        ...personalization,
      };
    }

    order.recipientShipments[shipmentIndex].selfServiceCompleted = true;
    order.recipientShipments[shipmentIndex].selfServiceCompletedAt = new Date();

    // Check if all completed
    const allCompleted = order.recipientShipments.every(
      (s) => s.selfServiceCompleted
    );
    if (allCompleted && order.status === SWAG_ORDER_STATUS.PENDING_INFO) {
      order.status = SWAG_ORDER_STATUS.DRAFT;
    }

    await order.save();

    Logger.success(
      `[SwagOrderSvc] Self-service completed for token: ${token.substring(
        0,
        8
      )}...`
    );
    return order;
  }

  /**
   * Get dashboard stats
   */
  async getStats(organizationId) {
    const [statusStats, recentOrders] = await Promise.all([
      this.swagOrderRepository.getStats(organizationId),
      this.swagOrderRepository.getRecentOrders(organizationId, 5),
    ]);

    const totalOrders = Object.values(statusStats).reduce(
      (sum, s) => sum + s.count,
      0
    );
    const totalRecipients = Object.values(statusStats).reduce(
      (sum, s) => sum + s.totalRecipients,
      0
    );
    const totalSpent = Object.values(statusStats).reduce(
      (sum, s) => sum + s.totalSpent,
      0
    );

    return {
      totalOrders,
      totalRecipients,
      totalSpent,
      byStatus: statusStats,
      recentOrders,
    };
  }

  /**
   * Resend self-service email
   */
  async resendSelfServiceEmail(organizationId, orderId, recipientId) {
    const order = await this.getOrder(organizationId, orderId);

    const shipment = order.recipientShipments.find(
      (s) => s.recipient.toString() === recipientId
    );
    if (!shipment) throw new NotFoundException("Shipment", recipientId);

    if (shipment.selfServiceCompleted) {
      throw new ValidationException("Người nhận đã hoàn tất thông tin");
    }

    // Regenerate token
    shipment.selfServiceToken = crypto.randomBytes(32).toString("hex");
    shipment.selfServiceExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await order.save();

    // TODO: Send email
    // await emailService.sendSelfServiceEmail(shipment);

    return { success: true, message: "Đã gửi lại email" };
  }
}
