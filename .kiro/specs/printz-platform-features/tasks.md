# Implementation Plan

## Phase 1: Foundation & Data Models

- [x] 1. Set up data models and base infrastructure

  - [x] 1.1 Create PricingFormula model with quantity tiers and formula configuration

    - Define schema with formula string, variables, quantityTiers, paperMultipliers, finishingCosts
    - Add indexes for productType and isActive
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [x] 1.2 Create Proposal model with customer snapshot and pricing details

    - Define schema with proposalNumber, customerSnapshot, items, pricing, dealPrice, salesCost
    - Add unique index for proposalNumber
    - _Requirements: 2.1, 2.4_

  - [x] 1.3 Create Asset model with version control fields

    - Define schema with version, versionLabel, status, isLocked, previousVersionId
    - Add compound index for orderId + version
    - _Requirements: 3.1, 3.2_

  - [x] 1.4 Create JobTicket model with QR code and specifications

    - Define schema with ticketId, qrCode, specifications, productionLogs, errors
    - Add unique index for ticketId and qrCode
    - _Requirements: 6.1, 6.2_

  - [x] 1.5 Create CustomerCredit model with credit limit and debt tracking

    - Define schema with creditLimit, currentDebt, overdueAmount, paymentPattern, creditHistory
    - Add index for customerId
    - _Requirements: 8.1, 11.1_

  - [x] 1.6 Create DebtLedger model for transaction history

    - Define schema with transactionType, amount, balanceBefore, balanceAfter, dueDate
    - Add compound index for customerId + createdAt
    - _Requirements: 8.5_

  - [x] 1.7 Create OutsourcedItem model for vendor tracking

    - Define schema with vendorId, cost, status, qualityCheck
    - Add indexes for orderId and vendorId
    - _Requirements: 10.1, 10.4_

- [x] 2. Checkpoint - Ensure all models compile correctly

  - Ensure all tests pass, ask the user if questions arise.

## Phase 2: Dynamic Pricing Engine

- [-] 3. Implement Pricing Service

  - [x] 3.1 Create PricingRepository with CRUD operations

    - Implement findByProductType, findActiveFormulas, create, update methods
    - _Requirements: 1.4_

  - [x] 3.2 Implement PricingService.calculatePrice method (NEEDS SECURITY FIX)

    - Parse and evaluate pricing formula with given inputs
    - Calculate costPrice, sellingPrice, profitMargin, marginPercentage
    - Return complete PricingResult within 1 second
    - ⚠️ **SECURITY ISSUE**: Currently uses `new Function()` - RCE vulnerability
    - _Requirements: 1.1_

  - [x] 3.2.1 🔴 CRITICAL: Fix formula evaluation security vulnerability

    - Replace `new Function()` with safe expression parser (mathjs or expr-eval)
    - Add strict whitelist for allowed operators: +, -, \*, /, (, )
    - Validate formula string before evaluation (no eval, no Function constructor)
    - Add unit tests for malicious formula injection attempts
    - _Security: Prevent Remote Code Execution (RCE)_

  - [x] 3.3 Write property test for pricing calculation completeness

    - **Property 1: Pricing Calculation Completeness**
    - **Validates: Requirements 1.1**

  - [x] 3.4 Implement quantity tier pricing logic

    - Apply correct tier based on quantity input
    - Ensure higher quantities get equal or lower per-unit prices
    - _Requirements: 1.2_

  - [x] 3.5 Write property test for quantity tier pricing

    - **Property 2: Quantity Tier Pricing Consistency**
    - **Validates: Requirements 1.2**

  - [x] 3.6 Implement finishing options cost calculation

    - Sum base cost with all selected finishing option costs
    - Update breakdown immediately when options change
    - _Requirements: 1.3_

  - [x] 3.7 Write property test for finishing options additive cost

    - **Property 3: Finishing Options Additive Cost**
    - **Validates: Requirements 1.3**

  - [x] 3.8 Implement formula determinism validation

    - Ensure same inputs always produce same outputs
    - _Requirements: 1.4_

  - [x] 3.9 Write property test for formula determinism

    - **Property 4: Pricing Formula Determinism**
    - **Validates: Requirements 1.4**

  - [x] 3.10 Implement margin warning threshold check

    - Return warning indicator when marginPercentage < minMargin
    - _Requirements: 1.5_

  - [x] 3.11 Write property test for margin warning threshold

    - **Property 5: Margin Warning Threshold**
    - **Validates: Requirements 1.5**

  - [x] 3.12 Create PricingController with API endpoints

    - POST /api/pricing/calculate - Calculate price for specifications
    - GET /api/pricing/formulas - Get available pricing formulas
    - PUT /api/pricing/formulas/:id - Update pricing formula (Admin)
    - _Requirements: 1.1, 1.4_

  - [x] 3.13 Register pricing routes in server.ts

    - Import and mount pricing routes
    - _Requirements: 1.1_

- [x] 4. Checkpoint - Pricing Engine complete

  - Ensure all tests pass, ask the user if questions arise.

## Phase 3: Proposal Generation

- [x] 5. Implement Proposal Service

  - [x] 5.1 Create ProposalRepository with CRUD operations

    - Implement create, findById, findByCustomer, updateStatus methods
    - _Requirements: 2.4_

  - [x] 5.2 Implement ProposalService.generateProposal method

    - Auto-populate customer details from database

    - Include product specifications and pricing
    - Generate unique proposal number
    - _Requirements: 2.1, 2.3, 2.4_

  - [x] 5.3 Write property test for proposal content completeness

    - **Property 6: Proposal Content Completeness**
    - **Validates: Requirements 2.1, 2.2, 2.3**

  - [x] 5.4 Write property test for proposal number uniqueness

    - **Property 7: Proposal Number Uniqueness**

    - **Validates: Requirements 2.4**

  - [x] 5.5 Implement PDF generation using PDFKit or similar (NEEDS REFACTOR)

    - Include customer info, specifications, pricing, terms
    - Professional layout with company branding
    - ⚠️ **TECHNICAL DEBT**: PDFKit is low-level and hard to maintain
    - _Requirements: 2.1_

  - [x] 5.5.1 🟡 REFACTOR: Migrate PDF generation to Puppeteer

    - Replace PDFKit with Puppeteer for HTML-to-PDF rendering
    - Create React/HTML invoice template component
    - Reuse Tailwind CSS styling for brand consistency
    - Ensure PDF matches web invoice design
    - _Technical Debt: Improve maintainability_

  - [x] 5.6 Implement text summary generation for Zalo/messaging

    - Create concise, copy-paste friendly format
    - Include key details: customer, items, total, deadline
    - _Requirements: 2.2_

  - [x] 5.7 Implement proposal to order conversion

    - Create order from proposal data
    - Link order to original proposal
    - _Requirements: 2.5_

  - [x] 5.8 Write property test for proposal-order linkage

    - **Property 8: Proposal-Order Linkage**
    - **Validates: Requirements 2.5**

  - [x] 5.9 Create ProposalController with API endpoints

    - POST /api/proposals - Create new proposal
    - GET /api/proposals/:id - Get proposal details
    - GET /api/proposals/:id/pdf - Download PDF
    - GET /api/proposals/:id/text - Get text summary
    - POST /api/proposals/:id/convert - Convert to order
    - _Requirements: 2.1, 2.2, 2.5_

  - [x] 5.10 Register proposal routes in server.ts

    - Import and mount proposal routes
    - _Requirements: 2.1_

- [x] 6. Checkpoint - Proposal Generation complete

  - Ensure all tests pass, ask the user if questions arise.

## Phase 4: Asset Version Control

- [-] 7. Implement Asset Service

  - [x] 7.1 Create AssetRepository with version management

    - Implement create, findByOrder, findLatestVersion, updateStatus methods
    - _Requirements: 3.1_

  - [x] 7.2 Implement AssetService.uploadAsset with auto-versioning (NEEDS CONCURRENCY FIX)

    - Assign sequential version numbers (v1, v2, v3...)
    - Store file with checksum for integrity
    - ⚠️ **RACE CONDITION**: Multiple uploads can get same version number
    - _Requirements: 3.1_

  - [x] 7.2.1 🔴 CRITICAL: Add transaction support for asset versioning

    - Use MongoDB transactions to prevent race conditions
    - Implement atomic version increment with findOneAndUpdate
    - Add optimistic locking with version field
    - Test concurrent upload scenarios
    - _Correctness: Prevent duplicate version numbers_

  - [x] 7.3 Write property test for asset version sequencing

    - **Property 9: Asset Version Sequencing**
    - **Validates: Requirements 3.1**

  - [x] 7.4 Implement markAsFinal with locking mechanism

    - Set status to 'final' and isLocked to true
    - Reject any modification attempts on locked assets
    - _Requirements: 3.2_

  - [x] 7.5 Implement validateForProduction method

    - Check if order has at least one FINAL asset
    - Block submission if no FINAL assets exist
    - Return only FINAL assets for production
    - _Requirements: 3.3, 3.4_

  - [x] 7.6 Implement createRevision for FINAL file updates

    - Create new version from FINAL file
    - Mark old FINAL as superseded
    - Require re-approval for new version
    - _Requirements: 3.5_

  - [x] 7.7 Create AssetController with API endpoints

    - POST /api/orders/:orderId/assets - Upload asset
    - GET /api/orders/:orderId/assets - List assets with versions
    - PUT /api/assets/:id/final - Mark as FINAL
    - POST /api/assets/:id/revision - Create revision
    - _Requirements: 3.1, 3.2, 3.5_

  - [x] 7.8 Register asset routes in server.ts

    - Import and mount asset routes
    - _Requirements: 3.1_

- [x] 8. Checkpoint - Asset Version Control complete

  - Ensure all tests pass, ask the user if questions arise.

## Phase 5: Production Status & Job Tickets

- [x] 9. Implement Production Status Service

  - [x] 9.1 Create ProductionStatusRepository

    - Implement updateStatus, addLog, getTimeline methods
    - _Requirements: 4.3_

  - [x] 9.2 🔴 CRITICAL: Set up real-time infrastructure

    - Install and configure Socket.io for WebSocket support
    - Create ProductionEventEmitter service using Redis Pub/Sub
    - Implement event broadcasting for status changes
    - Add WebSocket authentication middleware
    - _Requirements: 4.1 - Real-time updates within 5 seconds_

  - [x] 9.3 Implement status update with logging and real-time broadcast

    - Record timestamp and operator ID for each transition
    - Support barcode scanning workflow
    - Emit WebSocket event on status change
    - _Requirements: 4.2, 4.3_

  - [x] 9.4 Write property test for production status logging

    - **Property 12: Production Status Logging**
    - **Validates: Requirements 4.2, 4.3**

  - [x] 9.5 Implement getTimeline method

    - Return all stages in chronological order
    - Include current stage and estimated completion
    - _Requirements: 4.4_

  - [x] 9.6 Write property test for timeline completeness

    - **Property 13: Production Timeline Completeness**
    - **Validates: Requirements 4.4**

  - [x] 9.7 Implement issue reporting and notification

    - Create issue record linked to order
    - Trigger notification to assigned Sales
    - _Requirements: 4.5_

  - [x] 9.8 Create ProductionStatusController with REST + WebSocket endpoints

    - PUT /api/production/:orderId/status - Update status (emits WebSocket event)
    - POST /api/production/scan - Barcode scan endpoint
    - GET /api/production/:orderId/timeline - Get timeline
    - POST /api/production/:orderId/issues - Report issue
    - WebSocket: 'production:status:updated' event
    - _Requirements: 4.1, 4.2, 4.4, 4.5_

- [x] 10. Implement Job Ticket Service

  - [x] 10.1 Create JobTicketRepository

    - Implement create, findByOrder, findByQR methods
    - _Requirements: 6.2_

  - [x] 10.2 Implement generateJobTicket method

    - Include all technical specifications
    - Generate unique QR code linking to ticket
    - _Requirements: 6.1, 6.2_

  - [x] 10.3 Write property test for job ticket specification completeness

    - **Property 16: Job Ticket Specification Completeness**
    - **Validates: Requirements 6.1, 6.4**

  - [x] 10.4 Write property test for QR code uniqueness and resolution

    - **Property 17: QR Code Uniqueness and Resolution**
    - **Validates: Requirements 6.2, 6.3**

  - [x] 10.5 Implement QR code scanning resolution

    - Return job ticket data when QR is scanned
    - Display specifications on production device
    - _Requirements: 6.3, 6.4_

  - [x] 10.6 Implement error logging for accountability

    - Link errors to job ticket for traceability
    - _Requirements: 6.5_

  - [x] 10.7 Create JobTicketController with API endpoints

    - POST /api/orders/:orderId/job-ticket - Generate job ticket
    - GET /api/job-tickets/:id - Get ticket details
    - GET /api/job-tickets/qr/:code - Resolve QR code
    - POST /api/job-tickets/:id/errors - Log production error
    - _Requirements: 6.1, 6.3, 6.5_

- [x] 11. Checkpoint - Production Module complete

  - Ensure all tests pass, ask the user if questions arise.

## Phase 6: Deadline Alerts

- [x] 12. Implement Alert Service

  - [x] 12.1 Create AlertRepository

    - Implement create, findPending, markSent methods
    - _Requirements: 5.1_

  - [x] 12.2 Implement deadline checking job

    - Check orders with deadlines within threshold
    - Generate alerts for 24h and 48h thresholds
    - _Requirements: 5.1, 5.2_

  - [x] 12.3 Write property test for deadline alert triggering

    - **Property 14: Deadline Alert Triggering**
    - **Validates: Requirements 5.1, 5.2**

  - [x] 12.4 Implement escalation logic

    - Escalate to Sales Manager if production not started within 48h
    - _Requirements: 5.2_

  - [x] 12.5 Implement deadline urgency sorting

    - Sort orders by deadline (earliest first)
    - Highlight at-risk orders
    - _Requirements: 5.3, 5.4_

  - [x] 12.6 Write property test for deadline sorting correctness

    - **Property 15: Deadline Sorting Correctness**
    - **Validates: Requirements 5.3**

  - [x] 12.7 Implement configurable thresholds per customer tier

    - Allow different alert thresholds for different tiers
    - _Requirements: 5.5_

  - [x] 12.8 Create AlertController with API endpoints

    - GET /api/alerts - Get pending alerts
    - PUT /api/alerts/:id/acknowledge - Acknowledge alert
    - PUT /api/alerts/thresholds - Configure thresholds (Admin)
    - _Requirements: 5.1, 5.5_

- [ ] 13. Checkpoint - Alert System complete
  - Ensure all tests pass, ask the user if questions arise.

## Phase 7: Re-order & Debt Tracking

- [x] 14. Implement Re-order Service

  - [x] 14.1 Create ReorderService

    - Implement createReorder, comparePrice methods

    - _Requirements: 7.1_

  - [x] 14.2 Implement createReorder method

    - Copy specifications and FINAL files from original
    - Recalculate pricing with current rates
    - Link to original order
    - _Requirements: 7.1, 7.2, 7.4_

  - [x] 14.3 Write property test for re-order specification preservation

    - **Property 18: Re-order Specification Preservation**
    - **Validates: Requirements 7.1, 7.4**

  - [x] 14.4 Write property test for re-order pricing recalculation

    - **Property 19: Re-order Pricing Recalculation**
    - **Validates: Requirements 7.2, 7.3**

  - [x] 14.5 Implement price comparison display

    - Show old vs new pricing when rates changed
    - _Requirements: 7.3_

  - [x] 14.6 Skip asset approval for existing FINAL files

    - Reuse approved assets without re-approval
    - _Requirements: 7.5_

  - [x] 14.7 Create ReorderController with API endpoints

    - POST /api/orders/:orderId/reorder - Create re-order
    - GET /api/orders/:orderId/reorder-preview - Preview with price comparison
    - _Requirements: 7.1, 7.3_

- [-] 15. Implement Debt Service

  - [x] 15.1 Create DebtRepository

    - Implement getBalance, addTransaction, getHistory methods
    - _Requirements: 8.1_

  - [x] 15.2 Implement getCustomerDebt method

    - Calculate current debt from ledger transactions
    - Include overdue amount and payment pattern
    - _Requirements: 8.1, 8.5_

  - [x] 15.3 Write property test for debt display accuracy

    - **Property 20: Debt Display Accuracy**
    - **Validates: Requirements 8.1, 8.5**

  - [x] 15.4 🔴 CRITICAL: Implement checkCreditAvailability with transaction support

    - Use MongoDB transaction to prevent race conditions
    - Atomic check: (currentDebt + orderAmount) <= creditLimit
    - Lock customer credit record during check
    - Reserve credit amount if check passes
    - Rollback on failure
    - _Requirements: 8.2, 8.3_
    - _Correctness: Prevent concurrent orders exceeding credit limit_

  - [x] 15.5 Write property test for credit limit enforcement with concurrency

    - **Property 21: Credit Limit Enforcement**
    - **Validates: Requirements 8.2, 11.2**
    - Test concurrent order creation scenarios
    - Verify no race conditions allow credit limit breach

  - [ ] 15.6 Write property test for credit block message completeness

    - **Property 22: Credit Block Message Completeness**
    - **Validates: Requirements 8.3, 11.3**

  - [ ] 15.7 Implement payment recording with transaction

    - Record payment and update balance atomically
    - Release reserved credit on payment
    - _Requirements: 8.4_

  - [ ] 15.8 Implement notification system for blocked orders

    - Send real-time notification to Sales when order blocked
    - Include debt details, credit limit, and shortfall amount
    - Support multiple channels: WebSocket, Email, Zalo
    - _Requirements: 8.3_

  - [ ] 15.9 Create DebtController with API endpoints
    - GET /api/customers/:id/debt - Get debt summary
    - GET /api/customers/:id/debt/history - Get transaction history
    - POST /api/customers/:id/payments - Record payment
    - _Requirements: 8.1, 8.5_

- [ ] 16. Checkpoint - Re-order & Debt complete
  - Ensure all tests pass, ask the user if questions arise.

## Phase 8: Multi-Tier Pricing & Credit Management

- [ ] 17. Implement Multi-Tier Pricing Service

  - [ ] 17.1 Implement calculateActualMargin method
    - Calculate: actualProfit = dealPrice - costPrice - salesCost
    - Return full margin breakdown
    - _Requirements: 9.1, 9.2_
  - [ ] 17.2 Write property test for actual margin calculation
    - **Property 23: Actual Margin Calculation**
    - **Validates: Requirements 9.1, 9.2**
  - [ ] 17.3 Implement min margin validation and blocking
    - Block order if actualMarginPercentage < minMargin
    - Require manager approval for override
    - _Requirements: 9.3_
  - [ ] 17.4 Write property test for min margin enforcement
    - **Property 24: Min Margin Enforcement**
    - **Validates: Requirements 9.3**
  - [ ] 17.5 Implement document generation with content segregation
    - Customer documents: show dealPrice only
    - Internal reports: show full breakdown
    - _Requirements: 9.4, 9.5_
  - [ ] 17.6 Write property test for document content segregation
    - **Property 25: Document Content Segregation**
    - **Validates: Requirements 9.4, 9.5**
  - [ ] 17.7 Create MultiTierPricingController with API endpoints
    - POST /api/orders/:id/deal-price - Set deal price and sales cost
    - GET /api/orders/:id/margin - Get margin breakdown (internal)
    - GET /api/orders/:id/customer-invoice - Generate customer invoice
    - GET /api/orders/:id/internal-report - Generate internal report
    - _Requirements: 9.1, 9.4, 9.5_

- [ ] 18. Implement Credit Service

  - [ ] 18.1 Implement setCreditLimit with audit logging
    - Set credit limit for customer
    - Log change with timestamp and approver
    - _Requirements: 11.1, 11.5_
  - [ ] 18.2 Write property test for credit limit audit trail
    - **Property 28: Credit Limit Audit Trail**
    - **Validates: Requirements 11.4, 11.5**
  - [ ] 18.3 Implement override request and approval workflow
    - Allow manager to approve blocked orders
    - Create audit trail for overrides
    - _Requirements: 11.4_
  - [ ] 18.4 Create CreditController with API endpoints
    - PUT /api/customers/:id/credit-limit - Set credit limit
    - GET /api/customers/:id/credit-limit/history - Get change history
    - POST /api/orders/:id/override-request - Request override
    - PUT /api/override-requests/:id/approve - Approve override
    - _Requirements: 11.1, 11.4, 11.5_

- [ ] 19. Checkpoint - Multi-Tier Pricing & Credit complete
  - Ensure all tests pass, ask the user if questions arise.

## Phase 9: Outsourcing Management

- [ ] 20. Implement Outsourcing Service

  - [ ] 20.1 Create OutsourcingRepository
    - Implement create, findByOrder, updateStatus methods
    - _Requirements: 10.4_
  - [ ] 20.2 Implement markAsExternal method
    - Mark line item as external with vendor and cost
    - Validate required fields (vendorId, cost)
    - _Requirements: 10.1, 10.2_
  - [ ] 20.3 Write property test for external item vendor requirement
    - **Property 26: External Item Vendor Requirement**
    - **Validates: Requirements 10.1, 10.2**
  - [ ] 20.4 Implement vendor cost inclusion in total
    - Include all vendor costs in order total cost
    - _Requirements: 10.3_
  - [ ] 20.5 Write property test for vendor cost inclusion
    - **Property 27: Vendor Cost Inclusion**
    - **Validates: Requirements 10.3**
  - [ ] 20.6 Implement vendor status tracking
    - Track item location at each vendor
    - Display vendor status on dashboard
    - _Requirements: 10.4_
  - [ ] 20.7 Implement receipt and quality check recording
    - Record when items are received from vendor
    - Record quality check results
    - _Requirements: 10.5_
  - [ ] 20.8 Create OutsourcingController with API endpoints
    - PUT /api/line-items/:id/external - Mark as external
    - GET /api/orders/:id/outsourcing - Get outsourcing status
    - POST /api/outsourced-items/:id/receipt - Record receipt
    - POST /api/outsourced-items/:id/qc - Record quality check
    - _Requirements: 10.1, 10.4, 10.5_

- [ ] 21. Checkpoint - Outsourcing Management complete
  - Ensure all tests pass, ask the user if questions arise.

## Phase 10: Frontend Integration

- [ ] 22. Implement Frontend Services and Hooks

  - [ ] 22.1 Create pricing.service.ts with API calls

    - calculatePrice, getFormulas, updateFormula methods
    - _Requirements: 1.1_

  - [ ] 22.2 Create usePricing hook for state management

    - Handle loading, error states, pricing results
    - _Requirements: 1.1_

  - [ ] 22.2.1 🔴 Set up WebSocket client infrastructure

    - Install and configure Socket.io client
    - Create WebSocket context provider
    - Implement auto-reconnection logic
    - Add authentication token to WebSocket connection
    - _Requirements: 4.1 - Real-time updates_

  - [ ] 22.3 Create proposal.service.ts with API calls
    - generateProposal, downloadPDF, getTextSummary, convertToOrder methods
    - _Requirements: 2.1, 2.2_
  - [ ] 22.4 Create useProposal hook for state management
    - Handle proposal generation and conversion
    - _Requirements: 2.1_
  - [ ] 22.5 Create asset.service.ts with API calls
    - uploadAsset, markAsFinal, getVersions methods
    - _Requirements: 3.1, 3.2_
  - [ ] 22.6 Create useAssets hook for state management
    - Handle file uploads and version management
    - _Requirements: 3.1_
  - [ ] 22.7 Create production.service.ts with API calls

    - updateStatus, getTimeline, reportIssue methods
    - _Requirements: 4.1, 4.4_

  - [ ] 22.8 Create useProduction hook with WebSocket integration

    - Handle real-time status updates via WebSocket
    - Subscribe to 'production:status:updated' events
    - Auto-update UI when status changes
    - Fallback to polling if WebSocket disconnected
    - _Requirements: 4.1_

  - [ ] 22.9 Create debt.service.ts with API calls
    - getDebt, checkCredit, recordPayment methods
    - _Requirements: 8.1, 8.2_
  - [ ] 22.10 Create useDebt hook for state management
    - Handle debt display and credit checks
    - _Requirements: 8.1_

- [ ] 23. Implement Frontend Pages

  - [ ] 23.1 Create PricingCalculatorPage component
    - Form for product specifications
    - Real-time pricing display
    - Margin warning indicators
    - _Requirements: 1.1, 1.5_
  - [ ] 23.2 Create ProposalPage component
    - Proposal generation form
    - PDF preview and download
    - Text summary copy button
    - _Requirements: 2.1, 2.2_
  - [ ] 23.3 Create AssetManagerPage component
    - File upload with drag-and-drop
    - Version history display
    - FINAL marking controls
    - _Requirements: 3.1, 3.2_
  - [ ] 23.4 Create ProductionDashboardPage component with real-time updates

    - Real-time status display via WebSocket
    - Timeline visualization
    - Deadline alerts
    - Live notification badge for status changes
    - Audio/visual alerts for critical events
    - _Requirements: 4.1, 4.4, 5.3_

  - [ ] 23.5 Create JobTicketPage component
    - QR code display
    - Specifications view
    - Print-friendly layout
    - _Requirements: 6.1, 6.4_
  - [ ] 23.6 Create CustomerDebtPage component
    - Debt summary display
    - Transaction history
    - Credit limit status
    - _Requirements: 8.1, 8.5, 11.1_
  - [ ] 23.7 Create ReorderPage component
    - Re-order button on completed orders
    - Price comparison display
    - _Requirements: 7.1, 7.3_
  - [ ] 23.8 Create OutsourcingDashboardPage component
    - Vendor status tracking
    - Item location display
    - _Requirements: 10.4_

- [ ] 24. Final Checkpoint - All tests passing
  - Ensure all tests pass, ask the user if questions arise.

## Phase 11: Security & Performance Hardening

- [ ] 25. Security Audit & Fixes

  - [ ] 25.1 Verify formula evaluation security

    - Confirm no eval() or new Function() in production code
    - Test malicious formula injection scenarios
    - Document safe expression parser usage
    - _Security: RCE prevention_

  - [ ] 25.2 Audit transaction usage

    - Verify all credit checks use transactions
    - Verify all asset versioning uses atomic operations
    - Test concurrent operation scenarios
    - _Correctness: Race condition prevention_

  - [ ] 25.3 Review authentication & authorization

    - Verify all admin endpoints require authentication
    - Check role-based access control (RBAC)
    - Test unauthorized access scenarios
    - _Security: Access control_

  - [ ] 25.4 Add rate limiting

    - Implement rate limiting for pricing calculations
    - Protect against DoS attacks
    - Configure per-user and per-IP limits
    - _Security: DoS prevention_

- [ ] 26. Performance Optimization

  - [ ] 26.1 Add caching for pricing formulas

    - Cache active formulas in Redis
    - Invalidate cache on formula updates
    - Reduce database queries
    - _Performance: Response time_

  - [ ] 26.2 Optimize WebSocket connections

    - Implement connection pooling
    - Add heartbeat mechanism
    - Monitor connection count
    - _Performance: Real-time scalability_

  - [ ] 26.3 Add database indexes

    - Index frequently queried fields
    - Compound indexes for common queries
    - Monitor slow queries
    - _Performance: Query optimization_

- [ ] 27. Monitoring & Observability

  - [ ] 27.1 Add application metrics

    - Track pricing calculation time
    - Monitor WebSocket connection count
    - Track credit check failures
    - _Observability: System health_

  - [ ] 27.2 Set up error tracking

    - Configure Sentry for error reporting
    - Add custom error contexts
    - Set up alert rules
    - _Observability: Error detection_

  - [ ] 27.3 Add audit logging

    - Log all credit limit changes
    - Log all formula modifications
    - Log all FINAL asset approvals
    - _Compliance: Audit trail_

- [ ] 28. Final Security Checkpoint
  - Run security scan (npm audit, Snyk)
  - Verify all critical vulnerabilities fixed
  - Document security measures
  - Get security sign-off
