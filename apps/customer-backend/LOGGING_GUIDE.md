# Logging Configuration Guide

## Overview

Hệ thống logging đã được tối ưu để giảm noise ở production và hỗ trợ graceful degradation khi Redis hết quota.

## Log Levels

### Environment-based Log Levels

- **Production (default)**: `WARN` - Chỉ log warnings và errors
- **Development (default)**: `INFO` - Log info, warnings và errors
- **Custom**: Set `LOG_LEVEL` environment variable

```bash
# Các giá trị hợp lệ
LOG_LEVEL=ERROR  # Chỉ errors
LOG_LEVEL=WARN   # Warnings và errors
LOG_LEVEL=INFO   # Info, warnings và errors
LOG_LEVEL=DEBUG  # Tất cả logs (bao gồm debug)
```

## Logger Methods

```javascript
import { Logger } from "./shared/utils/index.js";

// Luôn log (không bị filter)
Logger.log("Raw message");

// Filtered by log level
Logger.error("Error message"); // Level 0 - Luôn hiển thị
Logger.warn("Warning message"); // Level 1 - Production default
Logger.info("Info message"); // Level 2 - Development default
Logger.success("Success"); // Level 2 - Tương đương INFO
Logger.debug("Debug details"); // Level 3 - Chỉ khi LOG_LEVEL=DEBUG

// Debounced logging (tránh spam)
Logger.debounced(
  "unique-key", // Key để track
  60000, // Interval (ms) - log 1 lần/phút
  Logger.error, // Logger function
  "Rate limit exceeded" // Message
);
```

## Production Optimizations

### 1. Request Logging

- **Development**: Log mọi request
- **Production**: Tắt request logging (trừ khi `LOG_LEVEL=INFO`)
- Health checks và static assets luôn bị skip

### 2. Rate Limit Errors

- Debounced logging: 1 lần/phút cho connection errors
- Debounced logging: 1 lần/5 phút cho rate limit exceeded

### 3. Pusher Events

- **Development**: Log mọi emit event
- **Production**: Chỉ log errors (success events dùng `Logger.debug`)

### 4. Chat Messages

- **Development**: Log chi tiết message flow
- **Production**: Chỉ log errors (message processing dùng `Logger.debug`)

## Redis Graceful Degradation

Khi Redis hết quota hoặc không available:

### Server Behavior

- ✅ Server vẫn khởi động bình thường
- ✅ Timeout 5 giây cho Redis connection
- ✅ Fallback to in-memory rate limiting
- ⚠️ Queues (notifications, URL preview) bị disable
- ⚠️ Caching không hoạt động

### Logs to Expect

```
⚠️ [WARN] Redis không khả dụng. Server sẽ chạy với chức năng hạn chế
⚠️ [WARN] [RateLimit] Redis not available, using in-memory rate limiting
⚠️ [WARN] [Notification Worker] Redis not available. Worker disabled.
⚠️ [WARN] [Queue] Queue not available. Skipping job 'chat-notify'
```

## Troubleshooting

### Too Many Logs in Production

1. Check `NODE_ENV`:

```bash
echo $NODE_ENV  # Should be "production"
```

2. Set explicit log level:

```bash
LOG_LEVEL=WARN
```

3. Restart server

### Redis Quota Exceeded

**Symptoms:**

```
❌ [ERROR] Redis quota exceeded! Server will run without Redis.
ERR max requests limit exceeded. Limit: 500000, Usage: 500000
```

**Solutions:**

1. Wait for monthly quota reset (Upstash free tier)
2. Upgrade Redis plan
3. Server continues running with degraded features

**Temporary Workarounds:**

- Disable URL Preview Worker (already done)
- Disable Notification Worker if needed
- Use in-memory rate limiting (automatic fallback)

## Best Practices

### For Development

```javascript
// Use debug for verbose logging
Logger.debug("[Feature] Detailed info", { data });

// Use info for important events
Logger.info("[Feature] User action completed");
```

### For Production

```javascript
// Only log actionable errors
Logger.error("[Feature] Critical error", error);

// Use debounced for repeated errors
Logger.debounced("redis-error", 60000, Logger.error, "Redis connection failed");

// Avoid logging in hot paths
if (process.env.NODE_ENV !== "production") {
  Logger.debug("[HotPath] Processing item", item);
}
```

## Environment Variables Summary

```bash
# Required
NODE_ENV=production

# Optional - Logging
LOG_LEVEL=WARN              # ERROR | WARN | INFO | DEBUG

# Optional - Redis (graceful degradation if missing)
REDIS_URL=rediss://...      # Upstash/Production Redis
```

## Migration Notes

### Breaking Changes

- `Logger.info()` no longer logs in production by default
- Set `LOG_LEVEL=INFO` to restore old behavior

### Non-Breaking Changes

- All error logging unchanged
- Graceful degradation when Redis unavailable
- Debounced logging for rate limit errors
