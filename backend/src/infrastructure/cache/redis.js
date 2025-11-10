// src/infrastructure/cache/redis.js
import IORedis from "ioredis";
import { Logger } from "../../shared/utils/index.js";

// Lấy thông tin kết nối từ biến môi trường,
// Hoặc dùng default cho môi trường dev
const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

let client;
let connectionAttempts = 0;
const maxConnectionAttempts = 10;

export const connectToRedis = () => {
  if (client && client.status === "ready") {
    Logger.info("✅ Redis đã được kết nối.");
    return;
  }

  client = new IORedis(redisUrl, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      connectionAttempts++;
      if (times > maxConnectionAttempts) {
        Logger.error(`[Redis] Đã thử ${times} lần, không thể kết nối.`);
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
  });

  client.on("error", (err) => {
    Logger.error("❌ Lỗi kết nối Redis:", err.message);
  });

  client.on("close", () => {
    Logger.warn("[Redis] Đã đóng kết nối.");
  });

  client.on("reconnecting", () => {
    Logger.warn(`[Redis] Đang kết nối lại... (Thử lần ${connectionAttempts})`);
  });
};

// Export client đã khởi tạo
export const redisClient = client;
