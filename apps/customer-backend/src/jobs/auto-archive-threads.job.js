// apps/customer-backend/src/jobs/auto-archive-threads.job.js
// Cron job to auto-archive inactive threads

import cron from "node-cron";
import { ThreadService } from "../services/thread.service.js";
import { Logger } from "../shared/utils/logger.util.js";

/**
 * Auto-archive inactive threads job
 * Runs daily at 2 AM
 */
export function startAutoArchiveJob() {
  const threadService = new ThreadService();

  // Run daily at 2 AM
  cron.schedule("0 2 * * *", async () => {
    try {
      Logger.info("[AutoArchiveJob] Starting auto-archive job...");

      const archivedCount = await threadService.autoArchiveInactiveThreads();

      Logger.success(
        `[AutoArchiveJob] Completed! Archived ${archivedCount} threads`
      );
    } catch (error) {
      Logger.error("[AutoArchiveJob] Error running auto-archive job:", error);
    }
  });

  Logger.info("[AutoArchiveJob] Auto-archive job scheduled (daily at 2 AM)");
}

/**
 * Run auto-archive job manually (for testing)
 */
export async function runAutoArchiveNow() {
  const threadService = new ThreadService();

  try {
    Logger.info("[AutoArchiveJob] Running auto-archive job manually...");

    const archivedCount = await threadService.autoArchiveInactiveThreads();

    Logger.success(
      `[AutoArchiveJob] Completed! Archived ${archivedCount} threads`
    );

    return archivedCount;
  } catch (error) {
    Logger.error("[AutoArchiveJob] Error running auto-archive job:", error);
    throw error;
  }
}
