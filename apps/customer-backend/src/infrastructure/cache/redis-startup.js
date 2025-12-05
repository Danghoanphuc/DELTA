// apps/customer-backend/src/infrastructure/cache/redis-startup.js
// ✅ Startup helper để check Redis và show friendly messages

import { Logger } from "../../shared/utils/index.js";
import { getRedisConnectionConfig } from "./redis-connection.helper.js";
import { waitForRedis } from "./redis-health.js";

/**
 * Initialize Redis connection with friendly error messages
 * @returns {Promise<{client: IORedis|null, available: boolean}>}
 */
export async function initializeRedis() {
  Logger.info("🔌 [Redis] Initializing connection...");

  try {
    const client = getRedisConnectionConfig();

    if (!client) {
      showRedisDisabledMessage();
      return { client: null, available: false };
    }

    // Wait for Redis with timeout
    const available = await waitForRedis(client, 5000);

    if (!available) {
      showRedisDisabledMessage();
      return { client, available: false };
    }

    Logger.info("✅ [Redis] Connected successfully!");
    Logger.info("✅ [Queues] Background jobs enabled");
    return { client, available: true };
  } catch (error) {
    Logger.error(`❌ [Redis] Initialization failed: ${error.message}`);
    showRedisDisabledMessage();
    return { client: null, available: false };
  }
}

/**
 * Show friendly message when Redis is not available
 */
function showRedisDisabledMessage() {
  console.log("\n" + "=".repeat(70));
  console.log("⚠️  REDIS NOT AVAILABLE");
  console.log("=".repeat(70));
  console.log("");
  console.log("  Background jobs and queues are DISABLED.");
  console.log(
    "  The server will continue to run, but some features may be limited:"
  );
  console.log("");
  console.log("  • PDF rendering will be synchronous (slower)");
  console.log("  • Notifications may be delayed");
  console.log("  • URL preview generation disabled");
  console.log("");
  console.log("  To enable Redis:");
  console.log("  1. Start Docker Desktop");
  console.log("  2. Run: docker-compose up -d redis");
  console.log("  3. Restart this server");
  console.log("");
  console.log("  Or add REDIS_URL to .env for cloud Redis (Upstash, etc.)");
  console.log("");
  console.log("=".repeat(70) + "\n");
}

/**
 * Show Redis enabled message
 */
export function showRedisEnabledMessage() {
  console.log("\n" + "=".repeat(70));
  console.log("✅ REDIS CONNECTED");
  console.log("=".repeat(70));
  console.log("");
  console.log("  Background jobs and queues are ENABLED:");
  console.log("");
  console.log("  • PDF rendering queue: Active");
  console.log("  • Notification worker: Active");
  console.log("  • URL preview queue: Active");
  console.log("");
  console.log("  Bull Board UI: http://localhost:5001/admin/queues");
  console.log("");
  console.log("=".repeat(70) + "\n");
}
