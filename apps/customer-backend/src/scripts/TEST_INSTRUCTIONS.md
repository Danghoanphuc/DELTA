# Test Instructions - Delivery Flow

## ✅ Data đã được seed thành công

### Customer: phucdh911@gmail.com

- **5 SwagOrders**: SW20251200001 - SW20251200005
- **3 DeliveryCheckins** với tọa độ GPS tại Quận 1, HCM

### Shipper: danghoanphuc16@gmail.com

- **3 MasterOrders** được gán: MO20251200001 - MO20251200003
- **3 DeliveryCheckins** đã tạo

---

## 🔧 Cách test

### 1. Khởi động Backend (nếu chưa chạy)

```bash
cd apps/customer-backend
pnpm dev
```

Backend chạy trên port **5001**

### 2. Khởi động Frontend

```bash
cd apps/customer-frontend
pnpm dev
```

Frontend chạy trên port **5173**

### 3. Test Customer Flow

1. Mở http://localhost:5173
2. Login bằng Google với email: **phucdh911@gmail.com**
3. Vào `/organization/dashboard?tab=swag-orders` → Thấy 5 đơn hàng
4. Vào `/organization/dashboard?tab=delivery-map` → Thấy 3 điểm trên bản đồ

### 4. Test Shipper Flow

1. Logout khỏi customer account
2. Login bằng Google với email: **danghoanphuc16@gmail.com**
3. Vào `/shipper` → Thấy 3 đơn hàng được gán
4. Tab "Lịch sử" → Thấy 3 checkin đã tạo

---

## 🔍 Verify API (không cần login)

Chạy script test:

```bash
cd apps/customer-backend
node --experimental-vm-modules src/scripts/test-frontend-api-flow.js
```

---

## ⚠️ Lưu ý quan trọng

1. **Goong Map API Keys** đã được cấu hình trong `.env`:

   - `VITE_GOONG_MAPTILES_KEY`
   - `VITE_GOONG_API_KEY`

2. **Vite Proxy** đã được cấu hình để forward `/api` → `localhost:5001`

3. **Sau khi thay đổi .env**, cần restart frontend:
   ```bash
   # Ctrl+C để dừng
   pnpm dev
   ```

---

## 📊 Data Structure

```
Customer (phucdh911@gmail.com)
├── organizationProfileId: 6933ede2dbb5dc25d8323b0f
├── customerProfileId: 6919b3fe10497b9e95875421
└── SwagOrders (5)
    ├── SW20251200001 (delivered) → DeliveryCheckin ✅
    ├── SW20251200002 (shipped) → DeliveryCheckin ✅
    ├── SW20251200003 (processing) → DeliveryCheckin ✅
    ├── SW20251200004 (paid)
    └── SW20251200005 (draft)

Shipper (danghoanphuc16@gmail.com)
├── shipperProfileId: 6937c74d7501510b9367503b
├── customerProfileId: 6937c741b1d76fc53424a179
├── MasterOrders Assigned (3)
│   ├── MO20251200001 (shipping)
│   ├── MO20251200002 (processing)
│   └── MO20251200003 (shipping)
└── DeliveryCheckins Created (3)
    ├── For SW20251200001 (completed)
    ├── For SW20251200002 (pending)
    └── For SW20251200003 (pending)
```

---

## 🐛 Troubleshooting

### Map không hiển thị

- Kiểm tra browser console cho lỗi
- Verify Goong API keys trong `.env`
- Restart frontend sau khi thay đổi `.env`

### Không thấy data

- Kiểm tra đã login đúng email chưa
- Chạy script verify: `node --experimental-vm-modules src/scripts/test-frontend-api-flow.js`
- Kiểm tra backend đang chạy trên port 5001

### API trả về 401/403

- Token hết hạn, cần login lại
- User không có quyền (customer vs shipper)
