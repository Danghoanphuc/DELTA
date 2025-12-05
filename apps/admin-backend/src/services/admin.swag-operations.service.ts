// src/services/admin.swag-operations.service.ts
// ✅ Admin Swag Operations Service - Refactored
// Re-export từ Facade để maintain backward compatibility

export { SwagOperationsFacade as SwagOperationsService } from "./swag-operations.facade.js";
export { swagOperationsService } from "./swag-operations.facade.js";

// Re-export interfaces
export type {
  OrderFilters,
  ShipmentUpdate,
  InventoryFilters,
  InventoryUpdateRequest,
  DashboardStats,
  FulfillmentQueue,
  InventoryOverview,
} from "../interfaces/swag-operations.interface.js";

export {
  ORDER_STATUS,
  SHIPMENT_STATUS,
} from "../interfaces/swag-operations.interface.js";
