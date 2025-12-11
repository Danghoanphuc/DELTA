# Debt Credit Concurrency Fix

## Overview

This document describes the implementation of transaction-based credit checking to prevent race conditions when multiple orders are created concurrently for the same customer.

## Problem

Without transaction support, concurrent order creations could both pass the credit check and exceed the customer's credit limit:

```
Time    Thread 1                    Thread 2
----    --------                    --------
T1      Read debt: 5000
T2                                  Read debt: 5000
T3      Check: 5000 + 6000 <= 10000 ✓
T4                                  Check: 5000 + 6000 <= 10000 ✓
T5      Add debt: 5000 + 6000 = 11000
T6                                  Add debt: 11000 + 6000 = 17000 ❌
```

Result: Customer debt is 17000, exceeding the 10000 credit limit!

## Solution

### Transaction-Based Implementation

The `checkCreditAvailability` method now uses MongoDB transactions to ensure atomic credit checks:

1. **Start Transaction**: Begin a MongoDB session with transaction
2. **Lock Record**: Use `findOneAndUpdate` with session to lock the customer credit record
3. **Atomic Check**: Perform credit check within the transaction
4. **Reserve Credit** (optional): If `reserveCredit` is true, add debt within the same transaction
5. **Commit/Rollback**: Commit if successful, rollback on error

```typescript
async checkCreditAvailability(
  customerId: string,
  orderAmount: number,
  options: {
    reserveCredit?: boolean;
    orderId?: string;
    userId?: string;
  } = {}
): Promise<CreditCheckResult>
```

### Key Features

- **Atomic Operations**: All operations within a transaction are atomic
- **Document Locking**: `findOneAndUpdate` with session locks the document
- **Automatic Rollback**: Any error triggers automatic rollback
- **Credit Reservation**: Optional credit reservation for order creation
- **Audit Trail**: Transaction records added to debt ledger

## MongoDB Requirements

### Production Environment

MongoDB transactions require a **replica set** or **sharded cluster**. Standalone MongoDB instances do not support transactions.

**Setup for Production:**

```bash
# Convert standalone to replica set
mongod --replSet rs0 --port 27017 --dbpath /data/db

# Initialize replica set
mongo --eval "rs.initiate()"
```

**Docker Compose:**

```yaml
services:
  mongodb:
    image: mongo:6
    command: mongod --replSet rs0
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
      - ./init-replica.sh:/docker-entrypoint-initdb.d/init-replica.sh

volumes:
  mongodb_data:
```

**init-replica.sh:**

```bash
#!/bin/bash
mongo --eval "rs.initiate()"
```

### Development/Test Environment

For development and testing with standalone MongoDB, the implementation gracefully handles the lack of transaction support:

1. **Fallback Behavior**: If transactions fail, the method falls back to non-transactional checks
2. **Test Mocking**: Tests can mock the transaction behavior
3. **Documentation**: Clear documentation about the limitation

**Note**: In development without replica set, race conditions are still possible. This is acceptable for development but **must be fixed for production**.

## Testing

### Unit Tests

Property-based tests verify the credit limit enforcement logic:

```typescript
/**
 * **Feature: printz-platform-features, Property 21: Credit Limit Enforcement**
 * **Validates: Requirements 8.2, 11.2**
 */
it("should block orders that exceed credit limit", async () => {
  // Test implementation
});
```

### Concurrency Tests

Concurrency tests verify that transactions prevent race conditions:

```typescript
it("should prevent concurrent orders from exceeding credit limit", async () => {
  // Create customer with credit limit 10000
  // Attempt two concurrent orders of 6000 each
  // Verify only one succeeds
});
```

**Important**: Concurrency tests require MongoDB replica set to run. They will fail on standalone MongoDB with the error:

```
MongoServerError: Transaction numbers are only allowed on a replica set member or mongos
```

## API Changes

### Service Method Signature

```typescript
async checkCreditAvailability(
  customerId: string,
  orderAmount: number,
  options?: {
    reserveCredit?: boolean;  // NEW: Reserve credit if check passes
    orderId?: string;          // NEW: Order ID for audit trail
    userId?: string;           // NEW: User ID for audit trail
  }
): Promise<CreditCheckResult>
```

### Backward Compatibility

The method is backward compatible. Existing calls without options will work:

```typescript
// Old usage (still works)
const result = await debtService.checkCreditAvailability(
  customerId,
  orderAmount
);

// New usage with reservation
const result = await debtService.checkCreditAvailability(
  customerId,
  orderAmount,
  {
    reserveCredit: true,
    orderId: order._id.toString(),
    userId: user._id.toString(),
  }
);
```

## Usage Example

### Order Creation with Credit Check

```typescript
async createOrder(customerId: string, orderData: CreateOrderData) {
  // Check credit availability with reservation
  const creditCheck = await debtService.checkCreditAvailability(
    customerId,
    orderData.totalAmount,
    {
      reserveCredit: true,
      orderId: newOrderId,
      userId: currentUserId,
    }
  );

  if (!creditCheck.allowed) {
    throw new CreditLimitExceededException(
      customerId,
      creditCheck.currentDebt,
      creditCheck.creditLimit,
      creditCheck.orderAmount
    );
  }

  // Create order (credit already reserved)
  const order = await orderRepository.create(orderData);

  return order;
}
```

## Performance Considerations

### Transaction Overhead

MongoDB transactions have some overhead:

- **Latency**: ~5-10ms additional latency per transaction
- **Throughput**: Slightly reduced throughput due to locking
- **Scalability**: Transactions scale well with replica sets

### Optimization Tips

1. **Keep Transactions Short**: Only include necessary operations
2. **Use Indexes**: Ensure customer credit records are indexed
3. **Connection Pooling**: Use connection pooling for better performance
4. **Monitoring**: Monitor transaction metrics in production

## Monitoring

### Key Metrics

Monitor these metrics in production:

- **Transaction Success Rate**: Should be >99%
- **Transaction Duration**: Should be <50ms p95
- **Credit Check Failures**: Track blocked orders
- **Concurrent Conflicts**: Track transaction conflicts

### Logging

The implementation includes comprehensive logging:

```
[DebtSvc] Checking credit availability for customer {id}, amount {amount}
[DebtRepo] Locked credit record for customer {id} in transaction
[DebtSvc] Reserved credit {amount} for customer {id}
[DebtSvc] Credit check ALLOWED for customer {id}
```

## Rollout Plan

### Phase 1: Development (Current)

- ✅ Implement transaction-based credit checking
- ✅ Add comprehensive tests
- ✅ Document requirements and limitations
- ⏳ Test with MongoDB replica set locally

### Phase 2: Staging

- Convert staging MongoDB to replica set
- Run load tests to verify performance
- Monitor transaction metrics
- Verify no race conditions occur

### Phase 3: Production

- Schedule maintenance window
- Convert production MongoDB to replica set
- Deploy new code
- Monitor closely for 24 hours
- Rollback plan ready if issues occur

## Troubleshooting

### "Transaction numbers are only allowed on a replica set"

**Cause**: MongoDB is running as standalone instance

**Solution**: Convert to replica set:

```bash
# Stop MongoDB
sudo systemctl stop mongod

# Edit /etc/mongod.conf
replication:
  replSetName: "rs0"

# Start MongoDB
sudo systemctl start mongod

# Initialize replica set
mongo --eval "rs.initiate()"
```

### Transaction Timeouts

**Cause**: Long-running transactions or deadlocks

**Solution**:

- Keep transactions short (<100ms)
- Ensure proper indexing
- Monitor for deadlocks
- Increase transaction timeout if needed

### High Transaction Conflicts

**Cause**: Many concurrent operations on same customer

**Solution**:

- This is expected behavior (one will succeed, others will retry)
- Implement exponential backoff for retries
- Consider rate limiting per customer

## References

- [MongoDB Transactions Documentation](https://docs.mongodb.com/manual/core/transactions/)
- [Mongoose Transactions Guide](https://mongoosejs.com/docs/transactions.html)
- Task: `.kiro/specs/printz-platform-features/tasks.md` - Task 15.4
- Requirements: 8.2, 8.3 (Credit limit enforcement)
- Design: Property 21 (Credit Limit Enforcement)

## Summary

The transaction-based implementation provides strong guarantees against race conditions in credit checking. It requires MongoDB replica set in production but provides a robust solution for preventing customers from exceeding their credit limits even under high concurrency.

**Key Takeaway**: Always use MongoDB replica set in production for transaction support!
