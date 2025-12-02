import IORedis from "ioredis";

export function connectToRedis(): Promise<IORedis.Redis | null>;
export function getRedisClient(): IORedis.Redis | null;
