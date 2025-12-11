# Product Controller Quick Start Guide

## 🚀 Quick Start

### 1. Configure Print Methods

```bash
curl -X PUT http://localhost:5001/api/admin/products/PRODUCT_ID/print-methods \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "printMethods": [
      {
        "method": "screen_print",
        "areas": [
          {
            "name": "front",
            "maxWidth": 300,
            "maxHeight": 400,
            "position": { "x": 150, "y": 100 },
            "allowedColors": 4,
            "setupFee": 50000,
            "unitCost": 5000
          }
        ],
        "artworkRequirements": {
          "minResolution": 300,
          "acceptedFormats": ["AI", "EPS", "PDF"],
          "colorMode": "CMYK",
          "maxFileSize": 50
        },
        "leadTime": {
          "min": 5,
          "max": 7,
          "unit": "days"
        }
      }
    ]
  }'
```

### 2. Set Pricing Tiers

```bash
curl -X POST http://localhost:5001/api/admin/products/PRODUCT_ID/pricing-tiers \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "pricingTiers": [
      {
        "minQty": 1,
        "maxQty": 10,
        "pricePerUnit": 100000,
        "discount": 0
      },
      {
        "minQty": 11,
        "maxQty": 50,
        "pricePerUnit": 90000,
        "discount": 10
      },
      {
        "minQty": 51,
        "pricePerUnit": 80000,
        "discount": 20
      }
    ]
  }'
```

### 3. Calculate Price

```bash
curl -X POST http://localhost:5001/api/admin/products/PRODUCT_ID/calculate-price \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 25,
    "customization": {
      "printMethod": "screen_print",
      "printAreas": ["front", "back"]
    }
  }'
```

## 📋 Available Endpoints

| Method | Endpoint                                  | Purpose                 |
| ------ | ----------------------------------------- | ----------------------- |
| PUT    | `/api/admin/products/:id/print-methods`   | Configure print methods |
| POST   | `/api/admin/products/:id/pricing-tiers`   | Set pricing tiers       |
| POST   | `/api/admin/products/:id/calculate-price` | Calculate price         |

## 🔐 Authentication

All endpoints require:

- **Header**: `Authorization: Bearer <token>`
- **Role**: `superadmin` or `support`

## 📝 Request/Response Examples

### Configure Print Methods

**Request**:

```json
{
  "printMethods": [
    {
      "method": "dtg",
      "areas": [
        {
          "name": "front",
          "maxWidth": 280,
          "maxHeight": 350,
          "position": { "x": 140, "y": 90 },
          "allowedColors": 999,
          "setupFee": 0,
          "unitCost": 15000
        }
      ],
      "artworkRequirements": {
        "minResolution": 300,
        "acceptedFormats": ["PNG", "PDF"],
        "colorMode": "RGB",
        "maxFileSize": 50
      },
      "leadTime": {
        "min": 3,
        "max": 5,
        "unit": "days"
      }
    }
  ]
}
```

**Response**:

```json
{
  "success": true,
  "message": "Đã cấu hình print methods thành công",
  "data": {
    "product": {
      "_id": "...",
      "name": "Áo thun cotton",
      "printMethods": [ ... ]
    }
  }
}
```

### Set Pricing Tiers

**Request**:

```json
{
  "pricingTiers": [
    { "minQty": 1, "maxQty": 10, "pricePerUnit": 100000 },
    { "minQty": 11, "maxQty": 50, "pricePerUnit": 90000 },
    { "minQty": 51, "pricePerUnit": 80000 }
  ]
}
```

**Response**:

```json
{
  "success": true,
  "message": "Đã thiết lập pricing tiers thành công",
  "data": {
    "product": {
      "_id": "...",
      "name": "Áo thun cotton",
      "pricingTiers": [ ... ]
    }
  }
}
```

### Calculate Price

**Request**:

```json
{
  "quantity": 25,
  "customization": {
    "printMethod": "screen_print",
    "printAreas": ["front"]
  }
}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "basePrice": 100000,
    "quantity": 25,
    "appliedTier": {
      "minQty": 11,
      "maxQty": 50,
      "pricePerUnit": 90000,
      "discount": 10
    },
    "unitPrice": 90000,
    "subtotal": 2250000,
    "customization": {
      "setupFees": 50000,
      "unitCosts": 5000,
      "totalCost": 175000,
      "breakdown": [
        {
          "area": "front",
          "setupFee": 50000,
          "unitCost": 5000,
          "totalCost": 175000
        }
      ]
    },
    "volumeDiscount": {
      "percentage": 10,
      "amount": 250000
    },
    "totalBeforeDiscount": 2500000,
    "totalDiscount": 250000,
    "totalPrice": 2425000,
    "savingsVsBasePrice": 75000,
    "savingsPercentage": 3,
    "nextTier": {
      "minQty": 51,
      "pricePerUnit": 80000,
      "potentialSavings": 510000
    }
  }
}
```

## ⚠️ Error Responses

### Validation Error

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "printMethods phải là một array và không được để trống"
  }
}
```

### Not Found Error

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Product with ID xxx not found"
  }
}
```

### Pricing Tier Validation Error

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Pricing tiers không hợp lệ: Tier 2: pricePerUnit phải nhỏ hơn tier trước đó"
  }
}
```

## 🧪 Testing with Postman

### 1. Import Collection

Create a new Postman collection with these requests:

### 2. Set Environment Variables

```
BASE_URL = http://localhost:5001
TOKEN = your_admin_token
PRODUCT_ID = your_product_id
```

### 3. Test Workflow

1. Configure print methods
2. Set pricing tiers
3. Calculate price for different quantities
4. Verify volume discounts apply correctly

## 💡 Tips

### Print Methods

- Use `screen_print` for bulk orders (lower unit cost, higher setup fee)
- Use `dtg` for small orders (no setup fee, higher unit cost)
- Use `embroidery` for premium items

### Pricing Tiers

- Ensure tiers don't overlap
- Price should decrease as quantity increases
- Last tier should have no `maxQty` (unlimited)

### Price Calculation

- Test with different quantities to see tier changes
- Include customization to see full cost breakdown
- Check `nextTier` for upsell opportunities

## 🔗 Related Documentation

- [Print Method Service](../services/PRINT_METHOD_QUICK_START.md)
- [Pricing Service](../services/PRICING_QUICK_START.md)
- [Variant Generation](../services/VARIANT_GENERATION_QUICK_START.md)
- [Phase 3.1.4 Complete](../../../../PHASE_3.1.4_COMPLETE.md)
