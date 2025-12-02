import Redis from 'ioredis';
const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379');
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || undefined;
console.log(`í´Œ Redis: ${REDIS_HOST}:${REDIS_PORT}`);
export const redisClient = new Redis({
  host: REDIS_HOST,
  port: REDIS_PORT,
  password: REDIS_PASSWORD,
  retryStrategy: (t) => Math.min(t * 50, 2000),
  maxRetriesPerRequest: null,
});
redisClient.on('error', (e) => console.error('Redis Error:', e));
