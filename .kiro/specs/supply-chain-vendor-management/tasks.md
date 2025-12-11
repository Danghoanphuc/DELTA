# Implementation Plan - Supply Chain & Vendor Management System

## Overview

Transform the vendor/supplier management from a simple "Address Book" into a comprehensive "Supply Chain Capability Profile" system with geo-spatial routing, auto-banking, performance tracking, and intelligent order routing.

---

## Phase 1: Enhanced Vendor Model & Financial Management

- [ ] 1. Extend Vendor/Supplier Model with Financial & Banking Information

  - Extend existing `ISupplier` interface in `catalog.models.ts` to include banking information
  - Add fields: `bankingInfo` (bank name, account number, account holder, VietQR image URL)
  - Add fields: `paymentTerms` enum (immediate_100, deposit_50, net_30)
  - Add fields: `autoBank ingEnabled` boolean flag
  - Add validation for required banking fields when auto-banking is enabled
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ]\* 1.1 Write property test for vendor banking validation

  - **Property 1: Banking info completeness**
  - **Validates: Requirements 1.1**

- [ ] 2. Extend Vendor Model with Operational Capacity

  - Add `operationalCapacity` object with fields: `vendorTypes` array (blank_supplier, processing, fulfillment_center)
  - Add `isFulfillmentCenter` boolean flag
  - Add `throughput` object (capacity per day, unit)
  - Add `currentLoad` number (percentage of capacity used)
  - Add `leadTime` object (min, max, unit) - already exists, verify structure
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ]\* 2.1 Write property test for capacity calculations
  - **Property 2: Capacity threshold triggers**
  - **Validates: Requirements 2.4**

---

## Phase 2: Geo-Spatial & Logistics Capabilities

- [ ] 3. Add Geo-Spatial Data to Vendor Model

  - Add `location` object with GeoJSON Point type for MongoDB geospatial queries
  - Add fields: `address`, `latitude`, `longitude`
  - Create 2dsphere index on `location` field
  - Add `inboundCapability` array (motorcycle, truck_1ton, container)
  - Add `services` array (kitting, cross_docking)
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ]\* 3.1 Write property test for distance calculations

  - **Property 3: Distance calculation accuracy**
  - **Validates: Requirements 3.2**

- [ ] 4. Implement Geo-Spatial Repository Methods

  - Create `VendorRepository` class in `repositories/vendor.repository.ts`
  - Implement `findNearby(coordinates, maxDistance, filters)` method using MongoDB `$near` operator
  - Implement `calculateDistance(vendorId, destinationCoords)` method
  - Implement `findByInboundCapability(capability, location)` method
  - _Requirements: 3.2, 3.4_

- [ ]\* 4.1 Write property test for geospatial queries
  - **Property 4: Nearby vendor search consistency**
  - **Validates: Requirements 3.2**

---

## Phase 3: Active Communication & Vendor Connectivity

- [ ] 5. Add Communication Fields to Vendor Model

  - Add `communication` object with fields: `zaloOAId`, `zaloUserId`, `primaryPhone`, `workingHours` (start, end, timezone)
  - Add `escalationContact` object (name, phone, relationship)
  - Add `notificationPreferences` object (zalo, sms, call, email)
  - _Requirements: 4.1, 4.2, 4.3_

- [ ] 6. Create Vendor Communication Service

  - Create `VendorCommunicationService` in `services/vendor-communication.service.ts`
  - Implement `sendZaloNotification(vendorId, message, actionLink)` method
  - Implement `makePhoneCall(vendorId, message)` method using Twilio/Stringee
  - Implement `escalateToContact(vendorId, reason)` method
  - Implement `checkWorkingHours(vendorId)` method
  - _Requirements: 4.4, 4.5, 12.1, 12.2, 12.4, 12.5_

- [ ]\* 6.1 Write property test for notification delivery
  - **Property 5: Notification timing respects working hours**
  - \*\*Validates: Requirements 4.3, 4.4\_

---

## Phase 4: Product-Vendor Matrix & Multi-Vendor Support

- [ ] 7. Create Product-Vendor Mapping Model

  - Create new model `ProductVendorMapping` in `models/product-vendor-mapping.model.ts`
  - Fields: `productId`, `vendorId`, `role` enum (primary, backup_1, backup_2)
  - Fields: `vendorSku`, `cogs`, `leadTime` (min, max, unit)
  - Fields: `isActive`, `priority` number
  - Add compound index on `productId` and `priority`
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ]\* 7.1 Write property test for vendor priority ordering

  - **Property 6: Vendor selection follows priority**
  - **Validates: Requirements 5.2**

- [ ] 8. Create Product-Vendor Repository
  - Create `ProductVendorRepository` in `repositories/product-vendor.repository.ts`
  - Implement `findVendorsForProduct(productId, options)` method
  - Implement `getPrimaryVendor(productId)` method
  - Implement `getBackupVendors(productId)` method
  - Implement `updateVendorForProduct(productId, vendorId, data)` method
  - _Requirements: 5.1, 5.2_

---

## Phase 5: Auto-Switch Vendor Logic

- [ ] 9. Create Vendor Availability Service

  - Create `VendorAvailabilityService` in `services/vendor-availability.service.ts`
  - Implement `checkVendorAvailability(vendorId)` method (checks capacity, working hours, response time)
  - Implement `getAvailableVendorsForProduct(productId)` method
  - Implement `calculateVendorScore(vendorId, criteria)` method
  - _Requirements: 6.1, 6.2, 6.3_

- [ ] 10. Implement Auto-Switch Logic Service

  - Create `VendorAutoSwitchService` in `services/vendor-auto-switch.service.ts`
  - Implement `evaluateSwitchTriggers(vendorId, orderId)` method
  - Implement `switchToBackupVendor(orderId, reason)` method
  - Implement `recalculateCostsWithNewVendor(orderId, newVendorId)` method
  - Implement `logSwitchEvent(orderId, fromVendor, toVendor, reason)` method
  - Send alerts to admin when auto-switch occurs
  - _Requirements: 6.2, 6.3, 6.4, 6.5_

- [ ]\* 10.1 Write property test for auto-switch triggers

  - **Property 7: Auto-switch activates on capacity threshold**
  - **Validates: Requirements 6.3**

- [ ]\* 10.2 Write property test for cost recalculation
  - **Property 8: Cost recalculation maintains margin threshold**
  - \*\*Validates: Requirements 6.4, 11.5\_

---

## Phase 6: Product Physical Specifications

- [ ] 11. Extend Product Model with Physical Specs

  - Extend `ICatalogProduct` interface to ensure `specifications.weight` and `specifications.dimensions` are properly structured
  - Add `shippingCategory` enum (standard, bulky, fragile, liquid)
  - Add `specialHandlingFee` number field
  - Add validation to require weight and dimensions for active products
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ]\* 11.1 Write property test for shipping cost calculation
  - **Property 9: Shipping cost increases with weight and dimensions**
  - **Validates: Requirements 7.4**

---

## Phase 7: Anchor Node Capability

- [ ] 12. Add Anchor Node Fields to Product Model

  - Add `anchorCapability` object to `ICatalogProduct`
  - Fields: `isAnchorItem` boolean, `kittingFee` number, `linkedWarehouse` reference
  - Add `canReceiveFromVendors` boolean to vendor model
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 13. Create Kitting Service

  - Create `KittingService` in `services/kitting.service.ts`
  - Implement `identifyAnchorItem(orderItems)` method
  - Implement `calculateKittingFee(anchorItemId, itemCount)` method
  - Implement `createKittingPlan(orderId)` method
  - _Requirements: 8.2, 8.3, 8.5_

- [ ]\* 13.1 Write property test for kitting fee calculation
  - **Property 10: Kitting fee scales with item count**
  - **Validates: Requirements 8.3**

---

## Phase 8: Intelligent Routing Engine

- [ ] 14. Create Routing Engine Service

  - Create `RoutingEngineService` in `services/routing-engine.service.ts`
  - Implement `analyzeOrder(orderId)` method - analyzes all items and available vendors
  - Implement `calculateRoutingOptions(orderItems, deliveryAddress)` method
  - Implement `evaluateDirectShipOption(items, vendors, destination)` method
  - Implement `evaluateAnchorNodeOption(items, vendors, destination)` method
  - Implement `selectOptimalRoute(options)` method based on cost and time
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ]\* 14.1 Write property test for routing optimization

  - **Property 11: Optimal route minimizes total cost**
  - \*\*Validates: Requirements 9.2, 9.5\_

- [ ] 15. Create Cost Calculation Service

  - Create `SupplyChainCostService` in `services/supply-chain-cost.service.ts`
  - Implement `calculateTotalCOGS(orderItems, vendorAssignments)` method
  - Implement `calculateShippingCost(fromLocation, toLocation, weight, dimensions)` method
  - Implement `calculateKittingCosts(anchorItem, itemCount)` method
  - Implement `calculateMultiLegShipping(legs)` method for Satellite → Anchor → Customer
  - Implement `calculateMargin(totalCost, sellingPrice)` method
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [ ]\* 15.1 Write property test for cost breakdown
  - **Property 12: Total cost equals sum of all components**
  - \*\*Validates: Requirements 11.1, 11.2, 11.3, 11.4\_

---

## Phase 9: Vendor Performance Tracking (Enhancement)

- [ ] 16. Enhance Vendor Performance Service

  - Extend existing `SupplierService` in `services/supplier.service.ts`
  - Add method `recordQualityIssue(vendorId, orderId, issueType, severity)`
  - Add method `getVendorAlerts(vendorId)` - returns alerts for low performance
  - Add method `suggestVendorSwitch(productId)` - suggests switching based on performance
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ]\* 16.1 Write property test for performance metrics
  - **Property 13: On-time rate calculation is accurate**
  - \*\*Validates: Requirements 10.1, 10.3\_

---

## Phase 10: Vendor Dashboard & Analytics

- [ ] 17. Create Vendor Analytics Service

  - Create `VendorAnalyticsService` in `services/vendor-analytics.service.ts`
  - Implement `getVendorDashboardStats()` method - returns active/inactive/pending counts
  - Implement `getVendorListWithMetrics(filters)` method
  - Implement `getVendorDetailAnalytics(vendorId)` method - order history, performance trends, cost analysis
  - Implement `exportVendorReport(filters, format)` method - CSV/Excel export
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

- [ ] 18. Create Vendor Dashboard Controller
  - Create `VendorDashboardController` in `controllers/admin.vendor-dashboard.controller.ts`
  - Implement `GET /api/admin/vendors/dashboard` endpoint
  - Implement `GET /api/admin/vendors/list` endpoint with filtering
  - Implement `GET /api/admin/vendors/:id/analytics` endpoint
  - Implement `GET /api/admin/vendors/export` endpoint
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

---

## Phase 11: Multi-Tab Product Form (Frontend)

- [ ] 19. Create Product Form Component Structure

  - Create `ProductFormTabs` component in `apps/admin-frontend/src/components/products/`
  - Implement tab navigation: Basic Info, Print Methods, Pricing Tiers, Supply Chain
  - Create `BasicInfoTab` component - name, description, category, images
  - Create `PrintMethodsTab` component - print technologies, print areas, file requirements
  - Create `PricingTiersTab` component - pricing by quantity, discounts
  - Create `SupplyChainTab` component - vendor matrix, physical specs, anchor capability
  - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_

- [ ] 20. Implement Supply Chain Tab
  - Create vendor selection interface with role assignment (Primary, Backup 1, Backup 2)
  - Add vendor SKU input field
  - Add COGS input field per vendor
  - Add lead time input per vendor
  - Add physical specifications form (weight, dimensions, shipping category)
  - Add anchor capability toggle and configuration
  - _Requirements: 14.5, 5.1, 5.2, 5.3, 5.4, 5.5, 7.1, 7.2, 7.3, 8.1, 8.2, 8.3_

---

## Phase 12: Multi-Tab Vendor Form (Frontend)

- [ ] 21. Create Vendor Form Component Structure

  - Create `VendorFormTabs` component in `apps/admin-frontend/src/components/suppliers/`
  - Implement tab navigation: Legal & Banking, Communication, Capabilities & Logistics
  - Create `LegalBankingTab` component - company name, tax ID, bank info, VietQR, payment terms
  - Create `CommunicationTab` component - Zalo OA/User ID, phone, escalation contact, working hours
  - Create `CapabilitiesTab` component - vendor types, capacity, lead time, location, inbound capability, services
  - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_

- [ ] 22. Implement Capabilities & Logistics Tab
  - Add vendor type checkboxes (Blank Supplier, Processing, Fulfillment Center)
  - Add throughput input (capacity per day)
  - Add lead time range inputs
  - Add Google Maps integration for location selection
  - Display calculated coordinates
  - Add inbound capability checkboxes (Motorcycle, Truck 1 ton, Container)
  - Add services checkboxes (Kitting, Cross-docking)
  - _Requirements: 15.4, 2.1, 2.2, 2.3, 3.1, 3.3, 3.5_

---

## Phase 13: Auto-Banking Workflow Integration

- [ ] 23. Create Auto-Banking Service

  - Create `AutoBankingService` in `services/auto-banking.service.ts`
  - Implement `triggerAutoBanking(orderId, vendorId)` method
  - Implement `createPaymentTransaction(vendorId, amount, orderId)` method
  - Implement `sendFinanceNotification(transactionId)` method
  - Implement `confirmPayment(transactionId)` method
  - _Requirements: 1.4, 1.5_

- [ ]\* 23.1 Write property test for payment transaction creation

  - **Property 14: Payment amount matches vendor COGS**
  - **Validates: Requirements 1.4**

- [ ] 24. Integrate Auto-Banking with Order Processing
  - Update order processing workflow to check vendor payment terms
  - Trigger auto-banking when payment term is "immediate_100"
  - Create payment transaction record
  - Send notification to finance team
  - _Requirements: 1.4, 1.5_

---

## Phase 14: Communication Automation Integration

- [ ] 25. Integrate Vendor Communication with Production Orders

  - Update production order creation to trigger vendor notification
  - Send Zalo message with order details and confirmation link
  - Implement confirmation webhook endpoint
  - Implement auto-call escalation after timeout
  - Implement escalation contact notification
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [ ]\* 25.1 Write property test for notification escalation
  - **Property 15: Escalation triggers after timeout**
  - \*\*Validates: Requirements 12.4, 12.5\_

---

## Phase 15: Routing Engine Integration with Orders

- [ ] 26. Integrate Routing Engine with Order Creation

  - Update order creation workflow to call routing engine
  - Display routing options to admin for review
  - Show cost breakdown (COGS, Kitting, Shipping) for each option
  - Allow admin to select routing or use recommended option
  - Save selected routing plan with order
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 27. Create Routing Visualization Component (Frontend)
  - Create `RoutingVisualization` component to display routing options
  - Show Direct Ship vs Anchor Node patterns
  - Display cost breakdown table
  - Show estimated delivery time
  - Highlight recommended option
  - _Requirements: 9.5_

---

## Phase 16: Testing & Validation

- [ ]\* 28. Write integration tests for routing engine

  - Test complete order flow with routing
  - Test auto-switch scenarios
  - Test cost calculations with different routing options
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 6.2, 6.3, 6.4_

- [ ]\* 29. Write integration tests for vendor communication

  - Test Zalo notification sending
  - Test escalation workflow
  - Test working hours validation
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [ ]\* 30. Write integration tests for auto-banking
  - Test payment transaction creation
  - Test finance notification
  - Test payment confirmation
  - _Requirements: 1.4, 1.5_

---

## Phase 17: Documentation & Deployment

- [ ] 31. Create API Documentation

  - Document all new vendor management endpoints
  - Document routing engine endpoints
  - Document auto-banking endpoints
  - Document communication endpoints
  - Add request/response examples

- [ ] 32. Create User Guide

  - Document multi-tab vendor form usage
  - Document multi-tab product form usage
  - Document routing engine usage
  - Document auto-switch configuration
  - Document performance tracking features

- [ ] 33. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

---

## Notes

- Tasks marked with `*` are optional testing tasks that can be skipped for faster MVP
- Each phase builds incrementally on previous phases
- Frontend tasks (Phases 11-12) can be developed in parallel with backend phases
- Geo-spatial features require MongoDB 2dsphere indexes
- Zalo OA integration requires Zalo OA API credentials
- Auto-banking requires banking API integration (VietQR or similar)
