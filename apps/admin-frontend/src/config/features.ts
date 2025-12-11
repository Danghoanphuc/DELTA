// apps/admin-frontend/src/config/features.ts
/**
 * Feature Flags Configuration
 * Control which features are visible in Admin UI
 */

export const FEATURES = {
  /**
   * MasterOrder System (Shop/E-commerce orders)
   * @deprecated - No longer fits business model
   */
  MASTER_ORDER_SYSTEM: false,

  /**
   * SwagOrder System (B2B Corporate Gifting)
   * Core business - always enabled
   */
  SWAG_ORDER_SYSTEM: true,

  /**
   * Printer Management
   */
  PRINTER_MANAGEMENT: true,

  /**
   * Finance/Payout System
   */
  FINANCE_SYSTEM: true,
} as const;

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(feature: keyof typeof FEATURES): boolean {
  return FEATURES[feature] === true;
}
