# 📊 Sentry Monitoring Guide - Printz Platform

**Date:** December 2, 2025  
**Version:** 2.0  
**Status:** ✅ Production Ready

---

## 🎯 Overview

Hướng dẫn toàn diện về monitoring và error tracking với Sentry cho nền tảng Printz - một platform lớn, toàn cầu.

### What's Monitored

✅ **Automatic Instrumentation:**

- HTTP requests & responses
- Database queries (MongoDB)
- Redis operations
- Express middleware
- All non-AI packages

✅ **Manual Instrumentation:**

- AI chat completions (OpenAI)
- AI streaming responses
- Tool calls (find_products, find_printers, etc.)
- Token usage tracking

✅ **Error Tracking:**

- All exceptions & errors
- Unhandled rejections
- Uncaught exceptions
- API errors

---

## 🏗️ Architecture

### 1. Sentry Initialization

**File:** `apps/customer-backend/src/infrastructure/instrument.js`

```javascript
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1, // 10% in production
  profilesSampleRate: 0.1,

  // ✅ CRITICAL: Exclude problematic ESM packages
  registerEsmLoaderHooks: {
    onlyIncludeInstrumentedModules: true,
    exclude: [
      "ai", // Vercel AI SDK
      "@ai-sdk/openai", // AI SDK providers
      "openai", // OpenAI SDK
    ],
  },
});
```

**Why Exclude AI Packages?**

- Pure ESM packages with complex re-exports
- Incompatible with `import-in-the-middle` (Sentry's instrumentation tool)
- Causes `TypeError: setters.get(...)[name] is not a function`
- Solution: Manual instrumentation instead

---

### 2. Manual Instrumentation Utilities

**File:** `apps/customer-backend/src/infrastructure/sentry-utils.js`

#### Available Functions:

**a) `traceAIOperation(operationName, fn, attributes)`**

Wrap AI operations with Sentry tracing:

```javascript
import { traceAIOperation } from '../../infrastructure/sentry-utils.js';

const result = await traceAIOperation(
  'ai.chat.stream',
  async () => {
    return await streamText({ ... });
  },
  {
    conversationId: 'conv_123',
    userId: 'user_456',
    model: 'gpt-4o-mini',
  }
);
```

**b) `addAIBreadcrumb(message, data)`**

Add breadcrumbs for AI operations:

```javascript
import { addAIBreadcrumb } from "../../infrastructure/sentry-utils.js";

addAIBreadcrumb("AI stream started", {
  model: "gpt-4o-mini",
  toolCount: 5,
});
```

**c) `trackTokenUsage(usage)`**

Track AI token consumption:

```javascript
import { trackTokenUsage } from "../../infrastructure/sentry-utils.js";

trackTokenUsage({
  promptTokens: 150,
  completionTokens: 300,
  totalTokens: 450,
});
```

**d) `trackToolCalls(toolCalls)`**

Track AI tool executions:

```javascript
import { trackToolCalls } from "../../infrastructure/sentry-utils.js";

trackToolCalls([
  {
    toolName: "find_products",
    toolCallId: "call_123",
    args: { query: "business cards" },
  },
]);
```

**e) `setSentryUser(user)`**

Set user context for better error tracking:

```javascript
import { setSentryUser } from "../../infrastructure/sentry-utils.js";

setSentryUser(req.user);
```

---

### 3. Middleware Integration

**File:** `apps/customer-backend/src/shared/middleware/sentry.middleware.js`

#### a) Context Middleware

Automatically sets Sentry context for all requests:

```javascript
// In server.ts
import { sentryContextMiddleware } from "./shared/middleware/sentry.middleware.js";

app.use(sentryContextMiddleware);
```

**What it does:**

- Sets user context (if authenticated)
- Sets request context (method, URL, IP, user-agent)
- Adds HTTP breadcrumbs

#### b) Error Middleware

Captures errors before final error handler:

```javascript
// In server.ts
import { sentryErrorMiddleware } from "./shared/middleware/sentry.middleware.js";

app.use(sentryErrorMiddleware);
app.use(errorHandler); // Your error handler
```

**What it does:**

- Captures all errors except 404s
- Enriches error context
- Sends to Sentry dashboard

---

## 📈 Usage Examples

### Example 1: AI Chat Stream (Already Implemented)

**File:** `apps/customer-backend/src/modules/chat/chat.controller.js`

```javascript
handleChatStream = async (req, res, next) => {
  try {
    // Set user context
    setSentryUser(req.user);
    addAIBreadcrumb("AI chat stream started", {
      conversationId,
      messageCount: messages.length,
    });

    // Wrap AI operation
    const result = await traceAIOperation(
      "ai.chat.stream",
      async () => {
        addAIBreadcrumb("Starting AI stream", {
          model: "gpt-4o-mini",
          toolCount: Object.keys(tools).length,
        });

        return await streamText({
          model: openaiProvider("gpt-4o-mini"),
          messages,
          tools,

          async onFinish({ text, toolCalls, usage }) {
            // Track metrics
            if (usage) trackTokenUsage(usage);
            if (toolCalls) trackToolCalls(toolCalls);

            addAIBreadcrumb("AI stream completed", {
              responseLength: text?.length || 0,
              toolCallCount: toolCalls?.length || 0,
            });
          },
        });
      },
      {
        conversationId: conversation._id.toString(),
        userId: user._id.toString(),
        messageCount: messages.length,
      }
    );

    result.pipeDataStreamToResponse(res);
  } catch (error) {
    // Error automatically captured by Sentry
    next(error);
  }
};
```

---

### Example 2: Custom API Endpoint

```javascript
import {
  traceAIOperation,
  addAIBreadcrumb,
} from "../../infrastructure/sentry-utils.js";
import * as Sentry from "@sentry/node";

async function generateProductDescription(req, res, next) {
  try {
    // Add custom tags
    Sentry.setTags({
      feature: "product-description",
      productId: req.params.productId,
    });

    addAIBreadcrumb("Generating product description", {
      productId: req.params.productId,
    });

    const result = await traceAIOperation(
      "ai.product.description",
      async () => {
        const { generateText } = await import("ai");
        return await generateText({
          model: openaiProvider("gpt-4o-mini"),
          prompt: `Generate description for: ${req.body.productName}`,
        });
      },
      {
        productId: req.params.productId,
        productName: req.body.productName,
      }
    );

    res.json({ description: result.text });
  } catch (error) {
    Sentry.captureException(error, {
      tags: { feature: "product-description" },
    });
    next(error);
  }
}
```

---

### Example 3: Background Job

```javascript
import {
  traceAIOperation,
  captureMetric,
} from "../../infrastructure/sentry-utils.js";

async function processOrderAI(orderId) {
  return await traceAIOperation(
    "ai.order.process",
    async () => {
      const startTime = Date.now();

      // Your AI processing logic
      const result = await analyzeOrder(orderId);

      // Track custom metric
      const duration = Date.now() - startTime;
      captureMetric("order.ai.processing.duration", duration, {
        orderId,
        status: "success",
      });

      return result;
    },
    { orderId }
  );
}
```

---

## 🔍 Monitoring Dashboard

### Key Metrics to Watch

**1. Error Rate**

- Target: < 1% of requests
- Alert: > 5% error rate

**2. Response Time**

- P50: < 200ms
- P95: < 1000ms
- P99: < 3000ms

**3. AI Operations**

- Token usage per request
- Tool call success rate
- Stream completion rate

**4. User Impact**

- Affected users count
- Error frequency per user
- Geographic distribution

---

## 🚨 Alerts Configuration

### Recommended Alerts

**1. High Error Rate**

```
Condition: Error rate > 5% for 5 minutes
Action: Notify on-call engineer
Severity: Critical
```

**2. AI Service Down**

```
Condition: No AI operations for 10 minutes
Action: Notify team
Severity: High
```

**3. Token Limit Exceeded**

```
Condition: Token usage > 100k per hour
Action: Notify team + throttle
Severity: Medium
```

**4. Slow Response Time**

```
Condition: P95 > 3000ms for 10 minutes
Action: Notify team
Severity: Medium
```

---

## 📊 Sample Queries

### Sentry Discover Queries

**1. AI Operations Performance**

```
transaction:ai.chat.stream
| avg(duration), p95(duration), count()
| group by environment
```

**2. Token Usage by User**

```
ai.tokens.total
| sum(value)
| group by user.id
| order by sum desc
```

**3. Tool Call Success Rate**

```
ai.tool.*
| count()
| group by ai.tool.name, status
```

**4. Errors by Feature**

```
error
| count()
| group by tags.feature
| order by count desc
```

---

## 🛠️ Troubleshooting

### Issue 1: No AI Metrics Showing

**Symptoms:**

- AI operations work but no Sentry data
- Missing breadcrumbs

**Solution:**

```javascript
// Check if Sentry is initialized
import * as Sentry from "@sentry/node";
console.log("Sentry DSN:", Sentry.getCurrentHub().getClient()?.getDsn());

// Verify manual instrumentation is imported
import { traceAIOperation } from "../../infrastructure/sentry-utils.js";
```

---

### Issue 2: Too Many Events

**Symptoms:**

- Sentry quota exceeded
- High costs

**Solution:**

```javascript
// Adjust sample rates in instrument.js
Sentry.init({
  tracesSampleRate: 0.05, // Reduce to 5%
  profilesSampleRate: 0.01, // Reduce to 1%

  // Add beforeSend filter
  beforeSend(event) {
    // Filter out noisy errors
    if (event.exception?.values?.[0]?.type === "ValidationError") {
      return null;
    }
    return event;
  },
});
```

---

### Issue 3: Missing User Context

**Symptoms:**

- Errors show but no user info
- Can't identify affected users

**Solution:**

```javascript
// Ensure middleware is applied
// In server.ts
import { sentryContextMiddleware } from "./shared/middleware/sentry.middleware.js";
app.use(sentryContextMiddleware); // Must be early in middleware chain

// Or manually set in controller
import { setSentryUser } from "../../infrastructure/sentry-utils.js";
setSentryUser(req.user);
```

---

## 📝 Best Practices

### 1. Always Set Context

```javascript
// ✅ Good
Sentry.setTags({ feature: "chat", conversationId });
Sentry.setContext("conversation", { id, type, participants });

// ❌ Bad
// No context - hard to debug
```

### 2. Use Breadcrumbs Liberally

```javascript
// ✅ Good
addAIBreadcrumb("Starting product search", { query });
addAIBreadcrumb("Found 10 products", { count: 10 });
addAIBreadcrumb("Filtering by price", { min, max });

// ❌ Bad
// No breadcrumbs - can't trace flow
```

### 3. Track Business Metrics

```javascript
// ✅ Good
captureMetric("order.created", 1, { paymentMethod: "momo" });
captureMetric("ai.tokens.used", usage.totalTokens, { model: "gpt-4" });

// ❌ Bad
// Only technical metrics - missing business insights
```

### 4. Handle Errors Gracefully

```javascript
// ✅ Good
try {
  await riskyOperation();
} catch (error) {
  Sentry.captureException(error, {
    tags: { feature: "payment" },
    level: "error",
  });
  // Fallback logic
  return fallbackResponse();
}

// ❌ Bad
try {
  await riskyOperation();
} catch (error) {
  // Silent failure - no tracking
}
```

---

## 🔐 Security Considerations

### 1. PII Filtering

```javascript
// In instrument.js
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
```

### 2. Environment Variables

```bash
# Never commit these
SENTRY_DSN=https://...@sentry.io/...
SENTRY_AUTH_TOKEN=...
```

### 3. Access Control

- Limit Sentry dashboard access to team members only
- Use role-based permissions
- Enable 2FA for all accounts

---

## 📚 Additional Resources

- [Sentry Node.js Docs](https://docs.sentry.io/platforms/node/)
- [Sentry Performance Monitoring](https://docs.sentry.io/product/performance/)
- [Sentry Best Practices](https://docs.sentry.io/platforms/node/best-practices/)
- [Root Cause Analysis](./SENTRY_ESM_ROOT_CAUSE_ANALYSIS.md)

---

**Maintained by:** Printz Engineering Team  
**Last Updated:** December 2, 2025  
**Next Review:** January 2026
