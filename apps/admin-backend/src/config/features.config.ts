// apps/admin-backend/src/config/features.config.ts
/**
 * Feature Flags Configuration
 * Control which features are enabled/disabled
 */

export const FEATURES = {
  /**
   * MasterOrder System (Shop/E-commerce orders)
   * @deprecated - No longer fits business model (B2B Corporate Gifting focus)
   * Set to false to disable all MasterOrder-related features
   */
  MASTER_ORDER_SYSTEM: false,

  /**
   * SwagOrder System (B2B Corporate Gifting)
   * Core business model - always enabled
   */
  SWAG_ORDER_SYSTEM: true,

  /**
   * Printer Management
   * Keep enabled as SwagOrder also needs printers
   */
  PRINTER_MANAGEMENT: true,

  /**
   * Finance/Payout System
   * Keep enabled but will need migration from MasterOrder to SwagOrder
   */
  FINANCE_SYSTEM: true,
} as const;

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(feature: keyof typeof FEATURES): boolean {
  return FEATURES[feature] === true;
}

/**
 * Middleware to check feature flag
 */
export function requireFeature(feature: keyof typeof FEATURES) {
  return (_req: any, res: any, next: any) => {
    if (!isFeatureEnabled(feature)) {
      return res.status(404).json({
        success: false,
        error: {
          code: "FEATURE_DISABLED",
          message: `Feature "${feature}" is currently disabled`,
        },
      });
    }
    next();
  };
}
