// apps/customer-frontend/src/shared/utils/format.ts
/**
 * Formatting utilities
 */

export { formatCurrency } from "./formatCurrency";

/**
 * Format a number with thousand separators
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat("vi-VN").format(num);
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}
