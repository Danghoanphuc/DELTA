# Requirements Document - POD Catalog & SKU Management Optimization

## Introduction

Đây là hệ thống quản lý catalog và SKU cho nền tảng Print-on-Demand (POD) và Corporate Gifting tại Việt Nam. Mục tiêu là tối ưu hóa quy trình từ lúc khách hàng đặt hàng đến khi sản xuất và giao hàng, đảm bảo tính linh hoạt cao cho customization, quản lý tồn kho hiệu quả, và tracking đơn hàng/chứng từ chính xác.

## Glossary

- **POD (Print-on-Demand)**: Mô hình sản xuất theo đơn đặt hàng, không tồn kho thành phẩm
- **SKU (Stock Keeping Unit)**: Đơn vị lưu kho, mã định danh duy nhất cho mỗi biến thể sản phẩm
- **Base Product**: Sản phẩm gốc chưa customization (áo trắng trơn, cốc trắng)
- **Customized Product**: Sản phẩm sau khi in/thêu logo, text
- **Swag Pack**: Bộ quà tặng gồm nhiều sản phẩm
- **Kitting**: Quy trình đóng gói nhiều sản phẩm thành một bộ
- **Fulfillment**: Quy trình hoàn tất đơn hàng (sản xuất + đóng gói + giao hàng)
- **Supplier**: Nhà cung cấp (xưởng in, nhà phân phối)
- **Lead Time**: Thời gian từ lúc đặt hàng đến khi nhận được sản phẩm
- **MOQ (Minimum Order Quantity)**: Số lượng đặt hàng tối thiểu
- **Artwork**: File thiết kế (logo, hình ảnh) để in lên sản phẩm
- **Print Method**: Phương pháp in (silk screen, DTG, embroidery, sublimation)
- **Inventory Reserve**: Tồn kho đã được đặt trước cho đơn hàng

## Requirements

### Requirement 1: Quản lý Base Products & Variants

**User Story:** Là admin, tôi muốn quản lý sản phẩm gốc với nhiều biến thể (size, màu, chất liệu), để khách hàng có thể chọn đúng sản phẩm họ muốn customization.

#### Acceptance Criteria

1. WHEN admin tạo base product THEN hệ thống SHALL cho phép định nghĩa các variant attributes (size, color, material)
2. WHEN admin tạo variants từ combinations THEN hệ thống SHALL tự động generate SKU unique cho mỗi variant
3. WHEN variant được tạo THEN hệ thống SHALL lưu trữ thông tin pricing, cost, weight, dimensions riêng cho từng variant
4. WHEN khách hàng xem product THEN hệ thống SHALL hiển thị tất cả variants available với stock status real-time
5. WHEN variant hết hàng THEN hệ thống SHALL cho phép backorder hoặc ẩn variant tùy theo cấu hình

### Requirement 2: Quản lý Print Methods & Customization Rules

**User Story:** Là admin, tôi muốn định nghĩa các phương pháp in và vị trí in cho từng sản phẩm, để đảm bảo khách hàng chỉ chọn được các options khả thi về mặt kỹ thuật.

#### Acceptance Criteria

1. WHEN admin cấu hình product THEN hệ thống SHALL cho phép chọn các print methods available (screen print, DTG, embroidery, heat transfer, sublimation)
2. WHEN admin định nghĩa print areas THEN hệ thống SHALL lưu trữ vị trí, kích thước max, và print method tương ứng cho mỗi area
3. WHEN print method được chọn THEN hệ thống SHALL validate artwork requirements (resolution, color mode, file format)
4. WHEN khách hàng upload artwork THEN hệ thống SHALL kiểm tra artwork có phù hợp với print method và area size không
5. WHEN print method có setup fee THEN hệ thống SHALL tự động tính vào giá đơn hàng

### Requirement 3: Dynamic Pricing với Volume Tiers

**User Story:** Là admin, tôi muốn thiết lập giá theo số lượng đặt hàng, để khuyến khích khách hàng đặt số lượng lớn và tối ưu chi phí sản xuất.

#### Acceptance Criteria

1. WHEN admin cấu hình pricing THEN hệ thống SHALL cho phép định nghĩa multiple pricing tiers (1-10, 11-50, 51-100, 100+)
2. WHEN khách hàng thay đổi quantity THEN hệ thống SHALL tự động áp dụng pricing tier phù hợp và hiển thị unit price
3. WHEN pricing tier thay đổi THEN hệ thống SHALL hiển thị savings amount so với tier thấp hơn
4. WHEN có customization THEN hệ thống SHALL cộng thêm customization cost vào base price
5. WHEN có multiple print areas THEN hệ thống SHALL tính tổng cost của tất cả print areas

### Requirement 4: Supplier Management & Lead Time Tracking

**User Story:** Là admin, tôi muốn quản lý nhiều suppliers với lead time khác nhau, để có thể chọn supplier phù hợp cho từng đơn hàng dựa trên deadline và cost.

#### Acceptance Criteria

1. WHEN admin tạo supplier THEN hệ thống SHALL lưu trữ contact info, capabilities, lead time (min-max), MOQ, và payment terms
2. WHEN admin assign product to supplier THEN hệ thống SHALL lưu supplier SKU và cost mapping
3. WHEN khách hàng đặt hàng THEN hệ thống SHALL tự động tính estimated delivery date dựa trên supplier lead time
4. WHEN có multiple suppliers cho cùng product THEN hệ thống SHALL cho phép admin chọn supplier dựa trên cost, lead time, hoặc quality rating
5. WHEN supplier lead time thay đổi THEN hệ thống SHALL cập nhật estimated delivery dates cho các đơn hàng pending

### Requirement 5: Inventory Management cho POD Model

**User Story:** Là admin, tôi muốn quản lý tồn kho base products (blank items) riêng biệt với customized products, để tối ưu cash flow và giảm waste.

#### Acceptance Criteria

1. WHEN base product được nhập kho THEN hệ thống SHALL track stock quantity, reserved quantity, và available quantity
2. WHEN đơn hàng được tạo THEN hệ thống SHALL reserve inventory cho base products cần thiết
3. WHEN đơn hàng bị cancel THEN hệ thống SHALL release reserved inventory về available pool
4. WHEN stock quantity thấp hơn threshold THEN hệ thống SHALL gửi low stock alert cho admin
5. WHEN product hết hàng THEN hệ thống SHALL cho phép backorder với estimated restock date

### Requirement 6: Artwork Management & Version Control

**User Story:** Là khách hàng, tôi muốn upload và quản lý các artwork files, để có thể reuse cho các đơn hàng sau mà không cần upload lại.

#### Acceptance Criteria

1. WHEN khách hàng upload artwork THEN hệ thống SHALL validate file format (AI, EPS, PDF, PNG với resolution >= 300dpi)
2. WHEN artwork được upload THEN hệ thống SHALL lưu trữ với version control và metadata (dimensions, colors, upload date)
3. WHEN khách hàng tạo đơn hàng mới THEN hệ thống SHALL hiển thị artwork library để chọn reuse
4. WHEN artwork được sử dụng trong đơn hàng THEN hệ thống SHALL tạo snapshot để đảm bảo không bị ảnh hưởng nếu artwork bị sửa
5. WHEN artwork không đạt yêu cầu kỹ thuật THEN hệ thống SHALL reject và hiển thị lý do cụ thể

### Requirement 7: Production Order Management

**User Story:** Là admin operations, tôi muốn quản lý production orders gửi cho suppliers, để tracking tiến độ sản xuất và đảm bảo đúng deadline.

#### Acceptance Criteria

1. WHEN swag order được paid THEN hệ thống SHALL tự động tạo production orders cho từng supplier
2. WHEN production order được tạo THEN hệ thống SHALL bao gồm: SKU list, quantities, artwork files, print specifications, và deadline
3. WHEN supplier nhận production order THEN hệ thống SHALL track status (received, in_production, quality_check, completed)
4. WHEN production order completed THEN hệ thống SHALL update swag order status và trigger shipping workflow
5. WHEN production order delayed THEN hệ thống SHALL alert admin và customer về revised delivery date

### Requirement 8: Kitting & Packaging Management

**User Story:** Là admin operations, tôi muốn quản lý quy trình kitting (đóng gói nhiều items thành swag pack), để đảm bảo đúng items và chất lượng trước khi ship.

#### Acceptance Criteria

1. WHEN swag pack được định nghĩa THEN hệ thống SHALL lưu trữ danh sách items, quantities, và packaging requirements
2. WHEN kitting process bắt đầu THEN hệ thống SHALL hiển thị checklist của tất cả items cần pack
3. WHEN item được scan THEN hệ thống SHALL verify đúng SKU và mark as completed trong checklist
4. WHEN tất cả items được packed THEN hệ thống SHALL cho phép print packing slip và shipping label
5. WHEN kitting completed THEN hệ thống SHALL update order status và trigger shipment creation

### Requirement 9: Multi-Recipient Order Management

**User Story:** Là khách hàng doanh nghiệp, tôi muốn gửi swag pack đến nhiều địa chỉ khác nhau trong một đơn hàng, để tiết kiệm thời gian và dễ quản lý.

#### Acceptance Criteria

1. WHEN khách hàng tạo swag order THEN hệ thống SHALL cho phép thêm multiple recipients với địa chỉ riêng
2. WHEN recipient được thêm THEN hệ thống SHALL cho phép customize size selections và personalization cho từng người
3. WHEN recipient chưa có địa chỉ THEN hệ thống SHALL gửi self-service link để recipient tự điền thông tin
4. WHEN tất cả recipients đã điền thông tin THEN hệ thống SHALL tự động trigger production workflow
5. WHEN shipment được tạo THEN hệ thống SHALL track riêng biệt status cho từng recipient

### Requirement 10: Invoice & Document Management

**User Story:** Là admin finance, tôi muốn tự động generate invoices và chứng từ kế toán, để đảm bảo compliance và dễ dàng reconciliation.

#### Acceptance Criteria

1. WHEN đơn hàng được paid THEN hệ thống SHALL tự động generate invoice với đầy đủ thông tin (tax code, items, pricing breakdown)
2. WHEN invoice được tạo THEN hệ thống SHALL lưu trữ PDF và gửi email cho khách hàng
3. WHEN có refund THEN hệ thống SHALL tạo credit note và link với invoice gốc
4. WHEN production order completed THEN hệ thống SHALL tạo delivery note cho supplier
5. WHEN tháng kết thúc THEN hệ thống SHALL generate revenue report theo organization và product category

### Requirement 11: Product Template & Quick Reorder

**User Story:** Là khách hàng, tôi muốn lưu swag pack configuration thành template, để có thể reorder nhanh chóng cho các đợt gửi quà sau.

#### Acceptance Criteria

1. WHEN khách hàng hoàn tất đơn hàng THEN hệ thống SHALL cho phép save as template với tên và description
2. WHEN template được tạo THEN hệ thống SHALL lưu trữ: product selections, customization settings, và packaging preferences
3. WHEN khách hàng reorder THEN hệ thống SHALL load template và cho phép adjust quantities và recipients
4. WHEN product trong template discontinued THEN hệ thống SHALL suggest substitute products
5. WHEN template được sử dụng THEN hệ thống SHALL track usage count và last used date

### Requirement 12: Quality Control & Approval Workflow

**User Story:** Là admin operations, tôi muốn có quy trình QC và approval trước khi ship, để đảm bảo chất lượng sản phẩm và giảm return rate.

#### Acceptance Criteria

1. WHEN production completed THEN hệ thống SHALL require QC check với photo upload
2. WHEN QC check failed THEN hệ thống SHALL allow reject với reason và trigger reproduction
3. WHEN QC check passed THEN hệ thống SHALL move order to ready_to_ship status
4. WHEN order value > threshold THEN hệ thống SHALL require customer approval trước khi ship
5. WHEN customer approve THEN hệ thống SHALL trigger shipment creation và update status

### Requirement 13: Analytics & Reporting

**User Story:** Là admin, tôi muốn xem analytics về products, suppliers, và orders, để đưa ra quyết định kinh doanh tốt hơn.

#### Acceptance Criteria

1. WHEN admin truy cập analytics THEN hệ thống SHALL hiển thị top selling products theo category và time period
2. WHEN admin xem supplier performance THEN hệ thống SHALL hiển thị on-time delivery rate, quality score, và average lead time
3. WHEN admin xem order trends THEN hệ thống SHALL hiển thị order volume, revenue, và average order value theo time
4. WHEN admin xem inventory report THEN hệ thống SHALL hiển thị stock levels, turnover rate, và slow-moving items
5. WHEN admin export report THEN hệ thống SHALL generate CSV/Excel với filtered data

### Requirement 14: Integration với Shipping Carriers

**User Story:** Là admin operations, tôi muốn tích hợp với các đơn vị vận chuyển (GHN, Viettel Post, GHTK), để tự động tạo vận đơn và tracking.

#### Acceptance Criteria

1. WHEN shipment được tạo THEN hệ thống SHALL tự động call carrier API để tạo shipping order
2. WHEN shipping order created THEN hệ thống SHALL lưu tracking number và tracking URL
3. WHEN carrier cập nhật status THEN hệ thống SHALL sync và update shipment status real-time
4. WHEN shipment delivered THEN hệ thống SHALL notify customer và update order status
5. WHEN shipment failed THEN hệ thống SHALL alert admin và suggest retry hoặc alternative carrier

### Requirement 15: Cost Calculation & Margin Tracking

**User Story:** Là admin finance, tôi muốn track cost và margin cho từng đơn hàng, để đảm bảo profitability và optimize pricing.

#### Acceptance Criteria

1. WHEN đơn hàng được tạo THEN hệ thống SHALL tính total cost (product cost + customization cost + kitting fee + shipping cost)
2. WHEN pricing được áp dụng THEN hệ thống SHALL tính gross margin percentage
3. WHEN có discount THEN hệ thống SHALL recalculate margin và alert nếu margin < threshold
4. WHEN production order completed THEN hệ thống SHALL record actual cost và compare với estimated cost
5. WHEN tháng kết thúc THEN hệ thống SHALL generate margin report theo product category và customer segment
