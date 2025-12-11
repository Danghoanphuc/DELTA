# Database Migrations - POD Catalog Optimization

## Overview

Migrations cho POD Catalog & SKU Management Optimization feature.

## Migrations

### 001-create-pod-catalog-models.js

Tạo 5 collections mới:

- **Artwork**: Quản lý artwork files với version control
- **ProductionOrder**: Tracking đơn hàng sản xuất
- **Invoice**: Hóa đơn với credit notes
- **InventoryTransaction**: Audit trail cho inventory
- **SkuVariant**: Biến thể sản phẩm với inventory tracking

### 002-enhance-existing-models.js

Thêm fields mới vào models hiện tại:

- **Product**: printMethods, moqByPrintMethod, productionComplexity
- **SwagOrder**: production, costBreakdown, documents

## Running Migrations

### Run all migrations

```bash
cd apps/customer-backend
node src/migrations/run-migrations.js up
```

### Rollback all migrations

```bash
node src/migrations/run-migrations.js down
```

### Run individual migration

```bash
node src/migrations/001-create-pod-catalog-models.js
```

## Environment Variables

Migrations sử dụng `MONGODB_URI` environment variable. Default: `mongodb://localhost:27017/delta-swag`

```bash
MONGODB_URI=mongodb://localhost:27017/delta-swag node src/migrations/run-migrations.js up
```

## Validation

Sau khi chạy migrations, kiểm tra:

1. **Collections created**: Artwork, ProductionOrder, Invoice, InventoryTransaction, SkuVariant
2. **Indexes created**: Check với `db.collection.getIndexes()`
3. **Existing data**: Product và SwagOrder có fields mới
4. **Data integrity**: Không có data loss

## Rollback Strategy

Migrations có thể rollback an toàn:

- Collections mới sẽ bị drop
- Fields mới sẽ bị remove từ existing documents
- Original data không bị ảnh hưởng

## Notes

- ✅ Migrations are idempotent (có thể chạy nhiều lần)
- ✅ Rollback safe (không làm mất data cũ)
- ✅ Validation checks included
- ⚠️ Backup database trước khi chạy migrations trong production
