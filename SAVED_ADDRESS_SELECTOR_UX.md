# 🎯 Saved Address Selector - UX Enhancement

## Tổng Quan

Thêm **Address Selector Box** ngay trong trang Checkout để người dùng có thể nhanh chóng chọn địa chỉ đã lưu mà không cần rời khỏi trang.

## Tính Năng Mới

### 📦 Address Selector Box

Component hiển thị ngay trên form địa chỉ trong CheckoutPage:

```
┌─────────────────────────────────────────┐
│  📍  Chọn địa chỉ đã lưu               ▼│
│      Bạn có 3 địa chỉ đã lưu            │
└─────────────────────────────────────────┘
```

**Khi đã chọn địa chỉ:**

```
┌─────────────────────────────────────────┐
│  📍  Nguyễn Văn A          ⭐ Mặc định ▼│
│      0912345678                          │
│      123 Đường ABC, Phường 1, Quận 1... │
└─────────────────────────────────────────┘
```

### 🎨 Modal Quản Lý Địa Chỉ

Click vào box → Mở modal với đầy đủ tính năng:

- ✅ **Xem danh sách** địa chỉ đã lưu
- ✅ **Chọn địa chỉ** → Auto-fill form ngay lập tức
- ✅ **Thêm địa chỉ mới** → Button "Thêm mới" ở header
- ✅ **Sửa địa chỉ** → Button "Sửa" trên mỗi card
- ✅ **Xóa địa chỉ** → Button "Xóa" với confirm
- ✅ **Đặt mặc định** → Button "Đặt mặc định"

## User Flow

### Flow 1: Chọn Địa Chỉ Có Sẵn

```
1. User vào Checkout
   ↓
2. Thấy box "Chọn địa chỉ đã lưu"
   ↓
3. Click vào box
   ↓
4. Modal hiển thị danh sách địa chỉ
   ↓
5. Click chọn địa chỉ
   ↓
6. Form tự động điền ✨
   ↓
7. Modal đóng
   ↓
8. Tiếp tục checkout
```

### Flow 2: Thêm Địa Chỉ Mới Ngay Trong Checkout

```
1. User vào Checkout
   ↓
2. Click box "Chọn địa chỉ đã lưu"
   ↓
3. Click "Thêm mới" trong modal
   ↓
4. Modal thêm địa chỉ hiện ra
   ↓
5. Nhập thông tin → Lưu
   ↓
6. Quay lại modal danh sách
   ↓
7. Chọn địa chỉ vừa tạo
   ↓
8. Form tự động điền ✨
```

### Flow 3: Sửa Địa Chỉ Trước Khi Dùng

```
1. User click box → Chọn địa chỉ
   ↓
2. Thấy thông tin cũ không đúng
   ↓
3. Click "Sửa" trên card địa chỉ
   ↓
4. Modal sửa hiện ra
   ↓
5. Cập nhật thông tin → Lưu
   ↓
6. Quay lại modal danh sách
   ↓
7. Chọn địa chỉ đã sửa
   ↓
8. Form tự động điền với thông tin mới ✨
```

## Component Structure

```
CheckoutPage.tsx
  └─> SavedAddressSelector
        ├─> Trigger Box (hiển thị địa chỉ đang chọn)
        ├─> Modal Danh Sách Địa Chỉ
        │     ├─> Address Cards (clickable)
        │     ├─> Button "Thêm mới"
        │     ├─> Button "Sửa" (mỗi card)
        │     ├─> Button "Xóa" (mỗi card)
        │     └─> Button "Đặt mặc định" (mỗi card)
        └─> AddressFormModal (thêm/sửa)
```

## UI/UX Details

### Trigger Box

**States:**

1. **Empty State** (chưa chọn):

   - Icon: Gray MapPin
   - Text: "Chọn địa chỉ đã lưu"
   - Subtext: "Bạn có X địa chỉ đã lưu"
   - Border: Gray

2. **Selected State** (đã chọn):
   - Icon: Blue MapPin
   - Text: Tên người nhận + Badge "Mặc định" (nếu có)
   - Subtext: SĐT + Địa chỉ đầy đủ
   - Border: Blue
   - Background: Blue-50

**Interactions:**

- Hover: Border color change + Shadow
- Click: Mở modal

### Modal Danh Sách

**Layout:**

- Max width: 2xl (672px)
- Max height: 80vh
- Scrollable content area

**Address Cards:**

- Hover: Shadow + Border color
- Selected: Blue border + Checkmark icon
- Default badge: Star icon + "Mặc định"

**Actions:**

- "Thêm mới": Primary button ở header
- "Sửa": Outline button
- "Xóa": Outline button (red text)
- "Đặt mặc định": Outline button (chỉ hiện nếu chưa default)

### Modal Thêm/Sửa

- Reuse `AddressFormModal` component
- Simple form với validation
- Auto-close sau khi lưu thành công

## Benefits

### Cho User

- ✅ **Tiết kiệm thời gian**: Chọn địa chỉ chỉ 2 clicks
- ✅ **Không rời trang**: Quản lý địa chỉ ngay trong checkout
- ✅ **Linh hoạt**: Có thể thêm/sửa/xóa ngay lập tức
- ✅ **Trực quan**: Thấy rõ địa chỉ nào đang được chọn

### Cho Business

- ✅ **Tăng conversion**: Checkout nhanh hơn → ít bỏ giỏ
- ✅ **Giảm friction**: Không cần chuyển trang
- ✅ **Tăng engagement**: User tương tác nhiều hơn với địa chỉ
- ✅ **Data quality**: Địa chỉ được quản lý tốt hơn

## Technical Implementation

### Props Interface

```typescript
interface SavedAddressSelectorProps {
  onSelectAddress: (address: SavedAddress) => void;
  currentAddress?: {
    street?: string;
    city?: string;
  };
}
```

### Key Features

1. **Smart Matching**: Tự động highlight địa chỉ đang được chọn
2. **Real-time Sync**: Danh sách cập nhật ngay khi thêm/sửa/xóa
3. **Nested Modals**: Modal trong modal (danh sách → thêm/sửa)
4. **Event Propagation**: Stop propagation để tránh conflict

### State Management

- `useSavedAddresses` hook: Quản lý CRUD operations
- Local state: Modal open/close, editing address
- Form state: React Hook Form trong CheckoutPage

## Testing Checklist

### Functional

- [ ] Click box → Modal mở
- [ ] Chọn địa chỉ → Form auto-fill
- [ ] Chọn địa chỉ → Modal đóng
- [ ] Click "Thêm mới" → Modal thêm mở
- [ ] Thêm địa chỉ → Danh sách cập nhật
- [ ] Click "Sửa" → Modal sửa mở
- [ ] Sửa địa chỉ → Danh sách cập nhật
- [ ] Click "Xóa" → Confirm dialog
- [ ] Xóa địa chỉ → Danh sách cập nhật
- [ ] Click "Đặt mặc định" → Badge cập nhật

### UI/UX

- [ ] Box hiển thị đúng empty state
- [ ] Box hiển thị đúng selected state
- [ ] Hover effects mượt mà
- [ ] Modal responsive trên mobile
- [ ] Scroll hoạt động trong modal
- [ ] Nested modals không conflict
- [ ] Toast notifications hiển thị

### Edge Cases

- [ ] Không có địa chỉ nào → Empty state
- [ ] Chỉ có 1 địa chỉ → Auto-select?
- [ ] Xóa địa chỉ đang chọn → Form clear?
- [ ] Sửa địa chỉ đang chọn → Form update?
- [ ] Network error → Error handling

## Future Enhancements

### Phase 2

1. **Quick Actions**

   - Swipe to delete (mobile)
   - Keyboard shortcuts (desktop)

2. **Smart Suggestions**

   - Gợi ý địa chỉ gần nhất (GPS)
   - Gợi ý địa chỉ hay dùng nhất

3. **Address Labels**

   - Icon tùy chỉnh (🏠 Nhà, 🏢 Công ty)
   - Color coding

4. **Bulk Actions**
   - Select multiple → Delete
   - Import/Export addresses

## Metrics to Track

- **Usage Rate**: % users sử dụng selector vs nhập thủ công
- **Time Saved**: Thời gian checkout trung bình
- **Address Management**: Số lượng địa chỉ trung bình/user
- **Conversion Impact**: Conversion rate trước/sau feature

---

**Version:** 1.0.0  
**Last Updated:** 2024-11-29  
**Component:** `SavedAddressSelector.tsx`
