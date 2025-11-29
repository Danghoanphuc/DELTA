// apps/customer-frontend/src/features/customer/utils/index.ts
/**
 * Central export for all customer feature utilities
 */

export { formatPhoneNumber, formatName, formatAddress } from "./formatters";

export {
  findMatchingProvince,
  findMatchingDistrict,
  normalizeCityName,
} from "./addressMatchers";
