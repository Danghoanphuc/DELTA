# Requirements Document - Supply Chain & Vendor Management System

## Introduction

Hệ thống quản lý chuỗi cung ứng và nhà cung cấp cho mô hình "Anchor Node" và "Không kho". Mục tiêu là biến form thêm sản phẩm và nhà cung cấp từ "Address Book" thành "Hồ sơ năng lực chuỗi cung ứng", cho phép hệ thống tự động định tuyến đơn hàng, tính toán chi phí logistics, và quản lý dòng tiền với nhà cung cấp.

## Glossary

- **Anchor Node**: Nhà cung cấp có khả năng nhận hàng từ các Vệ tinh khác về để đóng gói chung (Fulfillment Center)
- **Satellite Vendor**: Nhà cung cấp chỉ sản xuất/gia công, không có khả năng kitting
- **Primary Vendor**: Nhà cung cấp ưu tiên đầu tiên cho sản phẩm
- **Backup Vendor**: Nhà cung cấp dự phòng khi Primary không khả dụng
- **Auto-Banking**: Tự động chuyển tiền cho nhà cung cấp ngay khi nhận đơn
- **Kitting**: Đóng gói nhiều sản phẩm thành một bộ
- **Cross-docking**: Nhận hàng và chuyển tiếp ngay, không lưu kho lâu dài
- **Lead Time**: Thời gian từ lúc đặt hàng đến khi nhận được sản phẩm
- **MOQ (Minimum Order Quantity)**: Số lượng đặt hàng tối thiểu
- **COGS (Cost of Goods Sold)**: Giá vốn hàng bán
- **Throughput**: Công suất sản xuất (số lượng/ngày)
- **Geo-Spatial Routing**: Định tuyến dựa trên vị trí địa lý
- **Active Pushing**: Chủ động gửi thông báo cho nhà cung cấp (Zalo/Call)
- **VietQR**: Mã QR thanh toán ngân hàng Việt Nam
- **Escalation Contact**: Người liên hệ khẩn cấp khi liên hệ chính không phản hồi

## Requirements

### Requirement 1: Vendor Financial Management (Tài chính & Thanh toán)

**User Story:** Là admin finance, tôi muốn quản lý thông tin tài khoản ngân hàng và điều khoản thanh toán của nhà cung cấp, để có thể tự động chuyển tiền (Auto-Banking) và theo dõi công nợ.

#### Acceptance Criteria

1. WHEN admin tạo/cập nhật vendor THEN hệ thống SHALL yêu cầu nhập đầy đủ thông tin ngân hàng (tên ngân hàng, số tài khoản, chủ tài khoản)
2. WHEN admin upload VietQR image THEN hệ thống SHALL lưu trữ và hiển thị để backup khi API ngân hàng lỗi
3. WHEN admin chọn payment terms THEN hệ thống SHALL lưu điều khoản (Thanh toán ngay 100%, Cọc 50%, Công nợ 30 ngày)
4. WHEN đơn hàng được gán cho vendor với payment term "Thanh toán ngay 100%" THEN hệ thống SHALL tự động trigger auto-banking workflow
5. WHEN auto-banking được trigger THEN hệ thống SHALL tạo payment transaction và gửi thông báo cho finance team để xác nhận

### Requirement 2: Vendor Operational Capacity (Năng lực vận hành)

**User Story:** Là admin operations, tôi muốn định nghĩa năng lực vận hành của nhà cung cấp một cách có cấu trúc, để hệ thống có thể tự động quyết định vendor nào làm việc gì.

#### Acceptance Criteria

1. WHEN admin cấu hình vendor THEN hệ thống SHALL cho phép chọn loại hình (Cung cấp phôi, Gia công, Fulfillment Center/Anchor Node)
2. WHEN vendor được đánh dấu là "Fulfillment Center" THEN hệ thống SHALL cho phép vendor này nhận hàng từ vendors khác
3. WHEN admin nhập công suất (throughput) THEN hệ thống SHALL lưu con số cụ thể (ví dụ: 500 cái/ngày)
4. WHEN vendor throughput đạt 80% capacity THEN hệ thống SHALL tự động switch sang backup vendor cho đơn hàng mới
5. WHEN admin nhập lead time THEN hệ thống SHALL lưu khoảng thời gian (min-max) và đơn vị (giờ/ngày)

### Requirement 3: Vendor Logistics & Geo-Spatial Data (Vị trí & Logistics)

**User Story:** Là admin operations, tôi muốn lưu trữ thông tin vị trí và khả năng logistics của nhà cung cấp, để hệ thống có thể tính toán đường đi tối ưu và chi phí vận chuyển.

#### Acceptance Criteria

1. WHEN admin thêm vendor address THEN hệ thống SHALL yêu cầu chọn vị trí trên Google Map và lưu tọa độ (latitude, longitude)
2. WHEN hệ thống có tọa độ vendor THEN hệ thống SHALL tính khoảng cách chính xác (km) giữa các vendors và địa chỉ giao hàng
3. WHEN admin cấu hình inbound capability THEN hệ thống SHALL cho phép chọn loại xe có thể vào (Xe máy, Xe tải 1 tấn, Container)
4. WHEN hệ thống định tuyến hàng THEN hệ thống SHALL chỉ chọn vendors có inbound capability phù hợp với khối lượng hàng
5. WHEN admin cấu hình dịch vụ đi kèm THEN hệ thống SHALL cho phép chọn (Kitting, Cross-docking)

### Requirement 4: Vendor Active Communication (Kết nối tự động)

**User Story:** Là admin operations, tôi muốn hệ thống tự động gửi thông báo cho nhà cung cấp qua Zalo/Call, để giảm thời gian phản hồi và tăng hiệu quả vận hành.

#### Acceptance Criteria

1. WHEN admin cấu hình vendor THEN hệ thống SHALL cho phép nhập Zalo OA/User ID riêng biệt với số điện thoại
2. WHEN admin thêm escalation contact THEN hệ thống SHALL lưu thông tin người liên hệ khẩn cấp (số điện thoại, quan hệ)
3. WHEN admin cấu hình working hours THEN hệ thống SHALL lưu giờ làm việc để tránh spam ngoài giờ
4. WHEN đơn hàng được gán cho vendor THEN hệ thống SHALL tự động gửi thông báo qua Zalo với link xác nhận
5. WHEN vendor không phản hồi sau X phút THEN hệ thống SHALL tự động gọi điện hoặc liên hệ escalation contact

### Requirement 5: Product Vendor Matrix (Ma trận nhà cung cấp cho sản phẩm)

**User Story:** Là admin catalog, tôi muốn quản lý nhiều nhà cung cấp cho mỗi sản phẩm với vai trò và ưu tiên khác nhau, để hệ thống có thể tự động switch khi cần.

#### Acceptance Criteria

1. WHEN admin thêm vendor cho product THEN hệ thống SHALL cho phép chọn vendor từ danh sách đã lưu (không nhập tay)
2. WHEN admin chọn vendor THEN hệ thống SHALL yêu cầu chọn vai trò (Primary, Backup 1, Backup 2)
3. WHEN admin nhập vendor SKU THEN hệ thống SHALL lưu mã sản phẩm phía vendor để in vào PO tự động
4. WHEN admin nhập COGS THEN hệ thống SHALL lưu giá vốn riêng cho từng vendor (vì Backup thường đắt hơn Primary)
5. WHEN admin nhập lead time THEN hệ thống SHALL lưu thời gian sản xuất riêng cho từng vendor

### Requirement 6: Auto-Switch Vendor Logic (Tự động chuyển đổi nhà cung cấp)

**User Story:** Là admin operations, tôi muốn hệ thống tự động chuyển đơn hàng sang backup vendor khi primary vendor không khả dụng, để đảm bảo đơn hàng không bị delay.

#### Acceptance Criteria

1. WHEN admin enable auto-switch trigger THEN hệ thống SHALL cho phép cấu hình thời gian chờ (ví dụ: 30 phút)
2. WHEN primary vendor không phản hồi sau thời gian chờ THEN hệ thống SHALL tự động chuyển đơn sang backup vendor
3. WHEN primary vendor hết capacity THEN hệ thống SHALL tự động chuyển đơn mới sang backup vendor
4. WHEN backup vendor được chọn THEN hệ thống SHALL tính lại giá vốn và margin dựa trên COGS của backup
5. WHEN auto-switch xảy ra THEN hệ thống SHALL gửi alert cho admin và ghi log lý do switch

### Requirement 7: Product Physical Specs (Thông số vật lý sản phẩm)

**User Story:** Là admin catalog, tôi muốn lưu trữ thông số vật lý của sản phẩm (trọng lượng, kích thước), để hệ thống có thể tính phí ship và chọn phương tiện vận chuyển phù hợp.

#### Acceptance Criteria

1. WHEN admin tạo/cập nhật product THEN hệ thống SHALL yêu cầu nhập trọng lượng (gram)
2. WHEN admin nhập kích thước THEN hệ thống SHALL yêu cầu nhập đầy đủ (Dài x Rộng x Cao) trong cm
3. WHEN admin chọn loại hàng THEN hệ thống SHALL cho phép chọn (Thường, Cồng kềnh, Dễ vỡ, Chất lỏng)
4. WHEN hệ thống tính phí ship THEN hệ thống SHALL sử dụng trọng lượng và kích thước để tính phí chính xác
5. WHEN loại hàng là "Cồng kềnh" hoặc "Dễ vỡ" THEN hệ thống SHALL tự động thêm phí xử lý đặc biệt

### Requirement 8: Anchor Node Capability (Năng lực làm Trùm)

**User Story:** Là admin operations, tôi muốn định nghĩa sản phẩm/vendor nào có khả năng làm Anchor Node (nhận hàng từ vendors khác về đóng gói), để hệ thống có thể tự động gom hàng.

#### Acceptance Criteria

1. WHEN admin cấu hình product THEN hệ thống SHALL có toggle "Is Anchor Item?" để đánh dấu
2. WHEN "Is Anchor Item?" được bật THEN hệ thống SHALL hiển thị thêm cấu hình (Kitting Fee, Kho liên kết)
3. WHEN admin nhập kitting fee THEN hệ thống SHALL lưu phí đóng gói cộng thêm (ví dụ: +5.000đ/set)
4. WHEN admin chọn kho liên kết THEN hệ thống SHALL cho phép chọn (Ship thẳng khách, Về kho Vendor X)
5. WHEN đơn hàng có nhiều items THEN hệ thống SHALL tự động chọn Anchor Item để gom hàng và tính kitting fee

### Requirement 9: Intelligent Routing Engine (Động cơ định tuyến thông minh)

**User Story:** Là hệ thống, tôi muốn tự động quyết định đường đi tối ưu cho đơn hàng (vendor nào làm gì, hàng đi đâu), để giảm chi phí và thời gian giao hàng.

#### Acceptance Criteria

1. WHEN đơn hàng được tạo THEN hệ thống SHALL phân tích tất cả items và vendors available
2. WHEN hệ thống phân tích THEN hệ thống SHALL tính toán chi phí cho mỗi routing option (Primary vs Backup, Anchor vs Direct ship)
3. WHEN có Anchor Item trong đơn THEN hệ thống SHALL ưu tiên routing "Vệ tinh → Anchor → Khách"
4. WHEN không có Anchor Item THEN hệ thống SHALL routing "Vendor → Khách" trực tiếp
5. WHEN routing được chọn THEN hệ thống SHALL hiển thị breakdown chi phí (COGS, Kitting fee, Shipping cost) cho admin review

### Requirement 10: Vendor Performance Tracking (Theo dõi hiệu suất nhà cung cấp)

**User Story:** Là admin operations, tôi muốn theo dõi hiệu suất của nhà cung cấp (on-time rate, quality score), để đưa ra quyết định về việc tiếp tục hợp tác hay thay đổi.

#### Acceptance Criteria

1. WHEN production order completed THEN hệ thống SHALL tự động tính on-time delivery (so sánh actual vs expected completion date)
2. WHEN QC check failed THEN hệ thống SHALL ghi nhận quality issue và giảm quality score của vendor
3. WHEN admin xem vendor detail THEN hệ thống SHALL hiển thị metrics (On-time rate %, Quality score, Average lead time, Total orders)
4. WHEN vendor on-time rate < 80% THEN hệ thống SHALL gửi warning alert cho admin
5. WHEN vendor quality score < 3.0/5.0 THEN hệ thống SHALL suggest review hoặc switch sang backup vendor

### Requirement 11: Cost Calculation with Routing (Tính toán chi phí theo đường đi)

**User Story:** Là admin finance, tôi muốn hệ thống tự động tính toán chi phí dựa trên routing được chọn, để đảm bảo margin và profitability.

#### Acceptance Criteria

1. WHEN routing được chọn THEN hệ thống SHALL tính tổng COGS (sum of all vendor costs)
2. WHEN có Anchor Node THEN hệ thống SHALL cộng thêm kitting fee vào total cost
3. WHEN hệ thống tính shipping cost THEN hệ thống SHALL dựa trên khoảng cách (km) và trọng lượng/kích thước
4. WHEN có multiple legs (Vệ tinh → Anchor → Khách) THEN hệ thống SHALL tính shipping cost cho từng leg
5. WHEN total cost được tính THEN hệ thống SHALL hiển thị margin breakdown và alert nếu margin < threshold

### Requirement 12: Vendor Communication Automation (Tự động hóa giao tiếp)

**User Story:** Là admin operations, tôi muốn hệ thống tự động gửi thông báo và nhắc nhở cho nhà cung cấp, để giảm công việc thủ công và tăng tốc độ phản hồi.

#### Acceptance Criteria

1. WHEN production order được tạo THEN hệ thống SHALL tự động gửi Zalo message cho vendor với link xác nhận
2. WHEN vendor click link THEN hệ thống SHALL hiển thị production order detail và nút "Xác nhận"
3. WHEN vendor xác nhận THEN hệ thống SHALL update production order status và gửi notification cho admin
4. WHEN vendor không xác nhận sau X phút THEN hệ thống SHALL tự động gọi điện (sử dụng Twilio/Stringee)
5. WHEN vendor vẫn không phản hồi THEN hệ thống SHALL liên hệ escalation contact và trigger auto-switch logic

### Requirement 13: Vendor Dashboard & Analytics (Dashboard nhà cung cấp)

**User Story:** Là admin, tôi muốn xem dashboard tổng quan về nhà cung cấp (orders, revenue, performance), để đưa ra quyết định kinh doanh.

#### Acceptance Criteria

1. WHEN admin truy cập vendor dashboard THEN hệ thống SHALL hiển thị tổng số vendors (Active, Inactive, Pending)
2. WHEN admin xem vendor list THEN hệ thống SHALL hiển thị key metrics (Total orders, On-time rate, Quality score, Total revenue)
3. WHEN admin filter by vendor type THEN hệ thống SHALL cho phép filter (Cung cấp phôi, Gia công, Fulfillment Center)
4. WHEN admin xem vendor detail THEN hệ thống SHALL hiển thị order history, performance trends, cost analysis
5. WHEN admin export report THEN hệ thống SHALL generate CSV/Excel với vendor performance data

### Requirement 14: Multi-Tab Product Form (Form thêm sản phẩm nhiều tab)

**User Story:** Là admin catalog, tôi muốn form thêm sản phẩm được tổ chức thành nhiều tabs rõ ràng, để dễ dàng nhập thông tin mà không bị overwhelm.

#### Acceptance Criteria

1. WHEN admin mở form thêm sản phẩm THEN hệ thống SHALL hiển thị 4 tabs (Thông tin cơ bản, Print Methods, Pricing Tiers, Supply Chain)
2. WHEN admin ở tab "Thông tin cơ bản" THEN hệ thống SHALL hiển thị (Tên, Mô tả, Category, Images)
3. WHEN admin ở tab "Print Methods" THEN hệ thống SHALL hiển thị (Công nghệ in, Print areas, File requirements)
4. WHEN admin ở tab "Pricing Tiers" THEN hệ thống SHALL hiển thị (Giá bán theo số lượng, Discounts)
5. WHEN admin ở tab "Supply Chain" THEN hệ thống SHALL hiển thị (Vendor Matrix, Physical Specs, Anchor Capability)

### Requirement 15: Multi-Tab Vendor Form (Form thêm nhà cung cấp nhiều tab)

**User Story:** Là admin operations, tôi muốn form thêm nhà cung cấp được tổ chức thành nhiều tabs, để nhập đầy đủ thông tin chuỗi cung ứng.

#### Acceptance Criteria

1. WHEN admin mở form thêm vendor THEN hệ thống SHALL hiển thị 3 tabs (Hồ sơ pháp lý & Bank, Kết nối, Năng lực & Logistics)
2. WHEN admin ở tab "Hồ sơ pháp lý & Bank" THEN hệ thống SHALL hiển thị (Tên công ty, Mã số thuế, Bank info, VietQR, Payment terms)
3. WHEN admin ở tab "Kết nối" THEN hệ thống SHALL hiển thị (Zalo OA/User ID, Số điện thoại, Escalation contact, Working hours)
4. WHEN admin ở tab "Năng lực & Logistics" THEN hệ thống SHALL hiển thị (Loại hình, Công suất, Lead time, Tọa độ kho, Inbound capability, Dịch vụ đi kèm)
5. WHEN admin save vendor THEN hệ thống SHALL validate tất cả required fields across all tabs
