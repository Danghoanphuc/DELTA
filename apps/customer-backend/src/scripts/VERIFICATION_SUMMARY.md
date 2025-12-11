# Data Verification Summary

## ✅ Dữ liệu đã được seed thành công

### Customer (phucdh911@gmail.com)

- User ID: `6919b3fe10497b9e95875420`
- Organization: `Felix Dan's Company` (ID: `6933ede2dbb5dc25d8323b0f`)
- **5 SwagOrders** với các status: delivered, shipped, processing, paid, draft

### Shipper (danghoanphuc16@gmail.com)

- User ID: `6937c741b1d76fc53424a178`
- ShipperProfile ID: `6937c74d7501510b9367503b` (isActive: true)
- **3 DeliveryCheckins** với shipperId khớp với user.\_id

## 🔍 Kiểm tra đã thực hiện

1. ✅ Customer user có `organizationProfileId` đúng
2. ✅ Shipper user có `shipperProfileId` đúng
3. ✅ ShipperProfile tồn tại và `isActive: true`
4. ✅ SwagOrders có `organization` field khớp với customer's organizationProfileId
5. ✅ DeliveryCheckins có `shipperId` khớp với shipper's user.\_id
6. ✅ Auth middleware simulation passed
7. ✅ isShipper middleware simulation passed

## 🚀 Để test thực tế

### 1. Start Customer Backend

```bash
cd apps/customer-backend
pnpm dev
```

Server sẽ chạy trên port 3001

### 2. Start Customer Frontend

```bash
cd apps/customer-frontend
pnpm dev
```

Frontend sẽ chạy trên port 5173

### 3. Start Admin Backend

```bash
cd apps/admin-backend
pnpm dev
```

Server sẽ chạy trên port 3002

### 4. Start Admin Frontend

```bash
cd apps/admin-frontend
pnpm dev
```

Frontend sẽ chạy trên port 5174

## 📱 Test URLs

### Customer Portal

- Login: http://localhost:5173/signin (Google OAuth với phucdh911@gmail.com)
- SwagOrders: http://localhost:5173/organization/dashboard?tab=swag-orders

### Shipper Portal

- Login: http://localhost:5173/signin (Google OAuth với danghoanphuc16@gmail.com)
- Shipper Portal: http://localhost:5173/shipper

### Admin Portal

- Login: http://localhost:5174/login
- SwagOrders: http://localhost:5174/swag-ops/orders

## 🐛 Troubleshooting

### Nếu Customer không thấy orders:

1. Kiểm tra browser console cho API errors
2. Verify token được gửi trong Authorization header
3. Check API response từ `/api/swag-orders`

### Nếu Shipper không thấy checkins:

1. Kiểm tra browser console cho API errors
2. Verify user có `shipperProfileId` trong `/api/users/me` response
3. Check API response từ `/api/delivery-checkins/shipper`

### Nếu Admin không thấy data:

1. Verify admin backend đang chạy
2. Check admin authentication
3. Verify API response từ `/api/admin/swag-ops/orders`

## 📊 API Endpoints

### Customer Backend (port 3001)

- `GET /api/users/me` - Get current user info
- `GET /api/swag-orders` - Get organization's swag orders
- `GET /api/delivery-checkins/shipper` - Get shipper's checkins

### Admin Backend (port 3002)

- `GET /api/admin/swag-ops/orders` - Get all swag orders
- `GET /api/admin/swag-ops/dashboard` - Get dashboard stats
