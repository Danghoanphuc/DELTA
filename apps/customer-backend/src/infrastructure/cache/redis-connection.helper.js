// apps/customer-backend/src/infrastructure/cache/redis-connection.helper.js
// ✅ Helper để parse REDIS_URL và tạo connection config cho Bull/BullMQ

/**
 * Parse REDIS_URL thành connection config
 * Hỗ trợ cả redis:// và rediss:// (SSL)
 * Format: redis[s]://[username:password@]host[:port][/database]
 * 
 * ✅ QUAN TRỌNG: Redis 6+ (như Upstash) yêu cầu cả username và password
 * Format: rediss://default:password@host:port
 * 
 * @returns {object} Connection config cho Bull/BullMQ
 */
export function getRedisConnectionConfig() {
  const redisUrl = process.env.REDIS_URL;
  
  // Nếu có REDIS_URL, parse nó
  if (redisUrl) {
    try {
      const url = new URL(redisUrl);
      
      const config = {
        host: url.hostname,
        port: parseInt(url.port || '6379', 10),
        username: url.username || undefined, // ✅ QUAN TRỌNG: Phải lấy cả Username (thường là 'default' cho Upstash)
        password: url.password || undefined,
      };
      
      // ✅ Hỗ trợ SSL cho rediss:// (BullMQ hỗ trợ TLS trong connection config)
      if (url.protocol === 'rediss:') {
        config.tls = {
          rejectUnauthorized: false, // Render/Upstash chấp nhận kết nối SSL
        };
      }
      
      return config;
    } catch (error) {
      console.warn('⚠️ [Redis] Failed to parse REDIS_URL, falling back to REDIS_HOST/REDIS_PORT');
    }
  }
  
  // Fallback về REDIS_HOST/REDIS_PORT nếu không có REDIS_URL
  return {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    username: process.env.REDIS_USERNAME || undefined, // Optional: Hỗ trợ env rời
    password: process.env.REDIS_PASSWORD || undefined,
  };
}

/**
 * Get Redis config cho Bull (v4) - có thể dùng URL string hoặc IORedis instance
 * Bull v4 không hỗ trợ TLS trực tiếp trong redis config object
 * Nên dùng URL string hoặc IORedis instance với TLS
 */
export function getBullRedisConfig() {
  const redisUrl = process.env.REDIS_URL;
  
  // Nếu có REDIS_URL, dùng trực tiếp (Bull hỗ trợ URL string)
  if (redisUrl) {
    return redisUrl;
  }
  
  // Fallback về object config
  return getRedisConnectionConfig();
}

/**
 * Get Redis URL string (dùng cho IORedis hoặc Bull nếu hỗ trợ)
 */
export function getRedisUrl() {
  return process.env.REDIS_URL || 'redis://localhost:6379';
}

