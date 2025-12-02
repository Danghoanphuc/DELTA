# 🔌 Integration Guide - Thêm Monitoring vào Server Code

## 📋 Checklist Tích hợp

### Admin Backend

- [ ] Import Sentry instrument
- [ ] Add Sentry middleware
- [ ] Add health routes
- [ ] Replace console.log với logger
- [ ] Test integration

### Customer Backend

- [ ] Add health routes
- [ ] Replace console.log với logger (optional - đã có Sentry)
- [ ] Test integration

---

## 1️⃣ Admin Backend Integration

### Step 1: Update server.ts

```typescript
// apps/admin-backend/src/server.ts

// ✅ IMPORTANT: Import Sentry FIRST (before anything else)
import "./infrastructure/instrument.js";

import express from "express";
import * as Sentry from "@sentry/node";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";

// Import middleware
import {
  sentryContextMiddleware,
  sentryErrorHandler,
} from "./shared/middleware/sentry.middleware.js";

// Import routes
import healthRoutes from "./routes/health.routes.js";
// ... other routes

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Basic middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// ✅ Add Sentry request handler (MUST be first)
app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());

// ✅ Add Sentry context middleware
app.use(sentryContextMiddleware);

// ✅ Health check routes (should be early)
app.use("/", healthRoutes);

// Your other routes
// app.use("/api/auth", authRoutes);
// app.use("/api/users", userRoutes);
// ...

// ✅ Add Sentry error handler (MUST be before other error handlers)
app.use(Sentry.Handlers.errorHandler());

// ✅ Add custom Sentry error handler
app.use(sentryErrorHandler);

// Your error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal server error" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Admin Backend running on port ${PORT}`);
});
```

### Step 2: Replace console.log với logger

**Before:**

```javascript
console.log("User created:", user);
console.error("Database error:", error);
```

**After:**

```javascript
import logger from "../infrastructure/logger.js";

logger.info("User created", { userId: user.id, email: user.email });
logger.error("Database error", { error: error.message, stack: error.stack });
```

### Step 3: Add error tracking

**Before:**

```javascript
try {
  await createUser(data);
} catch (error) {
  console.error(error);
  throw error;
}
```

**After:**

```javascript
import * as Sentry from "@sentry/node";
import logger from "../infrastructure/logger.js";

try {
  await createUser(data);
} catch (error) {
  // Log to Logtail
  logger.error("Failed to create user", {
    error: error.message,
    data: { email: data.email },
  });

  // Track in Sentry
  Sentry.captureException(error, {
    tags: { operation: "create-user" },
    extra: { email: data.email },
  });

  throw error;
}
```

---

## 2️⃣ Customer Backend Integration

### Step 1: Update server.ts

```typescript
// apps/customer-backend/src/server.ts

// ✅ Sentry already imported at top (verify this exists)
import "./infrastructure/instrument.js";

import express from "express";
import * as Sentry from "@sentry/node";
// ... other imports

// Import health routes
import healthRoutes from "./routes/health.routes.js";

const app = express();

// ... existing middleware

// ✅ Add health check routes (if not already added)
app.use("/", healthRoutes);

// ... rest of your code
```

### Step 2: (Optional) Replace console.log với logger

```javascript
import logger from "../infrastructure/logger.js";

// Before
console.log("Order created:", order);

// After
logger.info("Order created", {
  orderId: order.id,
  userId: order.userId,
  total: order.total,
});
```

---

## 3️⃣ Usage Examples

### Error Tracking

```javascript
import * as Sentry from "@sentry/node";

// Simple error capture
try {
  await riskyOperation();
} catch (error) {
  Sentry.captureException(error);
  throw error;
}

// With context
try {
  await processPayment(orderId);
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      operation: "payment",
      orderId: orderId,
    },
    user: {
      id: userId,
      email: userEmail,
    },
    extra: {
      amount: paymentAmount,
      currency: "VND",
    },
  });
  throw error;
}
```

### Logging

```javascript
import logger from "../infrastructure/logger.js";

// Info level
logger.info("User logged in", {
  userId: user.id,
  email: user.email,
  ip: req.ip,
});

// Warning level
logger.warn("High memory usage", {
  usage: process.memoryUsage().heapUsed,
  threshold: 500 * 1024 * 1024,
});

// Error level
logger.error("Payment failed", {
  orderId: order.id,
  error: error.message,
  stack: error.stack,
});

// Debug level (only in development)
logger.debug("Processing order", {
  orderId: order.id,
  items: order.items.length,
});
```

### Performance Tracking

```javascript
import * as Sentry from "@sentry/node";

// Track operation performance
const result = await Sentry.startSpan(
  {
    name: "process-order",
    op: "function",
    attributes: {
      orderId: order.id,
      itemCount: order.items.length,
    },
  },
  async () => {
    return await processOrder(order);
  }
);
```

### User Context

```javascript
import {
  setSentryUser,
  clearSentryUser,
} from "../infrastructure/sentry-utils.js";

// Set user context (in auth middleware)
app.use((req, res, next) => {
  if (req.user) {
    setSentryUser(req.user);
  }
  next();
});

// Clear user context (on logout)
app.post("/logout", (req, res) => {
  clearSentryUser();
  // ... logout logic
});
```

---

## 4️⃣ Testing

### Test Sentry

```bash
# Admin Backend
cd apps/admin-backend
pnpm build
pnpm test:sentry

# Customer Backend
cd apps/customer-backend
pnpm test:sentry
```

### Test Health Endpoints

```bash
# Admin Backend
curl http://localhost:5001/health
curl http://localhost:5001/health/live
curl http://localhost:5001/health/ready

# Customer Backend
curl http://localhost:5000/health
curl http://localhost:5000/health/live
curl http://localhost:5000/health/ready
```

### Test Logging

```javascript
// Add this to any route temporarily
import logger from "../infrastructure/logger.js";

app.get("/test-logging", (req, res) => {
  logger.info("Test log", { test: true });
  logger.warn("Test warning", { test: true });
  logger.error("Test error", { test: true });
  res.json({ message: "Check Logtail dashboard" });
});
```

---

## 5️⃣ Best Practices

### DO ✅

```javascript
// ✅ Add context to errors
Sentry.captureException(error, {
  tags: { operation: "payment" },
  user: { id: userId },
});

// ✅ Use structured logging
logger.info("Order created", {
  orderId: order.id,
  total: order.total,
});

// ✅ Track important operations
await Sentry.startSpan({ name: "process-payment" }, async () => {
  return await processPayment();
});

// ✅ Filter sensitive data
logger.info("User login", {
  email: maskEmail(user.email),
  ip: req.ip,
});
```

### DON'T ❌

```javascript
// ❌ No context
Sentry.captureException(error);

// ❌ String concatenation
logger.info(`Order ${orderId} created`);

// ❌ No tracking
await processPayment(); // No visibility

// ❌ Log sensitive data
logger.info("User login", {
  email: user.email,
  password: user.password, // NEVER!
});
```

---

## 6️⃣ Environment Variables

### Development (.env)

```env
# Sentry
SENTRY_DSN=https://your-dev-dsn@sentry.io/project-id
NODE_ENV=development

# Logtail
LOGTAIL_TOKEN=your-dev-logtail-token
LOG_LEVEL=debug
```

### Production (.env)

```env
# Sentry
SENTRY_DSN=https://your-prod-dsn@sentry.io/project-id
NODE_ENV=production

# Logtail
LOGTAIL_TOKEN=your-prod-logtail-token
LOG_LEVEL=info
```

---

## 7️⃣ Troubleshooting

### Sentry not working

1. Check DSN is set: `echo $SENTRY_DSN`
2. Check initialization: Look for "[Sentry] Initialized" in logs
3. Check network: `curl https://sentry.io`
4. Check errors: Look for Sentry errors in console

### Logtail not working

1. Check token is set: `echo $LOGTAIL_TOKEN`
2. Check logger import: `import logger from "./infrastructure/logger.js"`
3. Check network: Test with `logger.info("test")`
4. Check Logtail dashboard: https://betterstack.com/logtail

### Health endpoints not working

1. Check routes are imported: `import healthRoutes from "./routes/health.routes.js"`
2. Check routes are used: `app.use("/", healthRoutes)`
3. Check server is running: `curl http://localhost:5000/health`
4. Check database connection: Verify MongoDB is running

---

## 8️⃣ Checklist

### Admin Backend

- [ ] Import `./infrastructure/instrument.js` at top of server.ts
- [ ] Add Sentry request handler
- [ ] Add Sentry context middleware
- [ ] Add health routes
- [ ] Add Sentry error handler
- [ ] Replace console.log with logger
- [ ] Test Sentry integration
- [ ] Test health endpoints
- [ ] Test logging

### Customer Backend

- [ ] Verify `./infrastructure/instrument.js` is imported
- [ ] Add health routes
- [ ] (Optional) Replace console.log with logger
- [ ] Test health endpoints
- [ ] Test logging

---

## ✅ Done!

Sau khi hoàn thành:

1. **Test locally:**

   ```bash
   pnpm test:sentry:all
   pnpm monitoring:start
   ```

2. **Check dashboards:**

   - Sentry: https://sentry.io
   - Logtail: https://betterstack.com/logtail
   - Uptime Kuma: http://localhost:3001

3. **Deploy to production:**
   - Set environment variables
   - Deploy applications
   - Verify monitoring is working

**Happy Monitoring! 🎉**
