// @ts-nocheck
import { Queue, Worker, Job } from "bullmq";
import { Logger } from "../shared/utils/logger.js";
import { SwagOrder } from "../models/swag-order.model.js";
import { ProductionOrder } from "../models/production-order.model.js";
import { SupplierRoutingService } from "../services/supplier-routing.service.js";
import { SkuTranslationService } from "../services/sku-translation.service.js";
import { SupplierAdapterFactory } from "../services/suppliers/supplier-adapter.factory.js";
import { AlertService } from "../services/alert.service.js";
import Redis from "ioredis";

/**
 * Order Processor Worker
 *
 * Purpose: Asynchronously process orders after payment
 *
 * Workflow:
 * 1. Get order details
 * 2. Extract order items
 * 3. Route items to suppliers
 * 4. Create production orders
 * 5. Send orders to suppliers via adapters
 * 6. Update order status
 */

// Redis connection
const redisConnection = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  maxRetriesPerRequest: null,
});

// Create queue
export const processOrderQueue = new Queue("process-order", {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
    removeOnComplete: {
      count: 100, // Keep last 100 completed jobs
    },
    removeOnFail: {
      count: 500, // Keep last 500 failed jobs
    },
  },
});

// Job data interface
interface ProcessOrderJobData {
  orderId: string;
  orderNumber: string;
}

/**
 * Add order to processing queue
 * @param orderId - Order ID
 * @param orderNumber - Order number
 */
export async function addOrderToQueue(orderId: string, orderNumber: string) {
  await processOrderQueue.add(
    "process",
    {
      orderId,
      orderNumber,
    },
    {
      jobId: `order-${orderId}`, // Prevent duplicate jobs
    }
  );

  Logger.info(
    `[OrderProcessor] Added order ${orderNumber} to processing queue`
  );
}

/**
 * Process order job
 * @param job - BullMQ job
 */
async function processOrderJob(job: Job<ProcessOrderJobData>) {
  const { orderId, orderNumber } = job.data;

  Logger.info(`[OrderProcessor] Processing order: ${orderNumber}`);

  try {
    // 1. Get order details
    const order = await SwagOrder.findById(orderId).populate(
      "packSnapshot.items.product"
    );

    if (!order) {
      throw new Error(`Order not found: ${orderId}`);
    }

    Logger.debug(
      `[OrderProcessor] Order ${orderNumber} has ${order.packSnapshot.items.length} items`
    );

    // 2. Extract order items
    const orderItems = order.packSnapshot.items.map((item) => ({
      sku: item.sku,
      skuVariantId: item.variantId,
      quantity: item.quantity,
      productName: item.name,
    }));

    // 3. Route to suppliers
    const translationService = new SkuTranslationService();
    const adapterFactory = new SupplierAdapterFactory();
    const routingService = new SupplierRoutingService(
      translationService,
      adapterFactory
    );

    const routingPlan = await routingService.routeOrder(orderItems);

    // 4. Check for unroutable items
    if (routingPlan.unroutableItems.length > 0) {
      Logger.error(
        `[OrderProcessor] Unroutable items:`,
        routingPlan.unroutableItems
      );

      // Send alert to admin
      const alertService = new AlertService();
      await alertService.sendUnroutableItemsAlert(
        order,
        routingPlan.unroutableItems
      );

      throw new Error(
        `Cannot route ${routingPlan.unroutableItems.length} items to suppliers`
      );
    }

    // 5. Create production orders for each supplier
    const productionOrders: any[] = [];

    for (const [supplierId, route] of routingPlan.routes) {
      Logger.info(
        `[OrderProcessor] Creating production order for supplier: ${route.supplierName}`
      );

      const productionOrder = await ProductionOrder.create({
        swagOrderId: order._id,
        swagOrderNumber: order.orderNumber,
        supplierId: supplierId,
        supplierName: route.supplierName,
        items: route.items.map((item) => ({
          skuVariantId: item.skuVariantId,
          sku: item.internalSku,
          supplierSku: item.supplierSku,
          quantity: item.quantity,
          unitCost: item.cost,
          totalCost: item.cost * item.quantity,
        })),
        status: "pending",
        estimatedCost: route.items.reduce(
          (sum, item) => sum + item.cost * item.quantity,
          0
        ),
      });

      productionOrders.push(productionOrder);

      // 6. Send order to supplier via adapter
      try {
        const adapter = SupplierAdapterFactory.create(route.supplierName);

        const supplierOrder = await adapter.createOrder({
          items: route.items.map((item) => ({
            sku: item.supplierSku,
            quantity: item.quantity,
          })),
          shippingAddress: order.shippingAddress || {},
          deadline: order.expectedDeliveryDate,
        });

        productionOrder.supplierOrderId = supplierOrder.id;
        productionOrder.status = "confirmed";
        await productionOrder.save();

        Logger.success(
          `[OrderProcessor] Created supplier order: ${supplierOrder.id}`
        );
      } catch (error) {
        Logger.error(
          `[OrderProcessor] Failed to create supplier order:`,
          error
        );
        productionOrder.status = "failed";
        await productionOrder.save();
        throw error;
      }
    }

    // 7. Update swag order status
    order.production = order.production || {};
    order.production.productionOrders = productionOrders.map((po) => po._id);
    order.production.status = "in_production";
    order.production.startedAt = new Date();
    order.status = "awaiting_shipment";
    await order.save();

    Logger.success(
      `[OrderProcessor] Order ${orderNumber} processed successfully`
    );

    return {
      success: true,
      productionOrders: productionOrders.length,
    };
  } catch (error) {
    Logger.error(
      `[OrderProcessor] Failed to process order ${orderNumber}:`,
      error
    );
    throw error;
  }
}

// Create worker
export const orderProcessorWorker = new Worker<ProcessOrderJobData>(
  "process-order",
  processOrderJob,
  {
    connection: redisConnection,
    concurrency: 5, // Process 5 orders concurrently
  }
);

// Event handlers
orderProcessorWorker.on("completed", (job) => {
  Logger.success(`[OrderProcessor] Job ${job.id} completed successfully`);
});

orderProcessorWorker.on("failed", (job, error) => {
  Logger.error(`[OrderProcessor] Job ${job?.id} failed:`, error);

  // Send alert to admin
  const alertService = new AlertService();
  alertService.sendOrderProcessingFailedAlert(
    job?.data.orderId || "unknown",
    error
  );
});

orderProcessorWorker.on("error", (error) => {
  Logger.error(`[OrderProcessor] Worker error:`, error);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  Logger.info("[OrderProcessor] Shutting down worker...");
  await orderProcessorWorker.close();
  await redisConnection.quit();
  process.exit(0);
});

Logger.info("[OrderProcessor] Worker started");
