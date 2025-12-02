// src/shared/services/cache.service.js
import { Logger } from "../utils/index.js";
// ✅ GIẢI PHÁP: Import hàm getter, không import biến
import { getRedisClient } from "../../infrastructure/cache/redis.js";

/**
 * Lớp dịch vụ Cache trừu tượng
 * Sử dụng Redis client để thực hiện cache-aside pattern
 */
export class CacheService {
  // ✅ GIẢI PHÁP: Gọi hàm getRedisClient() để lấy instance
  constructor(client = getRedisClient()) {
    if (!client) {
      // 🤞 Cảnh báo này sẽ không xuất hiện nữa
      Logger.warn(
        "[CacheService] Redis client chưa sẵn sàng. Cache sẽ bị vô hiệu hóa."
      );
      // Vẫn tạo object nhưng các hàm sẽ không hoạt động
      this.client = null;
    } else {
      this.client = client;
    }
  }

  /**
   * Lấy dữ liệu từ cache. Nếu không có, gọi hàm callback
   * để lấy từ DB, lưu vào cache, rồi trả về.
   *
   * @param {string} key - Khóa cache (ví dụ: 'product:123')
   * @param {number} ttl - Thời gian sống ( giây, ví dụ: 3600)
   * @param {Function} callback - Hàm async ( () => ... ) để lấy dữ liệu gốc
   * @returns {Promise<any>} Dữ liệu (từ cache hoặc từ DB)
   */
  async getOrSet(key, ttl, callback) {
    // ✅ GIẢI PHÁP: Kiểm tra client VÀ client.status
    if (!this.client || this.client.status !== "ready") {
      Logger.warn(
        `[Cache Miss] Bỏ qua cache (client chưa sẵn sàng) cho key: ${key}`
      );
      return await callback(); // Trả về dữ liệu gốc
    }

    try {
      // 1. Thử lấy từ Cache
      const cachedData = await this.client.get(key);
      if (cachedData) {
        Logger.info(`[Cache Hit] ⚡ Lấy thành công từ cache: ${key}`);
        return JSON.parse(cachedData);
      }
    } catch (err) {
      Logger.error(`[Cache] Lỗi khi GET từ Redis: ${key}`, err);
      // Nếu lỗi, bỏ qua và lấy từ DB
    }

    // 2. Cache Miss - Lấy từ DB
    Logger.warn(`[Cache Miss] ⚠️ Không tìm thấy cache, gọi DB cho key: ${key}`);
    const dbData = await callback();

    // 3. Lưu vào Cache
    try {
      if (dbData !== null && dbData !== undefined) {
        const jsonData = JSON.stringify(dbData);
        await this.client.set(key, jsonData, "EX", ttl);
        Logger.success(`[Cache Set] Đã lưu vào cache: ${key} (TTL: ${ttl}s)`);
      }
    } catch (err) {
      Logger.error(`[Cache] Lỗi khi SET vào Redis: ${key}`, err);
    }

    return dbData;
  }

  /**
   * Xóa một key cụ thể khỏi cache
   * @param {string} key
   */
  async clear(key) {
    if (!this.client || this.client.status !== "ready") return;
    try {
      Logger.warn(`[Cache Invalidate] 🗑️ Xóa key: ${key}`);
      await this.client.del(key);
    } catch (err) {
      Logger.error(`[Cache] Lỗi khi DEL: ${key}`, err);
    }
  }

  /**
   * Xóa cache hàng loạt theo pattern (DÙNG CẨN THẬN)
   * @param {string} pattern - Ví dụ: 'products:query:*'
   */
  async clearByPattern(pattern) {
    if (!this.client || this.client.status !== "ready") return;

    Logger.warn(`[Cache Invalidate] 💥 Xóa hàng loạt: ${pattern}`);
    return new Promise((resolve, reject) => {
      const stream = this.client.scanStream({
        match: pattern,
        count: 100, // Quét 100 key mỗi lần
      });

      let keyCount = 0;
      let pipeline = this.client.pipeline();

      stream.on("data", (keys) => {
        if (keys.length) {
          keyCount += keys.length;
          pipeline.del(...keys);
        }
      });

      stream.on("end", async () => {
        try {
          await pipeline.exec();
          Logger.success(
            `[Cache] Đã xóa ${keyCount} keys với pattern: ${pattern}`
          );
          resolve();
        } catch (err) {
          Logger.error(`[Cache] Lỗi pipeline khi xóa pattern: ${pattern}`, err);
          reject(err);
        }
      });

      stream.on("error", (err) => {
        Logger.error(`[Cache] Lỗi SCAN: ${pattern}`, err);
        reject(err);
      });
    });
  }
}
