# Requirements Document

## Introduction

Printz Platform Features là bộ tính năng toàn diện cho nền tảng in ấn, bao gồm 3 giai đoạn chính:

1. **Tiền kỳ (Pre-Production)**: Báo giá động, tạo proposal tự động, quản lý file assets
2. **Sản xuất & Giao hàng (Production & Delivery)**: Theo dõi trạng thái real-time, cảnh báo deadline, phiếu in điện tử
3. **Hậu kỳ (Post-Production)**: Tái bản đơn hàng, theo dõi công nợ, quản lý hạn mức tín dụng

Ngoài ra còn có các tính năng nâng cao:

- Multi-Tier Pricing (Quản lý "cơ chế" và "kê giá")
- Outsourcing Management (Quản lý gửi ngoài)
- Credit Limit Enforcement (Cưỡng chế hạn mức tín dụng)

## Glossary

- **Printz_System**: Hệ thống quản lý in ấn Printz Platform
- **Dynamic_Pricing_Engine**: Module tính giá tự động dựa trên quy cách sản phẩm
- **Proposal**: Báo giá chuyên nghiệp gửi cho khách hàng
- **Asset**: File thiết kế (artwork, logo, etc.) được upload lên hệ thống
- **Job_Ticket**: Phiếu in điện tử chứa thông số kỹ thuật cho thợ in
- **Re-order**: Tái bản đơn hàng cũ với file FINAL đã có
- **Credit_Limit**: Hạn mức công nợ tối đa cho phép của khách hàng
- **Deal_Price**: Giá chốt với khách hàng (có thể khác giá niêm yết)
- **Sales_Cost**: Chi phí "tế nhị" (hoa hồng, kickback) do Sales khai báo
- **Min_Margin**: Lợi nhuận tối thiểu bắt buộc do quản lý thiết lập
- **Outsourcing**: Gửi công đoạn sản xuất ra ngoài (vendor bên thứ 3)
- **Line_Item**: Từng dòng sản phẩm/dịch vụ trong đơn hàng

## Requirements

### Requirement 1: Dynamic Pricing Engine

**User Story:** As a Sales, I want to input product specifications and get instant pricing calculation, so that I can provide accurate quotes to customers within seconds.

#### Acceptance Criteria

1. WHEN a Sales inputs product specifications (size, paper type, quantity, finishing options) THEN the Printz_System SHALL calculate and display cost price, selling price, and profit margin within 1 second
2. WHEN the quantity changes THEN the Printz_System SHALL recalculate pricing using quantity-based pricing tiers
3. WHEN finishing options are added or removed THEN the Printz_System SHALL update the total cost breakdown immediately
4. WHEN a pricing formula is configured by Admin THEN the Printz_System SHALL apply that formula consistently across all calculations
5. WHEN the calculated margin falls below the configured minimum THEN the Printz_System SHALL display a warning indicator

### Requirement 2: 1-Click Proposal Generation

**User Story:** As a Sales, I want to generate professional PDF proposals with one click, so that I can send quotes to customers quickly without manual formatting.

#### Acceptance Criteria

1. WHEN a Sales clicks the "Generate Proposal" button THEN the Printz_System SHALL create a PDF document containing customer information, product specifications, pricing, and terms
2. WHEN a proposal is generated THEN the Printz_System SHALL also create a text summary suitable for copy-paste into Zalo/messaging apps
3. WHEN customer data exists in the system THEN the Printz_System SHALL auto-populate customer details in the proposal
4. WHEN a proposal is generated THEN the Printz_System SHALL assign a unique proposal number and store it for reference
5. WHEN a proposal is converted to an order THEN the Printz_System SHALL link the proposal to the order for traceability

### Requirement 3: Asset Version Control

**User Story:** As a Sales, I want to manage file versions with clear labeling, so that only approved final files are sent to production.

#### Acceptance Criteria

1. WHEN a Sales uploads a file to an order THEN the Printz_System SHALL automatically assign a version number (v1, v2, v3...)
2. WHEN a file is marked as "FINAL" THEN the Printz_System SHALL lock that file from further modifications
3. WHEN an order is submitted to production THEN the Printz_System SHALL only include files marked as "FINAL"
4. WHEN a non-FINAL file exists and order is submitted THEN the Printz_System SHALL block submission and display a warning
5. WHEN a FINAL file needs revision THEN the Printz_System SHALL require creating a new version and re-approval

### Requirement 4: Real-time Production Status Sync

**User Story:** As a Sales, I want to see real-time production status updates, so that I can inform customers about their order progress accurately.

#### Acceptance Criteria

1. WHEN production status changes (Printing, Finishing, Packaging) THEN the Printz_System SHALL update the Sales dashboard within 5 seconds
2. WHEN a barcode is scanned at the production floor THEN the Printz_System SHALL record the timestamp and update order status
3. WHEN an order moves to a new production stage THEN the Printz_System SHALL log the transition with timestamp and operator ID
4. WHEN Sales views an order THEN the Printz_System SHALL display a visual timeline of all production stages
5. WHEN production encounters an issue THEN the Printz_System SHALL notify relevant Sales immediately

### Requirement 5: Order Timeline and Deadline Alerts

**User Story:** As a Sales, I want automatic deadline reminders, so that I can proactively manage delivery commitments.

#### Acceptance Criteria

1. WHEN an order deadline is within 24 hours THEN the Printz_System SHALL send an alert notification to the assigned Sales
2. WHEN an order deadline is within 48 hours and production has not started THEN the Printz_System SHALL escalate the alert to Sales Manager
3. WHEN viewing the dashboard THEN the Printz_System SHALL display orders sorted by deadline urgency
4. WHEN an order is at risk of missing deadline THEN the Printz_System SHALL highlight it with a visual warning indicator
5. WHEN deadline alerts are configured THEN the Printz_System SHALL allow customization of alert thresholds per customer tier

### Requirement 6: Digital Job Ticket

**User Story:** As a Production Manager, I want digital job tickets with QR codes, so that production staff can access accurate specifications and accountability is clear.

#### Acceptance Criteria

1. WHEN an order is approved for production THEN the Printz_System SHALL generate a digital job ticket with all technical specifications
2. WHEN a job ticket is generated THEN the Printz_System SHALL include a unique QR code linking to the digital ticket
3. WHEN production staff scans the QR code THEN the Printz_System SHALL display the job specifications on their device
4. WHEN specifications are displayed THEN the Printz_System SHALL show size, paper type, quantity, finishing options, and special instructions
5. WHEN a production error occurs THEN the Printz_System SHALL allow tracing back to the job ticket specifications for accountability

### Requirement 7: Instant Re-order

**User Story:** As a Sales, I want to quickly re-order previous jobs, so that repeat customers can be served efficiently.

#### Acceptance Criteria

1. WHEN a Sales clicks "Re-order" on a completed order THEN the Printz_System SHALL create a new order with the same specifications and FINAL files
2. WHEN a re-order is created THEN the Printz_System SHALL recalculate pricing based on current rates
3. WHEN pricing has changed since the original order THEN the Printz_System SHALL display a comparison showing old vs new pricing
4. WHEN a re-order is created THEN the Printz_System SHALL link it to the original order for reference
5. WHEN the original FINAL files are used THEN the Printz_System SHALL skip the asset approval workflow

### Requirement 8: Live Debt Tracking

**User Story:** As a Sales, I want to see customer debt status when creating orders, so that I can manage credit risk appropriately.

#### Acceptance Criteria

1. WHEN a Sales creates a new order THEN the Printz_System SHALL display the customer's current outstanding debt
2. WHEN customer debt exceeds their credit limit THEN the Printz_System SHALL block order creation
3. WHEN an order is blocked due to debt THEN the Printz_System SHALL display the amount needed to clear before proceeding
4. WHEN debt status changes THEN the Printz_System SHALL update the display in real-time
5. WHEN viewing customer profile THEN the Printz_System SHALL show debt history and payment patterns

### Requirement 9: Multi-Tier Pricing Visibility (Commission Management)

**User Story:** As a Sales Manager, I want to track deal prices and sales costs transparently, so that actual profit margins are visible and controlled.

#### Acceptance Criteria

1. WHEN a Sales enters a Deal Price different from list price THEN the Printz_System SHALL calculate and display the actual margin
2. WHEN a Sales enters Sales Cost (commission/kickback) THEN the Printz_System SHALL deduct it from the margin calculation
3. WHEN actual profit falls below Min Margin threshold THEN the Printz_System SHALL block the order and require manager approval
4. WHEN generating customer-facing documents THEN the Printz_System SHALL show only the Deal Price without internal cost details
5. WHEN generating internal reports THEN the Printz_System SHALL display full breakdown including Sales Cost and actual profit

### Requirement 10: Outsourcing Management

**User Story:** As an Operations Manager, I want to track outsourced production items, so that I can manage vendor relationships and costs effectively.

#### Acceptance Criteria

1. WHEN creating an order with multiple processes THEN the Printz_System SHALL allow marking each line item as Internal or External (with vendor selection)
2. WHEN a line item is marked External THEN the Printz_System SHALL require vendor selection and cost input
3. WHEN vendor cost is entered THEN the Printz_System SHALL include it in the total cost calculation
4. WHEN viewing order status THEN the Printz_System SHALL show which items are at which vendor
5. WHEN an outsourced item is completed THEN the Printz_System SHALL allow recording receipt and quality check results

### Requirement 11: Credit Limit Enforcement

**User Story:** As a Finance Manager, I want automatic credit limit enforcement, so that bad debt risk is minimized.

#### Acceptance Criteria

1. WHEN a customer is created THEN the Printz_System SHALL allow setting a credit limit amount
2. WHEN a new order would cause total debt to exceed credit limit THEN the Printz_System SHALL block the order immediately
3. WHEN an order is blocked THEN the Printz_System SHALL display the current debt, credit limit, and shortfall amount
4. WHEN a manager approves an override THEN the Printz_System SHALL allow the order with an audit trail
5. WHEN credit limit is modified THEN the Printz_System SHALL log the change with timestamp and approver
