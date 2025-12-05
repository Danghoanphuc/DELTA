# Redis Setup Guide

## Vấn đề đã fix

✅ **Backend không còn bị loop khi Redis chưa có**

- Retry chỉ 3 lần, sau đó dừng hẳn
- Error log chỉ hiện 1 lần, không spam console
- Server vẫn chạy bình thường, chỉ disable queues/workers

## Redis là gì và tại sao cần?

Redis được dùng cho:

- **Bull Queue**: Xử lý PDF rendering bất đồng bộ
- **Notification Worker**: Gửi thông báo qua Novu
- **URL Preview Queue**: Generate preview cho links
- **Bull Board UI**: Monitor queues tại `/admin/queues`

## Khi nào cần Redis?

### ✅ CẦN Redis khi:

- Deploy production
- Test PDF rendering
- Test notification system
- Monitor queues qua Bull Board

### ⚠️ KHÔNG CẦN Redis khi:

- Chỉ dev frontend
- Test API đơn giản
- Không dùng background jobs

## Cách bật Redis

### Option 1: Docker (Khuyến nghị)

```bash
# 1. Bật Docker Desktop
# 2. Chạy Redis container
docker run -d -p 6379:6379 --name redis redis:alpine

# Hoặc dùng docker-compose (nếu có)
docker-compose up -d redis
```

### Option 2: Cloud Redis (Production)

Dùng Upstash hoặc Redis Cloud:

1. Tạo database tại https://upstash.com
2. Copy Redis URL
3. Thêm vào `.env`:

```env
REDIS_URL=rediss://default:password@host:port
```

### Option 3: Local Redis (Windows)

```bash
# Cài qua Chocolatey
choco install redis-64

# Hoặc download từ
# https://github.com/microsoftarchive/redis/releases
```

## Kiểm tra Redis đang chạy

```bash
# Test connection
redis-cli ping
# Kết quả: PONG

# Hoặc dùng Docker
docker exec -it redis redis-cli ping
```

## Khi backend start

### Nếu Redis KHÔNG có:

```
⚠️ [Redis] Connection refused. Is Redis/Docker running? Queues disabled.
⚠️ [Notification Worker] Redis not responding. Worker disabled.

======================================================================
⚠️  REDIS NOT AVAILABLE
======================================================================

  Background jobs and queues are DISABLED.
  The server will continue to run, but some features may be limited.

  To enable Redis:
  1. Start Docker Desktop
  2. Run: docker-compose up -d redis
  3. Restart this server

======================================================================
```

### Nếu Redis CÓ:

```
✅ [Redis] Connected successfully!
✅ [Queues] Background jobs enabled

======================================================================
✅ REDIS CONNECTED
======================================================================

  Background jobs and queues are ENABLED:

  • PDF rendering queue: Active
  • Notification worker: Active
  • URL preview queue: Active

  Bull Board UI: http://localhost:5001/admin/queues

======================================================================
```

## Troubleshooting

### Lỗi: ECONNREFUSED

**Nguyên nhân**: Redis chưa chạy
**Fix**: Bật Docker Desktop và start Redis container

### Lỗi: max requests limit exceeded

**Nguyên nhân**: Upstash free tier hết quota
**Fix**:

- Upgrade plan
- Hoặc dùng local Redis cho dev

### Backend vẫn bị loop

**Nguyên nhân**: Code cũ chưa update
**Fix**:

```bash
cd apps/customer-backend
git pull
npm install
npm run dev
```

## Tắt Redis features hoàn toàn (không khuyến nghị)

Nếu muốn tắt hẳn Redis:

1. Comment out worker initialization trong `server.js`
2. Set env variable:

```env
DISABLE_REDIS=true
```

Nhưng tốt hơn là để Redis optional như hiện tại - server vẫn chạy được, chỉ disable features cần Redis.
