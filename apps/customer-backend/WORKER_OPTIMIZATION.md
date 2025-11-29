# ⚡ Worker Optimization - Event-Driven Approach

## Vấn Đề Cũ: Polling

```javascript
// ❌ Worker polling liên tục
while (true) {
  checkQueue(); // Mỗi 5s = 17,280 requests/day
  sleep(5000);
}
```

**Redis Usage:** 520,000 requests/month per worker ❌

## Giải Pháp: Event-Driven (Redis Pub/Sub)

```javascript
// ✅ Worker chỉ wake up khi có job
queue.on("job:added", () => {
  worker.processJob(); // Chỉ khi có job mới
});
```

**Redis Usage:** ~1,000 requests/month per worker ✅

## Implementation

BullMQ tự động dùng Pub/Sub khi:

1. ✅ Connection có `enableReadyCheck: true`
2. ✅ Không set `skipDelayCheck: true`
3. ✅ Redis hỗ trợ Pub/Sub (Upstash có!)

### Config Tối Ưu:

```javascript
const worker = new Worker("queue-name", processor, {
  connection: redisConnection,

  // 🚀 Event-driven settings
  settings: {
    // Chỉ check stalled jobs thỉnh thoảng (không phải polling job mới)
    stalledInterval: 300000, // 5 phút (thay vì 5 giây)

    // Giảm lock renew frequency
    lockRenewTime: 15000, // 15s (thay vì 5s)

    // Giảm số lần retry check
    maxStalledCount: 1,
  },
});
```

## So Sánh Redis Requests

### Trước (Polling):

```
URL Preview:     520,000 requests/month
Notification:    520,000 requests/month
PDF:             520,000 requests/month
─────────────────────────────────────
TOTAL:         1,560,000 requests/month ❌
```

### Sau (Event-Driven + Optimized):

```
URL Preview:      5,000 requests/month (stalledInterval checks)
Notification:     5,000 requests/month
PDF:              DISABLED
─────────────────────────────────────
TOTAL:           10,000 requests/month ✅
```

**Tiết kiệm:** 99.4% Redis requests!

## Verify Event-Driven Hoạt Động

Check logs khi start:

```
✅ [Worker] Listening for events via Redis Pub/Sub
```

Nếu thấy:

```
⚠️ [Worker] Falling back to polling mode
```

→ Pub/Sub không hoạt động, cần check Redis config.

## Upstash Redis Pub/Sub

Upstash **HỖ TRỢ** Pub/Sub:

- ✅ PUBLISH command
- ✅ SUBSCRIBE command
- ✅ Không tính vào request limit (free!)

**Lưu ý:** Pub/Sub messages không tính quota!
