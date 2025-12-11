# Implementation Plan - POD Catalog & SKU Management Optimization

## Phase 1: Core Data Models & Infrastructure

### 1.1 Create New Data Models

- [ ] 1.1.1 Create Artwork Model

  - Define schema với file info, technical specs, validation status
  - Add indexes cho organizationId, validationStatus
  - Implement version control logic
  - _Requirements: 6.1, 6.2, 6.3_

- [ ] 1.1.2 Create Production Order Model

  - Define schema với supplier info, items, status tracking
  - Add indexes cho swagOrderId, supplierId, status
  - Implement status history tracking
  - _Requirements: 7.1, 7.2, 7.3_

- [ ] 1.1.3 Create Invoice Model

  - Define schema với billing info, line items, payment status
  - Add indexes cho invoiceNumber, swagOrderId
  - Implement credit note support
  - _Requirements: 10.1, 10.2, 10.3_

- [ ] 1.1.4 Create Inventory Transaction Model
  - Define schema với transaction type, quantity changes, references
  - Add indexes cho skuVariantId, referenceId, createdAt
  - Implement COGS calculation logic
  - _Requirements: 5.1, 5.2, 5.3_

### 1.2 Enhance Existing Models

- [ ] 1.2.1 Enhance Product Model with Print Methods

  - Add printMethods array với areas, requirements, costs
  - Add moqByPrintMethod configuration
  - Add productionComplexity scoring
  - _Requirements: 2.1, 2.2, 2.3_

- [ ] 1.2.2 Enhance SKU Variant Model with Inventory Tracking

  - Add detailed inventory object (onHand, reserved, available, inTransit)
  - Add supplierMappings array
  - Add performance metrics
  - _Requirements: 5.1, 5.4, 4.2_

- [ ] 1.2.3 Enhance Swag Order Model with Production Tracking
  - Add production object với status, kitting, QC
  - Add costBreakdown object
  - Add documents references
  - _Requirements: 7.4, 8.1, 10.4_

### 1.3 Database Migrations

- [ ] 1.3.1 Create migration script for new models

  - Create collections với indexes
  - Set up default values
  - _Requirements: All_

- [ ] 1.3.2 Create migration script for existing models
  - Add new fields to Product, SKU Variant, Swag Order
  - Migrate existing data
  - Validate data integrity
  - _Requirements: All_

## Phase 2: Artwork Management System

### 2.1 Backend - Artwork Service

- [ ] 2.1.1 Implement Artwork Repository

  - Create CRUD operations
  - Implement query methods (by organization, by status)
  - _Requirements: 6.1_

- [ ] 2.1.2 Implement Artwork Service

  - Implement upload logic với S3 integration
  - Implement validation logic (resolution, format, size)
  - Implement version control
  - Implement thumbnail generation
  - _Requirements: 6.1, 6.2, 6.4_

- [ ] 2.1.3 Create Artwork Controller & Routes
  - POST /api/artworks - Upload artwork
  - GET /api/artworks - Get artwork library
  - GET /api/artworks/:id - Get artwork detail
  - POST /api/artworks/:id/validate - Validate artwork
  - POST /api/artworks/:id/version - Create new version
  - DELETE /api/artworks/:id - Delete artwork
  - _Requirements: 6.1, 6.3, 6.5_

### 2.2 Frontend - Artwork Management UI

- [ ] 2.2.1 Create Artwork Upload Component

  - File upload với drag & drop
  - Preview artwork
  - Display validation errors
  - _Requirements: 6.1, 6.5_

- [ ] 2.2.2 Create Artwork Library Page

  - Display artwork grid với thumbnails
  - Filter by status, date
  - Search by name, tags
  - _Requirements: 6.3_

- [ ] 2.2.3 Create Artwork Detail Modal
  - Display artwork info và technical specs
  - Show version history
  - Allow download original file
  - _Requirements: 6.2, 6.4_

## Phase 3: Enhanced Product Catalog

### 3.1 Backend - Product Service Enhancements

- [x] 3.1.1 Implement Print Method Configuration

  - Add methods to configure print areas
  - Validate print method requirements
  - Calculate customization costs
  - _Requirements: 2.1, 2.2, 2.5_

- [x] 3.1.2 Implement Dynamic Pricing Logic

  - Calculate price based on quantity và tiers
  - Apply volume discounts
  - Calculate customization costs
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 3.1.3 Enhance Variant Generation

  - Auto-generate SKUs với naming convention
  - Create supplier mappings
  - Initialize inventory tracking
  - _Requirements: 1.2, 1.3, 4.2_

- [x] 3.1.4 Update Product Controller & Routes
  - PUT /api/admin/catalog/products/:id/print-methods - Configure print methods
  - POST /api/admin/catalog/products/:id/pricing-tiers - Set pricing tiers
  - POST /api/catalog/products/:id/calculate-price - Calculate price
  - _Requirements: 2.1, 3.1_

### 3.2 Frontend - Product Management UI

- [ ] 3.2.1 Create Print Method Configuration UI

  - Define print areas với visual editor
  - Set artwork requirements
  - Configure costs và lead time
  - _Requirements: 2.1, 2.2_

- [ ] 3.2.2 Create Pricing Tiers Configuration UI

  - Add/edit pricing tiers
  - Preview pricing table
  - Calculate margins
  - _Requirements: 3.1, 3.3_

- [ ] 3.2.3 Enhance Product Form Page
  - Add print methods section
  - Add pricing tiers section
  - Add MOQ configuration
  - _Requirements: 1.1, 2.1, 3.1_

### 3.3 Frontend - Customer Product Selection

- [ ] 3.3.1 Create Product Customization UI

  - Select variant (size, color)
  - Choose print method và areas
  - Upload/select artwork
  - Add personalization text
  - _Requirements: 1.4, 2.4, 6.3_

- [ ] 3.3.2 Create Price Calculator Component
  - Display base price
  - Show volume discount
  - Show customization costs
  - Display total price
  - _Requirements: 3.2, 3.3, 3.4_

## Phase 4: Inventory Management System

### 4.1 Backend - Inventory Service

- [ ] 4.1.1 Implement Inventory Repository

  - Query methods cho stock levels
  - Transaction recording
  - _Requirements: 5.1_

- [ ] 4.1.2 Implement Inventory Service

  - Reserve inventory logic
  - Release inventory logic
  - Record transactions
  - Calculate available stock
  - Low stock alerts
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 4.1.3 Create Inventory Controller & Routes
  - GET /api/admin/inventory - Get inventory overview
  - POST /api/admin/inventory/:variantId/reserve - Reserve stock
  - POST /api/admin/inventory/:variantId/release - Release stock
  - POST /api/admin/inventory/:variantId/adjust - Manual adjustment
  - GET /api/admin/inventory/:variantId/transactions - Get transaction history
  - GET /api/admin/inventory/low-stock - Get low stock items
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

### 4.2 Frontend - Inventory Management UI

- [ ] 4.2.1 Create Inventory Dashboard

  - Display stock levels by product
  - Show low stock alerts
  - Display reserved vs available
  - _Requirements: 5.4_

- [ ] 4.2.2 Create Inventory Transaction History

  - Display transaction log
  - Filter by date, type, product
  - Export to CSV
  - _Requirements: 5.1_

- [ ] 4.2.3 Create Manual Adjustment Modal
  - Adjust stock quantity
  - Select reason
  - Add notes
  - _Requirements: 5.3_

## Phase 5: Production Order Management

### 5.1 Backend - Production Service

- [ ] 5.1.1 Implement Production Order Repository

  - CRUD operations
  - Query methods (by supplier, by status, by date)
  - _Requirements: 7.1_

- [ ] 5.1.2 Implement Production Service

  - Auto-generate production orders from swag orders
  - Assign to suppliers based on product mappings
  - Update status với history tracking
  - QC check workflow
  - Calculate actual vs estimated costs
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 12.1_

- [ ] 5.1.3 Create Production Controller & Routes
  - POST /api/admin/production-orders - Create production order
  - GET /api/admin/production-orders - List production orders
  - GET /api/admin/production-orders/:id - Get production order detail
  - PUT /api/admin/production-orders/:id/status - Update status
  - POST /api/admin/production-orders/:id/qc - Perform QC check
  - POST /api/admin/production-orders/:id/complete - Mark as completed
  - _Requirements: 7.1, 7.2, 7.3, 12.1_

### 5.2 Frontend - Production Management UI

- [ ] 5.2.1 Create Production Queue Page

  - Display production orders by status
  - Filter by supplier, date
  - Bulk status updates
  - _Requirements: 7.2_

- [ ] 5.2.2 Create Production Order Detail Page

  - Display order info, items, specifications
  - Show status history timeline
  - Upload QC photos
  - Add notes
  - _Requirements: 7.3, 12.1_

- [ ] 5.2.3 Create QC Check Modal
  - Upload photos
  - Mark pass/fail
  - List issues
  - Add notes
  - _Requirements: 12.1, 12.2, 12.3_

## Phase 6: Kitting & Fulfillment

### 6.1 Backend - Kitting Service

- [x] 6.1.1 Implement Kitting Workflow

  - Generate kitting checklist from swag pack
  - Track kitting progress
  - Validate all items packed
  - _Requirements: 8.1, 8.2, 8.3_

- [x] 6.1.2 Create Kitting Controller & Routes
  - GET /api/admin/kitting/queue - Get kitting queue
  - POST /api/admin/kitting/:orderId/start - Start kitting
  - POST /api/admin/kitting/:orderId/scan - Scan item
  - POST /api/admin/kitting/:orderId/complete - Complete kitting
  - _Requirements: 8.2, 8.3, 8.4_

### 6.2 Frontend - Kitting UI

- [x] 6.2.1 Create Kitting Queue Page

  - Display orders ready for kitting
  - Sort by priority, date
  - _Requirements: 8.1_

- [x] 6.2.2 Create Kitting Checklist Component

  - Display items to pack
  - Scan barcode to verify
  - Mark items as packed
  - _Requirements: 8.2, 8.3_

- [x] 6.2.3 Create Packing Slip Generator
  - Generate packing slip PDF
  - Include order info, items, recipient
  - Print functionality
  - _Requirements: 8.4_

## Phase 7: Document Management

### 7.1 Backend - Document Service

- [x] 7.1.1 Implement Invoice Service

  - Auto-generate invoice from swag order
  - Calculate line items, taxes, totals
  - Generate PDF using template
  - Send email với attachment
  - _Requirements: 10.1, 10.2_

- [x] 7.1.2 Implement Credit Note Service

  - Generate credit note for refunds
  - Link to original invoice
  - Update invoice status
  - _Requirements: 10.3_

- [x] 7.1.3 Implement Delivery Note Service

  - Generate delivery note for suppliers
  - Include production order details
  - _Requirements: 10.4_

- [x] 7.1.4 Create Document Controller & Routes
  - POST /api/admin/documents/invoice/:orderId - Generate invoice
  - POST /api/admin/documents/credit-note/:invoiceId - Generate credit note
  - POST /api/admin/documents/delivery-note/:productionOrderId - Generate delivery note
  - GET /api/admin/documents/:orderId - Get all documents for order
  - _Requirements: 10.1, 10.2, 10.3, 10.4_

### 7.2 Frontend - Document Management UI

- [ ] 7.2.1 Create Invoice List Page

  - Display invoices với status
  - Filter by date, status, organization
  - Download PDF
  - _Requirements: 10.1_

- [ ] 7.2.2 Create Invoice Detail Page
  - Display invoice info, line items
  - Show payment status
  - Generate credit note
  - Resend email
  - _Requirements: 10.2, 10.3_

## Phase 8: Supplier Management

### 8.1 Backend - Supplier Service Enhancements

- [ ] 8.1.1 Enhance Supplier Model

  - Add performance metrics (on-time rate, quality score)
  - Add lead time tracking
  - _Requirements: 4.1, 4.3_

- [ ] 8.1.2 Implement Supplier Performance Tracking

  - Calculate on-time delivery rate
  - Track quality issues
  - Update supplier ratings
  - _Requirements: 4.4, 13.2_

- [ ] 8.1.3 Update Supplier Controller & Routes
  - GET /api/admin/suppliers/:id/performance - Get performance metrics
  - PUT /api/admin/suppliers/:id/rating - Update rating
  - _Requirements: 4.4, 13.2_

### 8.2 Frontend - Supplier Management UI

- [x] 8.2.1 Enhance Supplier Detail Page

  - Display performance metrics
  - Show lead time history
  - Display quality score
  - _Requirements: 4.3, 4.4_

- [x] 8.2.2 Create Supplier Performance Dashboard
  - Compare suppliers by metrics
  - Display on-time delivery rates
  - Show cost comparisons
  - _Requirements: 13.2_

## Phase 9: Product Templates & Quick Reorder

### 9.1 Backend - Template Service

- [x] 9.1.1 Enhance Product Template Model

  - Add usage tracking
  - Add substitute product support
  - _Requirements: 11.1, 11.4_

- [x] 9.1.2 Implement Template Service

  - Create template from order
  - Load template for reorder
  - Suggest substitutes for discontinued products
  - _Requirements: 11.1, 11.2, 11.3, 11.4_

- [x] 9.1.3 Update Template Controller & Routes
  - POST /api/templates/from-order/:orderId - Create from order
  - POST /api/orders/from-template/:templateId - Create order from template
  - GET /api/templates/:id/substitutes - Get substitute suggestions
  - _Requirements: 11.1, 11.2, 11.4_

### 9.2 Frontend - Template Management UI

- [x] 9.2.1 Create Template Library Page

  - Display saved templates
  - Filter by type, date
  - Quick reorder button
  - _Requirements: 11.2_

- [x] 9.2.2 Create Save as Template Modal

  - Name template
  - Add description
  - Select type
  - _Requirements: 11.1_

- [x] 9.2.3 Create Reorder from Template Flow
  - Load template
  - Adjust quantities
  - Update recipients
  - Handle discontinued products
  - _Requirements: 11.3, 11.4_

## Phase 10: Shipping Integration

### 10.1 Backend - Shipping Service

- [ ] 10.1.1 Implement Carrier Adapters

  - Create base adapter interface
  - Implement GHN adapter
  - Implement Viettel Post adapter
  - Implement GHTK adapter
  - _Requirements: 14.1_

- [ ] 10.1.2 Implement Shipping Service

  - Create shipment via carrier API
  - Get tracking info
  - Handle webhooks for status updates
  - _Requirements: 14.1, 14.2, 14.3_

- [ ] 10.1.3 Create Shipping Controller & Routes
  - POST /api/admin/shipments - Create shipment
  - GET /api/admin/shipments/:id/tracking - Get tracking info
  - POST /api/webhooks/carriers/:carrier - Handle carrier webhooks
  - _Requirements: 14.1, 14.2, 14.3_

### 10.2 Frontend - Shipping Management UI

- [ ] 10.2.1 Create Shipment Creation Modal

  - Select carrier
  - Enter package details
  - Generate shipping label
  - _Requirements: 14.1_

- [ ] 10.2.2 Create Tracking Display Component

  - Show tracking timeline
  - Display current status
  - Show estimated delivery
  - _Requirements: 14.2, 14.3_

- [ ] 10.2.3 Create Bulk Shipment Creation
  - Select multiple orders
  - Create shipments in batch
  - Print labels in batch
  - _Requirements: 14.1_

## Phase 11: Analytics & Reporting

### 11.1 Backend - Analytics Service

- [ ] 11.1.1 Implement Product Analytics

  - Top selling products
  - Revenue by category
  - Slow-moving inventory
  - _Requirements: 13.1, 13.4_

- [ ] 11.1.2 Implement Supplier Analytics

  - On-time delivery rates
  - Quality scores
  - Average lead times
  - Cost comparisons
  - _Requirements: 13.2_

- [ ] 11.1.3 Implement Order Analytics

  - Order volume trends
  - Revenue trends
  - Average order value
  - _Requirements: 13.3_

- [ ] 11.1.4 Create Analytics Controller & Routes
  - GET /api/admin/analytics/products - Product analytics
  - GET /api/admin/analytics/suppliers - Supplier analytics
  - GET /api/admin/analytics/orders - Order analytics
  - GET /api/admin/analytics/export - Export report
  - _Requirements: 13.1, 13.2, 13.3, 13.5_

### 11.2 Frontend - Analytics Dashboard

- [ ] 11.2.1 Create Product Analytics Page

  - Top products chart
  - Revenue by category
  - Inventory turnover
  - _Requirements: 13.1, 13.4_

- [ ] 11.2.2 Create Supplier Performance Page

  - Supplier comparison table
  - On-time delivery chart
  - Quality score trends
  - _Requirements: 13.2_

- [ ] 11.2.3 Create Order Trends Page

  - Order volume chart
  - Revenue chart
  - AOV trends
  - _Requirements: 13.3_

- [ ] 11.2.4 Create Report Export Functionality
  - Select date range
  - Choose metrics
  - Export to CSV/Excel
  - _Requirements: 13.5_

## Phase 12: Cost & Margin Tracking

### 12.1 Backend - Cost Tracking Service

- [ ] 12.1.1 Implement Cost Calculation Logic

  - Calculate product costs
  - Calculate customization costs
  - Calculate operational costs
  - Calculate total cost
  - _Requirements: 15.1_

- [ ] 12.1.2 Implement Margin Calculation

  - Calculate gross margin
  - Calculate margin percentage
  - Alert on low margins
  - _Requirements: 15.2, 15.3_

- [ ] 12.1.3 Implement Actual Cost Tracking

  - Record actual costs from production orders
  - Compare actual vs estimated
  - Calculate variance
  - _Requirements: 15.4_

- [ ] 12.1.4 Create Cost Tracking Controller & Routes
  - GET /api/admin/costs/:orderId - Get cost breakdown
  - GET /api/admin/costs/margin-report - Get margin report
  - PUT /api/admin/costs/:productionOrderId/actual - Update actual costs
  - _Requirements: 15.1, 15.2, 15.4, 15.5_

### 12.2 Frontend - Cost & Margin UI

- [ ] 12.2.1 Create Cost Breakdown Component

  - Display cost categories
  - Show margin calculation
  - Highlight low margins
  - _Requirements: 15.1, 15.2_

- [ ] 12.2.2 Create Margin Report Page

  - Display margins by product
  - Display margins by customer
  - Filter by date range
  - _Requirements: 15.5_

- [ ] 12.2.3 Create Cost Variance Analysis
  - Compare estimated vs actual
  - Identify cost overruns
  - Suggest optimizations
  - _Requirements: 15.4_

## Phase 13: Testing & Quality Assurance

### 13.1 Unit Tests

- [x] 13.1.1 Write unit tests for Cost Calculation Service

  - Test product cost calculation
  - Test customization cost calculation
  - Test operational cost calculation
  - Test total cost breakdown
  - Test edge cases
  - _Requirements: 15.1_

- [x] 13.1.2 Write unit tests for Margin Calculation Service

  - Test gross margin calculation
  - Test margin percentage calculation
  - Test margin threshold alerts
  - Test margin reports by product
  - Test margin reports by customer
  - _Requirements: 15.2, 15.3, 15.5_

- [x] 13.1.3 Write unit tests for Variance Analysis Service

  - Test actual cost recording
  - Test variance calculation
  - Test variance reason analysis
  - Test variance reports
  - _Requirements: 15.4_

- [x] 13.1.4 Set up test infrastructure
  - Configure Jest
  - Set up MongoDB Memory Server
  - Create test utilities
  - Add test scripts to package.json
  - _Requirements: All_

### 13.2 Integration Tests

- [x] 13.2.1 Test Cost Tracking API endpoints

  - GET /api/admin/costs/:orderId
  - GET /api/admin/costs/margin-report
  - PUT /api/admin/costs/production-orders/:id/actual
  - GET /api/admin/costs/variance
  - _Requirements: 15.1, 15.2, 15.4, 15.5_

- [x] 13.2.2 Test Complete Cost Tracking workflow

  - Get cost breakdown → Update actual cost → Generate variance report → Generate margin report
  - _Requirements: 15.1, 15.2, 15.4, 15.5_

- [x] 13.2.3 Test Low Margin Alert workflow

  - Create low margin order → Get cost breakdown → Verify alert triggered
  - _Requirements: 15.3_

- [x] 13.2.4 Test Authentication and Authorization
  - Verify 401 without token
  - Verify 403 for unauthorized access
  - Verify 404 for non-existent resources
  - _Requirements: All_

## Phase 14: Supplier Integration & Routing (NEW - CRITICAL)

### 14.1 Create SupplierVariantMapping Model

- [ ] 14.1.1 Create SupplierVariantMapping Model

  - Define schema with skuVariantId, supplierId, supplierSku, cost, stockQuantity
  - Add indexes for performance (skuVariantId + supplierId, sku + supplierId, routing queries)
  - Add sync tracking fields (lastSyncedAt, syncStatus)
  - _Requirements: 4.2, 4.3_

- [ ] 14.1.2 Create Migration Script

  - Migrate existing supplierMappings from SkuVariant to new collection
  - Validate data integrity
  - Remove supplierMappings field from SkuVariant schema
  - _Requirements: 4.2_

- [ ] 14.1.3 Update SkuVariant Model
  - Remove supplierMappings embedded array
  - Keep inventory and metrics fields
  - Update indexes
  - _Requirements: 4.2_

### 14.2 Implement Supplier API Adapters

- [x] 14.2.1 Create Base Supplier Adapter Interface

  - Define abstract BaseSupplierAdapter class
  - Define standard methods (getProductCatalog, checkInventory, createOrder, getOrderStatus, cancelOrder)
  - Implement shared HTTP client with retry logic
  - _Requirements: 4.1, 7.1_

- [x] 14.2.2 Implement Printful Adapter

  - Implement getProductCatalog() with Printful API
  - Implement checkInventory() with real-time stock check
  - Implement createOrder() with order placement
  - Implement getOrderStatus() for tracking
  - Map Printful data format to standard format
  - _Requirements: 4.1, 7.1, 14.1_

- [x] 14.2.3 Implement CustomCat Adapter

  - Implement all BaseSupplierAdapter methods for CustomCat
  - Handle CustomCat-specific API quirks
  - Map CustomCat data format to standard format
  - _Requirements: 4.1, 7.1, 14.1_

- [x] 14.2.4 Create Supplier Adapter Factory
  - Implement factory pattern to create adapters by supplier type
  - Handle unsupported supplier types gracefully
  - Cache adapter instances for reuse
  - _Requirements: 4.1_

### 14.3 Implement SKU Translation Service

- [x] 14.3.1 Create SKU Translation Service

  - Implement translateToSupplier() method
  - Implement translateFromSupplier() for reverse lookup
  - Implement getSupplierOptions() to list all suppliers for a SKU
  - Implement bulkTranslate() for batch operations
  - _Requirements: 4.2_

- [x] 14.3.2 Create SKU Translation Controller & Routes
  - POST /api/admin/sku-translation/to-supplier - Translate to supplier SKU
  - POST /api/admin/sku-translation/from-supplier - Reverse lookup
  - GET /api/admin/sku-translation/:sku/options - Get supplier options
  - POST /api/admin/sku-translation/bulk - Bulk translate
  - _Requirements: 4.2_

### 14.4 Implement Supplier Routing Service

- [x] 14.4.1 Create Supplier Routing Service

  - Implement selectSupplier() with routing rules (stock, preferred, cost, lead time)
  - Implement routeOrder() to route entire order to suppliers
  - Implement checkInventoryAcrossSuppliers() for real-time inventory
  - Handle unroutable items gracefully
  - _Requirements: 4.3, 4.4, 5.1_

- [x] 14.4.2 Create Supplier Routing Controller & Routes

  - POST /api/admin/routing/select-supplier - Select best supplier for SKU
  - POST /api/admin/routing/route-order - Route entire order
  - GET /api/admin/routing/inventory/:sku - Check inventory across suppliers
  - _Requirements: 4.3, 4.4_

- [ ] 14.4.3 Add Routing Configuration UI
  - Configure routing rules (priority, cost optimization, lead time)
  - Set preferred suppliers per SKU
  - View routing simulation before order
  - _Requirements: 4.4_

### 14.5 Implement Automated Order Processing Workflow

- [x] 14.5.1 Set Up BullMQ Infrastructure

  - Install and configure BullMQ
  - Set up Redis connection
  - Create process-order queue
  - Configure retry and backoff strategies
  - _Requirements: 7.1_

- [x] 14.5.2 Implement Order Processing Worker

  - Extract order items from swag order
  - Call SupplierRoutingService to route items
  - Handle unroutable items with alerts
  - Create production orders for each supplier
  - Send orders to suppliers via adapters
  - Update swag order status
  - _Requirements: 7.1, 7.2, 7.3_

- [ ] 14.5.3 Implement Queue Monitoring

  - Monitor queue depth and processing time
  - Alert on failed jobs
  - Implement job retry logic
  - Create admin UI to view queue status
  - _Requirements: 7.3_

- [ ] 14.5.4 Integrate with Order Service
  - Trigger queue job when order status = PAID
  - Update order status based on processing results
  - Handle processing failures gracefully
  - _Requirements: 7.1, 7.2_

### 14.6 Implement Supplier Sync Service

- [x] 14.6.1 Create Supplier Sync Service

  - Implement syncInventory() to update stock levels from suppliers
  - Implement syncPricing() to update costs from suppliers
  - Implement syncCatalog() to sync product catalog
  - Handle sync errors and mark mappings as error status
  - _Requirements: 4.3, 5.4_

- [x] 14.6.2 Create Webhook Handlers

  - POST /api/webhooks/suppliers/printful - Handle Printful webhooks
  - POST /api/webhooks/suppliers/customcat - Handle CustomCat webhooks
  - Verify webhook signatures for security
  - Update SupplierVariantMapping on inventory/price changes
  - _Requirements: 4.3, 14.3_

- [x] 14.6.3 Implement Scheduled Sync Jobs

  - Schedule daily catalog sync (3 AM)
  - Schedule hourly inventory sync
  - Schedule daily pricing sync
  - Log sync results and errors
  - _Requirements: 4.3, 5.4_

- [ ] 14.6.4 Create Sync Monitoring UI
  - Display last sync time per supplier
  - Show sync errors and warnings
  - Manual trigger for sync
  - View sync history
  - _Requirements: 4.3_

### 14.7 Testing Supplier Integration

- [ ] 14.7.1 Write Unit Tests for Supplier Adapters

  - Test Printful adapter methods
  - Test CustomCat adapter methods
  - Test error handling and retries
  - Mock external API calls
  - _Requirements: 4.1, 14.1_

- [ ] 14.7.2 Write Unit Tests for SKU Translation Service

  - Test translateToSupplier()
  - Test translateFromSupplier()
  - Test getSupplierOptions()
  - Test bulkTranslate()
  - _Requirements: 4.2_

- [ ] 14.7.3 Write Unit Tests for Supplier Routing Service

  - Test selectSupplier() with various scenarios
  - Test routing rules (stock, preferred, cost, lead time)
  - Test routeOrder() with multiple items
  - Test unroutable items handling
  - _Requirements: 4.3, 4.4_

- [ ] 14.7.4 Write Integration Tests for Order Processing Workflow

  - Test complete flow: Order paid → Routing → Production orders → Supplier orders
  - Test unroutable items scenario
  - Test supplier API failures
  - Test queue retry logic
  - _Requirements: 7.1, 7.2, 7.3_

- [ ] 14.7.5 Write Integration Tests for Supplier Sync

  - Test inventory sync from webhooks
  - Test pricing sync from webhooks
  - Test scheduled sync jobs
  - Test sync error handling
  - _Requirements: 4.3, 14.3_

## Phase 15: Documentation & Deployment

### 15.1 Documentation

- [ ] 15.1.1 Write API documentation for Supplier Integration

  - Document supplier adapter interfaces
  - Document SKU translation endpoints
  - Document routing endpoints
  - Document webhook endpoints
  - Add request/response examples
  - _Requirements: 4.1, 4.2, 4.3, 14.3_

- [ ] 15.1.2 Write Developer Guide for Adding New Suppliers

  - How to implement new supplier adapter
  - How to test adapter
  - How to configure routing rules
  - How to set up webhooks
  - _Requirements: 4.1_

- [ ] 15.1.3 Write Operations Guide for Supplier Management
  - How to configure supplier mappings
  - How to set routing priorities
  - How to monitor sync status
  - How to handle unroutable items
  - _Requirements: 4.3, 4.4_

### 15.2 Deployment

- [ ] 15.2.1 Run Database Migrations

  - Create SupplierVariantMapping collection
  - Migrate supplierMappings data from SkuVariant
  - Create indexes
  - Validate data integrity
  - _Requirements: 4.2_

- [ ] 15.2.2 Deploy Supplier Integration Services

  - Deploy supplier adapters
  - Deploy SKU translation service
  - Deploy routing service
  - Deploy sync service
  - Configure environment variables (API keys, webhooks)
  - _Requirements: 4.1, 4.2, 4.3_

- [ ] 15.2.3 Set Up BullMQ Infrastructure

  - Deploy Redis for queue
  - Deploy order processing workers
  - Configure queue monitoring
  - Set up alerts for failed jobs
  - _Requirements: 7.1_

- [ ] 15.2.4 Configure Supplier Webhooks
  - Register webhook URLs with Printful
  - Register webhook URLs with CustomCat
  - Test webhook delivery
  - Verify webhook signatures
  - _Requirements: 14.3_

### 15.3 Monitoring & Alerts

- [ ] 15.3.1 Set Up Supplier Integration Monitoring

  - Monitor supplier API response times
  - Monitor sync job success rates
  - Monitor queue processing times
  - Monitor unroutable items rate
  - _Requirements: 4.3, 7.3_

- [ ] 15.3.2 Configure Supplier Integration Alerts

  - Alert on supplier API failures
  - Alert on sync errors
  - Alert on unroutable items
  - Alert on queue backlog
  - Alert on failed order processing
  - _Requirements: 4.3, 7.3_

- [ ] 15.3.3 Create Supplier Performance Dashboard
  - Display supplier API uptime
  - Display sync status per supplier
  - Display routing success rate
  - Display order processing metrics
  - _Requirements: 4.4, 13.2_

## Checkpoint Tasks

- [ ] Checkpoint 1: After Phase 2 - Ensure artwork upload and validation works
- [ ] Checkpoint 2: After Phase 4 - Ensure inventory tracking is accurate
- [ ] Checkpoint 3: After Phase 5 - Ensure production orders are generated correctly
- [ ] Checkpoint 4: After Phase 7 - Ensure invoices are generated correctly
- [ ] Checkpoint 5: After Phase 10 - Ensure shipping integration works
- [ ] Checkpoint 6: After Phase 14 - Ensure supplier routing and order processing works end-to-end
  - Test SKU translation for all products
  - Test supplier selection with various scenarios (stock, cost, lead time)
  - Test order routing with multiple items
  - Test automated order processing via queue
  - Test supplier sync (inventory, pricing)
  - Test webhook handling
- [ ] Final Checkpoint: Run full end-to-end test from order to delivery with supplier integration
