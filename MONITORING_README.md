# 🔍 Monitoring & Logging - Printz Platform

## 📊 Tổng quan

Hệ thống monitoring toàn diện cho Printz Platform với 3 công cụ chính:

1. **Sentry** - Error tracking & Performance monitoring
2. **Logtail** - Centralized logging
3. **Uptime Kuma** - Uptime monitoring & Status page

## 🚀 Quick Start

### 1. Cài đặt Dependencies

```bash
pnpm install
```

### 2. Cấu hình Environment Variables

Copy các file `.env.example` và điền thông tin:

```bash
# Admin Backend
cp apps/admin-backend/.env.example apps/admin-backend/.env

# Customer Backend
cp apps/customer-backend/.env.example apps/customer-backend/.env

# Admin Frontend
cp apps/admin-frontend/.env.example apps/admin-frontend/.env.local

# Customer Frontend
cp apps/customer-frontend/.env.example apps/customer-frontend/.env.local
```

### 3. Lấy Tokens

#### Sentry DSN

1. Truy cập https://sentry.io
2. Tạo 4 projects (admin-backend, admin-frontend, customer-backend, customer-frontend)
3. Copy DSN từ Settings > Client Keys

#### Logtail Token

1. Truy cập https://betterstack.com/logtail
2. Tạo 2 sources (admin-backend, customer-backend)
3. Copy source tokens

### 4. Khởi động Uptime Kuma

**Windows:**

```bash
.\scripts\start-monitoring.bat
```

**Linux/Mac:**

```bash
chmod +x scripts/start-monitoring.sh
./scripts/start-monitoring.sh
```

**Hoặc dùng npm script:**

```bash
pnpm monitoring:start
```

Truy cập: http://localhost:3001

### 5. Test Integration

```bash
# Test tất cả
pnpm test:sentry:all

# Hoặc test riêng
pnpm test:sentry:admin
pnpm test:sentry:customer
```

## 📁 Cấu trúc Files

```
printz-platform/
├── apps/
│   ├── admin-backend/
│   │   ├── src/
│   │   │   ├── infrastructure/
│   │   │   │   ├── instrument.js       # Sentry init
│   │   │   │   ├── sentry-utils.js     # Sentry utilities
│   │   │   │   └── logger.js           # Winston + Logtail
│   │   │   ├── shared/middleware/
│   │   │   │   └── sentry.middleware.js
│   │   │   └── routes/
│   │   │       └── health.routes.ts    # Health checks
│   │   ├── scripts/
│   │   │   └── test-sentry.js
│   │   └── .env.example
│   │
│   ├── customer-backend/
│   │   ├── src/
│   │   │   ├── infrastructure/
│   │   │   │   ├── instrument.js
│   │   │   │   ├── sentry-utils.js
│   │   │   │   └── logger.js
│   │   │   └── routes/
│   │   │       └── health.routes.ts
│   │   └── .env.example
│   │
│   ├── admin-frontend/
│   │   ├── src/
│   │   │   └── main.tsx               # Sentry init
│   │   └── .env.example
│   │
│   └── customer-frontend/
│       ├── src/
│       │   └── main.tsx               # Sentry init
│       └── .env.example
│
├── scripts/
│   ├── start-monitoring.bat           # Windows startup
│   └── start-monitoring.sh            # Linux/Mac startup
│
├── docker-compose.monitoring.yml      # Uptime Kuma
│
└── docs/
    ├── MONITORING_SETUP_GUIDE.md      # Chi tiết setup
    ├── QUICK_START_MONITORING.md      # Hướng dẫn nhanh
    ├── MONITORING_CHECKLIST.md        # Checklist
    └── SENTRY_IMPLEMENTATION_SUMMARY.md
```

## 🔧 Sử dụng

### Backend - Error Tracking

```javascript
import * as Sentry from "@sentry/node";

try {
  await riskyOperation();
} catch (error) {
  Sentry.captureException(error, {
    tags: { operation: "risky" },
    user: { id: userId },
  });
  throw error;
}
```

### Backend - Logging

```javascript
import logger from "./infrastructure/logger.js";

logger.info("Order created", {
  orderId: order.id,
  userId: user.id,
  amount: order.total,
});

logger.error("Payment failed", {
  orderId: order.id,
  error: error.message,
});
```

### Frontend - Error Tracking

```javascript
import * as Sentry from "@sentry/react";

try {
  await fetchData();
} catch (error) {
  Sentry.captureException(error);
  showErrorToast("Failed to fetch data");
}
```

### Health Check Endpoints

```bash
# Full health check
curl http://localhost:5000/health

# Liveness probe
curl http://localhost:5000/health/live

# Readiness probe
curl http://localhost:5000/health/ready
```

## 📊 Dashboards

### Sentry

- **URL:** https://sentry.io
- **Features:** Errors, Performance, Releases, User Feedback

### Logtail

- **URL:** https://betterstack.com/logtail
- **Features:** Live tail, Search, Alerts, Retention

### Uptime Kuma

- **URL:** http://localhost:3001 (local)
- **Features:** Uptime monitoring, Status page, Notifications

## 🎯 Monitoring Targets

### Error Rate

- **Target:** < 1%
- **Alert:** > 5%

### Response Time (P95)

- **Target:** < 1000ms
- **Alert:** > 2000ms

### Uptime

- **Target:** > 99.9%
- **Alert:** < 99%

### Log Volume

- **Expected:** ~10K logs/day per service
- **Alert:** > 100K logs/day (potential issue)

## 🚨 Alerts & Notifications

### Sentry Alerts

- New issue created
- Issue frequency spike
- Performance degradation

### Logtail Alerts

- Error log spike
- Specific error patterns
- Log volume anomalies

### Uptime Kuma Notifications

- Service down
- High response time
- SSL certificate expiring

## 📚 Documentation

- **[Setup Guide](./MONITORING_SETUP_GUIDE.md)** - Chi tiết cài đặt và cấu hình
- **[Quick Start](./QUICK_START_MONITORING.md)** - Hướng dẫn nhanh
- **[Checklist](./MONITORING_CHECKLIST.md)** - Checklist triển khai
- **[Sentry Summary](./SENTRY_IMPLEMENTATION_SUMMARY.md)** - Tổng quan Sentry

## 🔐 Security

### Sensitive Data Filtering

```javascript
// Sentry
Sentry.init({
  beforeSend(event) {
    if (event.request?.data) {
      delete event.request.data.password;
      delete event.request.data.creditCard;
    }
    return event;
  },
});

// Logging
logger.info("User login", {
  email: maskEmail(user.email), // ✅ Masked
  ip: req.ip,
});
```

### Token Management

- Sử dụng tokens khác nhau cho dev/staging/prod
- Rotate tokens định kỳ (3-6 tháng)
- Không commit tokens vào Git
- Sử dụng environment variables

## 💰 Cost Optimization

### Sentry

- Adjust sample rates: `tracesSampleRate: 0.1` (10%)
- Filter out noise: `beforeSend` hook
- Monitor quota usage

### Logtail

- Set appropriate log levels
- Configure retention policies
- Filter unnecessary logs

## 🧪 Testing

```bash
# Test Sentry integration
pnpm test:sentry:all

# Start monitoring stack
pnpm monitoring:start

# View logs
pnpm monitoring:logs

# Stop monitoring stack
pnpm monitoring:stop
```

## 🆘 Troubleshooting

### Sentry không nhận events

1. Kiểm tra DSN đúng chưa
2. Verify `NODE_ENV` được set
3. Check network connectivity
4. Xem console logs

### Logtail không nhận logs

1. Kiểm tra token đúng chưa
2. Verify logger được import
3. Check network connectivity
4. Xem Winston errors

### Uptime Kuma báo DOWN

1. Check health endpoints
2. Verify services đang chạy
3. Check firewall/network
4. Review monitor config

## 📞 Support

- **Sentry:** https://docs.sentry.io
- **Logtail:** https://betterstack.com/docs/logtail
- **Uptime Kuma:** https://github.com/louislam/uptime-kuma/wiki

---

**Status:** ✅ Production Ready  
**Last Updated:** December 2, 2025  
**Maintained by:** Printz DevOps Team
