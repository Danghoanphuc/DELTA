// src/infrastructure/cache/redis.js
import IORedis from "ioredis";
import { Logger } from "../../shared/utils/index.js";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

/**
 * @type {IORedis.Redis | null}
 */
let client = null; // Đây là instance Singleton
let connectionAttempts = 0;
const maxConnectionAttempts = 10;

// ✅ GIẢI PHÁP: Trả về Promise, chỉ resolve khi "ready"
export const connectToRedis = () => {
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
    return new Promise((resolve, reject) => {
      client.once("ready", () => resolve(client));
      client.once("error", (err) => reject(err));
      client.once("end", () =>
        reject(new Error("Kết nối Redis đã đóng khi đang chờ."))
      );
    });
  }

  // Khởi tạo kết nối mới
  return new Promise((resolve, reject) => {
    client = new IORedis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        connectionAttempts++;
        if (times > maxConnectionAttempts) {
          const err = new Error(
            `[Redis] Đã thử ${times} lần, không thể kết nối.`
          );
          Logger.error(err.message);
          reject(err); // Reject promise
          return undefined; // Ngừng thử
        }
        const delay = Math.min(times * 100, 2000); // Tăng dần, max là 2s
        return delay;
      },
    });

    client.on("connect", () => {
      Logger.info("🔄 Đang kết nối đến Redis...");
    });

    client.on("ready", () => {
      Logger.success("✅ Đã kết nối Redis thành công!");
      connectionAttempts = 0; // Reset
      resolve(client); // ✅ Resolve promise khi sẵn sàng
    });

    client.on("error", (err) => {
      Logger.error("❌ Lỗi kết nối Redis:", err.message);
      // Nếu chưa connect, reject promise
      if (client?.status !== "ready") {
        reject(err);
      }
      // Nếu đã connect rồi bị lỗi sau đó, chỉ log
    });

    client.on("close", () => {
      Logger.warn("[Redis] Đã đóng kết nối.");
    });

    client.on("reconnecting", () => {
      Logger.warn(
        `[Redis] Đang kết nối lại... (Thử lần ${connectionAttempts})`
      );
    });
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
