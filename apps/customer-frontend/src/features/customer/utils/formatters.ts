// apps/customer-frontend/src/features/customer/utils/formatters.ts
/**
 * Utility functions for formatting user input
 */

/**
 * Format phone number: 0901234567 -> 090 123 4567
 */
export const formatPhoneNumber = (value: string): string => {
  const numbers = value.replace(/\D/g, "");
  let formatted = "";

  for (let i = 0; i < numbers.length && i < 11; i++) {
    if (i === 3 || i === 6) formatted += " ";
    formatted += numbers[i];
  }

  return formatted.trim();
};

/**
 * Format name: nguyen van a -> Nguyễn Văn A
 */
export const formatName = (value: string): string => {
  return value
    .toLowerCase()
    .replace(/(?:^|\s)\S/g, (char) => char.toUpperCase());
};

/**
 * Format address string
 */
export const formatAddress = (parts: {
  street?: string;
  ward?: string;
  district?: string;
  city?: string;
}): string => {
  return [parts.street, parts.ward, parts.district, parts.city]
    .filter(Boolean)
    .join(", ");
};
