# ✅ Sentry Deployment Checklist

**Platform:** Printz - Global Printing Platform  
**Date:** December 2, 2025  
**Version:** 2.0

---

## 🎯 Pre-Deployment

### 1. Environment Variables

- [ ] `SENTRY_DSN` set in production environment
- [ ] `SENTRY_DSN` set in staging environment
- [ ] `NODE_ENV` correctly set (`production`, `staging`, `development`)
- [ ] Verify DSN is valid: `curl -X POST <SENTRY_DSN>`

### 2. Configuration Review

- [ ] Review `instrument.js` - exclude list is correct
- [ ] Sample rates appropriate for environment:
  - Production: 10% (`tracesSampleRate: 0.1`)
  - Staging: 50% (`tracesSampleRate: 0.5`)
  - Development: 100% (`tracesSampleRate: 1.0`)
- [ ] `beforeSend` filter configured for PII
- [ ] `skipOpenTelemetrySetup: true` if using OpenTelemetry

### 3. Code Review

- [ ] All AI operations wrapped with `traceAIOperation()`
- [ ] Breadcrumbs added for critical flows
- [ ] User context set in authentication middleware
- [ ] Error handlers capture exceptions properly
- [ ] No sensitive data in error messages

---

## 🚀 Deployment Steps

### Step 1: Deploy to Staging

```bash
# 1. Build application
pnpm build

# 2. Run tests
pnpm test

# 3. Deploy to staging
git push staging main

# 4. Verify Sentry initialization
curl https://staging-api.printz.vn/health
# Check logs for: "[Sentry] Initialized successfully"
```

### Step 2: Smoke Tests

- [ ] Test AI chat stream: `/api/chat/stream`
- [ ] Test product search: `/api/products`
- [ ] Test order creation: `/api/orders`
- [ ] Trigger intentional error: `/api/test/error`
- [ ] Check Sentry dashboard for events

### Step 3: Monitor Staging

- [ ] Check error rate (should be < 1%)
- [ ] Verify AI operations appear in Sentry
- [ ] Confirm breadcrumbs are captured
- [ ] Validate user context is set
- [ ] Review performance metrics

### Step 4: Deploy to Production

```bash
# 1. Tag release
git tag -a v2.0.0 -m "Sentry monitoring v2.0"
git push origin v2.0.0

# 2. Deploy to production
git push production main

# 3. Monitor deployment
# Watch logs for errors
# Check Sentry dashboard
```

### Step 5: Post-Deployment Verification

- [ ] Server starts without errors
- [ ] Sentry events appearing in dashboard
- [ ] AI operations tracked correctly
- [ ] No increase in error rate
- [ ] Performance metrics within acceptable range

---

## 🧪 Testing Checklist

### Manual Tests

#### Test 1: AI Chat Stream

```bash
curl -X POST https://api.printz.vn/api/chat/stream \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "messages": [{"role": "user", "content": "Find business cards"}],
    "conversationId": null
  }'
```

**Expected:**

- ✅ Stream response received
- ✅ Sentry shows `ai.chat.stream` transaction
- ✅ Breadcrumbs captured
- ✅ Token usage tracked

---

#### Test 2: Error Handling

```bash
curl -X GET https://api.printz.vn/api/test/error \
  -H "Authorization: Bearer <token>"
```

**Expected:**

- ✅ Error response returned
- ✅ Sentry captures exception
- ✅ User context included
- ✅ Request context included

---

#### Test 3: Tool Calls

```bash
curl -X POST https://api.printz.vn/api/chat/stream \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "messages": [{"role": "user", "content": "Show me printers in Hanoi"}]
  }'
```

**Expected:**

- ✅ Tool `find_printers` called
- ✅ Sentry shows tool call breadcrumb
- ✅ Tool arguments captured

---

### Automated Tests

Create test file: `apps/customer-backend/src/__tests__/sentry.test.js`

```javascript
import * as Sentry from "@sentry/node";
import {
  traceAIOperation,
  addAIBreadcrumb,
} from "../infrastructure/sentry-utils.js";

describe("Sentry Integration", () => {
  test("should initialize Sentry", () => {
    const client = Sentry.getCurrentHub().getClient();
    expect(client).toBeDefined();
    expect(client.getDsn()).toBeDefined();
  });

  test("should trace AI operations", async () => {
    const result = await traceAIOperation(
      "test.operation",
      async () => "success",
      { testId: "123" }
    );
    expect(result).toBe("success");
  });

  test("should add breadcrumbs", () => {
    addAIBreadcrumb("Test breadcrumb", { data: "test" });
    // Breadcrumb should be added to current scope
  });
});
```

Run tests:

```bash
pnpm test apps/customer-backend/src/__tests__/sentry.test.js
```

---

## 📊 Monitoring Setup

### 1. Sentry Dashboard Configuration

- [ ] Create project: `printz-customer-backend`
- [ ] Set up alerts (see below)
- [ ] Configure integrations (Slack, PagerDuty)
- [ ] Add team members
- [ ] Set up release tracking

### 2. Alert Rules

#### Alert 1: High Error Rate

```yaml
Name: High Error Rate
Condition: Error count > 100 in 5 minutes
Action: Notify #engineering-alerts
Severity: Critical
```

#### Alert 2: AI Service Down

```yaml
Name: AI Service Down
Condition: No ai.chat.stream transactions in 10 minutes
Action: Notify #ai-team
Severity: High
```

#### Alert 3: Slow Response Time

```yaml
Name: Slow Response Time
Condition: P95 response time > 3000ms for 10 minutes
Action: Notify #performance-team
Severity: Medium
```

#### Alert 4: Token Limit Warning

```yaml
Name: Token Limit Warning
Condition: Token usage > 80% of daily limit
Action: Notify #ai-team
Severity: Low
```

### 3. Dashboard Widgets

Create custom dashboard with:

- [ ] Error rate graph (last 24h)
- [ ] AI operations count (last 24h)
- [ ] Token usage graph (last 7 days)
- [ ] Top errors table
- [ ] Affected users count
- [ ] Response time percentiles (P50, P95, P99)

---

## 🔍 Verification Commands

### Check Sentry Initialization

```bash
# SSH into server
ssh user@api.printz.vn

# Check logs
pm2 logs customer-backend | grep Sentry

# Expected output:
# [Sentry] Initialized successfully
```

### Check Sentry Events

```bash
# Using Sentry CLI
sentry-cli events list --project printz-customer-backend

# Expected: Recent events listed
```

### Check Sample Rate

```bash
# In Sentry dashboard
# Navigate to: Settings > Projects > printz-customer-backend > Performance
# Verify: Sample Rate = 10%
```

---

## 🚨 Rollback Plan

### If Issues Occur

#### Issue: Server won't start

```bash
# 1. Check logs
pm2 logs customer-backend --lines 100

# 2. If Sentry error, disable temporarily
export SENTRY_DSN=""
pm2 restart customer-backend

# 3. Rollback to previous version
git revert HEAD
git push production main
```

#### Issue: High error rate

```bash
# 1. Reduce sample rate
# Edit instrument.js:
tracesSampleRate: 0.01  # Reduce to 1%

# 2. Redeploy
git commit -am "Reduce Sentry sample rate"
git push production main
```

#### Issue: Performance degradation

```bash
# 1. Disable ESM hooks completely
# Edit instrument.js:
registerEsmLoaderHooks: false

# 2. Redeploy
git commit -am "Disable Sentry ESM hooks"
git push production main
```

---

## 📈 Success Metrics

### Week 1 Post-Deployment

- [ ] Error rate < 1%
- [ ] No increase in response time
- [ ] AI operations tracked successfully
- [ ] At least 1000 events captured
- [ ] No Sentry-related errors

### Month 1 Post-Deployment

- [ ] Error rate < 0.5%
- [ ] 95% of AI operations tracked
- [ ] Token usage trends identified
- [ ] 5+ bugs fixed using Sentry data
- [ ] Team trained on Sentry dashboard

---

## 📞 Support Contacts

### Sentry Support

- Email: support@sentry.io
- Docs: https://docs.sentry.io
- Status: https://status.sentry.io

### Internal Team

- Engineering Lead: [Name]
- DevOps: [Name]
- On-Call: Check PagerDuty

---

## 📝 Post-Deployment Tasks

### Immediate (Day 1)

- [ ] Monitor error rate for 24 hours
- [ ] Review first 100 events
- [ ] Verify alerts are working
- [ ] Update team on deployment status

### Short-term (Week 1)

- [ ] Analyze error patterns
- [ ] Optimize sample rates if needed
- [ ] Add missing instrumentation
- [ ] Train team on Sentry dashboard

### Long-term (Month 1)

- [ ] Review and update alert thresholds
- [ ] Create custom dashboards for each team
- [ ] Document common error patterns
- [ ] Plan for Sentry v9 upgrade

---

**Deployment Lead:** [Your Name]  
**Date:** December 2, 2025  
**Status:** Ready for Production ✅
