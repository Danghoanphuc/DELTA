# Design Document: Printz Platform Features

## Overview

Printz Platform Features là bộ tính năng toàn diện cho nền tảng in ấn, được thiết kế theo kiến trúc layered architecture với SOLID principles. Hệ thống bao gồm 3 module chính:

1. **Quotation Module**: Dynamic Pricing Engine, Proposal Generation, Asset Version Control
2. **Production Module**: Real-time Status Sync, Deadline Alerts, Digital Job Tickets
3. **Finance Module**: Re-order, Debt Tracking, Credit Limit Enforcement, Multi-Tier Pricing

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │ Quotation UI │  │ Production UI│  │  Finance UI  │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     API Gateway (Express)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │ Quotation API│  │Production API│  │  Finance API │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Service Layer                               │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐     │
│  │ PricingService │  │ProductionService│  │ FinanceService │     │
│  │ ProposalService│  │  AlertService  │  │  DebtService   │     │
│  │  AssetService  │  │ JobTicketService│  │ CreditService  │     │
│  └────────────────┘  └────────────────┘  └────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Repository Layer                              │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐     │
│  │QuotationRepo   │  │ProductionRepo  │  │  FinanceRepo   │     │
│  │ ProposalRepo   │  │  AlertRepo     │  │   DebtRepo     │     │
│  │  AssetRepo     │  │JobTicketRepo   │  │  CreditRepo    │     │
│  └────────────────┘  └────────────────┘  └────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Data Layer (MongoDB)                        │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐     │
│  │ PricingFormula │  │ProductionOrder │  │CustomerCredit  │     │
│  │   Proposal     │  │   JobTicket    │  │   DebtLedger   │     │
│  │    Asset       │  │ProductionLog   │  │  CreditLog     │     │
│  └────────────────┘  └────────────────┘  └────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Quotation Module

#### PricingService

```typescript
interface IPricingService {
  calculatePrice(specs: ProductSpecification): Promise<PricingResult>;
  getQuantityTiers(productType: string): Promise<QuantityTier[]>;
  validateMargin(pricing: PricingResult, minMargin: number): MarginValidation;
  applyFormula(formula: PricingFormula, inputs: FormulaInputs): number;
}

interface ProductSpecification {
  productType: string;
  size: { width: number; height: number; unit: "mm" | "cm" | "inch" };
  paperType: string;
  quantity: number;
  finishingOptions: FinishingOption[];
  printSides: "single" | "double";
  colors: number;
}

interface PricingResult {
  costPrice: number;
  sellingPrice: number;
  profitMargin: number;
  marginPercentage: number;
  breakdown: CostBreakdown;
  calculatedAt: Date;
}
```

#### ProposalService

```typescript
interface IProposalService {
  generateProposal(orderId: string, customerId: string): Promise<Proposal>;
  generatePDF(proposal: Proposal): Promise<Buffer>;
  generateTextSummary(proposal: Proposal): string;
  convertToOrder(proposalId: string): Promise<Order>;
}

interface Proposal {
  proposalNumber: string;
  customerId: string;
  customerInfo: CustomerInfo;
  items: ProposalItem[];
  pricing: PricingResult;
  terms: string;
  validUntil: Date;
  status: "draft" | "sent" | "accepted" | "rejected" | "converted";
  createdAt: Date;
}
```

#### AssetService

```typescript
interface IAssetService {
  uploadAsset(orderId: string, file: File): Promise<Asset>;
  markAsFinal(assetId: string): Promise<Asset>;
  getAssetVersions(orderId: string): Promise<Asset[]>;
  validateForProduction(orderId: string): AssetValidationResult;
  createRevision(assetId: string, file: File): Promise<Asset>;
}

interface Asset {
  _id: string;
  orderId: string;
  filename: string;
  version: number;
  versionLabel: string; // 'v1', 'v2', 'FINAL'
  status: "draft" | "review" | "approved" | "final" | "superseded";
  isLocked: boolean;
  uploadedBy: string;
  uploadedAt: Date;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
}
```

### 2. Production Module

#### ProductionStatusService

```typescript
interface IProductionStatusService {
  updateStatus(
    orderId: string,
    status: ProductionStatus,
    operatorId: string
  ): Promise<void>;
  scanBarcode(
    barcode: string,
    stationId: string,
    operatorId: string
  ): Promise<ScanResult>;
  getTimeline(orderId: string): Promise<ProductionTimeline>;
  reportIssue(orderId: string, issue: ProductionIssue): Promise<void>;
}

interface ProductionStatus {
  stage:
    | "queued"
    | "printing"
    | "finishing"
    | "packaging"
    | "ready"
    | "shipped";
  substage?: string;
  progress?: number;
  notes?: string;
}

interface ProductionTimeline {
  orderId: string;
  stages: TimelineStage[];
  currentStage: string;
  estimatedCompletion: Date;
}
```

#### AlertService

```typescript
interface IAlertService {
  checkDeadlines(): Promise<void>;
  sendAlert(alert: Alert): Promise<void>;
  escalateAlert(alertId: string, escalateTo: string): Promise<void>;
  getAlertThresholds(customerTier: string): AlertThresholds;
  configureThresholds(tier: string, thresholds: AlertThresholds): Promise<void>;
}

interface Alert {
  type:
    | "deadline_warning"
    | "deadline_critical"
    | "production_issue"
    | "escalation";
  orderId: string;
  recipientId: string;
  message: string;
  urgency: "low" | "medium" | "high" | "critical";
  deadline?: Date;
  hoursRemaining?: number;
}
```

#### JobTicketService

```typescript
interface IJobTicketService {
  generateJobTicket(orderId: string): Promise<JobTicket>;
  generateQRCode(ticketId: string): Promise<string>;
  getTicketByQR(qrCode: string): Promise<JobTicket>;
  logProductionError(ticketId: string, error: ProductionError): Promise<void>;
}

interface JobTicket {
  ticketId: string;
  orderId: string;
  qrCode: string;
  specifications: {
    size: string;
    paperType: string;
    quantity: number;
    finishingOptions: string[];
    specialInstructions: string;
    printAreas: PrintArea[];
  };
  generatedAt: Date;
  status: "active" | "completed" | "cancelled";
}
```

### 3. Finance Module

#### DebtService

```typescript
interface IDebtService {
  getCustomerDebt(customerId: string): Promise<DebtSummary>;
  checkCreditAvailability(
    customerId: string,
    orderAmount: number
  ): CreditCheckResult;
  recordPayment(customerId: string, payment: Payment): Promise<void>;
  getDebtHistory(customerId: string): Promise<DebtTransaction[]>;
}

interface DebtSummary {
  customerId: string;
  currentDebt: number;
  creditLimit: number;
  availableCredit: number;
  overdueAmount: number;
  lastPaymentDate?: Date;
  paymentPattern: "good" | "average" | "poor";
}

interface CreditCheckResult {
  allowed: boolean;
  currentDebt: number;
  creditLimit: number;
  orderAmount: number;
  shortfall?: number;
  message: string;
}
```

#### CreditService

```typescript
interface ICreditService {
  setCreditLimit(
    customerId: string,
    limit: number,
    approvedBy: string
  ): Promise<void>;
  getCreditLimit(customerId: string): Promise<number>;
  requestOverride(orderId: string, reason: string): Promise<OverrideRequest>;
  approveOverride(requestId: string, approverId: string): Promise<void>;
  getCreditLimitHistory(customerId: string): Promise<CreditLimitChange[]>;
}

interface CreditLimitChange {
  customerId: string;
  previousLimit: number;
  newLimit: number;
  changedBy: string;
  changedAt: Date;
  reason?: string;
}
```

#### MultiTierPricingService

```typescript
interface IMultiTierPricingService {
  calculateActualMargin(
    dealPrice: number,
    costPrice: number,
    salesCost: number
  ): MarginResult;
  validateMinMargin(margin: MarginResult, minMargin: number): ValidationResult;
  generateCustomerDocument(orderId: string): Promise<Buffer>; // Shows deal price only
  generateInternalReport(orderId: string): Promise<InternalReport>; // Shows full breakdown
}

interface MarginResult {
  dealPrice: number;
  costPrice: number;
  salesCost: number;
  grossProfit: number;
  actualProfit: number;
  marginPercentage: number;
}
```

#### OutsourcingService

```typescript
interface IOutsourcingService {
  markAsExternal(
    lineItemId: string,
    vendorId: string,
    cost: number
  ): Promise<void>;
  getVendorStatus(orderId: string): Promise<VendorStatus[]>;
  recordReceipt(lineItemId: string, receipt: VendorReceipt): Promise<void>;
  recordQualityCheck(
    lineItemId: string,
    qcResult: QualityCheckResult
  ): Promise<void>;
}

interface VendorStatus {
  lineItemId: string;
  vendorId: string;
  vendorName: string;
  status: "pending" | "in_progress" | "completed" | "received";
  cost: number;
  sentAt?: Date;
  expectedAt?: Date;
  receivedAt?: Date;
}
```

#### ReorderService

```typescript
interface IReorderService {
  createReorder(originalOrderId: string): Promise<ReorderResult>;
  comparePrice(originalOrderId: string): Promise<PriceComparison>;
}

interface ReorderResult {
  newOrderId: string;
  originalOrderId: string;
  specifications: ProductSpecification;
  assets: Asset[]; // FINAL files from original
  pricing: PricingResult;
  priceComparison?: PriceComparison;
}

interface PriceComparison {
  originalPrice: number;
  newPrice: number;
  difference: number;
  percentageChange: number;
}
```

## Data Models

### PricingFormula Model

```typescript
interface IPricingFormula {
  _id: ObjectId;
  name: string;
  productType: string;
  formula: string; // e.g., "basePrice * quantity * paperMultiplier + finishingCost"
  variables: FormulaVariable[];
  quantityTiers: QuantityTier[];
  paperMultipliers: Record<string, number>;
  finishingCosts: Record<string, number>;
  minMargin: number;
  isActive: boolean;
  createdBy: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

interface QuantityTier {
  minQuantity: number;
  maxQuantity: number;
  pricePerUnit: number;
  discount?: number;
}
```

### Proposal Model

```typescript
interface IProposal {
  _id: ObjectId;
  proposalNumber: string;
  customerId: ObjectId;
  customerSnapshot: CustomerInfo;
  items: ProposalItem[];
  specifications: ProductSpecification;
  pricing: PricingResult;
  dealPrice?: number;
  salesCost?: number;
  actualMargin?: MarginResult;
  terms: string;
  validUntil: Date;
  status: "draft" | "sent" | "accepted" | "rejected" | "converted";
  convertedToOrderId?: ObjectId;
  textSummary?: string;
  pdfUrl?: string;
  createdBy: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
```

### Asset Model

```typescript
interface IAsset {
  _id: ObjectId;
  orderId: ObjectId;
  filename: string;
  originalFilename: string;
  version: number;
  versionLabel: string;
  status: "draft" | "review" | "approved" | "final" | "superseded";
  isLocked: boolean;
  previousVersionId?: ObjectId;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  checksum: string;
  uploadedBy: ObjectId;
  approvedBy?: ObjectId;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### JobTicket Model

```typescript
interface IJobTicket {
  _id: ObjectId;
  ticketId: string;
  orderId: ObjectId;
  qrCode: string;
  qrCodeUrl: string;
  specifications: {
    productType: string;
    size: { width: number; height: number; unit: string };
    paperType: string;
    quantity: number;
    printSides: string;
    colors: number;
    finishingOptions: string[];
    specialInstructions: string;
  };
  assets: ObjectId[]; // FINAL assets only
  status: "active" | "in_progress" | "completed" | "cancelled";
  productionLogs: ProductionLog[];
  errors: ProductionError[];
  generatedAt: Date;
  completedAt?: Date;
}

interface ProductionLog {
  stage: string;
  operatorId: ObjectId;
  stationId: string;
  timestamp: Date;
  notes?: string;
}

interface ProductionError {
  errorType: string;
  description: string;
  reportedBy: ObjectId;
  reportedAt: Date;
  resolution?: string;
  resolvedAt?: Date;
}
```

### CustomerCredit Model

```typescript
interface ICustomerCredit {
  _id: ObjectId;
  customerId: ObjectId;
  creditLimit: number;
  currentDebt: number;
  overdueAmount: number;
  lastPaymentDate?: Date;
  paymentPattern: "good" | "average" | "poor";
  isBlocked: boolean;
  blockReason?: string;
  creditHistory: CreditLimitChange[];
  createdAt: Date;
  updatedAt: Date;
}
```

### DebtLedger Model

```typescript
interface IDebtLedger {
  _id: ObjectId;
  customerId: ObjectId;
  transactionType: "order" | "payment" | "adjustment" | "refund";
  orderId?: ObjectId;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  dueDate?: Date;
  paidDate?: Date;
  notes?: string;
  createdBy: ObjectId;
  createdAt: Date;
}
```

### OutsourcedItem Model

```typescript
interface IOutsourcedItem {
  _id: ObjectId;
  orderId: ObjectId;
  lineItemId: ObjectId;
  processType: string; // 'printing', 'lamination', 'binding', etc.
  vendorId: ObjectId;
  vendorName: string;
  cost: number;
  status: "pending" | "sent" | "in_progress" | "completed" | "received";
  sentAt?: Date;
  expectedAt?: Date;
  receivedAt?: Date;
  qualityCheck?: {
    passed: boolean;
    checkedBy: ObjectId;
    checkedAt: Date;
    notes?: string;
    issues?: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}
```

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

Based on the prework analysis, the following properties have been identified after reflection to eliminate redundancy:

### Property 1: Pricing Calculation Completeness

_For any_ valid product specification, the pricing calculation SHALL return all required fields (costPrice, sellingPrice, profitMargin, marginPercentage, breakdown) and complete within 1 second.
**Validates: Requirements 1.1**

### Property 2: Quantity Tier Pricing Consistency

_For any_ quantity value, the pricing SHALL follow the configured quantity tier structure, where higher quantities result in equal or lower per-unit prices.
**Validates: Requirements 1.2**

### Property 3: Finishing Options Additive Cost

_For any_ combination of finishing options, the total cost SHALL equal the sum of base cost plus all selected finishing option costs.
**Validates: Requirements 1.3**

### Property 4: Pricing Formula Determinism

_For any_ pricing formula and set of inputs, applying the formula multiple times SHALL always produce the same output.
**Validates: Requirements 1.4**

### Property 5: Margin Warning Threshold

_For any_ pricing result where marginPercentage < minMargin, the system SHALL return a warning indicator.
**Validates: Requirements 1.5**

### Property 6: Proposal Content Completeness

_For any_ generated proposal, the output SHALL contain customer information, product specifications, pricing details, and terms.
**Validates: Requirements 2.1, 2.2, 2.3**

### Property 7: Proposal Number Uniqueness

_For any_ set of generated proposals, all proposal numbers SHALL be unique.
**Validates: Requirements 2.4**

### Property 8: Proposal-Order Linkage

_For any_ proposal converted to an order, the order SHALL contain a reference to the original proposal ID.
**Validates: Requirements 2.5**

### Property 9: Asset Version Sequencing

_For any_ sequence of file uploads to an order, version numbers SHALL be assigned sequentially (v1, v2, v3...).
**Validates: Requirements 3.1**

### Property 10: FINAL Asset Immutability

_For any_ asset marked as FINAL, modification attempts SHALL be rejected and the asset SHALL remain unchanged.
**Validates: Requirements 3.2, 3.5**

### Property 11: Production Asset Filtering

_For any_ order submitted to production, the included assets SHALL only contain files with status 'final'.
**Validates: Requirements 3.3, 3.4**

### Property 12: Production Status Logging

_For any_ production status change, the system SHALL create a log entry containing timestamp and operator ID.
**Validates: Requirements 4.2, 4.3**

### Property 13: Production Timeline Completeness

_For any_ order with production history, the timeline SHALL contain all recorded stages in chronological order.
**Validates: Requirements 4.4**

### Property 14: Deadline Alert Triggering

_For any_ order with deadline within configured threshold hours, the system SHALL generate an alert for the assigned Sales.
**Validates: Requirements 5.1, 5.2**

### Property 15: Deadline Sorting Correctness

_For any_ list of orders sorted by deadline urgency, orders with earlier deadlines SHALL appear before orders with later deadlines.
**Validates: Requirements 5.3**

### Property 16: Job Ticket Specification Completeness

_For any_ generated job ticket, the specifications SHALL include size, paperType, quantity, finishingOptions, and specialInstructions.
**Validates: Requirements 6.1, 6.4**

### Property 17: QR Code Uniqueness and Resolution

_For any_ job ticket, the QR code SHALL be unique and scanning it SHALL return the correct job ticket data.
**Validates: Requirements 6.2, 6.3**

### Property 18: Re-order Specification Preservation

_For any_ re-order created from an original order, the specifications and FINAL files SHALL match the original.
**Validates: Requirements 7.1, 7.4**

### Property 19: Re-order Pricing Recalculation

_For any_ re-order, the pricing SHALL be calculated using current rates, not original order rates.
**Validates: Requirements 7.2, 7.3**

### Property 20: Debt Display Accuracy

_For any_ customer with recorded transactions, the displayed debt SHALL equal the sum of all order amounts minus all payment amounts.
**Validates: Requirements 8.1, 8.5**

### Property 21: Credit Limit Enforcement

_For any_ order where (currentDebt + orderAmount) > creditLimit, the order creation SHALL be blocked.
**Validates: Requirements 8.2, 11.2**

### Property 22: Credit Block Message Completeness

_For any_ blocked order due to credit limit, the message SHALL display currentDebt, creditLimit, and shortfall amount.
**Validates: Requirements 8.3, 11.3**

### Property 23: Actual Margin Calculation

_For any_ order with dealPrice and salesCost, actualProfit SHALL equal (dealPrice - costPrice - salesCost).
**Validates: Requirements 9.1, 9.2**

### Property 24: Min Margin Enforcement

_For any_ order where actualMarginPercentage < minMargin, the order SHALL be blocked until manager approval.
**Validates: Requirements 9.3**

### Property 25: Document Content Segregation

_For any_ customer-facing document, internal costs (salesCost, costPrice) SHALL NOT be visible. _For any_ internal report, all cost fields SHALL be visible.
**Validates: Requirements 9.4, 9.5**

### Property 26: External Item Vendor Requirement

_For any_ line item marked as External, vendorId and cost SHALL be required fields.
**Validates: Requirements 10.1, 10.2**

### Property 27: Vendor Cost Inclusion

_For any_ order with external items, the total cost SHALL include all vendor costs.
**Validates: Requirements 10.3**

### Property 28: Credit Limit Audit Trail

_For any_ credit limit modification, the system SHALL create a log entry with timestamp and approver ID.
**Validates: Requirements 11.4, 11.5**

## Error Handling

### Custom Exceptions

```typescript
// Pricing Errors
class PricingCalculationException extends Error {
  constructor(message: string, public specs: ProductSpecification) {
    super(message);
  }
}

class MarginBelowMinimumException extends Error {
  constructor(
    public actualMargin: number,
    public minMargin: number,
    public orderId?: string
  ) {
    super(`Margin ${actualMargin}% is below minimum ${minMargin}%`);
  }
}

// Asset Errors
class AssetLockedException extends Error {
  constructor(public assetId: string) {
    super(`Asset ${assetId} is locked and cannot be modified`);
  }
}

class NoFinalAssetException extends Error {
  constructor(public orderId: string) {
    super(`Order ${orderId} has no FINAL assets for production`);
  }
}

// Credit Errors
class CreditLimitExceededException extends Error {
  constructor(
    public customerId: string,
    public currentDebt: number,
    public creditLimit: number,
    public orderAmount: number
  ) {
    super(`Credit limit exceeded for customer ${customerId}`);
  }
}

class OrderBlockedException extends Error {
  constructor(
    public orderId: string,
    public reason: string,
    public requiredAction: string
  ) {
    super(`Order ${orderId} blocked: ${reason}`);
  }
}
```

### Error Handling Patterns

```typescript
// Service Layer
async createOrder(customerId: string, data: CreateOrderData): Promise<Order> {
  // 1. Check credit limit
  const creditCheck = await this.debtService.checkCreditAvailability(
    customerId,
    data.totalAmount
  );

  if (!creditCheck.allowed) {
    throw new CreditLimitExceededException(
      customerId,
      creditCheck.currentDebt,
      creditCheck.creditLimit,
      data.totalAmount
    );
  }

  // 2. Validate margin
  if (data.dealPrice) {
    const margin = this.multiTierPricingService.calculateActualMargin(
      data.dealPrice,
      data.costPrice,
      data.salesCost || 0
    );

    if (margin.marginPercentage < this.minMargin) {
      throw new MarginBelowMinimumException(
        margin.marginPercentage,
        this.minMargin
      );
    }
  }

  // 3. Create order
  return await this.orderRepository.create(data);
}
```

## Testing Strategy

### Property-Based Testing Library

The project will use **fast-check** for property-based testing in TypeScript/JavaScript.

### Unit Tests

- Test individual service methods with specific examples
- Test edge cases (empty inputs, boundary values)
- Test error conditions and exception handling

### Property-Based Tests

Each correctness property will be implemented as a property-based test using fast-check. Tests will be configured to run a minimum of 100 iterations.

Example test structure:

```typescript
import fc from "fast-check";

describe("PricingService", () => {
  /**
   * **Feature: printz-platform-features, Property 1: Pricing Calculation Completeness**
   * **Validates: Requirements 1.1**
   */
  it("should return complete pricing result for any valid specification", () => {
    fc.assert(
      fc.property(validProductSpecificationArb, async (spec) => {
        const result = await pricingService.calculatePrice(spec);

        expect(result.costPrice).toBeDefined();
        expect(result.sellingPrice).toBeDefined();
        expect(result.profitMargin).toBeDefined();
        expect(result.marginPercentage).toBeDefined();
        expect(result.breakdown).toBeDefined();
      }),
      { numRuns: 100 }
    );
  });
});
```

### Integration Tests

- Test end-to-end workflows (proposal → order → production)
- Test credit limit enforcement across order creation
- Test real-time status updates

### Test Coverage Requirements

- All correctness properties must have corresponding property-based tests
- Critical paths (pricing, credit check, asset validation) must have 100% coverage
- Error handling paths must be tested
