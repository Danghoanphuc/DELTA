# Security & Architecture Fixes - Printz Platform Features

**Status**: 🔴 CRITICAL ISSUES IDENTIFIED - MUST FIX BEFORE PRODUCTION

**Last Updated**: December 8, 2025

---

## 🔴 CRITICAL SECURITY VULNERABILITIES

### 1. Remote Code Execution (RCE) in Formula Evaluation

**Severity**: CRITICAL  
**Location**: `apps/admin-backend/src/services/pricing.service.ts:420-440`  
**Issue**: Using `new Function()` to evaluate pricing formulas allows arbitrary code execution

**Current Code**:

```typescript
private evaluateFormula(formulaStr: string, context: Record<string, number>): number {
  // ... variable replacement
  const fn = new Function(`return ${expression}`); // ⚠️ RCE VULNERABILITY
  return fn();
}
```

**Attack Scenario**:

```javascript
// Malicious formula injected by compromised admin account:
formula: "process.exit(1)"; // Crashes server
formula: "require('fs').readFileSync('/etc/passwd')"; // Reads sensitive files
formula: "require('child_process').exec('rm -rf /')"; // Destroys server
```

**Fix Required**: Task 3.2.1

- Replace with safe expression parser (mathjs or expr-eval)
- Whitelist operators: `+`, `-`, `*`, `/`, `(`, `)`
- Validate formula before saving to database
- Add unit tests for injection attempts

**Priority**: 🔴 MUST FIX IMMEDIATELY

---

### 2. Race Condition in Credit Limit Enforcement

**Severity**: CRITICAL  
**Location**: `apps/admin-backend/src/services/pricing.service.ts` (not yet implemented)  
**Issue**: No transaction support for credit checks allows concurrent orders to exceed limit

**Attack Scenario**:

```
Time    Sales A                     Sales B                     Database
----    -------                     -------                     --------
T0      Check credit: 80M/100M      -                          currentDebt: 80M
T1      -                           Check credit: 80M/100M      currentDebt: 80M
T2      Create order: 30M           -                          currentDebt: 80M
T3      -                           Create order: 30M           currentDebt: 80M
T4      Update debt: 110M           -                          currentDebt: 110M ❌
T5      -                           Update debt: 140M           currentDebt: 140M ❌❌
```

**Result**: Customer debt = 140M (exceeds 100M limit by 40M)

**Fix Required**: Task 15.4

- Use MongoDB transactions for atomic check-and-reserve
- Implement optimistic locking with version field
- Add property test for concurrent scenarios

**Priority**: 🔴 MUST FIX BEFORE PRODUCTION

---

### 3. Race Condition in Asset Version Numbering

**Severity**: HIGH  
**Location**: `apps/admin-backend/src/repositories/asset.repository.ts:150-160`  
**Issue**: Sequential version assignment without locking allows duplicate versions

**Attack Scenario**:

```
Time    Upload A                    Upload B                    Database
----    --------                    --------                    --------
T0      Get last version: v2        -                          version: 2
T1      -                           Get last version: v2        version: 2
T2      Assign version: v3          -                          version: 2
T3      -                           Assign version: v3          version: 2
T4      Save asset v3               -                          version: 3
T5      -                           Save asset v3 ❌            version: 3 (duplicate!)
```

**Fix Required**: Task 7.2.1

- Use `findOneAndUpdate` with atomic increment
- Add unique compound index on (orderId, version)
- Test concurrent upload scenarios

**Priority**: 🔴 MUST FIX BEFORE PRODUCTION

---

## 🟡 ARCHITECTURE ISSUES

### 4. Missing Real-time Infrastructure

**Severity**: HIGH  
**Issue**: Requirement 4 demands "5-second updates" but design uses REST polling

**Current Design**:

```
Frontend → (Poll every 5s) → REST API → Database
```

**Problem**:

- 100 concurrent users = 20 requests/second to server
- Unnecessary database load
- Not truly "real-time"

**Fix Required**: Tasks 9.2, 22.2.1, 22.8

- Install Socket.io (server + client)
- Implement Redis Pub/Sub for event broadcasting
- Create ProductionEventEmitter service
- Update frontend to use WebSocket subscriptions

**Priority**: 🟡 HIGH - Required for Requirement 4

---

### 5. Missing Notification System for Blocked Orders

**Severity**: MEDIUM  
**Issue**: When order blocked due to credit limit, Sales not notified in real-time

**Current Flow**:

```
Order blocked → Error message → Sales must manually check
```

**Required Flow**:

```
Order blocked → WebSocket notification → Sales dashboard alert
              → Email notification
              → Zalo notification (if configured)
```

**Fix Required**: Task 15.8

- Implement NotificationService
- Support multiple channels (WebSocket, Email, Zalo)
- Include actionable information (debt, limit, shortfall)

**Priority**: 🟡 MEDIUM - UX improvement

---

## 🟢 TECHNICAL DEBT

### 6. PDF Generation Maintainability

**Severity**: LOW  
**Issue**: PDFKit requires manual coordinate-based drawing, hard to maintain

**Current**: PDFKit (low-level, manual positioning)  
**Proposed**: Puppeteer + HTML/React templates

**Benefits**:

- Reuse existing Tailwind CSS styles
- Consistent branding between web and PDF
- Easier to maintain and update layouts
- Support for complex layouts (tables, charts)

**Fix Required**: Task 5.5.1  
**Priority**: 🟢 LOW - Can defer to Phase 2

---

### 7. Missing Internationalization (i18n)

**Severity**: LOW  
**Issue**: Currency, timezone, and locale hardcoded

**Current**:

```typescript
interface PricingResult {
  costPrice: number; // Assumed VND
  calculatedAt: Date; // Timezone unclear
}
```

**Proposed**:

```typescript
interface PricingResult {
  costPrice: number;
  currency: "VND" | "USD" | "EUR";
  timezone: string; // 'Asia/Ho_Chi_Minh'
  locale: string; // 'vi-VN'
  calculatedAt: Date;
}
```

**Fix Required**: New tasks in Phase 11  
**Priority**: 🟢 LOW - Can defer to Phase 3

---

## 📊 IMPLEMENTATION PRIORITY

### Phase 1: Critical Security Fixes (MUST DO BEFORE PRODUCTION)

1. ✅ Task 3.2.1 - Fix formula evaluation RCE
2. ✅ Task 15.4 - Add credit check transactions
3. ✅ Task 7.2.1 - Fix asset version race condition
4. ✅ Task 25.1 - Security audit
5. ✅ Task 25.2 - Transaction audit

**Estimated Time**: 3-5 days  
**Blocker**: Cannot deploy to production without these fixes

---

### Phase 2: Real-time Infrastructure (HIGH PRIORITY)

1. ✅ Task 9.2 - Set up Socket.io + Redis Pub/Sub
2. ✅ Task 22.2.1 - WebSocket client setup
3. ✅ Task 22.8 - Real-time hooks
4. ✅ Task 9.8 - WebSocket endpoints
5. ✅ Task 23.4 - Real-time dashboard

**Estimated Time**: 5-7 days  
**Requirement**: Needed for Requirement 4 (5-second updates)

---

### Phase 3: Notification & Monitoring (MEDIUM PRIORITY)

1. ✅ Task 15.8 - Notification system
2. ✅ Task 27.1 - Application metrics
3. ✅ Task 27.2 - Error tracking
4. ✅ Task 27.3 - Audit logging

**Estimated Time**: 3-4 days  
**Benefit**: Improved UX and observability

---

### Phase 4: Technical Debt (LOW PRIORITY)

1. ✅ Task 5.5.1 - Puppeteer PDF generation
2. ✅ Task 26.1 - Caching optimization
3. ✅ Task 26.3 - Database indexes
4. ⏸️ i18n support (future)

**Estimated Time**: 4-6 days  
**Benefit**: Long-term maintainability

---

## 🎯 SUCCESS CRITERIA

### Security

- [ ] No eval() or new Function() in production code
- [ ] All credit checks use MongoDB transactions
- [ ] All asset operations use atomic updates
- [ ] npm audit shows 0 critical vulnerabilities
- [ ] Penetration test passed

### Performance

- [ ] Pricing calculation < 1 second (99th percentile)
- [ ] Real-time updates delivered < 5 seconds
- [ ] WebSocket connection stable for 24+ hours
- [ ] Database queries < 100ms (95th percentile)

### Correctness

- [ ] All property-based tests pass (100 iterations)
- [ ] Concurrent credit checks never exceed limit
- [ ] Asset versions always sequential
- [ ] No race conditions in production

### Observability

- [ ] All critical operations logged
- [ ] Error rate < 0.1%
- [ ] Metrics dashboard operational
- [ ] Alerts configured for critical events

---

## 📝 NOTES FOR IMPLEMENTATION

### Formula Evaluation Security

```typescript
// ❌ NEVER DO THIS
const fn = new Function(`return ${formula}`);

// ✅ DO THIS INSTEAD
import { evaluate } from "mathjs";
const result = evaluate(formula, context);
```

### Credit Check Transaction Pattern

```typescript
async checkAndReserveCredit(customerId: string, amount: number) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const credit = await CustomerCredit.findOneAndUpdate(
      {
        customerId,
        $expr: { $gte: [{ $subtract: ['$creditLimit', '$currentDebt'] }, amount] }
      },
      { $inc: { currentDebt: amount } },
      { session, new: true }
    );

    if (!credit) throw new CreditLimitExceededException();

    await session.commitTransaction();
    return credit;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}
```

### Asset Version Atomic Increment

```typescript
async getNextVersion(orderId: string): Promise<number> {
  const result = await Asset.findOneAndUpdate(
    { orderId },
    { $inc: { versionCounter: 1 } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  return result.versionCounter;
}
```

---

## 🔗 RELATED DOCUMENTS

- [Design Document](.kiro/specs/printz-platform-features/design.md)
- [Requirements Document](.kiro/specs/printz-platform-features/requirements.md)
- [Task List](.kiro/specs/printz-platform-features/tasks.md)

---

**Sign-off Required**:

- [ ] Security Team
- [ ] Architecture Team
- [ ] QA Team
- [ ] Product Owner
