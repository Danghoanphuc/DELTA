# 🔍 Monitoring & Logging Setup Guide - Printz Platform

**Date:** December 2, 2025  
**Status:** ✅ Complete Integration

---

## 📊 Overview

Hệ thống monitoring toàn diện cho Printz Platform bao gồm:

1. **Sentry** - Error tracking & Performance monitoring
2. **Logtail** - Centralized logging & Log management
3. **Uptime Kuma** - Uptime monitoring & Status page

---

## 🎯 1. Sentry Integration

### Tính năng

- ✅ Error tracking & Exception handling
- ✅ Performance monitoring (APM)
- ✅ User context tracking
- ✅ Breadcrumbs & Event tracking
- ✅ Session replay (Frontend)
- ✅ Profiling (Backend)

### Setup

#### Backend (Admin & Customer)

**1. Cài đặt dependencies:**

```bash
pnpm add @sentry/node @sentry/profiling-node
```

**2. Cấu hình môi trường (.env):**

```env
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
NODE_ENV=production
```

**3. Khởi tạo Sentry (instrument.js):**

File đã được tạo tại:

- `apps/admin-backend/src/infrastructure/instrument.js`
- `apps/customer-backend/src/infrastructure/instrument.js`

**4. Tích hợp vào server:**

```javascript
// Import Sentry FIRST
import "./infrastructure/instrument.js";
import express from "express";
import * as Sentry from "@sentry/node";

const app = express();

// Add Sentry middleware
app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());

// Your routes here...

// Error handler (MUST be last)
app.use(Sentry.Handlers.errorHandler());
```

**5. Chạy với Sentry:**

```bash
# Development
pnpm dev

# Production
node --import ./dist/infrastructure/instrument.js dist/server.js
```

#### Frontend (Admin & Customer)

**1. Cài đặt dependencies:**

```bash
pnpm add @sentry/react
```

**2. Cấu hình môi trường (.env):**

```env
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

**3. Khởi tạo trong main.tsx:**

File đã được cập nhật:

- `apps/admin-frontend/src/main.tsx` ✅
- `apps/customer-frontend/src/main.tsx` ✅

### Testing

```bash
# Test Admin Backend
cd apps/admin-backend
pnpm build
pnpm test:sentry

# Test Customer Backend
cd apps/customer-backend
pnpm test:sentry
```

### Sentry Dashboard

1. Truy cập: https://sentry.io
2. Tạo projects:
   - `printz-admin-backend`
   - `printz-admin-frontend`
   - `printz-customer-backend`
   - `printz-customer-frontend`
3. Copy DSN cho mỗi project
4. Cấu hình alerts & notifications

---

## 📝 2. Logtail Integration

### Tính năng

- ✅ Centralized logging
- ✅ Real-time log streaming
- ✅ Log search & filtering
- ✅ Log retention & archiving
- ✅ Integration với Winston

### Setup

#### Backend (Admin & Customer)

**1. Cài đặt dependencies:**

```bash
pnpm add @logtail/node @logtail/winston winston
```

**2. Cấu hình môi trường (.env):**

```env
LOGTAIL_TOKEN=your-logtail-token
LOG_LEVEL=info
```

**3. Sử dụng logger:**

```javascript
import logger from "./infrastructure/logger.js";

// Log levels
logger.info("User logged in", { userId: "123" });
logger.warn("High memory usage", { usage: "85%" });
logger.error("Database connection failed", { error: err.message });
logger.debug("Debug info", { data: someData });
```

File logger đã được tạo tại:

- `apps/admin-backend/src/infrastructure/logger.js`
- `apps/customer-backend/src/infrastructure/logger.js`

### Logtail Dashboard

1. Truy cập: https://betterstack.com/logtail
2. Tạo sources:
   - `printz-admin-backend`
   - `printz-customer-backend`
3. Copy source tokens
4. Cấu hình views & alerts

---

## 🚨 3. Uptime Kuma Setup

### Tính năng

- ✅ Uptime monitoring
- ✅ Status page
- ✅ Multi-protocol support (HTTP, TCP, Ping)
- ✅ Notifications (Email, Slack, Discord, etc.)
- ✅ SSL certificate monitoring

### Installation

#### Option 1: Docker (Recommended)

**1. Tạo docker-compose.yml:**

```yaml
version: "3.8"

services:
  uptime-kuma:
    image: louislam/uptime-kuma:1
    container_name: uptime-kuma
    volumes:
      - ./uptime-kuma-data:/app/data
    ports:
      - "3001:3001"
    restart: unless-stopped
```

**2. Khởi động:**

```bash
docker-compose up -d
```

**3. Truy cập:**

```
http://localhost:3001
```

#### Option 2: Node.js

```bash
# Install
npm install -g uptime-kuma

# Run
uptime-kuma
```

### Configuration

**1. Tạo monitors:**

- **Admin Backend API**

  - Type: HTTP(s)
  - URL: https://admin-api.printz.vn/health
  - Interval: 60 seconds

- **Customer Backend API**

  - Type: HTTP(s)
  - URL: https://api.printz.vn/health
  - Interval: 60 seconds

- **Admin Frontend**

  - Type: HTTP(s)
  - URL: https://admin.printz.vn
  - Interval: 60 seconds

- **Customer Frontend**

  - Type: HTTP(s)
  - URL: https://printz.vn
  - Interval: 60 seconds

- **Database**

  - Type: TCP Port
  - Host: your-mongodb-host
  - Port: 27017
  - Interval: 120 seconds

- **Redis**
  - Type: TCP Port
  - Host: your-redis-host
  - Port: 6379
  - Interval: 120 seconds

**2. Setup notifications:**

- Email: admin@printz.vn
- Slack: #alerts channel
- Discord: Monitoring webhook

**3. Create status page:**

- Public URL: https://status.printz.vn
- Custom domain (optional)
- Show/hide specific monitors

---

## 🔧 4. Health Check Endpoints

### Backend Health Checks

Tạo health check endpoints cho monitoring:

```javascript
// apps/admin-backend/src/routes/health.routes.js
import express from "express";
import mongoose from "mongoose";

const router = express.Router();

router.get("/health", async (req, res) => {
  const health = {
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    service: "admin-backend",
    checks: {
      database: "unknown",
    },
  };

  try {
    // Check MongoDB
    if (mongoose.connection.readyState === 1) {
      health.checks.database = "ok";
    } else {
      health.checks.database = "error";
      health.status = "degraded";
    }
  } catch (error) {
    health.checks.database = "error";
    health.status = "error";
  }

  const statusCode = health.status === "ok" ? 200 : 503;
  res.status(statusCode).json(health);
});

export default router;
```

```javascript
// apps/customer-backend/src/routes/health.routes.js
import express from "express";
import mongoose from "mongoose";
import redis from "../config/redis.js";

const router = express.Router();

router.get("/health", async (req, res) => {
  const health = {
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    service: "customer-backend",
    checks: {
      database: "unknown",
      redis: "unknown",
    },
  };

  try {
    // Check MongoDB
    if (mongoose.connection.readyState === 1) {
      health.checks.database = "ok";
    } else {
      health.checks.database = "error";
      health.status = "degraded";
    }

    // Check Redis
    await redis.ping();
    health.checks.redis = "ok";
  } catch (error) {
    health.checks.redis = "error";
    health.status = "degraded";
  }

  const statusCode = health.status === "ok" ? 200 : 503;
  res.status(statusCode).json(health);
});

export default router;
```

---

## 📊 5. Monitoring Dashboard

### Recommended Setup

**1. Sentry Dashboard:**

- Errors & Issues
- Performance metrics
- Release tracking
- User feedback

**2. Logtail Dashboard:**

- Live tail
- Log search
- Saved views
- Alerts

**3. Uptime Kuma:**

- Status overview
- Response times
- Uptime percentage
- Incident history

---

## 🚀 6. Deployment Checklist

### Pre-deployment

- [ ] Set all environment variables
- [ ] Test Sentry integration
- [ ] Verify Logtail connection
- [ ] Configure Uptime Kuma monitors
- [ ] Setup health check endpoints
- [ ] Configure alerts & notifications

### Post-deployment

- [ ] Verify Sentry is receiving events
- [ ] Check Logtail logs are streaming
- [ ] Confirm Uptime Kuma monitors are green
- [ ] Test alert notifications
- [ ] Review dashboard metrics

---

## 📈 7. Best Practices

### Error Tracking

```javascript
// ✅ Good: Add context
try {
  await processOrder(orderId);
} catch (error) {
  Sentry.captureException(error, {
    tags: { orderId },
    user: { id: userId },
  });
  throw error;
}

// ❌ Bad: No context
try {
  await processOrder(orderId);
} catch (error) {
  Sentry.captureException(error);
  throw error;
}
```

### Logging

```javascript
// ✅ Good: Structured logging
logger.info("Order created", {
  orderId: order.id,
  userId: user.id,
  amount: order.total,
  timestamp: new Date(),
});

// ❌ Bad: String concatenation
logger.info(`Order ${order.id} created by ${user.id}`);
```

### Performance Monitoring

```javascript
// ✅ Good: Track important operations
const result = await Sentry.startSpan(
  { name: "process-payment", op: "payment" },
  async () => {
    return await processPayment(data);
  }
);

// ❌ Bad: No tracking
const result = await processPayment(data);
```

---

## 🔐 8. Security Considerations

### Sensitive Data

```javascript
// ✅ Good: Filter sensitive data
Sentry.init({
  beforeSend(event) {
    // Remove sensitive data
    if (event.request?.data) {
      delete event.request.data.password;
      delete event.request.data.creditCard;
    }
    return event;
  },
});

// ✅ Good: Mask in logs
logger.info("User login", {
  email: maskEmail(user.email),
  ip: req.ip,
});
```

### Environment Variables

- Never commit `.env` files
- Use `.env.example` for documentation
- Rotate tokens regularly
- Use different tokens for dev/staging/prod

---

## 📞 9. Support & Resources

### Sentry

- Docs: https://docs.sentry.io
- Support: support@sentry.io
- Status: https://status.sentry.io

### Logtail

- Docs: https://betterstack.com/docs/logtail
- Support: support@betterstack.com
- Status: https://betterstack.statuspage.io

### Uptime Kuma

- Docs: https://github.com/louislam/uptime-kuma/wiki
- Community: https://github.com/louislam/uptime-kuma/discussions

---

## ✅ Success Metrics

### Targets

- **Error Rate:** < 1%
- **Response Time (P95):** < 1000ms
- **Uptime:** > 99.9%
- **MTTR (Mean Time To Recovery):** < 30 minutes
- **Log Retention:** 30 days

### Monitoring

- Daily review of error trends
- Weekly performance analysis
- Monthly uptime reports
- Quarterly capacity planning

---

**Implemented by:** Kiro AI Assistant  
**Date:** December 2, 2025  
**Status:** ✅ Production Ready
