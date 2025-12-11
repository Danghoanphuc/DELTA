# Product Customization - Quick Start Guide

## 🚀 Quick Start

### Basic Usage

```typescript
import { ProductCustomizationPanel } from "@/features/products";

function ProductPage() {
  return (
    <ProductCustomizationPanel
      productId="product-123"
      productName="Premium T-Shirt"
      variantAttributes={[
        {
          name: "size",
          label: "Size",
          values: ["S", "M", "L", "XL"],
        },
        {
          name: "color",
          label: "Màu sắc",
          values: ["Đen", "Trắng", "Xanh"],
        },
      ]}
      printMethods={[
        {
          method: "screen_print",
          label: "Screen Print (Lụa)",
          areas: [
            {
              name: "front",
              label: "Mặt trước",
              maxWidth: 300,
              maxHeight: 400,
              setupFee: 100000,
              unitCost: 50000,
            },
          ],
          leadTime: { min: 5, max: 7, unit: "days" },
        },
      ]}
      artworks={[]}
      minQuantity={10}
      onAddToCart={(customization) => {
        console.log("Add to cart:", customization);
      }}
    />
  );
}
```

---

## 📦 Components

### 1. VariantSelector

Select product variants (size, color, material).

```typescript
import { VariantSelector } from "@/features/products";

<VariantSelector
  attributes={[
    { name: "size", label: "Size", values: ["S", "M", "L"] },
    { name: "color", label: "Màu", values: ["Đen", "Trắng"] },
  ]}
  selection={{ size: "M", color: "Đen" }}
  onChange={(selection) => console.log(selection)}
/>;
```

### 2. PrintMethodSelector

Choose print method and areas.

```typescript
import { PrintMethodSelector } from "@/features/products";

<PrintMethodSelector
  printMethods={[
    {
      method: "screen_print",
      label: "Screen Print",
      areas: [
        {
          name: "front",
          label: "Mặt trước",
          maxWidth: 300,
          maxHeight: 400,
          setupFee: 100000,
          unitCost: 50000,
        },
      ],
      leadTime: { min: 5, max: 7, unit: "days" },
    },
  ]}
  selection={undefined}
  onChange={(selection) => console.log(selection)}
/>;
```

### 3. ArtworkSelector

Upload or select artwork from library.

```typescript
import { ArtworkSelector } from "@/features/products";

<ArtworkSelector
  printAreas={[{ area: "front" }, { area: "back" }]}
  artworks={[
    {
      _id: "artwork-1",
      fileName: "logo.png",
      thumbnailUrl: "/thumb.jpg",
      fileUrl: "/logo.png",
      dimensions: { width: 300, height: 400, unit: "mm" },
      resolution: 300,
    },
  ]}
  onArtworkSelect={(area, artworkId) => {
    console.log(`Selected ${artworkId} for ${area}`);
  }}
  onUploadClick={() => console.log("Upload clicked")}
/>;
```

### 4. PersonalizationInput

Add personalization text.

```typescript
import { PersonalizationInput } from "@/features/products";

<PersonalizationInput
  personalization={{ text: "Company Name", font: "arial", color: "black" }}
  onChange={(personalization) => console.log(personalization)}
/>;
```

### 5. PriceCalculator

Display price breakdown.

```typescript
import { PriceCalculator } from "@/features/products";

<PriceCalculator
  priceBreakdown={{
    basePrice: 100000,
    customizationCost: 50000,
    setupFees: 200000,
    volumeDiscount: 35000,
    subtotal: 350000,
    total: 315000,
    unitPrice: 6300,
    savings: 35000,
    nextTierInfo: {
      quantity: 100,
      unitPrice: 5500,
      savings: 80000,
    },
  }}
  quantity={50}
  loading={false}
/>;
```

---

## 🎣 Hooks

### useProductCustomization

Manage customization state and API calls.

```typescript
import { useProductCustomization } from "@/features/products";

function ProductPage() {
  const {
    variants,
    printMethods,
    priceBreakdown,
    isLoading,
    isCalculating,
    error,
    calculatePrice,
    refetch,
  } = useProductCustomization("product-123");

  // Calculate price when customization changes
  useEffect(() => {
    calculatePrice("variant-id", 50, {
      printMethod: "screen_print",
      printAreas: [{ area: "front", artworkId: "artwork-1" }],
    });
  }, [calculatePrice]);

  return <div>...</div>;
}
```

---

## 🔌 API Service

### productCustomizationService

```typescript
import { productCustomizationService } from "@/features/products";

// Calculate price
const priceBreakdown = await productCustomizationService.calculatePrice(
  "product-123",
  {
    variantId: "variant-456",
    quantity: 50,
    customization: {
      printMethod: "screen_print",
      printAreas: [{ area: "front", artworkId: "artwork-1" }],
      personalization: { text: "Company Name" },
    },
  }
);

// Get variants
const variants = await productCustomizationService.getProductVariants(
  "product-123"
);

// Get print methods
const printMethods = await productCustomizationService.getPrintMethods(
  "product-123"
);
```

---

## 📝 Types

### CustomizationOptions

```typescript
interface CustomizationOptions {
  variantSelection: {
    size?: string;
    color?: string;
    [key: string]: string | undefined;
  };
  printMethod?: {
    method: string;
    areas: Array<{
      area: string;
      artworkId?: string;
      artworkUrl?: string;
      colors?: string[];
    }>;
  };
  personalization?: {
    text: string;
    font?: string;
    color?: string;
  };
  quantity: number;
}
```

### PriceBreakdown

```typescript
interface PriceBreakdown {
  basePrice: number;
  customizationCost: number;
  setupFees: number;
  volumeDiscount: number;
  subtotal: number;
  total: number;
  unitPrice: number;
  savings?: number;
  nextTierInfo?: {
    quantity: number;
    unitPrice: number;
    savings: number;
  };
}
```

---

## 🎨 Styling

All components use Tailwind CSS and shadcn/ui components. Customize by:

1. **Tailwind Classes**: Pass className prop
2. **Theme Variables**: Modify CSS variables
3. **Component Props**: Use variant props

```typescript
<PriceCalculator
  className="custom-class"
  priceBreakdown={breakdown}
  quantity={50}
/>
```

---

## 🔗 Integration with Other Features

### With Artwork Management (Phase 2)

```typescript
import { useArtworks } from "@/features/artworks";
import { ProductCustomizationPanel } from "@/features/products";

function ProductPage() {
  const { artworks, openUploadModal } = useArtworks();

  return (
    <ProductCustomizationPanel
      artworks={artworks}
      onUploadArtwork={openUploadModal}
      // ... other props
    />
  );
}
```

### With Cart Store

```typescript
import { useCartStore } from "@/stores/useCartStore";
import { ProductCustomizationPanel } from "@/features/products";

function ProductPage() {
  const { addToCart, isAdding } = useCartStore();

  return (
    <ProductCustomizationPanel
      onAddToCart={(customization) => {
        addToCart({
          productId: product._id,
          ...customization,
        });
      }}
      isAddingToCart={isAdding}
      // ... other props
    />
  );
}
```

---

## 🐛 Troubleshooting

### Price not calculating

Check that:

1. Backend API is running
2. Product has pricing tiers configured
3. Variant is selected
4. Network requests are successful

### Artwork not displaying

Check that:

1. Artwork URLs are accessible
2. Artwork has thumbnailUrl
3. CORS is configured correctly

### Components not rendering

Check that:

1. All required props are provided
2. Data format matches TypeScript interfaces
3. No console errors

---

## 📚 Further Reading

- [Phase 3.3 Complete Documentation](./PHASE_3.3_COMPLETE.md)
- [Customization Types](./types/customization.types.ts)
- [API Service](./services/product-customization.service.ts)
- [Phase 2 Artwork Management](../artworks/README.md)

---

**Need help?** Check the complete documentation or ask the team! 🚀
