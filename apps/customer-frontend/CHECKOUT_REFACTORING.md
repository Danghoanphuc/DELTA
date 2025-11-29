# 🏗️ Checkout Refactoring Plan

## 📋 Vấn đề hiện tại

### CheckoutPage.tsx (500+ lines)

- ❌ Quá nhiều responsibilities
- ❌ Logic business trộn lẫn với UI
- ❌ Khó test
- ❌ Khó maintain

### AddressForm.tsx (400+ lines)

- ❌ Xử lý GPS, GHN API, validation cùng lúc
- ❌ Không tái sử dụng được
- ❌ State management phức tạp

---

## 🎯 Kiến trúc mới

### 1. **Separation of Concerns**

```
📦 features/customer/
├── 📁 components/          # Pure UI Components
│   ├── AddressForm/
│   │   ├── index.tsx                    # Main orchestrator
│   │   ├── GPSLocationButton.tsx        # GPS button UI
│   │   ├── LocationPreview.tsx          # Map preview
│   │   ├── PersonalInfoFields.tsx       # Name + Phone
│   │   ├── LocationSelects.tsx          # Province/District/Ward
│   │   └── StreetAddressField.tsx       # Street input
│   ├── PaymentMethod/
│   │   ├── index.tsx                    # Payment method selector
│   │   ├── PaymentMethodCard.tsx        # Individual payment card
│   │   └── StripePaymentForm.tsx        # Stripe form wrapper
│   └── CheckoutSummary/
│       └── index.tsx                    # Order summary
│
├── 📁 hooks/               # Business Logic
│   ├── useGPSLocation.ts               # GPS detection logic
│   ├── useGHNLocations.ts              # GHN API + cascading
│   ├── useAddressForm.ts               # Form state management
│   ├── usePaymentMethod.ts             # Payment logic
│   └── useCheckoutSubmit.ts            # Submit orchestration
│
├── 📁 utils/               # Pure Functions
│   ├── formatters.ts                   # formatPhone, formatName
│   ├── validators.ts                   # Validation rules
│   └── addressMatchers.ts              # Smart matching logic
│
└── 📁 pages/
    └── CheckoutPage.tsx                # Layout orchestrator (100 lines)
```

---

## 🔧 Đã triển khai

### ✅ Phase 1: Extract Utilities

#### 1. `utils/formatters.ts`

```typescript
export const formatPhoneNumber = (value: string): string
export const formatName = (value: string): string
export const formatAddress = (parts: {...}): string
```

**Benefits:**

- ✅ Pure functions - dễ test
- ✅ Reusable across components
- ✅ Single responsibility

#### 2. `utils/addressMatchers.ts`

```typescript
export const findMatchingProvince = (cityName, provinces);
export const findMatchingDistrict = (districtName, districts);
export const normalizeCityName = cityName;
```

**Benefits:**

- ✅ Tách logic matching phức tạp
- ✅ Dễ maintain và extend
- ✅ Testable

---

### ✅ Phase 2: Extract Custom Hooks

#### 1. `hooks/useGPSLocation.ts`

```typescript
export const useGPSLocation = () => {
  return {
    isDetecting,
    detectedLocation,
    detectLocation, // async function
    clearLocation,
  };
};
```

**Benefits:**

- ✅ Tách logic GPS khỏi UI
- ✅ Reusable trong nhiều components
- ✅ Centralized error handling
- ✅ Testable với mock geolocation API

**Usage:**

```tsx
const { detectLocation, detectedLocation } = useGPSLocation();

<Button onClick={detectLocation}>Định vị</Button>;
```

#### 2. `hooks/useGHNLocations.ts`

```typescript
export const useGHNLocations = () => {
  return {
    provinces,
    districts,
    wards,
    isLoadingProvinces,
    isLoadingDistricts,
    isLoadingWards,
    loadDistricts, // async function
    loadWards, // async function
  };
};
```

**Benefits:**

- ✅ Tách logic GHN API
- ✅ Quản lý loading states
- ✅ Cascading logic tập trung
- ✅ Dễ mock cho testing

**Usage:**

```tsx
const { provinces, loadDistricts } = useGHNLocations();

<Select onChange={(id) => loadDistricts(id)}>
  {provinces.map(...)}
</Select>
```

---

### ✅ Phase 3: Extract UI Components

#### 1. `components/AddressForm/GPSLocationButton.tsx`

```tsx
<GPSLocationButton
  isDetecting={isDetecting}
  isGPSFilled={isGPSFilled}
  onDetect={handleDetect}
/>
```

**Benefits:**

- ✅ Single responsibility: Chỉ render button
- ✅ Props-driven: Dễ test
- ✅ Reusable

#### 2. `components/AddressForm/LocationPreview.tsx`

```tsx
<LocationPreview lat={lat} lng={lng} address={address} onClear={handleClear} />
```

**Benefits:**

- ✅ Tách logic hiển thị map
- ✅ Self-contained
- ✅ Easy to replace/upgrade

#### 3. `components/AddressForm/PersonalInfoFields.tsx`

```tsx
<PersonalInfoFields isFieldValid={isFieldValid} />
```

**Benefits:**

- ✅ Group related fields
- ✅ Reusable validation logic
- ✅ Cleaner parent component

---

## 🚀 Phase 4: Refactor Main Components (TODO)

### 1. Refactor `AddressForm/index.tsx`

**Before:** 400 lines
**After:** ~150 lines

```tsx
export const AddressForm = () => {
  // Use custom hooks
  const { detectLocation, detectedLocation, clearLocation } = useGPSLocation();
  const { provinces, districts, wards, loadDistricts, loadWards } =
    useGHNLocations();

  // Minimal state
  const [isGPSFilled, setIsGPSFilled] = useState(false);

  // Compose UI from small components
  return (
    <div>
      <GPSLocationButton onDetect={handleDetect} />
      {detectedLocation && <LocationPreview onClear={clearLocation} />}
      <PersonalInfoFields />
      <LocationSelects provinces={provinces} districts={districts} />
      <StreetAddressField />
    </div>
  );
};
```

---

### 2. Refactor `CheckoutPage.tsx`

**Before:** 500+ lines
**After:** ~100 lines

```tsx
export const CheckoutPage = () => {
  const { cart } = useCartStore();
  const { submitCheckout } = useCheckoutSubmit();
  const { paymentMethod, setPaymentMethod } = usePaymentMethod();

  return (
    <div className="checkout-layout">
      <div className="left-column">
        <AddressForm />
        <PaymentMethod value={paymentMethod} onChange={setPaymentMethod} />
      </div>

      <div className="right-column">
        <CheckoutSummary cart={cart} />
      </div>
    </div>
  );
};
```

---

## 📊 Metrics Comparison

| Metric               | Before | After | Improvement |
| -------------------- | ------ | ----- | ----------- |
| CheckoutPage lines   | 500+   | ~100  | 80% ↓       |
| AddressForm lines    | 400+   | ~150  | 62% ↓       |
| Testable functions   | 0      | 10+   | ∞ ↑         |
| Reusable hooks       | 0      | 5     | ∞ ↑         |
| Component complexity | High   | Low   | ✅          |

---

## 🎯 Benefits

### 1. **Maintainability**

- ✅ Mỗi file < 200 lines
- ✅ Single responsibility
- ✅ Dễ tìm và fix bugs

### 2. **Testability**

- ✅ Pure functions dễ test
- ✅ Hooks có thể mock
- ✅ Components có thể test riêng

### 3. **Reusability**

- ✅ Hooks dùng lại ở nhiều nơi
- ✅ Utils functions universal
- ✅ Components composable

### 4. **Scalability**

- ✅ Dễ thêm payment methods mới
- ✅ Dễ thêm address providers mới
- ✅ Dễ customize UI

---

## 🔄 Migration Strategy

### Step 1: Create new structure (✅ Done)

- ✅ Create utils/
- ✅ Create hooks/
- ✅ Create component folders

### Step 2: Extract logic (✅ In Progress)

- ✅ Extract formatters
- ✅ Extract matchers
- ✅ Extract GPS hook
- ✅ Extract GHN hook
- ⏳ Extract payment hook
- ⏳ Extract submit hook

### Step 3: Refactor components (⏳ Next)

- ⏳ Refactor AddressForm
- ⏳ Refactor CheckoutPage
- ⏳ Create PaymentMethod components

### Step 4: Testing (⏳ Next)

- ⏳ Write unit tests for utils
- ⏳ Write tests for hooks
- ⏳ Write integration tests

### Step 5: Cleanup (⏳ Next)

- ⏳ Remove old code
- ⏳ Update imports
- ⏳ Update documentation

---

## 📝 Next Steps

1. **Complete component extraction**

   - LocationSelects.tsx
   - StreetAddressField.tsx
   - PaymentMethodCard.tsx

2. **Create remaining hooks**

   - usePaymentMethod.ts
   - useCheckoutSubmit.ts
   - useAddressForm.ts (orchestrator)

3. **Refactor main components**

   - AddressForm/index.tsx
   - CheckoutPage.tsx

4. **Add tests**

   - Unit tests for utils
   - Hook tests
   - Component tests

5. **Documentation**
   - API documentation
   - Usage examples
   - Migration guide

---

## 🎉 Conclusion

Refactoring này sẽ:

- ✅ Giảm complexity
- ✅ Tăng maintainability
- ✅ Tăng testability
- ✅ Tăng reusability
- ✅ Chuẩn bị cho scale

**Estimated time:** 4-6 hours
**Risk:** Low (incremental changes)
**Impact:** High (long-term benefits)
