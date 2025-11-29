# Customer Feature Module

Clean, modular architecture for customer-facing features (Checkout, Address Management, etc.)

## 📁 Structure

```
features/customer/
├── components/          # UI Components
│   ├── AddressForm/    # Address form components
│   ├── PaymentForm.tsx
│   └── ...
├── hooks/              # Business Logic Hooks
│   ├── useGPSLocation.ts
│   ├── useGHNLocations.ts
│   ├── useAddressForm.ts
│   └── index.ts
├── utils/              # Pure Utility Functions
│   ├── formatters.ts
│   ├── addressMatchers.ts
│   └── index.ts
├── pages/              # Page Components
│   └── CheckoutPage.tsx
└── README.md
```

---

## 🎯 Design Principles

### 1. Separation of Concerns

- **Components**: Pure UI, no business logic
- **Hooks**: Business logic, state management
- **Utils**: Pure functions, no side effects

### 2. Single Responsibility

- Each file has ONE clear purpose
- Each function does ONE thing well

### 3. Composition

- Small components compose into larger ones
- Hooks compose into orchestrator hooks

---

## 🔧 Usage Examples

### Using GPS Location Hook

```typescript
import { useGPSLocation } from "@/features/customer/hooks";

function MyComponent() {
  const { detectLocation, detectedLocation, isDetecting } = useGPSLocation();

  return (
    <button onClick={detectLocation} disabled={isDetecting}>
      {isDetecting ? "Detecting..." : "Get Location"}
    </button>
  );
}
```

### Using Formatters

```typescript
import { formatPhoneNumber, formatName } from "@/features/customer/utils";

const formatted = formatPhoneNumber("0901234567");
// Result: "090 123 4567"

const name = formatName("nguyen van a");
// Result: "Nguyễn Văn A"
```

### Using Address Form

```typescript
import { AddressForm } from "@/features/customer/components/AddressForm";
import { FormProvider, useForm } from "react-hook-form";

function CheckoutPage() {
  const form = useForm();

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <AddressForm />
        <button type="submit">Submit</button>
      </form>
    </FormProvider>
  );
}
```

---

## 📦 Available Hooks

### `useGPSLocation()`

Handles GPS detection and reverse geocoding.

**Returns:**

```typescript
{
  isDetecting: boolean;
  detectedLocation: GPSLocation | null;
  detectLocation: () => Promise<GPSLocation | null>;
  clearLocation: () => void;
}
```

### `useGHNLocations()`

Manages GHN location data (provinces, districts, wards).

**Returns:**

```typescript
{
  provinces: GHNProvince[];
  districts: GHNDistrict[];
  wards: GHNWard[];
  isLoadingProvinces: boolean;
  isLoadingDistricts: boolean;
  isLoadingWards: boolean;
  loadDistricts: (provinceId: number) => Promise<void>;
  loadWards: (districtId: number) => Promise<void>;
}
```

### `useAddressForm()`

Main orchestrator for address form logic.

**Returns:**

```typescript
{
  // GPS
  isDetecting, detectedLocation, isGPSFilled,
  handleGPSDetect, handleGPSClear,

  // GHN
  provinces, districts, wards,
  isLoadingProvinces, isLoadingDistricts, isLoadingWards,

  // Handlers
  handleProvinceChange, handleDistrictChange, handleWardChange,

  // Utils
  isFieldValid,
}
```

---

## 🛠️ Available Utils

### Formatters

```typescript
// Format phone number
formatPhoneNumber(value: string): string

// Format name (capitalize)
formatName(value: string): string

// Format full address
formatAddress(parts: {
  street?: string;
  ward?: string;
  district?: string;
  city?: string;
}): string
```

### Address Matchers

```typescript
// Find matching province
findMatchingProvince(
  cityName: string,
  provinces: GHNProvince[]
): GHNProvince | undefined

// Find matching district
findMatchingDistrict(
  districtName: string,
  districts: GHNDistrict[]
): GHNDistrict | undefined

// Normalize city name
normalizeCityName(cityName: string): string
```

---

## 🧩 Components

### AddressForm Components

All components are in `components/AddressForm/`:

- **`index.tsx`**: Main orchestrator
- **`GPSLocationButton.tsx`**: GPS detection button
- **`LocationPreview.tsx`**: Map preview with clear button
- **`PersonalInfoFields.tsx`**: Name + Phone inputs
- **`LocationSelects.tsx`**: Province/District/Ward selects
- **`StreetAddressField.tsx`**: Street address input

**Usage:**

```typescript
import { AddressForm } from "@/features/customer/components/AddressForm";

// Use as a whole
<AddressForm />;

// Or use individual components
import { GPSLocationButton } from "@/features/customer/components/AddressForm";
<GPSLocationButton onDetect={handleDetect} />;
```

---

## 🧪 Testing

### Testing Utils (Pure Functions)

```typescript
import { formatPhoneNumber } from "@/features/customer/utils";

describe("formatPhoneNumber", () => {
  it("formats 10-digit phone number", () => {
    expect(formatPhoneNumber("0901234567")).toBe("090 123 4567");
  });
});
```

### Testing Hooks

```typescript
import { renderHook } from "@testing-library/react-hooks";
import { useGPSLocation } from "@/features/customer/hooks";

describe("useGPSLocation", () => {
  it("detects location", async () => {
    const { result } = renderHook(() => useGPSLocation());

    // Mock geolocation
    global.navigator.geolocation = {
      getCurrentPosition: jest.fn((success) =>
        success({ coords: { latitude: 10, longitude: 106 } })
      ),
    };

    await result.current.detectLocation();
    expect(result.current.detectedLocation).toBeTruthy();
  });
});
```

### Testing Components

```typescript
import { render, screen } from "@testing-library/react";
import { GPSLocationButton } from "@/features/customer/components/AddressForm";

describe("GPSLocationButton", () => {
  it("renders correctly", () => {
    render(
      <GPSLocationButton
        isDetecting={false}
        isGPSFilled={false}
        onDetect={jest.fn()}
      />
    );

    expect(screen.getByText("Định vị tôi")).toBeInTheDocument();
  });
});
```

---

## 🚀 Adding New Features

### Example: Add "Save Address" Feature

#### 1. Create Hook (if needed)

```typescript
// hooks/useSaveAddress.ts
export const useSaveAddress = () => {
  const saveAddress = async (address: Address) => {
    // Save logic
  };

  return { saveAddress };
};
```

#### 2. Create Component

```typescript
// components/AddressForm/SaveAddressButton.tsx
export const SaveAddressButton = ({ onSave }) => {
  return <button onClick={onSave}>Save</button>;
};
```

#### 3. Compose in Main Component

```typescript
// components/AddressForm/index.tsx
import { SaveAddressButton } from "./SaveAddressButton";
import { useSaveAddress } from "../../hooks/useSaveAddress";

export const AddressForm = () => {
  const { saveAddress } = useSaveAddress();

  return (
    <div>
      {/* ... existing components ... */}
      <SaveAddressButton onSave={saveAddress} />
    </div>
  );
};
```

---

## 📚 Best Practices

### 1. Keep Components Pure

```typescript
// ✅ Good - Pure component
export const MyButton = ({ onClick, label }) => (
  <button onClick={onClick}>{label}</button>
);

// ❌ Bad - Component with business logic
export const MyButton = () => {
  const [data, setData] = useState();
  useEffect(() => {
    fetchData();
  }, []);
  // ...
};
```

### 2. Extract Business Logic to Hooks

```typescript
// ✅ Good - Logic in hook
const useMyFeature = () => {
  const [state, setState] = useState();
  const doSomething = () => {
    /* logic */
  };
  return { state, doSomething };
};

// ❌ Bad - Logic in component
const MyComponent = () => {
  const [state, setState] = useState();
  const doSomething = () => {
    /* logic */
  };
  // ...
};
```

### 3. Use Pure Functions for Transformations

```typescript
// ✅ Good - Pure function
export const formatData = (data: Data): FormattedData => {
  return {
    /* transformation */
  };
};

// ❌ Bad - Impure function
export const formatData = (data: Data) => {
  globalState.formatted = {
    /* transformation */
  };
};
```

---

## 🔍 Code Review Checklist

When adding new code, ensure:

- [ ] Components are < 200 lines
- [ ] Functions are < 50 lines
- [ ] No business logic in components
- [ ] Hooks are reusable
- [ ] Utils are pure functions
- [ ] TypeScript types are defined
- [ ] JSDoc comments for complex functions
- [ ] No console.logs in production code
- [ ] Error handling is present
- [ ] Loading states are handled

---

## 📖 Related Documentation

- [Refactoring Plan](../../../CHECKOUT_REFACTORING.md)
- [Refactoring Complete](../../../REFACTORING_COMPLETE.md)
- [GPS UX Improvements](../../../GPS_UX_IMPROVEMENTS.md)

---

## 🤝 Contributing

When contributing to this module:

1. Follow the existing structure
2. Keep components small and focused
3. Extract logic to hooks
4. Write pure utility functions
5. Add TypeScript types
6. Update this README if needed

---

**Maintained by:** Printz Development Team
**Last Updated:** 2024
