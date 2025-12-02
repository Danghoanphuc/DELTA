import Redis from 'ioredis';

// Ưu tiên dùng Connection String (Render cung cấp cái này)
const REDIS_URL = process.env.REDIS_URL;

// Fallback cho Localhost
const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379');
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || undefined;

console.log(REDIS_URL ? `��� Redis: Connecting via URL...` : `��� Redis: ${REDIS_HOST}:${REDIS_PORT}`);

// Logic: Nếu có URL thì dùng URL, không thì dùng Host/Port
export const redisClient = REDIS_URL 
  ? new Redis(REDIS_URL, {
      maxRetriesPerRequest: null,
      retryStrategy: (t) => Math.min(t * 50, 2000),
    })
  : new Redis({
      host: REDIS_HOST,
      port: REDIS_PORT,
      password: REDIS_PASSWORD,
      maxRetriesPerRequest: null,
      retryStrategy: (t) => Math.min(t * 50, 2000),
    });

redisClient.on('connect', () => console.log('✅ Redis Connected!'));
redisClient.on('error', (e) => console.error('❌ Redis Error:', e));
