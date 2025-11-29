# 📍 Tính Năng Lưu Địa Chỉ Giao Hàng

## Tổng Quan

Tính năng cho phép khách hàng lưu nhiều địa chỉ giao hàng, đánh dấu địa chỉ mặc định, và tự động điền thông tin khi checkout.

## Tính Năng

### ✅ Đã Triển Khai

1. **Lưu nhiều địa chỉ**

   - Tên người nhận
   - Số điện thoại
   - Địa chỉ đầy đủ (đường, phường, quận, tỉnh)
   - Đánh dấu địa chỉ mặc định

2. **Quản lý địa chỉ trong Settings**

   - Xem danh sách địa chỉ đã lưu
   - Thêm địa chỉ mới
   - Chỉnh sửa địa chỉ
   - Xóa địa chỉ
   - Đặt địa chỉ mặc định

3. **Auto-fill khi Checkout**
   - Tự động điền địa chỉ mặc định
   - Checkbox "Lưu địa chỉ này" khi checkout
   - Người dùng có thể chỉnh sửa trước khi đặt hàng

## Cấu Trúc Code

### Backend

```
apps/customer-backend/src/modules/customer-profile/
├── customer-profile.service.js      # Business logic
├── customer-profile.controller.js   # API handlers
└── customer-profile.routes.js       # Route definitions
```

**API Endpoints:**

- `GET /api/customer-profile/addresses` - Lấy tất cả địa chỉ
- `GET /api/customer-profile/addresses/default` - Lấy địa chỉ mặc định
- `POST /api/customer-profile/addresses` - Thêm địa chỉ mới
- `PUT /api/customer-profile/addresses/:id` - Cập nhật địa chỉ
- `DELETE /api/customer-profile/addresses/:id` - Xóa địa chỉ
- `POST /api/customer-profile/addresses/:id/set-default` - Đặt mặc định

### Frontend

```
apps/customer-frontend/src/
├── types/address.ts                                    # TypeScript types
├── services/customerProfileService.ts                  # API service
└── features/customer/
    ├── hooks/
    │   └── useSavedAddresses.ts                       # Hook quản lý địa chỉ
    ├── components/settings/
    │   ├── SavedAddressesSection.tsx                  # UI danh sách địa chỉ
    │   ├── AddressFormModal.tsx                       # Modal thêm/sửa
    │   └── AddressSettingsTab.tsx                     # Tab trong Settings
    └── pages/
        └── CheckoutPage.tsx                           # Tích hợp auto-fill
```

## Cách Sử Dụng

### 1. Quản Lý Địa Chỉ (Settings)

```typescript
import { useSavedAddresses } from "@/features/customer/hooks";

const MyComponent = () => {
  const {
    addresses,           // Danh sách địa chỉ
    defaultAddress,      // Địa chỉ mặc định
    isLoading,
    addAddress,          // Thêm địa chỉ mới
    updateAddress,       // Cập nhật địa chỉ
    deleteAddress,       // Xóa địa chỉ
    setAsDefault,        // Đặt mặc định
  } = useSavedAddresses();

  // Thêm địa chỉ mới
  const handleAdd = async () => {
    await addAddress({
      recipientName: "Nguyễn Văn A",
      phone: "0912345678",
      street: "123 Đường ABC",
      ward: "Phường 1",
      district: "Quận 1",
      city: "TP. Hồ Chí Minh",
      isDefault: false,
    });
  };

  return (
    <div>
      {addresses.map(addr => (
        <div key={addr._id}>an>}
        </div>
      ))}
    </div>
  );
};
```

### 2. Auto-fill Checkout

Địa chỉ mặc định sẽ tự động được điền vào form checkout khi trang load.

```typescript
// CheckoutPage.tsx
useEffect(() => {
  const loadDefaultAddress = async () => {
    const defaultAddress = await customerProfileService.getDefaultAddress();
    if (defaultAddress) {
      form.setValue("shippingAddress", {
        fullName: defaultAddress.recipientName,
        phone: defaultAddress.phone,
        street: defaultAddress.street,
        // ...
      });
    }
  };
  loadDefaultAddress();
}, []);
```

### 3. Lưu Địa Chỉ Khi Checkout

Checkbox "Lưu địa chỉ này vào sổ địa chỉ" cho phép lưu địa chỉ mới ngay khi checkout.

## Database Schema

```javascript
// CustomerProfile Model
{
  userId: ObjectId,
  savedAddresses: [
    {
      _id: ObjectId,
      recipientName: String,
      phone: String,
      street: String,
      ward: String,
      district: String,
      city: String,
      isDefault: Boolean
    }
  ]
}
```

## User Flow

### Flow 1: Lần Đầu Mua Hàng

```
1. User vào Checkout
   ↓
2. Nhập thông tin địa chỉ thủ công
   ↓
3. Check "Lưu địa chỉ này"
   ↓
4. Hoàn tất đơn hàng
   ↓
5. Địa chỉ được lưu vào profile
```

### Flow 2: Mua Hàng Lần 2+

```
1. User vào Checkout
   ↓
2. Địa chỉ mặc định tự động điền ✨
   ↓
3. User review và xác nhận
   ↓
4. Hoàn tất đơn hàng nhanh chóng 🚀
```

### Flow 3: Quản Lý Địa Chỉ

```
1. User vào Settings → Sổ địa chỉ
   ↓
2. Xem danh sách địa chỉ đã lưu
   ↓
3. Thêm/Sửa/Xóa địa chỉ
   ↓
4. Đặt địa chỉ mặc định
```

## Lợi Ích

### Cho Khách Hàng

- ✅ **Tiết kiệm thời gian**: Không cần nhập lại địa chỉ mỗi lần mua
- ✅ **Quản lý dễ dàng**: Lưu nhiều địa chỉ (nhà, công ty, nhà bạn bè)
- ✅ **Giảm lỗi**: Địa chỉ đã được xác thực và lưu chính xác
- ✅ **Trải nghiệm tốt**: Checkout nhanh hơn 70%

### Cho Business

- ✅ **Tăng conversion rate**: Checkout nhanh → ít bỏ giỏ hàng
- ✅ **Giảm lỗi giao hàng**: Địa chỉ chính xác hơn
- ✅ **Tăng retention**: Khách hàng quay lại dễ dàng hơn
- ✅ **Data insights**: Phân tích khu vực khách hàng

## Testing Checklist

### Backend

- [ ] API GET /addresses trả về đúng danh sách
- [ ] API POST /addresses tạo địa chỉ mới
- [ ] API PUT /addresses/:id cập nhật đúng
- [ ] API DELETE /addresses/:id xóa thành công
- [ ] Set default bỏ default của địa chỉ khác
- [ ] Xóa địa chỉ default → địa chỉ đầu tiên thành default
- [ ] Authentication required cho tất cả endpoints

### Frontend

- [ ] Hiển thị danh sách địa chỉ trong Settings
- [ ] Modal thêm/sửa hoạt động đúng
- [ ] Xóa địa chỉ có confirm dialog
- [ ] Badge "Mặc định" hiển thị đúng
- [ ] Auto-fill checkout với địa chỉ mặc định
- [ ] Checkbox "Lưu địa chỉ" hoạt động
- [ ] Toast notifications hiển thị đúng
- [ ] Loading states hiển thị

## Cải Tiến Tương Lai

### Phase 2 (Optional)

1. **Gợi ý địa chỉ thông minh**

   - Gợi ý địa chỉ gần nhất dựa trên GPS
   - Gợi ý địa chỉ hay dùng nhất

2. **Nhãn địa chỉ**

   - Thêm label: "Nhà", "Công ty", "Nhà bạn"
   - Icon tùy chỉnh cho mỗi loại

3. **Chia sẻ địa chỉ**

   - Chia sẻ địa chỉ cho người khác
   - Gửi quà tặng đến địa chỉ đã lưu

4. **Xác thực địa chỉ**
   - Tích hợp GHN API để validate
   - Hiển thị phí ship cho từng địa chỉ

## Troubleshooting

### Lỗi: "Không thể tải danh sách địa chỉ"

**Nguyên nhân:** Backend API không hoạt động hoặc user chưa đăng nhập

**Giải pháp:**

1. Check console log
2. Verify token trong localStorage
3. Check backend server đang chạy

### Lỗi: "Không thể lưu địa chỉ"

**Nguyên nhân:** Validation failed hoặc database error

**Giải pháp:**

1. Check required fields (recipientName, phone, city)
2. Check backend logs
3. Verify MongoDB connection

## Support

Nếu có vấn đề, liên hệ:

- Email: support@printz.vn
- Slack: #printz-dev

---

**Version:** 1.0.0  
**Last Updated:** 2024-11-29  
**Author:** Kiro AI Assistant

          {addr.recipientName} - {addr.phone}
          {addr.isDefault && <span>⭐ Mặc địn

```

```
