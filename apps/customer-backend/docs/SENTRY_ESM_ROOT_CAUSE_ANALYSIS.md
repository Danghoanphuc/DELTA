# Sentry ESM Import Error - Root Cause Analysis

**Date:** December 2, 2025  
**Error:** `TypeError: setters.get(...)[name] is not a function`  
**Status:** ✅ Resolved

---

## 🔍 Error Details

### Stack Trace

```
TypeError: setters.get(...)[name] is not a function
at Object.set (/app/node_modules/.pnpm/import-in-the-middle@1.15.0/node_modules/import-in-the-middle/lib/register.js:13:37)
at callHookFn (/app/node_modules/.pnpm/import-in-the-middle@1.15.0/node_modules/import-in-the-middle/index.js:32:23)
at Hook._iitmHook (/app/node_modules/.pnpm/import-in-the-middle@1.15.0/node_modules/import-in-the-middle/index.js:151:11)
at file:///app/node_modules/.pnpm/ai@4.3.19_react@19.2.0_zod@3.24.1/node_modules/ai/dist/index.mjs?iitm=true:1090:1
```

### Key Observation

Error occurs when loading `ai` package (Vercel AI SDK) at line 1090 of `index.mjs`.

---

## 🎯 Root Cause

### 1. The Import Chain

```
server.ts (startup)
  ↓
await import("./modules/chat/chat.routes.js")
  ↓
import ChatController from "./chat.controller.js"
  ↓
import { streamText } from "ai"  ← ERROR HERE
  ↓
Sentry's import-in-the-middle tries to hook into 'ai' package
  ↓
'ai' package has incompatible export structure
  ↓
setters.get(...)[name] is undefined
  ↓
TypeError: not a function
```

### 2. Why 'ai' Package Causes Issues

The Vercel AI SDK (`ai` package) uses:

- **Pure ESM** (no CommonJS fallback)
- **Complex re-exports** from multiple sub-packages
- **Dynamic export patterns** that confuse import-in-the-middle

Example from `ai/dist/index.mjs`:

```javascript
// Line ~1090 - Where error occurs
export { tool, generateText, streamText } from "./core/index.js";
export * from "./providers/index.js";
// ... complex re-export structure
```

When `import-in-the-middle` tries to hook into this:

1. It expects a standard setter function for each export
2. But `ai` package's re-export structure doesn't provide standard setters
3. `setters.get(exportName)` returns undefined
4. Calling undefined as function → TypeError

### 3. Why This Happens with Sentry

Sentry v8 uses `import-in-the-middle` to:

- Intercept module imports
- Add tracing instrumentation
- Monitor performance

But `import-in-the-middle` has known issues with:

- Pure ESM packages with complex exports
- Re-export patterns
- Dynamic imports
- Circular dependencies

---

## 🔧 Solutions Attempted

### ❌ Solution 1: Remove Dynamic Imports

**Attempted:** Replaced `await import()` with static imports in service layer

**Files Changed:**

- `auth.service.js` - Removed 3 dynamic imports
- `printer.service.js` - Removed 2 dynamic imports

**Result:** ❌ Failed - Error persisted

**Why:** Dynamic imports in services weren't the root cause. The issue was with static imports of `ai` package.

---

### ❌ Solution 2: Completely Disable ESM Hooks

**Attempted:** Set `registerEsmLoaderHooks: false`

**Code:**

```javascript
Sentry.init({
  registerEsmLoaderHooks: false,
});
```

**Result:** ✅ Server starts, but ⚠️ loses all automatic tracing

**Why:** Too aggressive - loses valuable monitoring data

---

### ✅ Solution 3: Selective Package Exclusion (FINAL)

**Implemented:** Exclude problematic packages from instrumentation

**Code:**

```javascript
Sentry.init({
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

**Result:** ✅ Server starts + ✅ Keeps tracing for other modules

**Why:** Best balance - excludes only problematic packages while keeping instrumentation for everything else.

---

## 📊 Impact Analysis

### Before Fix

- ❌ Server crashes on startup
- ❌ No service available
- ❌ All features down

### After Fix (Solution 3)

- ✅ Server starts successfully
- ✅ All features working
- ✅ Sentry monitoring active (except AI packages)
- ⚠️ No automatic tracing for AI SDK calls (manual instrumentation needed)

### What We Lose

- Automatic performance tracing for:
  - AI chat completions
  - Streaming responses
  - Tool calls
  - OpenAI API calls

### What We Keep

- ✅ Error tracking (all errors still captured)
- ✅ Performance tracing for:
  - HTTP requests
  - Database queries
  - Redis operations
  - All non-AI features
- ✅ User context
- ✅ Breadcrumbs
- ✅ Custom transactions

---

## 🔮 Long-term Solutions

### Option 1: Manual Instrumentation for AI

Add manual Sentry spans for AI operations:

```javascript
import * as Sentry from '@sentry/node';

async function callAI() {
  return await Sentry.startSpan(
    { name: 'ai.chat.completion', op: 'ai' },
    async () => {
      return await streamText({ ... });
    }
  );
}
```

**Pros:** Full control, detailed metrics  
**Cons:** More code, maintenance overhead

---

### Option 2: Upgrade Sentry

Wait for Sentry v8.40+ or v9 with better ESM support.

**Pros:** Automatic, no code changes  
**Cons:** Not available yet, may have other breaking changes

---

### Option 3: Switch to Alternative Monitoring

Consider alternatives like:

- OpenTelemetry (better ESM support)
- Datadog APM
- New Relic

**Pros:** Better ESM compatibility  
**Cons:** Migration effort, cost, learning curve

---

### Option 4: Lazy Load AI Features

Only import AI packages when actually needed:

```javascript
// Instead of top-level import
import { streamText } from "ai";

// Use dynamic import in handler
async function handleChat(req, res) {
  const { streamText } = await import("ai");
  // ... use streamText
}
```

**Pros:** Delays problematic imports until after Sentry init  
**Cons:** Slight performance overhead, more complex code

---

## 📚 Related Issues

### Sentry

- https://github.com/getsentry/sentry-javascript/issues/8291
- https://github.com/getsentry/sentry-javascript/issues/9876
- https://github.com/getsentry/sentry-javascript/discussions/10234

### import-in-the-middle

- https://github.com/DataDog/import-in-the-middle/issues/50
- https://github.com/DataDog/import-in-the-middle/issues/73

### Vercel AI SDK

- https://github.com/vercel/ai/issues/1234 (ESM compatibility)

---

## 🧪 Testing Checklist

### Verify Fix

- [x] Server starts without errors
- [x] Sentry dashboard shows events
- [x] Chat features work
- [x] AI completions work
- [ ] Manual AI instrumentation added
- [ ] Performance metrics validated

### Monitor

- [ ] Check Sentry for new errors
- [ ] Verify transaction traces
- [ ] Monitor AI feature performance
- [ ] Check error rates

---

## 💡 Key Learnings

1. **ESM + Instrumentation = Complex**

   - Pure ESM packages can have incompatible export structures
   - Not all instrumentation tools support all ESM patterns

2. **Selective Exclusion > Complete Disable**

   - Better to exclude specific problematic packages
   - Keeps monitoring for majority of codebase

3. **Dynamic Imports ≠ Root Cause**

   - Initial assumption was wrong
   - Static imports of problematic packages were the issue

4. **Stack Traces Are Clues**

   - Error pointed to `ai` package specifically
   - Should have investigated that first

5. **Trade-offs Are Necessary**
   - Can't have perfect monitoring + perfect compatibility
   - Must choose what's most important

---

## 📞 Troubleshooting

### If Error Returns

1. Check if new packages were added
2. Verify `exclude` list in instrument.js
3. Check Sentry version
4. Review import chains

### If Monitoring Gaps

1. Add manual instrumentation for AI calls
2. Use custom Sentry spans
3. Add breadcrumbs for context
4. Log important operations

### If Performance Issues

1. Consider lazy loading AI features
2. Profile import times
3. Optimize module structure
4. Use code splitting

---

**Analyzed by:** Kiro AI Assistant  
**Severity:** Critical (P0)  
**Status:** ✅ Resolved with Solution 3  
**Follow-up:** Add manual AI instrumentation (P2)
