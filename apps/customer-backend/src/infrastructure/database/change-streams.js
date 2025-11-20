// apps/customer-backend/src/infrastructure/database/change-streams.js
import { MasterOrder } from "../../shared/models/master-order.model.js";
import { socketService } from "../realtime/socket.service.js";
import { Logger } from "../../shared/utils/index.js";
import { notificationService } from "../../modules/notifications/notification.service.js";

/**
 * Initialize MongoDB Change Streams for real-time notifications
 * 
 * Watches:
 * - Insert operations: New orders → Notify printers
 * - Update operations: Status changes → Notify customers
 */
export function initChangeStreams() {
  try {
    // ✅ Watch MasterOrder collection for all changes
    const changeStream = MasterOrder.watch(
      [
        {
          $match: {
            $or: [
              { operationType: "insert" }, // New orders
              { operationType: "update" }, // Status updates
              { operationType: "replace" }, // Full document replacement
            ],
          },
        },
      ],
      {
        fullDocument: "updateLookup", // Include full document in updates
      }
    );

    Logger.success("[ChangeStreams] MongoDB Change Streams initialized");

    // ✅ Handle change events
    changeStream.on("change", async (change) => {
      try {
        await handleOrderChange(change);
      } catch (error) {
        Logger.error("[ChangeStreams] Error handling change event:", error);
      }
    });

    // ✅ Handle errors
    changeStream.on("error", (error) => {
      Logger.error("[ChangeStreams] Change stream error:", error);
      
      // Attempt to reconnect after a delay
      setTimeout(() => {
        Logger.info("[ChangeStreams] Attempting to reconnect...");
        initChangeStreams();
      }, 5000);
    });

    // ✅ Handle stream close
    changeStream.on("close", () => {
      Logger.warn("[ChangeStreams] Change stream closed");
    });

    return changeStream;
  } catch (error) {
    Logger.error("[ChangeStreams] Failed to initialize change streams:", error);
    throw error;
  }
}

/**
 * Handle order change events
 * @param {object} change - Change stream event
 */
async function handleOrderChange(change) {
  const { operationType, fullDocument, documentKey } = change;

  Logger.info(
    `[ChangeStreams] Detected ${operationType} on order: ${documentKey?._id}`
  );

  switch (operationType) {
    case "insert":
      await handleNewOrder(fullDocument);
      break;
    case "update":
    case "replace":
      await handleOrderUpdate(change);
      break;
    default:
      Logger.warn(`[ChangeStreams] Unhandled operation type: ${operationType}`);
  }
}

/**
 * Handle new order insertion
 * Notify all printers involved in the order
 * @param {object} order - Full order document
 */
async function handleNewOrder(order) {
  if (!order || !order.printerOrders || order.printerOrders.length === 0) {
    Logger.warn("[ChangeStreams] New order has no printer orders");
    return;
  }

  Logger.info(
    `[ChangeStreams] 🎉 New order created: ${order.orderNumber} (${order.printerOrders.length} printer(s))`
  );

  // Notify each printer involved in the order
  for (const printerOrder of order.printerOrders) {
    const printerProfileId = printerOrder.printerProfileId.toString();

    // Count items for this printer
    const itemsCount = printerOrder.items.length;
    const totalQuantity = printerOrder.items.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    // Build notification payload
    const notification = {
      type: "new_order",
      orderNumber: order.orderNumber,
      orderId: order._id.toString(),
      customerName: order.customerName,
      totalAmount: printerOrder.printerTotalPrice,
      itemsCount: itemsCount,
      totalQuantity: totalQuantity,
      printerPayout: printerOrder.printerPayout,
      items: printerOrder.items.map((item) => ({
        productName: item.productName,
        quantity: item.quantity,
        thumbnailUrl: item.thumbnailUrl,
      })),
      createdAt: order.createdAt || new Date().toISOString(),
      shippingAddress: {
        city: order.shippingAddress.city,
        district: order.shippingAddress.district,
      },
    };

    // Emit to printer's room
    socketService.emitToPrinter(
      printerProfileId,
      "printer:new_order",
      notification
    );

    Logger.info(
      `[ChangeStreams] 📢 Notified printer ${printerProfileId} about order ${order.orderNumber}`
    );
  }

  // ✅ SAVE NOTIFICATION TO DB: Customer order created
  try {
    await notificationService.createOrderNotification(
      order.customerId.toString(),
      "order_created",
      "🎉 Đơn hàng đã được tạo",
      `Đơn hàng #${order.orderNumber} đã được tạo thành công với ${order.totalItems} sản phẩm`,
      {
        orderId: order._id.toString(),
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        link: `/orders/${order._id}`,
      }
    );
  } catch (error) {
    Logger.error("[ChangeStreams] Error creating notification:", error);
  }

  // Also notify the customer that their order was created (real-time)
  const customerNotification = {
    type: "order_created",
    orderNumber: order.orderNumber,
    orderId: order._id.toString(),
    totalAmount: order.totalAmount,
    totalItems: order.totalItems,
    masterStatus: order.masterStatus,
    paymentStatus: order.paymentStatus,
    createdAt: order.createdAt || new Date().toISOString(),
  };

  socketService.emitToUser(
    order.customerId.toString(),
    "customer:order_created",
    customerNotification
  );

  Logger.info(
    `[ChangeStreams] 📢 Notified customer ${order.customerId} about their new order ${order.orderNumber}`
  );
}

/**
 * Handle order updates
 * Notify customer when order status changes
 * @param {object} change - Change event
 */
async function handleOrderUpdate(change) {
  const { fullDocument, updateDescription } = change;

  if (!fullDocument) {
    Logger.warn("[ChangeStreams] Update event missing fullDocument");
    return;
  }

  // Check if important fields were updated
  const updatedFields = updateDescription?.updatedFields || {};
  const hasStatusChange =
    "masterStatus" in updatedFields ||
    "paymentStatus" in updatedFields ||
    Object.keys(updatedFields).some(
      (key) =>
        key.startsWith("printerOrders.") && key.includes(".printerStatus")
    );

  if (!hasStatusChange) {
    // Not a status update, ignore
    return;
  }

  Logger.info(
    `[ChangeStreams] 📝 Order status updated: ${fullDocument.orderNumber}`
  );

  // Build notification for customer
  const notification = {
    type: "order_update",
    orderNumber: fullDocument.orderNumber,
    orderId: fullDocument._id.toString(),
    masterStatus: fullDocument.masterStatus,
    paymentStatus: fullDocument.paymentStatus,
    updatedAt: new Date().toISOString(),
    changes: {},
  };

  // Detect what changed
  if ("masterStatus" in updatedFields) {
    notification.changes.masterStatus = {
      newValue: fullDocument.masterStatus,
    };
  }

  if ("paymentStatus" in updatedFields) {
    notification.changes.paymentStatus = {
      newValue: fullDocument.paymentStatus,
    };
  }

  // Check for printer order status changes
  const printerStatusChanges = [];
  for (const [key, value] of Object.entries(updatedFields)) {
    if (key.includes("printerOrders") && key.includes("printerStatus")) {
      // Extract printer index from key like "printerOrders.0.printerStatus"
      const match = key.match(/printerOrders\.(\d+)\.printerStatus/);
      if (match) {
        const index = parseInt(match[1]);
        const printerOrder = fullDocument.printerOrders[index];
        if (printerOrder) {
          printerStatusChanges.push({
            printerBusinessName: printerOrder.printerBusinessName,
            status: value,
          });
        }
      }
    }
  }

  if (printerStatusChanges.length > 0) {
    notification.changes.printerStatuses = printerStatusChanges;
  }

  // ✅ SAVE NOTIFICATION TO DB: Order status update
  try {
    // Determine notification title and message based on status
    let title = "📦 Đơn hàng cập nhật";
    let message = `Đơn hàng #${fullDocument.orderNumber} đã được cập nhật`;
    let notificationType = "order_update";

    if (notification.changes?.paymentStatus?.newValue === "paid") {
      title = "✅ Thanh toán thành công";
      message = `Đơn hàng #${fullDocument.orderNumber} đã được thanh toán thành công`;
      notificationType = "payment_confirmed";
    } else if (notification.changes?.masterStatus?.newValue === "shipping") {
      title = "🚚 Đang giao hàng";
      message = `Đơn hàng #${fullDocument.orderNumber} đang trên đường giao đến bạn`;
      notificationType = "order_shipped";
    } else if (notification.changes?.masterStatus?.newValue === "completed") {
      title = "🎉 Hoàn thành";
      message = `Đơn hàng #${fullDocument.orderNumber} đã được giao thành công`;
      notificationType = "order_completed";
    } else if (notification.changes?.masterStatus?.newValue === "cancelled") {
      title = "❌ Đã hủy";
      message = `Đơn hàng #${fullDocument.orderNumber} đã bị hủy`;
      notificationType = "order_cancelled";
    }

    await notificationService.createOrderNotification(
      fullDocument.customerId.toString(),
      notificationType,
      title,
      message,
      {
        orderId: fullDocument._id.toString(),
        orderNumber: fullDocument.orderNumber,
        masterStatus: fullDocument.masterStatus,
        paymentStatus: fullDocument.paymentStatus,
        link: `/orders/${fullDocument._id}`,
      }
    );
  } catch (error) {
    Logger.error("[ChangeStreams] Error creating notification:", error);
  }

  // Emit to customer (real-time)
  socketService.emitToUser(
    fullDocument.customerId.toString(),
    "customer:order_update",
    notification
  );

  Logger.info(
    `[ChangeStreams] 📢 Notified customer ${fullDocument.customerId} about order update: ${fullDocument.orderNumber}`
  );

  // ✅ BONUS: Notify printers when customer-facing status changes
  // (e.g., payment confirmed, order cancelled by customer)
  if ("masterStatus" in updatedFields || "paymentStatus" in updatedFields) {
    for (const printerOrder of fullDocument.printerOrders || []) {
      const printerProfileId = printerOrder.printerProfileId.toString();

      const printerNotification = {
        type: "order_status_changed",
        orderNumber: fullDocument.orderNumber,
        orderId: fullDocument._id.toString(),
        masterStatus: fullDocument.masterStatus,
        paymentStatus: fullDocument.paymentStatus,
        printerStatus: printerOrder.printerStatus,
        updatedAt: new Date().toISOString(),
      };

      socketService.emitToPrinter(
        printerProfileId,
        "printer:order_update",
        printerNotification
      );
    }
  }
}

/**
 * Gracefully close change streams
 * @param {ChangeStream} changeStream
 */
export async function closeChangeStreams(changeStream) {
  if (changeStream) {
    try {
      await changeStream.close();
      Logger.info("[ChangeStreams] Change streams closed gracefully");
    } catch (error) {
      Logger.error("[ChangeStreams] Error closing change streams:", error);
    }
  }
}

