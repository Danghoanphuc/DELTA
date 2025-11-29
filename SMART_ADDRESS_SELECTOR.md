# 🧠 Smart Address Selector - Intelligent UX

## Tổng Quan

**Smart Address Selector** là component thông minh tự động điều chỉnh UI dựa trên trạng thái địa chỉ của người dùng.

## Tính Năng Thông Minh

### 🎯 Adaptive UI

Component tự động chuyển đổi giữa 2 modes:

#### Mode 1: Chưa Có Địa Chỉ (Empty State)

```
┌─────────────────────────────────────────┐
│  ➕  Thêm địa chỉ giao hàng            →│
│      Nhấn để nhập địa chỉ của bạn...    │
│      Bạn có thể sử dụng GPS...          │
└─────────────────────────────────────────┘
```

**Khi click** → Mở modal với form nhập địa chỉ + GPS

#### Mode 2: Đã Có Địa chỉ (Filled State)

```
┌─────────────────────────────────────────┐
│  📍  Nguyễn Văn A          ⭐ Mặc định  │
│      📞 0912345678              [Sửa]   │
│      📍 123 Đường ABC, Phường 1...      │
│      ───────────────────────────────────│
│      ▼ Chọn địa chỉ khác (3 địa chỉ)   │
└─────────────────────────────────────────┘
```

**Khi click "Sửa"** → Mở modal quản lý địa chỉ
**Khi click "Chọn địa chỉ khác"** → Mở modal danh sách

## Component Structure

```
SmartAddressSelector (Orchestrator)
  ├─> Trigger Box (Adaptive UI)
  │     ├─> Empty State (Prompt thêm mới)
  │     └─> Filled State (Hiển thị địa chỉ)
  └─> AddressManagementModal
        ├─> List Mode (Danh sách địa chỉ)
        │     ├─> Address Cards
        │     ├─> Select/Edit/Delete actions
        │     └─> Button "Thêm mới"
        └─> Form Mode (Nhập/Sửa địa chỉ)
              ├─> AddressFormWithGPS
              ├─> GPS Detection
              ├─> Map Preview
              └─> Form Fields
```

## User Flows

### Flow 1: Lần Đầu Sử Dụng (No Address)

```
1. User vào Checkout
   ↓
2. Thấy box "Thêm địa chỉ giao hàng"
   ↓
3. Click vào box
   ↓
4. Modal mở với form + GPS
   ↓
5. Click "Bắt đầu định vị"
   ↓
6. GPS tự động điền địa chỉ
   ↓
7. Review và điều chỉnh
   ↓
8. Click "Lưu địa chỉ"
   ↓
9. Form checkout tự động điền ✨
   ↓
10. Modal đóng
```

### Flow 2: Đã Có Địa Chỉ (Has Address)

```
1. User vào Checkout
   ↓
2. Thấy địa chỉ mặc định đã điền sẵn ✨
   ↓
3. Nếu OK → Tiếp tục checkout
   ↓
4. Nếu muốn đổi → Click "Sửa"
   ↓
5. Modal mở với danh sách địa chỉ
   ↓
6. Chọn địa chỉ khác hoặc thêm mới
   ↓
7. Form checkout cập nhật ✨
```

### Flow 3: Quản Lý Nhiều Địa Chỉ

```
1. Click "Chọn địa chỉ khác"
   ↓
2. Modal hiển thị tất cả địa chỉ
   ↓
3. User có thể:
   - Chọn địa chỉ khác
   - Sửa địa chỉ hiện tại
   - Xóa địa chỉ không dùng
   - Đặt địa chỉ mặc định
   - Thêm địa chỉ mới
```

## Technical Details

### Props Interface

```typescript
interface SmartAddressSelectorProps {
  onSelectAddress: (address: SavedAddress) => void;
  currentAddress?: {
    fullName?: string;
    phone?: string;
    street?: string;
    city?: string;
  };
}
```

### State Management

**Smart Detection:**

```typescript
const hasAddresses = addresses.length > 0;
const displayAddress = selectedAddress || defaultAddress;

// Tự động chọn UI mode
if (hasAddresses && displayAddress) {
  // Show filled state
} else {
  // Show empty state
}
```

**Modal Modes:**

```typescript
type ModalMode = "list" | "form";

// Auto-switch based on context
initialMode = hasAddresses ? "list" : "form";
```

### GPS Integration

**AddressFormWithGPS** tích hợp:

- `useGPSLocation` hook
- Real-time map preview
- Auto-fill form fields
- Error handling

## UI/UX Highlights

### Visual Hierarchy

**Empty State:**

- Gray icon (neutral)
- Clear call-to-action
- Helpful description
- Arrow indicator

**Filled State:**

- Blue gradient background
- Bold recipient name
- Phone + address details
- Edit button prominent
- Quick action link

### Color System

```css
/* Empty State */
border: gray-200
background: white
icon: gray-400

/* Filled State */
border: blue-500
background: gradient(blue-50 → indigo-50)
icon: blue-600

/* Selected in List */
border: blue-500 (2px)
background: blue-50
checkmark: blue-600
```

### Spacing & Typography

```css
/* Trigger Box */
padding: 20px (empty) / 20px (filled)
border-radius: 12px
border-width: 2px

/* Text Sizes */
title: text-lg (18px) font-bold
phone: text-sm (14px) font-medium
address: text-sm (14px) leading-relaxed
```

## Benefits

### Cho User

- ✅ **Zero Friction**: Không cần học cách dùng
- ✅ **Context-Aware**: UI thay đổi theo tình huống
- ✅ **Fast Checkout**: Địa chỉ sẵn sàng ngay
- ✅ **Flexible**: Dễ dàng thay đổi địa chỉ

### Cho Developer

- ✅ **Single Component**: Một component cho mọi case
- ✅ **Reusable**: Dùng ở bất kỳ đâu cần địa chỉ
- ✅ **Maintainable**: Logic tập trung
- ✅ **Testable**: Clear states để test

## Comparison

### ❌ Old Approach (Separate Components)

```
CheckoutPage
  ├─> AddressForm (always visible)
  └─> SavedAddressSelector (separate box)
```

**Problems:**

- Redundant UI
- Confusing for first-time users
- Takes more space
- Not intuitive

### ✅ New Approach (Smart Component)

```
CheckoutPage
  └─> SmartAddressSelector (adaptive)
        ├─> Empty → Form
        └─> Filled → Display + Edit
```

**Benefits:**

- Clean UI
- Intuitive flow
- Space efficient
- Context-aware

## Testing Checklist

### Functional

- [ ] Empty state hiển thị khi chưa có địa chỉ
- [ ] Filled state hiển thị khi đã có địa chỉ
- [ ] Click empty state → Modal form mở
- [ ] Click "Sửa" → Modal list mở
- [ ] GPS detection hoạt động
- [ ] Map preview hiển thị
- [ ] Form validation đúng
- [ ] Lưu địa chỉ thành công
- [ ] Auto-fill checkout form
- [ ] Modal đóng sau khi chọn

### UI/UX

- [ ] Transition mượt mà
- [ ] Colors contrast đủ
- [ ] Text readable
- [ ] Icons clear
- [ ] Buttons accessible
- [ ] Mobile responsive
- [ ] Loading states
- [ ] Error states

### Edge Cases

- [ ] Không có địa chỉ nào
- [ ] Có 1 địa chỉ
- [ ] Có nhiều địa chỉ
- [ ] GPS fail
- [ ] Network error
- [ ] Validation errors

## Performance

### Optimizations

1. **Lazy Loading**: Modal chỉ render khi mở
2. **Memoization**: Prevent unnecessary re-renders
3. **Debouncing**: GPS detection throttled
4. **Caching**: Addresses cached in hook

### Metrics

- **Initial Load**: < 100ms
- **GPS Detection**: 2-5s (depends on device)
- **Form Submit**: < 500ms
- **Modal Open**: < 50ms

## Future Enhancements

### Phase 2

1. **Smart Suggestions**

   - Gợi ý địa chỉ dựa trên lịch sử
   - Địa chỉ gần nhất (GPS)

2. **Quick Edit**

   - Inline editing
   - No modal needed

3. **Address Validation**

   - Real-time validation với GHN
   - Shipping cost preview

4. **Voice Input**
   - Nhập địa chỉ bằng giọng nói
   - Accessibility improvement

## Migration Guide

### From Old Components

```typescript
// ❌ Old
<SavedAddressSelector ... />
<AddressForm ... />

// ✅ New
<SmartAddressSelector
  onSelectAddress={(address) => {
    // Handle address selection
  }}
  currentAddress={formData}
/>
```

### Props Mapping

```typescript
// Old SavedAddressSelector props
onSelectAddress → Same
currentAddress → Enhanced (more fields)

// Old AddressForm props
Not needed anymore (handled internally)
```

## Support

**Files:**

- `SmartAddressSelector.tsx` - Main component
- `AddressManagementModal.tsx` - Modal orchestrator
- `AddressFormWithGPS.tsx` - Form with GPS

**Hooks:**

- `useSavedAddresses` - CRUD operations
- `useGPSLocation` - GPS detection

---

**Version:** 2.0.0  
**Last Updated:** 2024-11-29  
**Breaking Changes:** Replaces SavedAddressSelector + AddressForm
