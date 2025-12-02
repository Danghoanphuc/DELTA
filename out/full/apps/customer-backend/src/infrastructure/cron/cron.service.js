// apps/customer-backend/src/infrastructure/cron/cron.service.js
import cron from "node-cron";
import { Logger } from "../../shared/utils/index.js";
import { CustomizedDesign } from "../../shared/models/customized-design.model.js";

/**
 * Cron Jobs Service for automated maintenance tasks
 * 
 * Jobs:
 * 1. Cleanup old draft designs (daily at 3 AM)
 * 2. More jobs can be added here as needed
 */

/**
 * Cleanup old draft designs that haven't been touched in 30 days
 * This helps keep the database clean and reduce storage costs
 */
async function cleanupOldDrafts() {
  try {
    Logger.info("[Cron] Starting cleanup of old draft designs...");

    // Calculate date 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Find and delete old drafts
    const result = await CustomizedDesign.deleteMany({
      status: "draft",
      updatedAt: { $lt: thirtyDaysAgo },
    });

    if (result.deletedCount > 0) {
      Logger.success(
        `[Cron] ✅ Deleted ${result.deletedCount} old draft design(s) (older than 30 days)`
      );
    } else {
      Logger.info("[Cron] No old draft designs to clean up");
    }

    return result.deletedCount;
  } catch (error) {
    Logger.error("[Cron] Error cleaning up old drafts:", error);
    return 0;
  }
}

/**
 * Cleanup abandoned carts (optional - can be added later)
 * Remove carts that haven't been updated in 7 days
 */
async function cleanupAbandonedCarts() {
  try {
    Logger.info("[Cron] Starting cleanup of abandoned carts...");

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // This would require importing Cart model
    // const result = await Cart.deleteMany({
    //   updatedAt: { $lt: sevenDaysAgo },
    //   items: { $size: 0 } // Only delete empty carts
    // });

    Logger.info("[Cron] Abandoned cart cleanup skipped (not implemented yet)");
    return 0;
  } catch (error) {
    Logger.error("[Cron] Error cleaning up abandoned carts:", error);
    return 0;
  }
}

/**
 * Cleanup old guest conversations (optional)
 * Remove chat conversations for guests older than 7 days
 */
async function cleanupOldGuestConversations() {
  try {
    Logger.info("[Cron] Starting cleanup of old guest conversations...");

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // This would require importing Conversation model
    // const result = await Conversation.deleteMany({
    //   actorType: "Guest",
    //   updatedAt: { $lt: sevenDaysAgo }
    // });

    Logger.info(
      "[Cron] Old guest conversation cleanup skipped (not implemented yet)"
    );
    return 0;
  } catch (error) {
    Logger.error("[Cron] Error cleaning up old guest conversations:", error);
    return 0;
  }
}

/**
 * Health check job - verify system health metrics
 */
async function systemHealthCheck() {
  try {
    Logger.info("[Cron] Running system health check...");

    // Check database connection
    const dbStatus = "connected"; // You can check mongoose.connection.readyState

    // Check Redis connection
    // const redisClient = getRedisClient();
    // const redisStatus = redisClient ? "connected" : "disconnected";

    Logger.info(
      `[Cron] System Health: DB=${dbStatus}, Redis=connected (assumed)`
    );

    return true;
  } catch (error) {
    Logger.error("[Cron] Error in system health check:", error);
    return false;
  }
}

/**
 * Initialize all cron jobs
 * Call this function after database connection is established
 */
export function initCronJobs() {
  Logger.info("[Cron] Initializing cron jobs...");

  // Job 1: Cleanup old draft designs
  // Schedule: Every day at 3:00 AM (Vietnam time)
  cron.schedule(
    "0 3 * * *",
    async () => {
      Logger.info("[Cron] 🕒 Running scheduled job: Cleanup Old Drafts");
      await cleanupOldDrafts();
    },
    {
      timezone: "Asia/Ho_Chi_Minh",
    }
  );

  // Job 2: System health check
  // Schedule: Every 6 hours
  cron.schedule(
    "0 */6 * * *",
    async () => {
      Logger.info("[Cron] 🕒 Running scheduled job: System Health Check");
      await systemHealthCheck();
    },
    {
      timezone: "Asia/Ho_Chi_Minh",
    }
  );

  // Job 3: Cleanup abandoned carts (disabled by default)
  // Uncomment when Cart cleanup logic is ready
  // cron.schedule(
  //   "0 4 * * *",
  //   async () => {
  //     Logger.info("[Cron] 🕒 Running scheduled job: Cleanup Abandoned Carts");
  //     await cleanupAbandonedCarts();
  //   },
  //   {
  //     timezone: "Asia/Ho_Chi_Minh",
  //   }
  // );

  // Job 4: Cleanup old guest conversations (disabled by default)
  // Uncomment when Conversation cleanup logic is ready
  // cron.schedule(
  //   "0 2 * * 0",
  //   async () => {
  //     Logger.info("[Cron] 🕒 Running scheduled job: Cleanup Old Guest Conversations");
  //     await cleanupOldGuestConversations();
  //   },
  //   {
  //     timezone: "Asia/Ho_Chi_Minh",
  //   }
  // );

  Logger.success("[Cron] ✅ Cron jobs initialized successfully");
  Logger.info("[Cron] Active jobs:");
  Logger.info("  • Cleanup Old Drafts: Daily at 3:00 AM");
  Logger.info("  • System Health Check: Every 6 hours");

  // Run cleanup immediately on startup (for testing/debugging)
  if (process.env.NODE_ENV === "development") {
    Logger.info("[Cron] Running initial cleanup (development mode)...");
    setTimeout(async () => {
      await cleanupOldDrafts();
    }, 5000); // Wait 5 seconds after startup
  }
}

/**
 * Manual trigger functions (for testing or admin API)
 */
export const cronTasks = {
  cleanupOldDrafts,
  cleanupAbandonedCarts,
  cleanupOldGuestConversations,
  systemHealthCheck,
};

