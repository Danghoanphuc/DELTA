// apps/customer-backend/src/infrastructure/cache/redis-connection.helper.js
// ✅ Helper để tạo IORedis connection cho Bull/BullMQ
// Thay vì parse URL thủ công, để IORedis tự xử lý SSL/TLS

import IORedis from "ioredis";

/**
 * Tạo và trả về một instance IORedis đã được cấu hình chuẩn cho BullMQ.
 * Thay vì trả về object config, ta trả về luôn Instance kết nối
 * để tận dụng khả năng tự động xử lý SSL/TLS của IORedis.
 *
 * ✅ QUAN TRỌNG: Redis 6+ (như Upstash) yêu cầu cả username và password
 * Format: rediss://default:password@host:port
 * IORedis sẽ tự động parse và xử lý đúng format này
 *
 * @returns {IORedis} IORedis instance đã được cấu hình
 */
export function getRedisConnectionConfig() {
  const redisUrl = process.env.REDIS_URL;

  try {
    // Nếu có REDIS_URL (Trường hợp Production/Render/Upstash)
    if (redisUrl) {
      console.log("🔌 [BullMQ] Creating connection from REDIS_URL...");

      // Khởi tạo trực tiếp từ URL string -> IORedis tự lo phần SSL/TLS (rediss://)
      const client = new IORedis(redisUrl, {
        maxRetriesPerRequest: null, // ⚠️ BẮT BUỘC cho BullMQ
        enableReadyCheck: false, // Tối ưu cho Upstash/Serverless
        connectTimeout: 5000, // 5 second timeout
        retryStrategy(times) {
          if (times > 3) {
            console.warn(
              "⚠️ [BullMQ] Redis connection failed after 3 attempts"
            );
            return null; // Stop retrying
          }
          return Math.min(times * 500, 2000);
        },
        // Nếu vẫn bị lỗi SSL, dòng dưới sẽ ép buộc chấp nhận (thường không cần nếu dùng URL chuẩn)
        tls: {
          rejectUnauthorized: false,
        },
      });

      // Handle connection errors gracefully
      client.on("error", (err) => {
        if (err.message?.includes("max requests limit exceeded")) {
          console.error(
            "❌ [BullMQ] Redis quota exceeded. Queues will not work."
          );
        } else {
          console.error("❌ [BullMQ] Redis connection error:", err.message);
        }
      });

      return client;
    }

    // Fallback cho Local (nếu không có REDIS_URL)
    console.log(
      "🔌 [BullMQ] Creating connection from REDIS_HOST/REDIS_PORT..."
    );
    return new IORedis({
      host: process.env.REDIS_HOST || "localhost",
      port: parseInt(process.env.REDIS_PORT || "6379", 10),
      password: process.env.REDIS_PASSWORD || undefined,
      username: process.env.REDIS_USERNAME || undefined,
      maxRetriesPerRequest: null, // ⚠️ BẮT BUỘC cho BullMQ
      connectTimeout: 5000,
    });
  } catch (error) {
    console.error(
      "❌ [BullMQ] Failed to create Redis connection:",
      error.message
    );
    // Return a dummy client that won't crash the app
    return null;
  }
}

/**
 * Get Redis config cho Bull (v4) - trả về IORedis instance
 * Bull v4 hỗ trợ IORedis instance trong redis config
 *
 * @returns {IORedis} IORedis instance đã được cấu hình
 */
export function getBullRedisConfig() {
  // Trả về kết quả của hàm trên luôn cho đồng bộ
  return getRedisConnectionConfig();
}

/**
 * Get Redis URL string (dùng cho IORedis hoặc Bull nếu hỗ trợ)
 *
 * @returns {string} Redis URL string
 */
export function getRedisUrl() {
  return process.env.REDIS_URL || "redis://localhost:6379";
}
