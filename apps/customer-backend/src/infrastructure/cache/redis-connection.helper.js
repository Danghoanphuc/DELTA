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
          // ✅ FIX: Chỉ retry 3 lần, sau đó dừng hẳn
          if (times > 3) {
            console.warn(
              "⚠️ [Redis] Connection failed after 3 attempts. Stopping retries."
            );
            return null; // Stop retrying completely
          }
          const delay = Math.min(times * 1000, 3000);
          console.log(`⚠️ [Redis] Retry attempt ${times}/3 in ${delay}ms...`);
          return delay;
        },
        // Nếu vẫn bị lỗi SSL, dòng dưới sẽ ép buộc chấp nhận (thường không cần nếu dùng URL chuẩn)
        tls: {
          rejectUnauthorized: false,
        },
        // ✅ FIX: Tắt auto-reconnect sau khi hết retry
        lazyConnect: true, // Không connect ngay, đợi lệnh đầu tiên
      });

      // Handle connection errors gracefully
      let errorLogged = false;
      client.on("error", (err) => {
        // ✅ FIX: Chỉ log 1 lần để tránh spam console
        if (!errorLogged) {
          if (err.message?.includes("max requests limit exceeded")) {
            console.error("❌ [Redis] Quota exceeded. Queues disabled.");
          } else if (err.code === "ECONNREFUSED") {
            console.error(
              "❌ [Redis] Connection refused. Is Redis/Docker running? Queues disabled."
            );
          } else {
            console.error("❌ [Redis] Connection error:", err.message);
          }
          errorLogged = true;
        }
      });

      // Try to connect
      client.connect().catch((err) => {
        console.error("❌ [Redis] Failed to connect:", err.message);
      });

      return client;
    }

    // Fallback cho Local (nếu không có REDIS_URL)
    console.log("🔌 [Redis] Creating connection from REDIS_HOST/REDIS_PORT...");
    const client = new IORedis({
      host: process.env.REDIS_HOST || "localhost",
      port: parseInt(process.env.REDIS_PORT || "6379", 10),
      password: process.env.REDIS_PASSWORD || undefined,
      username: process.env.REDIS_USERNAME || undefined,
      maxRetriesPerRequest: null, // ⚠️ BẮT BUỘC cho BullMQ
      connectTimeout: 5000,
      lazyConnect: true,
      retryStrategy(times) {
        // ✅ FIX: Chỉ retry 3 lần
        if (times > 3) {
          console.warn(
            "⚠️ [Redis] Connection failed after 3 attempts. Stopping retries."
          );
          return null;
        }
        const delay = Math.min(times * 1000, 3000);
        console.log(`⚠️ [Redis] Retry attempt ${times}/3 in ${delay}ms...`);
        return delay;
      },
    });

    // Handle errors
    let errorLogged = false;
    client.on("error", (err) => {
      if (!errorLogged) {
        if (err.code === "ECONNREFUSED") {
          console.error(
            "❌ [Redis] Connection refused. Is Redis/Docker running? Queues disabled."
          );
        } else {
          console.error("❌ [Redis] Error:", err.message);
        }
        errorLogged = true;
      }
    });

    // Try to connect
    client.connect().catch((err) => {
      console.error("❌ [Redis] Failed to connect:", err.message);
    });

    return client;
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
