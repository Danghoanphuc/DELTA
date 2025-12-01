# 🚀 Sentry Setup Guide - Admin Backend

**Platform:** Printz Admin Backend  
**Date:** December 2, 2025  
**Status:** 📝 Ready to Implement

---

## 📋 Overview

Admin backend hiện chưa có Sentry monitoring. Document này hướng dẫn setup Sentry cho admin backend, dựa trên giải pháp đã triển khai thành công ở customer backend.

---

## 🎯 Why Sentry for Admin Backend?

✅ **Error Tracking:** Catch và track mọi errors  
✅ **Performance Monitoring:** Monitor API response times  
✅ **User Context:** Biết admin nào gặp lỗi  
✅ **Alerting:** Thông báo ngay khi có vấn đề  
✅ **Debugging:** Dễ dàng reproduce và fix bugs

---

## 📦 Installation

### Step 1: Install Dependencies

```bash
cd apps/admin-backend
pnpm add @sentry/node @sentry/profiling-node
```

### Step 2: Copy Files from Customer Backend

```bash
# Copy Sentry utilities
cp ../customer-backend/src/infrastructure/sentry-utils.js ./src/infrastructure/
cp ../customer-backend/src/infrastructure/instrument.js ./src/infrastructure/

# Copy middleware
cp ../customer-backend/src/shared/middleware/sentry.middleware.js ./src/shared/middleware/

# Copy test script
cp ../customer-backend/scripts/test-sentry.js ./scripts/
```

### Step 3: Update instrument.js

```javascript
// src/infrastructure/instrument.js
import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

try {
  if (process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || "development",

      // Sample rates
      tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
      profilesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

      integrations: [nodeProfilingIntegration()],

      // Admin backend không dùng AI SDK nên không cần exclude
      registerEsmLoaderHooks: {
        onlyIncludeInstrumentedModules: true,
      },

      skipOpenTelemetrySetup: true,

      beforeSend(event) {
        // Filter out noise
        if (process.env.NODE_ENV !== "production") {
          if (event.exception?.values?.[0]?.type === "NotFoundException") {
            return null;
          }
        }
        return event;
      },
    });
    console.log("[Sentry] Initialized successfully");
  } else {
    console.warn("[Sentry] SENTRY_DSN not set, skipping initialization");
  }
} catch (error) {
  console.error("[Sentry] Initialization failed:", error);
}
```

### Step 4: Update server.js/ts

```javascript
// At the very top of server.js
import "./infrastructure/instrument.js";

// ... rest of imports

// After creating Express app
import {
  sentryContextMiddleware,
  sentryErrorMiddleware,
} from "./shared/middleware/sentry.middleware.js";

// Apply middleware
app.use(sentryContextMiddleware);

// ... your routes

// Before error handler
app.use(sentryErrorMiddleware);
Sentry.setupExpressErrorHandler(app);
app.use(errorHandler);
```

### Step 5: Add Environment Variable

```bash
# .env
SENTRY_DSN=https://...@sentry.io/...
```

---

## 🧪 Testing

```bash
# Run test script
pnpm test:sentry

# Expected output:
# ✅ Sentry is initialized
# ✅ Test error captured
# ✅ Breadcrumb added
# ✅ User context set
```

---

## 📊 What Will Be Monitored

✅ **HTTP Requests:** All API calls  
✅ **Database:** MongoDB queries  
✅ **Authentication:** Login/logout events  
✅ **Admin Actions:** User management, printer approval, etc.  
✅ **Errors:** All exceptions and errors

---

## 🎯 Usage Examples

### Example 1: Controller with Error Handling

```javascript
import * as Sentry from "@sentry/node";
import { setSentryUser } from "../../infrastructure/sentry-utils.js";

export class AdminController {
  async approveUser(req, res, next) {
    try {
      // Set admin context
      setSentryUser(req.user);
      Sentry.setTags({
        action: "approve_user",
        targetUserId: req.params.userId,
      });

      // Your logic
      await userService.approve(req.params.userId);

      res.json({ success: true });
    } catch (error) {
      Sentry.captureException(error, {
        tags: { feature: "user-management" },
      });
      next(error);
    }
  }
}
```

### Example 2: Background Job

```javascript
import * as Sentry from "@sentry/node";

async function processReports() {
  return await Sentry.startSpan(
    { name: "admin.reports.process", op: "job" },
    async () => {
      // Your processing logic
      const reports = await generateReports();
      return reports;
    }
  );
}
```

---

## 📚 Documentation

Tham khảo customer backend documentation:

- **[Comprehensive Solution](../../customer-backend/docs/SENTRY_COMPREHENSIVE_SOLUTION.md)**
- **[Monitoring Guide](../../customer-backend/docs/SENTRY_MONITORING_GUIDE.md)**
- **[Quick Reference](../../customer-backend/docs/SENTRY_QUICK_REFERENCE.md)**

---

## ✅ Checklist

### Setup

- [ ] Install dependencies
- [ ] Copy utility files
- [ ] Update instrument.js
- [ ] Update server.js
- [ ] Add environment variable

### Testing

- [ ] Run test script
- [ ] Test error capture
- [ ] Test user context
- [ ] Verify Sentry dashboard

### Deployment

- [ ] Deploy to staging
- [ ] Smoke tests
- [ ] Monitor for 24h
- [ ] Deploy to production

---

## 🚨 Notes

⚠️ **Important:** Admin backend không dùng AI SDK nên không cần exclude packages như customer backend.

✅ **Simpler Setup:** Admin backend có setup đơn giản hơn vì không có AI operations.

---

**Status:** Ready to implement  
**Estimated Time:** 2-3 hours  
**Priority:** Medium (implement after customer backend is stable)
