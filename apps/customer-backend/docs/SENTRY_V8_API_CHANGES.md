# 🔄 Sentry v8 API Changes

**Date:** December 2, 2025  
**Issue:** `TypeError: Cannot read properties of undefined (reading 'errorHandler')`  
**Status:** ✅ Fixed

---

## 🎯 Problem

Sentry v8 changed the Express error handler API, but our code was using the old v7 API.

### Error Message

```
TypeError: Cannot read properties of undefined (reading 'errorHandler')
at file:///app/dist/shared/middleware/sentry.middleware.js:40:54
```

---

## 📝 API Changes

### Old API (Sentry v7)

```javascript
import * as Sentry from "@sentry/node";

// Error handler middleware
export const sentryErrorMiddleware = Sentry.Handlers.errorHandler({
  shouldHandleError(error) {
    return error.status !== 404;
  },
});

// In server.ts
app.use(sentryErrorMiddleware);
```

### New API (Sentry v8)

```javascript
import * as Sentry from "@sentry/node";

// In server.ts - use setupExpressErrorHandler() directly
Sentry.setupExpressErrorHandler(app);
```

---

## ✅ Fix Applied

### 1. Updated sentry.middleware.js

```javascript
// Before
export const sentryErrorMiddleware = Sentry.Handlers.errorHandler({
  shouldHandleError(error) {
    return error.status !== 404;
  },
});

// After
export const sentryErrorMiddleware = (req, res, next) => {
  // No-op middleware for backward compatibility
  // Actual error handling done by Sentry.setupExpressErrorHandler()
  next();
};
```

### 2. Updated server.ts

```javascript
// Before
const { sentryErrorMiddleware } = await import(
  "./shared/middleware/sentry.middleware.js"
);
app.use(sentryErrorMiddleware);
Sentry.setupExpressErrorHandler(app);

// After
Sentry.setupExpressErrorHandler(app);
```

---

## 🎯 Key Differences

| Feature           | Sentry v7                        | Sentry v8                              |
| ----------------- | -------------------------------- | -------------------------------------- |
| **API**           | `Sentry.Handlers.errorHandler()` | `Sentry.setupExpressErrorHandler(app)` |
| **Usage**         | Middleware function              | Direct app setup                       |
| **Filtering**     | `shouldHandleError` option       | Built-in (captures all errors)         |
| **Configuration** | In middleware                    | In `Sentry.init()`                     |

---

## 📚 Migration Guide

### Step 1: Remove Old Middleware

```javascript
// Remove this
import { sentryErrorMiddleware } from "./middleware/sentry.middleware.js";
app.use(sentryErrorMiddleware);
```

### Step 2: Use New API

```javascript
// Add this
import * as Sentry from "@sentry/node";
Sentry.setupExpressErrorHandler(app);
```

### Step 3: Configure Filtering (Optional)

```javascript
// In instrument.js
Sentry.init({
  // ... other options
  beforeSend(event, hint) {
    // Filter 404s
    if (hint.originalException?.status === 404) {
      return null;
    }
    return event;
  },
});
```

---

## ✅ Verification

```bash
# Build and start
pnpm build
pnpm start

# Expected: No errors
# ✅ [Sentry] Initialized successfully
# ✅ Server running at http://localhost:8000
```

---

## 📖 References

- [Sentry v8 Migration Guide](https://docs.sentry.io/platforms/node/migration/v7-to-v8/)
- [Express Error Handler](https://docs.sentry.io/platforms/node/guides/express/)
- [Sentry v8 Release Notes](https://github.com/getsentry/sentry-javascript/releases/tag/8.0.0)

---

**Fixed by:** Kiro AI Assistant  
**Date:** December 2, 2025  
**Status:** ✅ Resolved
