// apps/customer-backend/src/shared/constants/order-types.constant.js
/**
 * Order Types Constants - Single Source of Truth
 *
 * Định nghĩa tất cả các loại order trong hệ thống.
 * Sử dụng cho polymorphic references và type discrimination.
 *
 * @module OrderTypes
 */

/**
 * Enum các loại order trong hệ thống
 * @readonly
 * @enum {string}
 */
export const ORDER_TYPES = Object.freeze({
  /**
   * SwagOrder - Đơn hàng gửi quà cho organization
   * Prefix: SW (e.g., SW20251200001)
   * Model: SwagOrder
   */
  SWAG: "swag",

  /**
   * MasterOrder - Đơn hàng mua từ shop (print-on-demand)
   * Prefix: MO (e.g., MO20251200001)
   * Model: MasterOrder
   */
  MASTER: "master",
});

/**
 * Mapping từ ORDER_TYPE sang Mongoose Model name
 * Sử dụng cho dynamic population
 */
export const ORDER_TYPE_TO_MODEL = Object.freeze({
  [ORDER_TYPES.SWAG]: "SwagOrder",
  [ORDER_TYPES.MASTER]: "MasterOrder",
});

/**
 * Mapping từ Model name sang ORDER_TYPE
 * Sử dụng cho reverse lookup
 */
export const MODEL_TO_ORDER_TYPE = Object.freeze({
  SwagOrder: ORDER_TYPES.SWAG,
  MasterOrder: ORDER_TYPES.MASTER,
});

/**
 * Order number prefixes
 * Sử dụng để detect order type từ orderNumber
 */
export const ORDER_NUMBER_PREFIXES = Object.freeze({
  [ORDER_TYPES.SWAG]: "SW",
  [ORDER_TYPES.MASTER]: "MO",
});

/**
 * Detect order type từ orderNumber
 * @param {string} orderNumber - Order number (e.g., "SW20251200001")
 * @returns {string|null} Order type hoặc null nếu không detect được
 */
export function detectOrderTypeFromNumber(orderNumber) {
  if (!orderNumber || typeof orderNumber !== "string") {
    return null;
  }

  const prefix = orderNumber.substring(0, 2).toUpperCase();

  for (const [type, typePrefix] of Object.entries(ORDER_NUMBER_PREFIXES)) {
    if (prefix === typePrefix) {
      return type;
    }
  }

  return null;
}

/**
 * Validate order type
 * @param {string} orderType - Order type to validate
 * @returns {boolean}
 */
export function isValidOrderType(orderType) {
  return Object.values(ORDER_TYPES).includes(orderType);
}

/**
 * Get model name for order type
 * @param {string} orderType - Order type
 * @returns {string|null} Model name hoặc null
 */
export function getModelNameForOrderType(orderType) {
  return ORDER_TYPE_TO_MODEL[orderType] || null;
}
