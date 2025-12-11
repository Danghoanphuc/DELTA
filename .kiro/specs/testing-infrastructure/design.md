# Design Document - Testing Infrastructure

## Overview

This document outlines the comprehensive testing infrastructure design for the Delta Swag Platform. The design follows industry best practices from companies like Google, Meta, and Stripe, implementing a testing pyramid approach with 70% unit tests, 20% integration tests, and 10% E2E tests.

The testing infrastructure will provide:

- Fast feedback loops (< 10 minutes for full suite)
- High confidence in deployments
- Regression prevention
- Code quality enforcement
- Automated testing in CI/CD pipeline

## Architecture

### Testing Pyramid Structure

```
        /\
       /  \  E2E Tests (10%)
      /____\  - Critical user flows
     /      \  - Order creation → Payment → Fulfillment
    /________\ Integration Tests (20%)
   /          \ - API endpoints
  /____________\ - Database operations
                 - Service orchestration

                 Unit Tests (70%)
                 - Business logic
                 - Utilities
                 - Validators
```

### Technology Stack

#### Backend Testing

- **Test Runner**: Jest 29.x
- **HTTP Testing**: Supertest 6.x
- **Database**: mongodb-memory-server 9.x (in-memory MongoDB)
- **Mocking**: Jest built-in mocks
- **Coverage**: Istanbul (built into Jest)

#### Frontend Testing

- **Test Runner**: Jest 29.x (admin-frontend), Vitest 1.x (customer-frontend)
- **Component Testing**: React Testing Library 14.x
- **User Interactions**: @testing-library/user-event 14.x
- **API Mocking**: MSW (Mock Service Worker) 2.x
- **DOM Environment**: jsdom

## Components and Interfaces

### 1. Backend Test Structure

```
apps/admin-backend/
  src/
    services/
      admin.finance.service.ts
      __tests__/
        admin.finance.service.test.ts       # Unit tests
    repositories/
      swag-order.repository.ts
      __tests__/
        swag-order.repository.test.ts       # Integration tests
    controllers/
      admin.swag-operations.controller.ts
      __tests__/
        admin.swag-operations.integration.test.ts  # API tests
    utils/
      __tests__/
        helpers.test.ts                     # Utility tests
  __tests__/
    setup.ts                                # Global test setup
    fixtures/                               # Test data
      orders.fixture.ts
      users.fixture.ts
    helpers/                                # Test utilities
      db-helper.ts
      auth-helper.ts
```

### 2. Frontend Test Structure

```
apps/admin-frontend/
  src/
    hooks/
      __tests__/
        useSwagOrders.test.ts
    components/
      __tests__/
        OrderCard.test.tsx
    services/
      __tests__/
        swag-order.service.test.ts
    setupTests.ts                           # Test setup
    __mocks__/                              # MSW handlers
      handlers.ts
```

## Data Models

### Test Fixture Models

```typescript
// Test Data Factories
interface TestUser {
  _id: string;
  email: string;
  role: "admin" | "superadmin";
  organizationProfileId?: string;
}

interface TestOrder {
  _id: string;
  orderNumber: string;
  status: string;
  organization: string;
  swagPack: string;
  recipients: TestRecipient[];
  totalAmount: number;
}

interface TestBalanceLedger {
  _id: string;
  printer: string;
  amount: number;
  transactionType: BalanceTransactionType;
  status: BalanceLedgerStatus;
}
```

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Acceptance Criteria Testing Prework

#### 1.1 Backend testing framework setup

Thoughts: This is about infrastructure setup, not a functional requirement that can be tested with properties. We verify this works by running tests successfully.
Testable: no

#### 1.2 In-memory database usage

Thoughts: This is about test infrastructure configuration. We verify this by checking that tests don't affect real databases.
Testable: no

#### 2.1 Frontend testing framework setup

Thoughts: This is about infrastructure setup. We verify this works by running component tests successfully.
Testable: no

#### 2.2 API mocking with MSW

Thoughts: This is about test infrastructure. We verify this by checking that API calls are intercepted in tests.
Testable: no

#### 3.1 Payment processing logic correctness

Thoughts: This is critical business logic that must work for all valid inputs. We can generate random payment amounts, fees, and verify calculations are correct.
Testable: yes - property

#### 3.2 Commission calculation correctness

Thoughts: This is critical business logic. We can generate random orders with different commission rates and verify calculations.
Testable: yes - property

#### 3.3 Pricing calculation correctness

Thoughts: This is critical business logic. We can generate random products with customizations and verify pricing.
Testable: yes - property

#### 3.4 Order status transition validity

Thoughts: This is a state machine rule that should hold for all orders. We can verify only valid transitions are allowed.
Testable: yes - property

#### 3.5 Inventory deduction correctness

Thoughts: This is critical business logic. We can verify inventory is correctly deducted for any order.
Testable: yes - property

#### 4.1 JWT token generation correctness

Thoughts: This is security-critical logic. We can generate random user data and verify tokens contain correct information.
Testable: yes - property

#### 4.2 JWT token verification correctness

Thoughts: This is security-critical. We can generate invalid/expired tokens and verify they are rejected.
Testable: yes - property

#### 4.3 Password hashing correctness

Thoughts: This is security-critical. We can verify any password is hashed correctly and can be verified.
Testable: yes - property

#### 4.4 Authorization middleware correctness

Thoughts: This is security-critical. We can verify users can only access their own resources.
Testable: yes - property

#### 5.1 API response structure consistency

Thoughts: This is about API contracts. We can verify all successful responses follow the same structure.
Testable: yes - property

#### 5.2 API error response consistency

Thoughts: This is about API contracts. We can verify all error responses follow the same structure.
Testable: yes - property

#### 6.1 Repository create operation correctness

Thoughts: This is about data persistence. We can verify any data saved can be retrieved correctly.
Testable: yes - property

#### 6.2 Repository query filtering correctness

Thoughts: This is about data retrieval. We can verify filters return only matching records.
Testable: yes - property

#### 7.1 Service validation exception throwing

Thoughts: This is about error handling. We can verify invalid inputs always throw ValidationException.
Testable: yes - property

#### 7.2 Service authorization exception throwing

Thoughts: This is about security. We can verify unauthorized access always throws ForbiddenException.
Testable: yes - property

#### 8.1 Form validation behavior

Thoughts: This is UI logic. We can verify forms reject invalid inputs and accept valid inputs.
Testable: yes - property

#### 8.2 Component loading state display

Thoughts: This is UI behavior. We can verify loading indicators appear during async operations.
Testable: yes - example

#### 9.1 Hook API call correctness

Thoughts: This is about data fetching. We can verify hooks make correct API calls with correct parameters.
Testable: yes - property

#### 9.2 Hook error handling

Thoughts: This is about error states. We can verify hooks handle errors and show toast notifications.
Testable: yes - property

#### 10.1 Test fixture consistency

Thoughts: This is about test infrastructure. We verify fixtures generate valid data.
Testable: yes - property

#### 11.1 Coverage threshold enforcement

Thoughts: This is about test infrastructure. We verify coverage meets thresholds.
Testable: no

#### 12.1 CI test execution

Thoughts: This is about CI/CD infrastructure, not functional requirements.
Testable: no

#### 13.1 Test performance requirements

Thoughts: This is about test infrastructure performance, not functional correctness.
Testable: no

#### 14.1 Test isolation

Thoughts: This is about test infrastructure. We verify tests don't affect each other.
Testable: no

#### 15.1 Error message consistency

Thoughts: This is about error handling. We can verify all errors return appropriate messages.
Testable: yes - property

#### 16.1 Mock behavior correctness

Thoughts: This is about test infrastructure. We verify mocks behave like real implementations.
Testable: no

#### 17.1 Documentation completeness

Thoughts: This is about documentation, not functional requirements.
Testable: no

#### 18.1 E2E test coverage

Thoughts: This is about test infrastructure, not functional requirements.
Testable: no

### Property Reflection

After reviewing all properties, I identified the following consolidations:

**Redundancies to eliminate:**

1. Properties 5.1 and 5.2 (API response consistency) can be combined into one comprehensive property about API contract consistency
2. Properties 7.1 and 7.2 (Service exception throwing) can be combined into one property about service error handling
3. Properties 4.1 and 4.2 (JWT generation and verification) are complementary and should both be kept as they test different aspects

**Final property list after reflection:**

- 15 testable properties (reduced from 17)
- Focus on business logic, security, and data integrity
- Eliminated redundant API and service exception properties

### Correctness Properties

#### Property 1: Payment amount calculation correctness

_For any_ valid order with items and fees, the total payment amount should equal the sum of all item prices plus applicable fees minus any discounts
**Validates: Requirements 3.1**

#### Property 2: Commission calculation correctness

_For any_ order with a commission rate, the calculated commission should equal the order subtotal multiplied by the commission rate
**Validates: Requirements 3.2**

#### Property 3: Pricing calculation with customizations

_For any_ product with customizations and quantity, the total price should equal base price plus customization costs multiplied by quantity
**Validates: Requirements 3.3**

#### Property 4: Order status transition validity

_For any_ order, only valid status transitions should be allowed (e.g., draft → pending → processing → shipped → delivered)
**Validates: Requirements 3.4**

#### Property 5: Inventory deduction correctness

_For any_ order creation, inventory quantity should decrease by the ordered amount
**Validates: Requirements 3.5**

#### Property 6: JWT token data integrity

_For any_ user data, generating a JWT token and decoding it should return the same user data
**Validates: Requirements 4.1**

#### Property 7: JWT token expiration enforcement

_For any_ expired or invalid JWT token, verification should reject the token
**Validates: Requirements 4.2**

#### Property 8: Password hashing round-trip

_For any_ password, hashing it and then verifying the original password against the hash should succeed
**Validates: Requirements 4.3**

#### Property 9: Resource authorization enforcement

_For any_ user and resource, access should only be granted if the user owns the resource or has appropriate permissions
**Validates: Requirements 4.4**

#### Property 10: API contract consistency

_For any_ API endpoint, successful responses should follow the structure { success: true, data: {...} } and errors should follow { success: false, error: {...} }
**Validates: Requirements 5.1, 5.2**

#### Property 11: Repository round-trip consistency

_For any_ valid data object, creating it in the repository and then retrieving it by ID should return equivalent data
**Validates: Requirements 6.1**

#### Property 12: Repository filter correctness

_For any_ filter criteria, all returned records should match the filter and no matching records should be excluded
**Validates: Requirements 6.2**

#### Property 13: Service validation error handling

_For any_ invalid input to a service method, a ValidationException or ForbiddenException should be thrown with an appropriate message
**Validates: Requirements 7.1, 7.2**

#### Property 14: Form validation consistency

_For any_ form with validation rules, submitting invalid data should prevent submission and display error messages
**Validates: Requirements 8.1**

#### Property 15: Hook API call correctness

_For any_ data-fetching hook, calling the fetch function should make the correct API call with correct parameters and update state appropriately
**Validates: Requirements 9.1, 9.2**

## Error Handling

### Test Error Handling Strategy

#### 1. Test Failures

- **Assertion Failures**: Clear error messages indicating what was expected vs actual
- **Timeout Failures**: Increase timeout for slow operations, or optimize test
- **Setup Failures**: Fail fast with clear indication of setup issue

#### 2. Database Errors

- **Connection Failures**: Use in-memory database to avoid connection issues
- **Data Conflicts**: Clear database between tests to ensure isolation
- **Migration Issues**: Run migrations before test suite

#### 3. Mock Failures

- **Mock Not Found**: Ensure mocks are properly registered before tests
- **Mock Behavior Mismatch**: Verify mock behavior matches real implementation
- **Mock Cleanup**: Reset mocks between tests to avoid state leakage

#### 4. CI/CD Failures

- **Flaky Tests**: Identify and fix or quarantine flaky tests
- **Environment Issues**: Ensure CI environment matches local environment
- **Timeout Issues**: Optimize slow tests or increase CI timeout

### Error Reporting

```typescript
// Custom error messages for better debugging
expect(result).toBe(expected); // ❌ Generic message

expect(result).toBe(expected); // ✅ With custom message
// Expected commission to be 100 for order with amount 1000 and rate 0.1
```

## Testing Strategy

### Unit Testing Strategy

**What to Test**:

- Business logic functions
- Utility functions
- Validators
- Formatters
- Calculators

**What NOT to Test**:

- Third-party libraries
- Simple getters/setters
- Configuration files
- Trivial code

**Example Unit Test Pattern**:

```typescript
// apps/admin-backend/src/services/__tests__/admin.finance.service.test.ts

describe("FinanceService - Commission Calculation", () => {
  describe("calculateCommission", () => {
    it("should calculate commission correctly for standard rate", () => {
      // Arrange
      const order = { amount: 1000, commissionRate: 0.1 };

      // Act
      const commission = calculateCommission(order);

      // Assert
      expect(commission).toBe(100);
    });

    it("should handle zero commission rate", () => {
      const order = { amount: 1000, commissionRate: 0 };
      const commission = calculateCommission(order);
      expect(commission).toBe(0);
    });

    it("should throw ValidationException for negative rate", () => {
      const order = { amount: 1000, commissionRate: -0.1 };
      expect(() => calculateCommission(order)).toThrow(ValidationException);
    });
  });
});
```

### Integration Testing Strategy

**What to Test**:

- API endpoints (request → response)
- Database operations (CRUD)
- Service orchestration (multiple services working together)
- Authentication/Authorization flows

**Example Integration Test Pattern**:

```typescript
// apps/admin-backend/src/controllers/__tests__/admin.swag-operations.integration.test.ts

describe("POST /api/admin/swag-orders", () => {
  let authToken: string;
  let testOrganization: any;

  beforeAll(async () => {
    // Setup: Create test user and get auth token
    const admin = await createTestAdmin();
    authToken = generateTestToken(admin);
    testOrganization = await createTestOrganization();
  });

  afterAll(async () => {
    // Cleanup: Clear test data
    await clearTestDatabase();
  });

  it("should create order and return 201", async () => {
    const orderData = {
      name: "Test Order",
      swagPackId: testSwagPack._id,
      recipientIds: [testRecipient._id],
    };

    const response = await request(app)
      .post("/api/admin/swag-orders")
      .set("Authorization", `Bearer ${authToken}`)
      .send(orderData);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.order).toHaveProperty("orderNumber");
  });

  it("should return 400 for invalid data", async () => {
    const invalidData = { name: "" }; // Missing required fields

    const response = await request(app)
      .post("/api/admin/swag-orders")
      .set("Authorization", `Bearer ${authToken}`)
      .send(invalidData);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it("should return 401 without auth token", async () => {
    const response = await request(app).post("/api/admin/swag-orders").send({});

    expect(response.status).toBe(401);
  });
});
```

### Frontend Testing Strategy

**Component Testing Pattern**:

```typescript
// apps/admin-frontend/src/components/__tests__/OrderCard.test.tsx

describe("OrderCard", () => {
  const mockOrder = {
    _id: "123",
    orderNumber: "ORD-001",
    status: "pending",
    totalAmount: 1000,
  };

  it("should render order information", () => {
    render(<OrderCard order={mockOrder} />);

    expect(screen.getByText("ORD-001")).toBeInTheDocument();
    expect(screen.getByText("1000")).toBeInTheDocument();
  });

  it("should call onCancel when cancel button clicked", async () => {
    const onCancel = jest.fn();
    render(<OrderCard order={mockOrder} onCancel={onCancel} />);

    const cancelButton = screen.getByRole("button", { name: /cancel/i });
    await userEvent.click(cancelButton);

    expect(onCancel).toHaveBeenCalledWith("123");
  });
});
```

**Hook Testing Pattern**:

```typescript
// apps/admin-frontend/src/hooks/__tests__/useSwagOrders.test.ts

describe("useSwagOrders", () => {
  beforeEach(() => {
    // Setup MSW handlers
    server.use(
      rest.get("/api/swag-orders", (req, res, ctx) => {
        return res(
          ctx.json({
            success: true,
            data: { orders: [mockOrder] },
          })
        );
      })
    );
  });

  it("should fetch orders on mount", async () => {
    const { result } = renderHook(() => useSwagOrders());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.orders).toHaveLength(1);
  });

  it("should handle fetch error", async () => {
    server.use(
      rest.get("/api/swag-orders", (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result } = renderHook(() => useSwagOrders());

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });
  });
});
```

### Test Data Management

**Fixture Factory Pattern**:

```typescript
// __tests__/fixtures/orders.fixture.ts

export const createTestOrder = (overrides?: Partial<TestOrder>): TestOrder => {
  return {
    _id: new ObjectId().toString(),
    orderNumber: `ORD-${Date.now()}`,
    status: "draft",
    organization: new ObjectId().toString(),
    swagPack: new ObjectId().toString(),
    recipients: [],
    totalAmount: 1000,
    createdAt: new Date(),
    ...overrides,
  };
};

export const createTestUser = (overrides?: Partial<TestUser>): TestUser => {
  return {
    _id: new ObjectId().toString(),
    email: `test-${Date.now()}@example.com`,
    role: "admin",
    ...overrides,
  };
};

// Usage in tests
const order = createTestOrder({ status: "pending", totalAmount: 5000 });
```

### Mock Management

**Service Mocking Pattern**:

```typescript
// __mocks__/email.service.ts

export const mockEmailService = {
  sendOrderConfirmation: jest.fn().mockResolvedValue(true),
  sendShipmentNotification: jest.fn().mockResolvedValue(true),
  sendPaymentReceipt: jest.fn().mockResolvedValue(true),
};

// Usage in tests
jest.mock("../services/email.service", () => mockEmailService);

// In test
it("should send email after order creation", async () => {
  await createOrder(orderData);
  expect(mockEmailService.sendOrderConfirmation).toHaveBeenCalledWith(
    expect.objectContaining({ orderNumber: expect.any(String) })
  );
});
```

### Coverage Requirements

**Coverage Targets by Layer**:

```typescript
// jest.config.js
module.exports = {
  coverageThresholds: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    // Stricter for critical code
    "./src/services/admin.finance.service.ts": {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    },
    "./src/services/pricing.service.ts": {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    },
  },
};
```

### Test Performance Optimization

**Strategies**:

1. **Parallel Execution**: Run tests in parallel using Jest workers
2. **In-Memory Database**: Use mongodb-memory-server instead of real MongoDB
3. **Selective Testing**: Run only affected tests during development
4. **Mock External Services**: Mock all external API calls
5. **Optimize Setup/Teardown**: Share setup between related tests

```typescript
// jest.config.js
module.exports = {
  maxWorkers: "50%", // Use 50% of CPU cores
  testTimeout: 10000, // 10 second timeout
  setupFilesAfterEnv: ["<rootDir>/__tests__/setup.ts"],
};
```

### CI/CD Integration

**GitHub Actions Workflow**:

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "20"

      - name: Install dependencies
        run: pnpm install

      - name: Run tests
        run: pnpm test:ci

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

### Test Documentation

**Testing Guide Structure**:

```markdown
# Testing Guide

## Quick Start

- How to run tests
- How to run specific tests
- How to debug tests

## Writing Tests

- Unit test examples
- Integration test examples
- Component test examples
- Hook test examples

## Best Practices

- AAA pattern (Arrange, Act, Assert)
- Test naming conventions
- Mock usage guidelines
- Fixture usage

## Troubleshooting

- Common test failures
- Debugging techniques
- Performance issues
```
