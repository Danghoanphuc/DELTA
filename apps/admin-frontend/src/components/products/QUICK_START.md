# Quick Start - Product Management UI

## 🚀 Getting Started

### 1. Navigate to Product Form

```typescript
// In your browser
http://localhost:3000/catalog/products/new  // Create new product
http://localhost:3000/catalog/products/:id  // Edit existing product
```

### 2. Basic Product Setup

```typescript
// Fill in basic information
Name: "Áo thun cotton"
Description: "Áo thun cotton 100% cao cấp"
Category: "Apparel"
Base Cost: 100000  // VND
Base Price: 150000 // VND
MOQ: 1
Status: "active"
```

**Result**: Margin automatically calculated (33.3%)

### 3. Configure Print Methods

Click on "Print Methods" tab:

```typescript
// Add a print method
Method: "Screen Print"
Lead Time: 5-7 days

// Configure artwork requirements
Min Resolution: 300 DPI
Accepted Formats: AI, EPS, PDF
Color Mode: CMYK
Max File Size: 50 MB

// Add print area
Position: "front"
Max Size: 300mm x 400mm
Allowed Colors: 4
Setup Fee: 500000 VND
Unit Cost: 50000 VND
```

**Result**: Print method configured with 1 area

### 4. Configure Pricing Tiers

Click on "Pricing Tiers" tab:

```typescript
// Add tier 1
Min Qty: 1
Max Qty: 10
Price Per Unit: 150000 VND
// Discount: 0% (auto-calculated)
// Margin: 33.3% (auto-calculated)

// Add tier 2
Min Qty: 11
Max Qty: 50
Price Per Unit: 140000 VND
// Discount: 6.7% (auto-calculated)
// Margin: 28.6% (auto-calculated)

// Add tier 3
Min Qty: 51
Max Qty: (leave empty for unlimited)
Price Per Unit: 130000 VND
// Discount: 13.3% (auto-calculated)
// Margin: 23.1% (auto-calculated)
```

**Result**: 3 pricing tiers configured with auto-calculated discounts

### 5. Preview & Save

```typescript
// Click "Xem Preview" in Pricing Tiers tab
// Review pricing table with sample calculations

// Click "Lưu sản phẩm"
// Product saved successfully!
```

---

## 📋 Component Usage

### Using PrintMethodConfig

```typescript
import { PrintMethodConfig, PrintMethod } from "@/components/products";

function MyComponent() {
  const [printMethods, setPrintMethods] = useState<PrintMethod[]>([]);

  return (
    <PrintMethodConfig printMethods={printMethods} onChange={setPrintMethods} />
  );
}
```

### Using PricingTiersConfig

```typescript
import { PricingTiersConfig, PricingTier } from "@/components/products";

function MyComponent() {
  const [pricingTiers, setPricingTiers] = useState<PricingTier[]>([]);
  const baseCost = 100000;
  const basePrice = 150000;

  return (
    <PricingTiersConfig
      pricingTiers={pricingTiers}
      baseCost={baseCost}
      basePrice={basePrice}
      onChange={setPricingTiers}
    />
  );
}
```

### Using ProductForm

```typescript
import { ProductForm, ProductFormData } from "@/components/products";

function MyPage() {
  const handleSubmit = async (data: ProductFormData) => {
    await catalogService.createProduct(data);
  };

  const handleCancel = () => {
    navigate("/catalog/products");
  };

  return (
    <ProductForm
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isLoading={false}
    />
  );
}
```

---

## 🎯 Common Use Cases

### Use Case 1: Simple Product (No Customization)

```typescript
const simpleProduct = {
  name: "Bút bi",
  category: "stationery",
  basePrice: 5000,
  baseCost: 2000,
  moq: 100,
  printMethods: [], // No customization
  pricingTiers: [
    { minQty: 100, maxQty: 500, pricePerUnit: 5000 },
    { minQty: 501, pricePerUnit: 4500 },
  ],
};
```

### Use Case 2: T-Shirt with Multiple Print Methods

```typescript
const tshirt = {
  name: "Áo thun cotton",
  category: "apparel",
  basePrice: 150000,
  baseCost: 100000,
  moq: 1,
  printMethods: [
    {
      method: "screen_print",
      areas: [
        {
          name: "front",
          maxWidth: 300,
          maxHeight: 400,
          setupFee: 500000,
          unitCost: 50000,
        },
      ],
      artworkRequirements: {
        minResolution: 300,
        acceptedFormats: ["AI", "EPS", "PDF"],
        colorMode: "CMYK",
        maxFileSize: 50,
      },
      leadTime: { min: 5, max: 7, unit: "days" },
    },
    {
      method: "dtg",
      areas: [
        {
          name: "front",
          maxWidth: 350,
          maxHeight: 450,
          setupFee: 0,
          unitCost: 80000,
        },
      ],
      artworkRequirements: {
        minResolution: 300,
        acceptedFormats: ["PNG", "PDF"],
        colorMode: "RGB",
        maxFileSize: 100,
      },
      leadTime: { min: 3, max: 5, unit: "days" },
    },
  ],
  pricingTiers: [
    { minQty: 1, maxQty: 10, pricePerUnit: 150000 },
    { minQty: 11, maxQty: 50, pricePerUnit: 140000 },
    { minQty: 51, pricePerUnit: 130000 },
  ],
};
```

### Use Case 3: Mug with Embroidery

```typescript
const mug = {
  name: "Cốc sứ cao cấp",
  category: "drinkware",
  basePrice: 80000,
  baseCost: 50000,
  moq: 50,
  printMethods: [
    {
      method: "sublimation",
      areas: [
        {
          name: "front",
          maxWidth: 200,
          maxHeight: 100,
          setupFee: 300000,
          unitCost: 30000,
        },
      ],
      artworkRequirements: {
        minResolution: 300,
        acceptedFormats: ["PNG", "PDF"],
        colorMode: "RGB",
        maxFileSize: 50,
      },
      leadTime: { min: 7, max: 10, unit: "days" },
    },
  ],
  pricingTiers: [
    { minQty: 50, maxQty: 100, pricePerUnit: 80000 },
    { minQty: 101, maxQty: 500, pricePerUnit: 75000 },
    { minQty: 501, pricePerUnit: 70000 },
  ],
};
```

---

## 🔧 Customization

### Custom Currency Formatting

```typescript
// In your component
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

// Usage
<span>{formatCurrency(150000)}</span>;
// Output: "150.000 ₫"
```

### Custom Validation

```typescript
// Add custom validation in ProductForm
const validateForm = (data: ProductFormData) => {
  if (data.basePrice <= data.baseCost) {
    throw new Error("Giá bán phải lớn hơn giá vốn");
  }

  if (data.printMethods.length > 0) {
    data.printMethods.forEach((method) => {
      if (method.areas.length === 0) {
        throw new Error(
          `Print method ${method.method} phải có ít nhất 1 vị trí in`
        );
      }
    });
  }

  return true;
};
```

---

## 🐛 Troubleshooting

### Issue: Margin shows negative

**Cause**: Base price is lower than base cost

**Solution**: Increase base price or reduce base cost

```typescript
// Check margin calculation
const margin = ((basePrice - baseCost) / basePrice) * 100;
if (margin < 0) {
  alert("Giá bán phải lớn hơn giá vốn!");
}
```

### Issue: Discount not calculating

**Cause**: Base price not set

**Solution**: Set base price first before adding tiers

```typescript
// Ensure base price is set
if (!basePrice || basePrice === 0) {
  alert("Vui lòng nhập giá bán cơ bản trước");
  return;
}
```

### Issue: Print method not saving

**Cause**: Missing required fields

**Solution**: Ensure all required fields are filled

```typescript
// Validate print method
const validatePrintMethod = (method: PrintMethod) => {
  if (!method.method) throw new Error("Chọn phương pháp in");
  if (method.areas.length === 0) throw new Error("Thêm ít nhất 1 vị trí in");
  if (!method.artworkRequirements.minResolution)
    throw new Error("Nhập resolution tối thiểu");
  return true;
};
```

---

## 📚 API Reference

### CatalogService Methods

```typescript
// Get product
const product = await catalogService.getProduct(productId);

// Create product
const newProduct = await catalogService.createProduct(productData);

// Update product
const updated = await catalogService.updateProduct(productId, productData);

// Delete product
await catalogService.deleteProduct(productId);
```

### Data Transformation

```typescript
// Form data → API data
const transformToAPI = (formData: ProductFormData) => ({
  name: formData.name,
  description: formData.description,
  categoryId: formData.category,
  basePrice: formData.basePrice,
  baseCost: formData.baseCost,
  status: formData.status,
  pricingTiers: formData.pricingTiers,
  printMethods: formData.printMethods,
  images: formData.images.map((url, index) => ({
    url,
    isPrimary: index === 0,
    sortOrder: index,
  })),
});

// API data → Form data
const transformToForm = (product: Product) => ({
  name: product.name,
  description: product.description,
  category:
    typeof product.categoryId === "string"
      ? product.categoryId
      : product.categoryId._id,
  basePrice: product.basePrice,
  baseCost: product.baseCost,
  moq: 1,
  status: product.status === "discontinued" ? "inactive" : product.status,
  printMethods: product.printMethods || [],
  pricingTiers: product.pricingTiers || [],
  images: product.images?.map((img) => img.url) || [],
});
```

---

## 🎓 Best Practices

### 1. Always Set Base Price First

```typescript
// ✅ GOOD
1. Set base cost: 100,000 VND
2. Set base price: 150,000 VND
3. Add pricing tiers

// ❌ BAD
1. Add pricing tiers
2. Set base price (tiers won't calculate correctly)
```

### 2. Configure Print Methods Before Pricing

```typescript
// ✅ GOOD
1. Add print methods
2. Configure print areas
3. Add pricing tiers (includes customization costs)

// ❌ BAD
1. Add pricing tiers
2. Add print methods (pricing won't include customization)
```

### 3. Use Meaningful Names

```typescript
// ✅ GOOD
name: "Áo thun cotton cao cấp - Unisex";

// ❌ BAD
name: "Product 1";
```

### 4. Set Realistic Lead Times

```typescript
// ✅ GOOD
leadTime: { min: 5, max: 7, unit: "days" }

// ❌ BAD
leadTime: { min: 1, max: 1, unit: "days" } // Unrealistic
```

---

## 🚀 Next Steps

1. **Test the form**: Create a test product
2. **Configure print methods**: Add at least one print method
3. **Set pricing tiers**: Add 2-3 tiers for volume discounts
4. **Preview**: Check the pricing table
5. **Save**: Submit the form

**Need help?** Check `PHASE_3.2_COMPLETE.md` for detailed documentation.

---

**Last Updated**: December 7, 2025  
**Version**: 1.0.0  
**Phase**: 3.2 - Frontend Product Management UI
