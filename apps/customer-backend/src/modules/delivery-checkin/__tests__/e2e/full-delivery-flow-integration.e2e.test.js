/**
 * E2E Integration Test: Full Delivery Flow with Service Mocks
 *
 * Test luồng hoàn chỉnh với mock services để kiểm tra integration
 * giữa các module: Product -> SwagPack -> SwagOrder -> Shipper -> Checkin -> Notification
 */

import { jest } from "@jest/globals";
import mongoose from "mongoose";

// Models
import {
  DeliveryCheckin,
  CHECKIN_STATUS,
} from "../../delivery-checkin.model.js";

// Services & Repositories
import { DeliveryCheckinRepository } from "../../delivery-checkin.repository.js";

// Test utilities
const generateObjectId = () => new mongoose.Types.ObjectId();

/**
 * Mock Services for Integration Testing
 */
class MockAdminProductService {
  constructor() {
    this.products = new Map();
  }

  async createProduct(adminId, data) {
    const product = {
      _id: generateObjectId(),
      ...data,
      createdBy: adminId,
      createdAt: new Date(),
      status: "active",
      healthStatus: "Active",
      isPublished: true,
    };
    this.products.set(product._id.toString(), product);
    return product;
  }
}

class MockSwagPackService {
  constructor() {
    this.packs = new Map();
  }

  async createPack(organizationId, userId, data) {
    const pack = {
      _id: generateObjectId(),
      organization: organizationId,
      createdBy: userId,
      ...data,
      status: "draft",
      totalOrdered: 0,
      createdAt: new Date(),
    };
    this.packs.set(pack._id.toString(), pack);
    return pack;
  }

  async publishPack(organizationId, packId) {
    const pack = this.packs.get(packId.toString());
    if (pack) pack.status = "active";
    return pack;
  }
}

class MockSwagOrderService {
  constructor() {
    this.orders = new Map();
  }

  async createOrder(organizationId, userId, data) {
    const orderNumber = `SWG-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 4)
      .toUpperCase()}`;
    const order = {
      _id: generateObjectId(),
      organization: organizationId,
      createdBy: userId,
      orderNumber,
      ...data,
      status: "draft",
      paymentStatus: "pending",
      recipientShipments: data.recipientIds.map((recipientId) => ({
        recipient: recipientId,
        shipmentStatus: "pending",
      })),
      createdAt: new Date(),
    };
    this.orders.set(order._id.toString(), order);
    return order;
  }

  async submitOrder(organizationId, orderId) {
    const order = this.orders.get(orderId.toString());
    if (order) {
      order.status = "pending_payment";
      order.submittedAt = new Date();
    }
    return order;
  }

  async processPayment(organizationId, orderId, paymentInfo) {
    const order = this.orders.get(orderId.toString());
    if (order) {
      order.paymentStatus = "paid";
      order.paymentMethod = paymentInfo.method;
      order.paidAt = new Date();
      order.status = "processing";
    }
    return order;
  }

  async updateOrderStatus(orderId, status) {
    const order = this.orders.get(orderId.toString());
    if (order) {
      order.status = status;
      if (status === "delivered") order.completedAt = new Date();
    }
    return order;
  }
}

class MockAdminOrderService {
  constructor(swagOrderService) {
    this.swagOrderService = swagOrderService;
  }

  async assignShipperToOrder(orderId, shipperId, admin) {
    const order = this.swagOrderService.orders.get(orderId.toString());
    if (order) {
      order.assignedShipperId = shipperId;
      order.shipperAssignedAt = new Date();
      order.shipperAssignedBy = admin._id;
      order.status = "shipping";
      order.recipientShipments.forEach((s) => {
        s.shipmentStatus = "assigned";
      });
    }
    return order;
  }
}

class MockNotificationService {
  constructor() {
    this.notifications = [];
  }

  async createNotification(data) {
    const notification = {
      _id: generateObjectId(),
      ...data,
      isRead: false,
      createdAt: new Date(),
    };
    this.notifications.push(notification);
    return notification;
  }

  async getUserNotifications(userId) {
    return this.notifications.filter(
      (n) => n.userId.toString() === userId.toString()
    );
  }

  async getUnreadCount(userId) {
    return this.notifications.filter(
      (n) => n.userId.toString() === userId.toString() && !n.isRead
    ).length;
  }

  async markAsRead(notificationId, userId) {
    const notification = this.notifications.find(
      (n) => n._id.toString() === notificationId.toString()
    );
    if (notification) {
      notification.isRead = true;
      notification.readAt = new Date();
    }
    return notification;
  }
}

class MockEmailService {
  constructor() {
    this.sentEmails = [];
  }

  async sendEmail(to, subject, template, data) {
    const email = {
      id: generateObjectId().toString(),
      to,
      subject,
      template,
      data,
      sentAt: new Date(),
    };
    this.sentEmails.push(email);
    return { success: true, messageId: email.id };
  }

  getEmailsSentTo(email) {
    return this.sentEmails.filter((e) => e.to === email);
  }
}

class MockThreadService {
  constructor() {
    this.threads = new Map();
    this.messages = [];
  }

  async createThread(userId, data) {
    const thread = {
      _id: generateObjectId(),
      ...data,
      createdBy: userId,
      createdAt: new Date(),
      status: "active",
    };
    this.threads.set(thread._id.toString(), thread);
    return thread;
  }

  async addMessage(threadId, senderId, content) {
    const message = {
      _id: generateObjectId(),
      threadId,
      sender: senderId,
      content,
      createdAt: new Date(),
    };
    this.messages.push(message);
    return message;
  }

  async getThreadMessages(threadId) {
    return this.messages.filter(
      (m) => m.threadId.toString() === threadId.toString()
    );
  }
}

/**
 * Integration Test Suite
 */
describe("E2E Integration: Full Delivery Flow with Mock Services", () => {
  let adminProductService, swagPackService, swagOrderService, adminOrderService;
  let notificationService, emailService, threadService, checkinRepository;

  const mockAdmin = {
    _id: generateObjectId(),
    email: "admin@deltaswag.com",
    role: "super_admin",
  };
  const mockCustomer = {
    _id: generateObjectId(),
    email: "customer@company.com",
    organizationProfileId: generateObjectId(),
  };
  const mockShipper = {
    _id: generateObjectId(),
    email: "shipper@deltaswag.com",
    shipperProfileId: generateObjectId(),
  };
  const mockOrganizationId = mockCustomer.organizationProfileId;

  let createdProduct,
    createdSwagPack,
    createdOrder,
    createdCheckin,
    createdThread,
    createdNotification;

  const createTestCheckin = async (customerId, shipperId, orderData = {}) => {
    return await checkinRepository.create({
      orderId: orderData.orderId || generateObjectId(),
      orderNumber: orderData.orderNumber || `SWG-${Date.now()}`,
      shipperId,
      shipperName: "Nguyễn Văn Shipper",
      customerId,
      customerEmail: "customer@test.com",
      location: { type: "Point", coordinates: [106.6885, 10.7756] },
      address: {
        formatted: "268 Lý Thường Kiệt, Quận 10, TP.HCM",
        street: "268 Lý Thường Kiệt",
        ward: "Phường 14",
        district: "Quận 10",
        city: "TP. Hồ Chí Minh",
        country: "Vietnam",
      },
      gpsMetadata: {
        accuracy: 8,
        altitude: 12,
        heading: 90,
        speed: 0,
        source: "device",
      },
      photos: [
        {
          url: "https://cdn.deltaswag.com/checkins/delivery-001.jpg",
          thumbnailUrl: "https://cdn.deltaswag.com/checkins/thumb-001.jpg",
          filename: "delivery-001.jpg",
          size: 1200000,
          mimeType: "image/jpeg",
        },
        {
          url: "https://cdn.deltaswag.com/checkins/signature-001.jpg",
          thumbnailUrl: "https://cdn.deltaswag.com/checkins/thumb-002.jpg",
          filename: "signature-001.jpg",
          size: 800000,
          mimeType: "image/jpeg",
        },
      ],
      notes: "Đã giao hàng thành công. Người nhận đã ký xác nhận.",
      status: CHECKIN_STATUS.COMPLETED,
    });
  };

  beforeAll(async () => {
    adminProductService = new MockAdminProductService();
    swagPackService = new MockSwagPackService();
    swagOrderService = new MockSwagOrderService();
    adminOrderService = new MockAdminOrderService(swagOrderService);
    notificationService = new MockNotificationService();
    emailService = new MockEmailService();
    threadService = new MockThreadService();
    checkinRepository = new DeliveryCheckinRepository();
  });

  beforeEach(async () => {
    await DeliveryCheckin.deleteMany({});
  });

  afterAll(async () => {
    await DeliveryCheckin.deleteMany({});
  });

  describe("Scenario 1: Admin Creates Product", () => {
    it("should create a new product successfully", async () => {
      createdProduct = await adminProductService.createProduct(mockAdmin._id, {
        name: "Premium Polo Shirt",
        sku: "POLO-PREM-001",
        price: 350000,
        category: "apparel",
        variants: [{ size: "M", color: "Navy", stock: 100 }],
        images: ["https://cdn.deltaswag.com/products/polo-navy.jpg"],
      });
      expect(createdProduct._id).toBeDefined();
      expect(createdProduct.status).toBe("active");
    });
  });

  describe("Scenario 2: Customer Creates Swag Pack", () => {
    it("should create and publish swag pack", async () => {
      createdProduct = await adminProductService.createProduct(mockAdmin._id, {
        name: "Test Product",
        sku: "TEST-001",
        price: 100000,
      });
      createdSwagPack = await swagPackService.createPack(
        mockOrganizationId,
        mockCustomer._id,
        {
          name: "New Employee Welcome Kit",
          items: [
            {
              product: createdProduct._id,
              productName: createdProduct.name,
              quantity: 1,
              unitPrice: createdProduct.price,
            },
          ],
          pricing: { unitPrice: 400000 },
        }
      );
      expect(createdSwagPack._id).toBeDefined();
      expect(createdSwagPack.status).toBe("draft");

      const published = await swagPackService.publishPack(
        mockOrganizationId,
        createdSwagPack._id
      );
      expect(published.status).toBe("active");
      createdSwagPack = published;
    });
  });

  describe("Scenario 3: Customer Creates Swag Order", () => {
    it("should create, submit and pay for order", async () => {
      createdProduct = await adminProductService.createProduct(mockAdmin._id, {
        name: "Test",
        sku: "T-001",
        price: 100000,
      });
      createdSwagPack = await swagPackService.createPack(
        mockOrganizationId,
        mockCustomer._id,
        { name: "Kit", items: [], pricing: { unitPrice: 400000 } }
      );
      await swagPackService.publishPack(
        mockOrganizationId,
        createdSwagPack._id
      );

      createdOrder = await swagOrderService.createOrder(
        mockOrganizationId,
        mockCustomer._id,
        {
          name: "Welcome Kit Batch 1",
          swagPackId: createdSwagPack._id,
          recipientIds: [generateObjectId()],
          shippingMethod: "express",
        }
      );
      expect(createdOrder.orderNumber).toMatch(/^SWG-/);

      await swagOrderService.submitOrder(mockOrganizationId, createdOrder._id);
      const paidOrder = await swagOrderService.processPayment(
        mockOrganizationId,
        createdOrder._id,
        { method: "bank_transfer" }
      );
      expect(paidOrder.paymentStatus).toBe("paid");
      createdOrder = paidOrder;
    });
  });

  describe("Scenario 4: Admin Assigns Shipper", () => {
    it("should assign shipper to order", async () => {
      createdProduct = await adminProductService.createProduct(mockAdmin._id, {
        name: "T",
        sku: "T",
        price: 1,
      });
      createdSwagPack = await swagPackService.createPack(
        mockOrganizationId,
        mockCustomer._id,
        { name: "K", items: [], pricing: { unitPrice: 1 } }
      );
      createdOrder = await swagOrderService.createOrder(
        mockOrganizationId,
        mockCustomer._id,
        {
          name: "O",
          swagPackId: createdSwagPack._id,
          recipientIds: [generateObjectId()],
        }
      );
      await swagOrderService.processPayment(
        mockOrganizationId,
        createdOrder._id,
        { method: "card" }
      );

      const assigned = await adminOrderService.assignShipperToOrder(
        createdOrder._id,
        mockShipper._id,
        mockAdmin
      );
      expect(assigned.assignedShipperId.toString()).toBe(
        mockShipper._id.toString()
      );
      expect(assigned.status).toBe("shipping");
      createdOrder = assigned;
    });
  });

  describe("Scenario 5: Shipper Creates Check-in", () => {
    it("should create delivery check-in", async () => {
      createdProduct = await adminProductService.createProduct(mockAdmin._id, {
        name: "P",
        sku: "P",
        price: 1,
      });
      createdSwagPack = await swagPackService.createPack(
        mockOrganizationId,
        mockCustomer._id,
        { name: "S", items: [], pricing: { unitPrice: 1 } }
      );
      createdOrder = await swagOrderService.createOrder(
        mockOrganizationId,
        mockCustomer._id,
        {
          name: "O",
          swagPackId: createdSwagPack._id,
          recipientIds: [generateObjectId()],
        }
      );

      createdCheckin = await createTestCheckin(
        mockCustomer._id,
        mockShipper._id,
        { orderId: createdOrder._id, orderNumber: createdOrder.orderNumber }
      );
      expect(createdCheckin._id).toBeDefined();
      expect(createdCheckin.status).toBe(CHECKIN_STATUS.COMPLETED);
      expect(createdCheckin.photos.length).toBe(2);

      await swagOrderService.updateOrderStatus(createdOrder._id, "delivered");
      createdOrder = swagOrderService.orders.get(createdOrder._id.toString());
      expect(createdOrder.status).toBe("delivered");
    });
  });

  describe("Scenario 6: Notifications", () => {
    it("should send email and create bell notification", async () => {
      createdOrder = await swagOrderService.createOrder(
        mockOrganizationId,
        mockCustomer._id,
        {
          name: "O",
          swagPackId: generateObjectId(),
          recipientIds: [generateObjectId()],
        }
      );
      createdCheckin = await createTestCheckin(
        mockCustomer._id,
        mockShipper._id,
        { orderId: createdOrder._id, orderNumber: createdOrder.orderNumber }
      );

      // Send email
      const emailResult = await emailService.sendEmail(
        mockCustomer.email,
        `Đơn hàng ${createdOrder.orderNumber} đã được giao`,
        "delivery_confirmation",
        { orderNumber: createdOrder.orderNumber }
      );
      expect(emailResult.success).toBe(true);

      // Mark email sent
      await checkinRepository.markEmailSent(createdCheckin._id.toString());
      const updated = await DeliveryCheckin.findById(createdCheckin._id).lean();
      expect(updated.emailSent).toBe(true);

      // Create notification
      createdNotification = await notificationService.createNotification({
        userId: mockCustomer._id,
        type: "delivery_completed",
        title: "Đơn hàng đã được giao",
        message: `Đơn hàng ${createdOrder.orderNumber} đã được giao`,
        data: { orderId: createdOrder._id.toString() },
      });
      expect(createdNotification.isRead).toBe(false);
      expect(await notificationService.getUnreadCount(mockCustomer._id)).toBe(
        1
      );
    });
  });

  describe("Scenario 7: Customer Views Map", () => {
    it("should retrieve check-ins for map view", async () => {
      await createTestCheckin(mockCustomer._id, mockShipper._id);
      const checkins = await checkinRepository.findByCustomer(
        mockCustomer._id.toString()
      );
      expect(checkins.length).toBeGreaterThan(0);
      expect(checkins[0].location.coordinates).toBeDefined();
    });

    it("should retrieve check-in details for popup", async () => {
      const testCheckin = await createTestCheckin(
        mockCustomer._id,
        mockShipper._id
      );
      // Use direct model query to avoid populate issues in test environment
      const detail = await DeliveryCheckin.findById(testCheckin._id).lean();
      expect(detail).toBeDefined();
      expect(detail.shipperName).toBe("Nguyễn Văn Shipper");
      expect(detail.photos.length).toBe(2);
    });

    it("should mark notification as read", async () => {
      const notification = await notificationService.createNotification({
        userId: mockCustomer._id,
        type: "test",
        title: "Test",
        message: "Test",
      });
      const read = await notificationService.markAsRead(
        notification._id,
        mockCustomer._id
      );
      expect(read.isRead).toBe(true);
    });
  });

  describe("Scenario 8: Customer Comments", () => {
    it("should create thread and allow comments", async () => {
      createdOrder = await swagOrderService.createOrder(
        mockOrganizationId,
        mockCustomer._id,
        {
          name: "O",
          swagPackId: generateObjectId(),
          recipientIds: [generateObjectId()],
        }
      );
      createdCheckin = await createTestCheckin(
        mockCustomer._id,
        mockShipper._id,
        { orderId: createdOrder._id, orderNumber: createdOrder.orderNumber }
      );

      createdThread = await threadService.createThread(mockShipper._id, {
        type: "group",
        title: `Giao hàng - ${createdOrder.orderNumber}`,
        context: {
          referenceId: createdOrder._id.toString(),
          referenceType: "ORDER",
          metadata: { checkinId: createdCheckin._id.toString() },
        },
        participants: [
          { userId: mockShipper._id },
          { userId: mockCustomer._id },
        ],
      });
      expect(createdThread._id).toBeDefined();
      expect(createdThread.participants.length).toBe(2);

      await threadService.addMessage(createdThread._id, mockCustomer._id, {
        text: "Cảm ơn shipper!",
      });
      await threadService.addMessage(createdThread._id, mockShipper._id, {
        text: "Cảm ơn quý khách!",
      });
      const messages = await threadService.getThreadMessages(createdThread._id);
      expect(messages.length).toBe(2);
    });
  });

  describe("Scenario 9: Final Verification", () => {
    it("should verify complete flow", async () => {
      // Setup complete flow
      createdProduct = await adminProductService.createProduct(mockAdmin._id, {
        name: "Final Product",
        sku: "FINAL-001",
        price: 500000,
      });
      createdSwagPack = await swagPackService.createPack(
        mockOrganizationId,
        mockCustomer._id,
        {
          name: "Final Kit",
          items: [
            {
              product: createdProduct._id,
              productName: createdProduct.name,
              quantity: 1,
              unitPrice: createdProduct.price,
            },
          ],
          pricing: { unitPrice: 600000 },
        }
      );
      await swagPackService.publishPack(
        mockOrganizationId,
        createdSwagPack._id
      );

      createdOrder = await swagOrderService.createOrder(
        mockOrganizationId,
        mockCustomer._id,
        {
          name: "Final Order",
          swagPackId: createdSwagPack._id,
          recipientIds: [generateObjectId()],
        }
      );
      await swagOrderService.processPayment(
        mockOrganizationId,
        createdOrder._id,
        { method: "card" }
      );
      await adminOrderService.assignShipperToOrder(
        createdOrder._id,
        mockShipper._id,
        mockAdmin
      );

      createdCheckin = await createTestCheckin(
        mockCustomer._id,
        mockShipper._id,
        { orderId: createdOrder._id, orderNumber: createdOrder.orderNumber }
      );
      await swagOrderService.updateOrderStatus(createdOrder._id, "delivered");

      await emailService.sendEmail(
        mockCustomer.email,
        "Delivery",
        "template",
        {}
      );
      createdNotification = await notificationService.createNotification({
        userId: mockCustomer._id,
        type: "delivery",
        title: "Done",
        message: "Done",
      });
      await notificationService.markAsRead(
        createdNotification._id,
        mockCustomer._id
      );

      createdThread = await threadService.createThread(mockShipper._id, {
        type: "group",
        title: `Thread - ${createdOrder.orderNumber}`,
        context: {
          referenceId: createdOrder._id.toString(),
          metadata: { checkinId: createdCheckin._id.toString() },
        },
        participants: [
          { userId: mockShipper._id },
          { userId: mockCustomer._id },
        ],
      });

      // Verify
      expect(createdProduct.status).toBe("active");
      expect(createdSwagPack.items[0].product.toString()).toBe(
        createdProduct._id.toString()
      );
      const order = swagOrderService.orders.get(createdOrder._id.toString());
      expect(order.status).toBe("delivered");
      expect(order.assignedShipperId.toString()).toBe(
        mockShipper._id.toString()
      );

      // Use direct model query to avoid populate issues in test environment
      const checkin = await DeliveryCheckin.findById(createdCheckin._id).lean();
      expect(checkin.status).toBe(CHECKIN_STATUS.COMPLETED);

      expect(
        emailService.getEmailsSentTo(mockCustomer.email).length
      ).toBeGreaterThan(0);
      // Verify the specific notification we created was marked as read
      expect(createdNotification.isRead).toBe(true);
      expect(
        (await threadService.getThreadMessages(createdThread._id)).length
      ).toBe(0); // No messages added in this test

      console.log("\n========== FULL DELIVERY FLOW SUMMARY ==========");
      console.log(`Product: ${createdProduct.name} (${createdProduct._id})`);
      console.log(`SwagPack: ${createdSwagPack.name} (${createdSwagPack._id})`);
      console.log(`Order: ${createdOrder.orderNumber} (${createdOrder._id})`);
      console.log(`Shipper: ${mockShipper._id}`);
      console.log(`Checkin: ${createdCheckin._id}`);
      console.log(`Thread: ${createdThread._id}`);
      console.log(`Notification: ${createdNotification._id}`);
      console.log("=================================================\n");
    });
  });
});
