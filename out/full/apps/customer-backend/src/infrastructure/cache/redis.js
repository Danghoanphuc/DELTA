// src/infrastructure/cache/redis.js
import IORedis from "ioredis";
import { Logger } from "../../shared/utils/index.js";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

/**
 * @type {IORedis.Redis | null}
 */
let client = null; // Đây là instance Singleton
let connectionAttempts = 0;
const maxConnectionAttempts = 3; // Giảm xuống để fail fast
let isRedisAvailable = true; // Track Redis availability

// ✅ GRACEFUL DEGRADATION: Trả về Promise, resolve null nếu Redis fail
export const connectToRedis = () => {
  // Nếu đã biết Redis không available, return null ngay
  if (!isRedisAvailable) {
    Logger.warn(
      "⚠️ Redis đã bị disable do lỗi trước đó. Server chạy without Redis."
    );
    return Promise.resolve(null);
  }

  // Nếu đã kết nối, trả về promise đã resolve
  if (client && client.status === "ready") {
    Logger.info("✅ Redis đã được kết nối (tái sử dụng).");
    return Promise.resolve(client);
  }

  // Nếu đang kết nối, trả về promise đang chờ
  if (
    client &&
    (client.status === "connecting" || client.status === "reconnecting")
  ) {
    Logger.info("🔄 Redis đang kết nối, chờ... (tái sử dụng).");
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        Logger.warn("⚠️ Redis connection timeout. Continuing without Redis.");
        isRedisAvailable = false;
        resolve(null);
      }, 5000); // 5 second timeout

      client.once("ready", () => {
        clearTimeout(timeout);
        resolve(client);
      });
      client.once("error", () => {
        clearTimeout(timeout);
        isRedisAvailable = false;
        resolve(null);
      });
      client.once("end", () => {
        clearTimeout(timeout);
        isRedisAvailable = false;
        resolve(null);
      });
    });
  }

  // Khởi tạo kết nối mới
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      Logger.warn(
        "⚠️ Redis connection timeout. Server will start without Redis."
      );
      isRedisAvailable = false;
      if (client) {
        client.disconnect();
        client = null;
      }
      resolve(null);
    }, 5000); // 5 second timeout

    try {
      client = new IORedis(redisUrl, {
        maxRetriesPerRequest: 1,
        connectTimeout: 3000,
        retryStrategy(times) {
          connectionAttempts++;
          if (times > maxConnectionAttempts) {
            Logger.warn(
              `⚠️ [Redis] Không thể kết nối sau ${times} lần thử. Disabling Redis.`
            );
            isRedisAvailable = false;
            clearTimeout(timeout);
            resolve(null);
            return undefined; // Ngừng thử
          }
          const delay = Math.min(times * 500, 2000);
          return delay;
        },
      });

      client.on("connect", () => {
        Logger.info("🔄 Đang kết nối đến Redis...");
      });

      client.on("ready", () => {
        clearTimeout(timeout);
        Logger.success("✅ Đã kết nối Redis thành công!");
        connectionAttempts = 0;
        isRedisAvailable = true;
        resolve(client);
      });

      client.on("error", (err) => {
        // Check for quota exceeded error
        if (
          err.message &&
          err.message.includes("max requests limit exceeded")
        ) {
          Logger.error(
            "❌ Redis quota exceeded! Server will run without Redis."
          );
          isRedisAvailable = false;
          clearTimeout(timeout);
          if (client) {
            client.disconnect();
            client = null;
          }
          resolve(null);
        } else {
          Logger.error("❌ Lỗi kết nối Redis:", err.message);
          // Nếu chưa connect, sẽ được handle bởi timeout
        }
      });

      client.on("close", () => {
        Logger.warn("[Redis] Đã đóng kết nối.");
      });

      client.on("reconnecting", () => {
        Logger.warn(
          `[Redis] Đang kết nối lại... (Thử lần ${connectionAttempts})`
        );
      });
    } catch (err) {
      clearTimeout(timeout);
      Logger.error("❌ Redis initialization error:", err.message);
      isRedisAvailable = false;
      resolve(null);
    }
  });
};

// ✅ GIẢI PHÁP: Hàm để lấy Singleton instance
/**
 * Lấy instance IORedis client đã được kết nối.
 * CHỈ GỌI SAU KHI connectToRedis() đã resolve.
 * @returns {IORedis.Redis | null}
 */
export const getRedisClient = () => {
  if (!client || client.status !== "ready") {
    // Log này không nên xuất hiện nữa, nhưng để đây để phòng thủ
    Logger.warn(
      "Gọi getRedisClient() khi client chưa 'ready'. Service nào đó đã khởi tạo quá sớm."
    );
    return null;
  }
  return client;
};
