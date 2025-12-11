# Implementation Plan - Testing Infrastructure

## Phase 1: Backend Testing Setup (Admin Backend)

- [ ] 1. Setup Jest configuration for admin-backend

  - Install Jest, @types/jest, ts-jest, supertest, @types/supertest
  - Create jest.config.js with TypeScript support
  - Add test scripts to package.json (test, test:watch, test:coverage)
  - Create **tests**/setup.ts for global test configuration
  - _Requirements: 1.1, 1.3_

- [ ] 2. Setup in-memory MongoDB for testing

  - Install mongodb-memory-server
  - Create **tests**/helpers/db-helper.ts for database setup/teardown
  - Implement beforeAll/afterAll hooks for database lifecycle
  - Test database connection and cleanup
  - _Requirements: 1.4_

- [ ] 3. Create test fixtures and factories

  - Create **tests**/fixtures/users.fixture.ts
  - Create **tests**/fixtures/orders.fixture.ts
  - Create **tests**/fixtures/balance-ledger.fixture.ts
  - Implement factory functions for generating test data
  - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [ ] 4. Create authentication test helpers
  - Create **tests**/helpers/auth-helper.ts
  - Implement generateTestToken() function
  - Implement createTestAdmin() function
  - Implement createTestUser() function
  - _Requirements: 4.1_

## Phase 2: Critical Business Logic Tests (Priority 1)

- [ ] 5. Test payment processing logic
- [ ] 5.1 Write unit tests for payment amount calculations

  - Test total amount = items + fees - discounts
  - Test edge cases: zero amount, negative values
  - Test rounding errors
  - _Requirements: 3.1_

- [ ] 5.2 Write property test for payment calculations

  - **Property 1: Payment amount calculation correctness**
  - **Validates: Requirements 3.1**

- [ ] 6. Test commission calculation logic
- [ ] 6.1 Write unit tests for commission calculations

  - Test commission = subtotal × rate
  - Test different commission rates (0%, 5%, 10%, 15%)
  - Test edge cases: zero rate, 100% rate
  - _Requirements: 3.2_

- [ ] 6.2 Write property test for commission calculations

  - **Property 2: Commission calculation correctness**
  - **Validates: Requirements 3.2**

- [ ] 7. Test pricing calculation logic
- [ ] 7.1 Write unit tests for pricing with customizations

  - Test base price + customizations × quantity
  - Test multiple customizations
  - Test quantity discounts
  - _Requirements: 3.3_

- [ ] 7.2 Write property test for pricing calculations

  - **Property 3: Pricing calculation with customizations**
  - **Validates: Requirements 3.3**

- [ ] 8. Test order status transitions
- [ ] 8.1 Write unit tests for status transition validation

  - Test valid transitions (draft → pending → processing)
  - Test invalid transitions (shipped → draft)
  - Test status transition history
  - _Requirements: 3.4_

- [ ] 8.2 Write property test for status transitions

  - **Property 4: Order status transition validity**
  - **Validates: Requirements 3.4**

- [ ] 9. Test inventory management logic
- [ ] 9.1 Write unit tests for inventory deduction

  - Test inventory decrease on order creation
  - Test inventory restoration on order cancellation
  - Test low stock warnings
  - _Requirements: 3.5_

- [ ] 9.2 Write property test for inventory operations
  - **Property 5: Inventory deduction correctness**
  - **Validates: Requirements 3.5**

## Phase 3: Authentication & Authorization Tests (Priority 1)

- [ ] 10. Test JWT token operations
- [ ] 10.1 Write unit tests for JWT generation

  - Test token contains correct user data
  - Test token expiration setting
  - Test token signing
  - _Requirements: 4.1_

- [ ] 10.2 Write property test for JWT round-trip

  - **Property 6: JWT token data integrity**
  - **Validates: Requirements 4.1**

- [ ] 10.3 Write unit tests for JWT verification

  - Test valid token verification
  - Test expired token rejection
  - Test tampered token rejection
  - Test invalid signature rejection
  - _Requirements: 4.2_

- [ ] 10.4 Write property test for JWT expiration

  - **Property 7: JWT token expiration enforcement**
  - **Validates: Requirements 4.2**

- [ ] 11. Test password hashing
- [ ] 11.1 Write unit tests for password operations

  - Test password hashing
  - Test password verification
  - Test different password lengths
  - _Requirements: 4.3_

- [ ] 11.2 Write property test for password round-trip

  - **Property 8: Password hashing round-trip**
  - **Validates: Requirements 4.3**

- [ ] 12. Test authorization middleware
- [ ] 12.1 Write integration tests for auth middleware

  - Test authenticated requests pass through
  - Test unauthenticated requests are rejected
  - Test expired token requests are rejected
  - _Requirements: 4.4_

- [ ] 12.2 Write property test for resource authorization
  - **Property 9: Resource authorization enforcement**
  - **Validates: Requirements 4.4**

## Phase 4: Repository Layer Tests (Priority 2)

- [ ] 13. Test SwagOrder repository
- [ ] 13.1 Write integration tests for CRUD operations

  - Test create() saves data correctly
  - Test findById() retrieves correct data
  - Test update() modifies data correctly
  - Test delete() removes data correctly
  - _Requirements: 6.1_

- [ ] 13.2 Write property test for repository round-trip

  - **Property 11: Repository round-trip consistency**
  - **Validates: Requirements 6.1**

- [ ] 13.3 Write integration tests for query operations

  - Test findWithPagination() with filters
  - Test sorting and pagination
  - Test population of related data
  - _Requirements: 6.2_

- [ ] 13.4 Write property test for filtering

  - **Property 12: Repository filter correctness**
  - **Validates: Requirements 6.2**

- [ ] 14. Test BalanceLedger repository
- [ ] 14.1 Write integration tests for ledger operations
  - Test creating ledger entries
  - Test querying by printer
  - Test querying by transaction type
  - Test aggregation queries
  - _Requirements: 6.1, 6.2_

## Phase 5: Service Layer Tests (Priority 2)

- [ ] 15. Test FinanceService
- [ ] 15.1 Write unit tests for payout approval

  - Test approvePayoutRequest() updates status correctly
  - Test validation of request ID
  - Test authorization checks
  - Mock repository dependencies
  - _Requirements: 7.1, 7.2_

- [ ] 15.2 Write unit tests for payout confirmation

  - Test confirmPayoutSuccess() with proof image
  - Test transaction atomicity
  - Test status updates
  - _Requirements: 7.1_

- [ ] 15.3 Write unit tests for payout rejection

  - Test rejectPayoutRequest() with refund
  - Test refund amount calculation
  - Test transaction rollback on error
  - _Requirements: 7.1_

- [ ] 15.4 Write property test for service error handling

  - **Property 13: Service validation error handling**
  - **Validates: Requirements 7.1, 7.2**

- [ ] 16. Test SwagOperationsService
- [ ] 16.1 Write unit tests for order operations
  - Test getOrders() with filters
  - Test updateOrderStatus() validation
  - Test authorization checks
  - Mock repository dependencies
  - _Requirements: 7.1, 7.2_

## Phase 6: API Integration Tests (Priority 2)

- [ ] 17. Test Swag Operations API endpoints
- [ ] 17.1 Write integration tests for GET /api/admin/swag-orders

  - Test successful request returns 200 with orders
  - Test filtering by status
  - Test pagination
  - Test authentication requirement
  - _Requirements: 5.1, 5.2_

- [ ] 17.2 Write integration tests for POST /api/admin/swag-orders

  - Test successful creation returns 201
  - Test validation errors return 400
  - Test unauthorized access returns 401
  - Test forbidden access returns 403
  - _Requirements: 5.1, 5.2_

- [ ] 17.3 Write integration tests for PUT /api/admin/swag-orders/:id

  - Test successful update returns 200
  - Test not found returns 404
  - Test validation errors return 400
  - _Requirements: 5.1, 5.2_

- [ ] 17.4 Write property test for API contract consistency

  - **Property 10: API contract consistency**
  - **Validates: Requirements 5.1, 5.2**

- [ ] 18. Test Finance API endpoints
- [ ] 18.1 Write integration tests for payout endpoints
  - Test GET /api/admin/finance/payout-requests
  - Test POST /api/admin/finance/payout-requests/:id/approve
  - Test POST /api/admin/finance/payout-requests/:id/confirm
  - Test POST /api/admin/finance/payout-requests/:id/reject
  - _Requirements: 5.1, 5.2_

## Phase 7: Frontend Testing Setup

- [ ] 19. Setup Jest for admin-frontend (already exists, verify)

  - Verify jest.config.js configuration
  - Verify setupTests.ts exists
  - Add missing test scripts if needed
  - _Requirements: 2.1_

- [ ] 20. Setup MSW for API mocking

  - Install msw
  - Create src/**mocks**/handlers.ts
  - Create src/**mocks**/server.ts
  - Setup MSW in setupTests.ts
  - _Requirements: 2.4_

- [ ] 21. Create test utilities for frontend
  - Create test-utils.tsx with custom render function
  - Create mock data factories
  - Create helper functions for user interactions
  - _Requirements: 2.5_

## Phase 8: Frontend Component Tests (Priority 2)

- [ ] 22. Test OrderCard component
- [ ] 22.1 Write component tests for OrderCard

  - Test renders order information correctly
  - Test status badge displays correct color
  - Test action buttons are clickable
  - Test loading state
  - _Requirements: 8.1, 8.2_

- [ ] 23. Test OrderForm component
- [ ] 23.1 Write component tests for form validation

  - Test required field validation
  - Test email format validation
  - Test form submission
  - Test error message display
  - _Requirements: 8.1_

- [ ] 23.2 Write property test for form validation
  - **Property 14: Form validation consistency**
  - **Validates: Requirements 8.1**

## Phase 9: Frontend Hook Tests (Priority 2)

- [ ] 24. Test useSwagOrders hook
- [ ] 24.1 Write hook tests for data fetching

  - Test fetches orders on mount
  - Test loading state during fetch
  - Test error state on fetch failure
  - Test refetch functionality
  - _Requirements: 9.1, 9.2_

- [ ] 24.2 Write property test for hook API calls

  - **Property 15: Hook API call correctness**
  - **Validates: Requirements 9.1, 9.2**

- [ ] 25. Test useAuth hook
- [ ] 25.1 Write hook tests for authentication
  - Test login updates auth state
  - Test logout clears auth state
  - Test token refresh
  - Test error handling
  - _Requirements: 9.1, 9.2_

## Phase 10: Backend Testing Setup (Customer Backend)

- [ ] 26. Setup Jest configuration for customer-backend

  - Install Jest dependencies
  - Create jest.config.js
  - Add test scripts to package.json
  - Create **tests**/setup.ts
  - _Requirements: 1.1, 1.3_

- [ ] 27. Setup in-memory MongoDB for customer-backend

  - Install mongodb-memory-server
  - Create database helpers
  - Test database connection
  - _Requirements: 1.4_

- [ ] 28. Create test fixtures for customer-backend
  - Create fixtures for products
  - Create fixtures for orders
  - Create fixtures for customers
  - _Requirements: 10.1, 10.2, 10.3_

## Phase 11: Customer Backend Critical Tests (Priority 1)

- [ ] 29. Test pricing service
- [ ] 29.1 Write unit tests for product pricing

  - Test base price calculation
  - Test customization pricing
  - Test quantity discounts
  - Test tier pricing
  - _Requirements: 3.3_

- [ ] 30. Test order processing service
- [ ] 30.1 Write unit tests for order creation
  - Test order validation
  - Test inventory checks
  - Test payment processing integration
  - _Requirements: 3.1, 3.5_

## Phase 12: Frontend Testing Setup (Customer Frontend)

- [ ] 31. Setup Vitest for customer-frontend

  - Install Vitest and dependencies
  - Create vitest.config.ts
  - Add test scripts to package.json
  - Create setupTests.ts
  - _Requirements: 2.1, 2.3_

- [ ] 32. Setup MSW for customer-frontend
  - Install msw
  - Create mock handlers
  - Setup MSW server
  - _Requirements: 2.4_

## Phase 13: Coverage and CI/CD

- [ ] 33. Configure coverage thresholds

  - Set global coverage to 80%
  - Set critical services to 95%
  - Configure coverage reports
  - _Requirements: 11.1, 11.2, 11.3_

- [ ] 34. Setup CI/CD pipeline
  - Create .github/workflows/test.yml
  - Configure test execution on push/PR
  - Setup coverage upload to Codecov
  - Configure branch protection rules
  - _Requirements: 12.1, 12.2, 12.3_

## Phase 14: Documentation and Optimization

- [ ] 35. Create testing documentation

  - Write TESTING_GUIDE.md with examples
  - Document test patterns and best practices
  - Create troubleshooting guide
  - Document how to run specific tests
  - _Requirements: 17.1, 17.2, 17.3, 17.4_

- [ ] 36. Optimize test performance

  - Configure parallel test execution
  - Optimize slow tests
  - Setup test caching in CI
  - _Requirements: 13.1, 13.2, 13.3_

- [ ] 37. Final checkpoint - Ensure all tests pass
  - Run full test suite for all apps
  - Verify coverage meets thresholds
  - Fix any failing tests
  - Ask user if questions arise
