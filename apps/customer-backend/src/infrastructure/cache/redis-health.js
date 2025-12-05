// apps/customer-backend/src/infrastructure/cache/redis-health.js
// ✅ Helper để check Redis health trước khi start queues/workers

import { Logger } from "../../shared/utils/index.js";

let redisAvailable = null; // Cache result
let lastCheck = 0;
const CHECK_INTERVAL = 60000; // Re-check mỗi 60 giây

/**
 * Check if Redis is available
 * @param {IORedis} client - Redis client instance
 * @returns {Promise<boolean>}
 */
export async function isRedisAvailable(client) {
  // Return cached result if checked recently
  const now = Date.now();
  if (redisAvailable !== null && now - lastCheck < CHECK_INTERVAL) {
    return redisAvailable;
  }

  if (!client) {
    redisAvailable = false;
    lastCheck = now;
    return false;
  }

  try {
    await client.ping();
    if (redisAvailable === false) {
      Logger.info("✅ [Redis] Connection restored!");
    }
    redisAvailable = true;
    lastCheck = now;
    return true;
  } catch (error) {
    if (redisAvailable === true) {
      Logger.warn("⚠️ [Redis] Connection lost!");
    }
    redisAvailable = false;
    lastCheck = now;
    return false;
  }
}

/**
 * Wait for Redis to be available (with timeout)
 * @param {IORedis} client - Redis client instance
 * @param {number} maxWaitMs - Maximum wait time in milliseconds
 * @returns {Promise<boolean>}
 */
export async function waitForRedis(client, maxWaitMs = 10000) {
  const startTime = Date.now();
  let attempts = 0;

  while (Date.now() - startTime < maxWaitMs) {
    attempts++;
    const available = await isRedisAvailable(client);

    if (available) {
      Logger.info(`✅ [Redis] Connected after ${attempts} attempt(s)`);
      return true;
    }

    // Wait before retry
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  Logger.warn(
    `⚠️ [Redis] Not available after ${attempts} attempts. Queues/workers disabled.`
  );
  return false;
}

/**
 * Get Redis status for health check endpoint
 * @param {IORedis} client - Redis client instance
 * @returns {Promise<object>}
 */
export async function getRedisStatus(client) {
  const available = await isRedisAvailable(client);

  return {
    available,
    status: available ? "connected" : "disconnected",
    message: available
      ? "Redis is healthy"
      : "Redis is not available. Queues/workers disabled.",
  };
}
