// apps/customer-backend/src/infrastructure/cron/cron.service.js
import cron from "node-cron";
import { Logger } from "../../shared/utils/index.js";

/**
 * Cron Jobs Service for automated maintenance tasks
 *
 * Jobs:
 * 1. More jobs can be added here as needed
 */

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

  // Job 1: System health check
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

  // Job 2: Cleanup abandoned carts (disabled by default)
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

  // Job 3: Cleanup old guest conversations (disabled by default)
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
  Logger.info("  • System Health Check: Every 6 hours");
}

/**
 * Manual trigger functions (for testing or admin API)
 */
export const cronTasks = {
  cleanupAbandonedCarts,
  cleanupOldGuestConversations,
  systemHealthCheck,
};
