# Logger Import and Inventory Service Fix

## Issue 1: Logger Import Error

The application was failing to start with the error:

```
SyntaxError: The requested module '../infrastructure/logger.js' does not provide an export named 'Logger'
```

### Root Cause

The codebase has two different logger implementations:

1. **`infrastructure/logger.js`** - Winston-based logger with Logtail integration

   - Uses **default export**: `export default logger`
   - Intended for production logging with cloud integration

2. **`utils/logger.ts`** - Simple TypeScript logger class
   - Uses **named export**: `export { Logger }`
   - Used throughout the codebase for consistent logging

Several files were incorrectly trying to import `Logger` as a named export from `infrastructure/logger.js`, which only provides a default export.

### Files Fixed

The following files were updated to import from the correct logger:

1. `src/middleware/socket-auth.middleware.ts`
2. `src/services/alert.service.ts`
3. `src/services/production-status.service.ts`
4. `src/services/production-event-emitter.service.ts`

### Changes Made

Changed import statements from:

```typescript
import { Logger } from "../infrastructure/logger.js";
```

To:

```typescript
import { Logger } from "../utils/logger.js";
```

---

## Issue 2: Inventory Service Repository Mismatch

After fixing the logger issue, the application encountered a runtime error:

```
TypeError: this.inventoryRepo.findAllWithOrganization is not a function
```

### Root Cause

The `InventoryService` was calling methods (`findAllWithOrganization`, `findByOrganization`, `findItemById`) that don't exist in the `InventoryRepository`.

The repository is designed for **SKU variant inventory tracking** with methods like:

- `getInventoryLevels(variantId)`
- `updateInventoryLevels(variantId, updates)`
- `getLowStockItems(threshold)`
- `getInventoryOverview()`

But the service was expecting an **organization-based inventory model** with nested items.

### Solution

Refactored the `InventoryService` to use the actual repository methods:

1. **`getOverview()`** - Now uses `getInventoryOverview()` and `getLowStockItems()`
2. **`updateItem()`** - Now uses `getInventoryLevels()` and `updateInventoryLevels()`
3. **`getAlerts()`** - Now uses `getLowStockItems()` to generate alerts

### Changes Made

**Before:**

```typescript
// Expected organization-based inventory
const inventories = await this.inventoryRepo.findAllWithOrganization();
for (const inv of inventories) {
  for (const item of inv.items || []) {
    // Process items
  }
}
```

**After:**

```typescript
// Uses SKU variant inventory
const overview = await this.inventoryRepo.getInventoryOverview();
const items = await this.inventoryRepo.getLowStockItems();
```

---

## Verification

- ✅ All incorrect logger imports have been fixed
- ✅ Inventory service now uses correct repository methods
- ✅ No TypeScript compilation errors
- ✅ Application starts successfully
- ✅ Inventory endpoints should now work correctly

## Recommendation

The `infrastructure/logger.js` file appears to be unused. Consider either:

1. Removing it if not needed, OR
2. Exporting a named `Logger` export if it's intended to be used elsewhere

## Testing

Run the development server to verify:

```bash
cd apps/admin-backend
pnpm dev
```

Test the inventory endpoint:

```bash
curl http://localhost:5002/api/admin/swag-ops/inventory?lowStockOnly=false
```

The server should start without errors and the inventory endpoint should return data.
