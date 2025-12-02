# 🚀 Sentry Quick Reference Card

**For:** Printz Platform Developers  
**Version:** 2.0  
**Last Updated:** December 2, 2025

---

## 📦 Import Statements

```javascript
// Manual instrumentation utilities
import {
  traceAIOperation,
  addAIBreadcrumb,
  trackTokenUsage,
  trackToolCalls,
  setSentryUser,
  clearSentryUser,
  addSentryTags,
  captureMetric,
} from "../../infrastructure/sentry-utils.js";

// Core Sentry
import * as Sentry from "@sentry/node";
```

---

## 🎯 Common Use Cases

### 1. Wrap AI Operation

```javascript
const result = await traceAIOperation(
  'ai.operation.name',
  async () => {
    // Your AI code here
    return await streamText({ ... });
  },
  {
    // Attributes
    userId: user._id.toString(),
    conversationId: conv._id.toString(),
  }
);
```

### 2. Add Breadcrumb

```javascript
addAIBreadcrumb("Operation started", {
  model: "gpt-4o-mini",
  toolCount: 5,
});
```

### 3. Track Token Usage

```javascript
// In onFinish callback
trackTokenUsage({
  promptTokens: usage.promptTokens,
  completionTokens: usage.completionTokens,
  totalTokens: usage.totalTokens,
});
```

### 4. Track Tool Calls

```javascript
// In onFinish callback
trackToolCalls(toolCalls);
```

### 5. Set User Context

```javascript
// In controller
setSentryUser(req.user);
```

### 6. Capture Error

```javascript
try {
  await riskyOperation();
} catch (error) {
  Sentry.captureException(error, {
    tags: { feature: "payment" },
    level: "error",
  });
  throw error;
}
```

### 7. Add Custom Tags

```javascript
addSentryTags({
  feature: "chat",
  conversationId: conv._id.toString(),
});
```

### 8. Track Custom Metric

```javascript
captureMetric("order.created", 1, {
  paymentMethod: "momo",
});
```

---

## 🔍 Debugging Commands

```bash
# Test Sentry integration
pnpm test:sentry

# Check Sentry initialization
curl http://localhost:8000/health

# View logs
pm2 logs customer-backend | grep Sentry

# Check Sentry events
sentry-cli events list --project printz-customer-backend
```

---

## 📊 Sentry Dashboard URLs

- **Issues:** https://sentry.io/organizations/printz/issues/
- **Performance:** https://sentry.io/organizations/printz/performance/
- **Releases:** https://sentry.io/organizations/printz/releases/
- **Alerts:** https://sentry.io/organizations/printz/alerts/

---

## 🚨 Emergency Procedures

### Server Won't Start

```bash
# 1. Check logs
pm2 logs customer-backend --lines 100

# 2. Disable Sentry temporarily
export SENTRY_DSN=""
pm2 restart customer-backend

# 3. Check environment
echo $SENTRY_DSN
```

### High Error Rate

```bash
# 1. Check Sentry dashboard
# 2. Identify error pattern
# 3. Apply hotfix
# 4. Monitor for 1 hour
```

### No Metrics Showing

```javascript
// 1. Verify import
import { traceAIOperation } from '../../infrastructure/sentry-utils.js';

// 2. Check wrapping
const result = await traceAIOperation(...);

// 3. Check Sentry DSN
console.log(Sentry.getCurrentHub().getClient()?.getDsn());
```

---

## 📚 Documentation Links

- **[Comprehensive Solution](./SENTRY_COMPREHENSIVE_SOLUTION.md)** - Complete overview
- **[Monitoring Guide](./SENTRY_MONITORING_GUIDE.md)** - Detailed guide
- **[Deployment Checklist](./SENTRY_DEPLOYMENT_CHECKLIST.md)** - Deployment steps
- **[Root Cause Analysis](./SENTRY_ESM_ROOT_CAUSE_ANALYSIS.md)** - Problem analysis

---

## 💡 Best Practices

✅ **Always** wrap AI operations with `traceAIOperation()`  
✅ **Always** add breadcrumbs for important steps  
✅ **Always** set user context in controllers  
✅ **Always** capture exceptions with context  
✅ **Never** log sensitive data (passwords, tokens)  
✅ **Never** ignore errors silently

---

## 🎓 Training Resources

- **Internal:** [Monitoring Guide](./SENTRY_MONITORING_GUIDE.md)
- **External:** [Sentry Node.js Docs](https://docs.sentry.io/platforms/node/)
- **Video:** [Sentry Tutorial](https://www.youtube.com/watch?v=...)

---

**Need Help?** Ask in #engineering-support or check the [Monitoring Guide](./SENTRY_MONITORING_GUIDE.md)
