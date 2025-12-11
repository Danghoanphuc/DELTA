# Full Delivery Flow E2E Test

## Tổng quan

Test E2E này mô phỏng toàn bộ luồng giao hàng từ lúc Admin thêm sản phẩm đến khi khách hàng nhận thông báo và bình luận.

## Luồng Test

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           FULL DELIVERY FLOW                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PHASE 1: ADMIN - Product Management                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Step 1.1: Admin tạo sản phẩm mới trong catalog                      │   │
│  │           - Tên, SKU, giá, variants (size/color)                    │   │
│  │           - Publish sản phẩm                                        │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    ↓                                        │
│  PHASE 2: CUSTOMER - Order Creation                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Step 2.1: Khách tạo Swag Pack với sản phẩm                          │   │
│  │ Step 2.2: Khách tạo Swag Order (chọn recipients)                    │   │
│  │ Step 2.3: Khách submit order và thanh toán                          │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    ↓                                        │
│  PHASE 3: ADMIN - Order Confirmation                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Step 3.1: Admin xác nhận đơn hàng                                   │   │
│  │ Step 3.2: Admin gán shipper cho đơn hàng                            │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    ↓                                        │
│  PHASE 4: SHIPPER - Delivery & Check-in                                     │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Step 4.1: Shipper xem danh sách đơn được gán                        │   │
│  │ Step 4.2: Shipper đến địa điểm và tạo check-in                      │   │
│  │           - GPS coordinates + accuracy                              │   │
│  │           - Ảnh giao hàng (2+ ảnh)                                  │   │
│  │           - Ghi chú                                                 │   │
│  │ Step 4.3: Hệ thống cập nhật trạng thái đơn hàng                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    ↓                                        │
│  PHASE 5: NOTIFICATIONS                                                     │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Step 5.1: Hệ thống gửi email thông báo cho khách                    │   │
│  │ Step 5.2: Hệ thống tạo notification (chuông) cho khách              │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    ↓                                        │
│  PHASE 6: CUSTOMER - View Delivery Map                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Step 6.1: Khách vào /organization/dashboard?tab=delivery-map        │   │
│  │ Step 6.2: Khách xem popup chi tiết check-in                         │   │
│  │ Step 6.3: Khách filter check-ins theo ngày                          │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    ↓                                        │
│  PHASE 7: CUSTOMER - Comments                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Step 7.1: Hệ thống tạo delivery thread cho check-in                 │   │
│  │ Step 7.2: Thread message được format đúng                           │   │
│  │ Step 7.3: Khách thêm comment vào thread                             │   │
│  │ Step 7.4: Shipper reply comment                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    ↓                                        │
│  PHASE 8: VERIFICATION                                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ - Verify toàn bộ flow hoàn thành                                    │   │
│  │ - Verify data integrity                                             │   │
│  │ - Verify timeline of events                                         │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Files

### 1. `full-delivery-flow.e2e.test.js`

Test E2E cơ bản với repository trực tiếp, focus vào data flow và model validation.

### 2. `full-delivery-flow-integration.e2e.test.js`

Test E2E với mock services, mô phỏng integration giữa các module:

- MockAdminProductService
- MockSwagPackService
- MockSwagOrderService
- MockAdminOrderService
- MockNotificationService
- MockEmailService
- MockThreadService

## Cách chạy test

```bash
# Chạy tất cả E2E tests
cd apps/customer-backend
pnpm test -- --testPathPattern="e2e"

# Chạy chỉ full delivery flow tests
pnpm test -- --testPathPattern="full-delivery-flow"

# Chạy với verbose output
pnpm test -- --testPathPattern="full-delivery-flow" --verbose

# Chạy với coverage
pnpm test -- --testPathPattern="full-delivery-flow" --coverage
```

## Test Data

### Actors

| Actor    | Role                | Description                                 |
| -------- | ------------------- | ------------------------------------------- |
| Admin    | super_admin         | Quản lý sản phẩm, xác nhận đơn, gán shipper |
| Customer | organization_member | Tạo swag pack, đặt hàng, xem delivery map   |
| Shipper  | shipper             | Giao hàng, tạo check-in                     |

### Entities

| Entity          | Description                      |
| --------------- | -------------------------------- |
| Product         | Sản phẩm trong catalog (Áo Polo) |
| SwagPack        | Bộ quà (Welcome Kit)             |
| SwagOrder       | Đơn hàng gửi quà                 |
| Recipient       | Người nhận quà                   |
| DeliveryCheckin | Check-in giao hàng               |
| Thread          | Thread bình luận                 |
| Notification    | Thông báo chuông                 |

## Assertions

### Phase 1: Product

- Product được tạo với status "active"
- Product có variants (size/color)
- Product được publish

### Phase 2: Order

- SwagPack chứa product đúng
- Order có orderNumber format `SWG-*`
- Payment status = "paid" sau thanh toán

### Phase 3: Shipper Assignment

- Order có assignedShipperId
- Order status = "shipping"
- Shipment status = "assigned"

### Phase 4: Check-in

- Check-in có GPS coordinates hợp lệ
- Check-in có ít nhất 1 ảnh
- Check-in status = "completed"
- Order status = "delivered"

### Phase 5: Notifications

- Email được gửi đến customer
- emailSent = true trong check-in
- Bell notification được tạo
- Notification isRead = false ban đầu

### Phase 6: Map View

- Customer có thể query check-ins
- Check-in có đầy đủ data cho popup
- Date filter hoạt động đúng

### Phase 7: Comments

- Thread được tạo với 2 participants
- Customer có thể add comment
- Shipper có thể reply

### Phase 8: Final

- Tất cả entities linked đúng
- Timeline events đúng thứ tự
- Data integrity được đảm bảo

## Related APIs

### Admin Backend

- `POST /api/admin/products` - Tạo sản phẩm
- `PUT /api/admin/orders/:id/assign-shipper` - Gán shipper

### Customer Backend

- `POST /api/swag-packs` - Tạo swag pack
- `POST /api/swag-orders` - Tạo đơn hàng
- `POST /api/delivery-checkins` - Tạo check-in
- `GET /api/delivery-checkins/customer` - Lấy check-ins cho map
- `GET /api/notifications` - Lấy thông báo

### Shipper Portal

- `GET /api/shipper/orders` - Lấy đơn được gán
- `POST /api/shipper/checkins` - Tạo check-in

## Notes

1. Test sử dụng MongoDB in-memory cho isolation
2. Mock services cho external dependencies (email, thread)
3. GPS coordinates sử dụng vị trí thực tế ở HCMC
4. Photos sử dụng mock URLs
