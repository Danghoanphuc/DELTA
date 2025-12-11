// apps/admin-backend/src/models/shared.models.ts
// ✅ Re-export models from admin-backend for convenience
// These models exist in admin-backend and can be imported directly

// Re-export SwagOrder model
export { SwagOrder } from "./swag-order.model.js";

// Re-export OrganizationProfile model (stub for admin-backend)
export { OrganizationProfile } from "./organization.model.js";

// Note: SwagPack should be imported from customer-backend package
// or created in admin-backend if needed
