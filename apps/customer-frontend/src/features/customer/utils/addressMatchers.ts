// apps/customer-frontend/src/features/customer/utils/addressMatchers.ts
/**
 * Smart matching utilities for address components
 */

import type { GHNProvince, GHNDistrict } from "@/services/ghnLocationService";

/**
 * Find matching province by fuzzy matching
 */
export const findMatchingProvince = (
  cityName: string,
  provinces: GHNProvince[]
): GHNProvince | undefined => {
  const normalized = cityName.toLowerCase().trim();

  return provinces.find((province) => {
    const provinceName = province.ProvinceName.toLowerCase();
    return (
      provinceName.includes(normalized) ||
      normalized.includes(provinceName) ||
      // Handle common variations
      (normalized.includes("hồ chí minh") &&
        provinceName.includes("hồ chí minh")) ||
      (normalized.includes("hà nội") && provinceName.includes("hà nội")) ||
      (normalized.includes("đà nẵng") && provinceName.includes("đà nẵng"))
    );
  });
};

/**
 * Find matching district by fuzzy matching
 */
export const findMatchingDistrict = (
  districtName: string,
  districts: GHNDistrict[]
): GHNDistrict | undefined => {
  const normalized = districtName.toLowerCase().trim();

  return districts.find((district) => {
    const dName = district.DistrictName.toLowerCase();
    return dName.includes(normalized) || normalized.includes(dName);
  });
};

/**
 * Normalize city name variations
 */
export const normalizeCityName = (cityName: string): string => {
  const cityMap: Record<string, string> = {
    "hồ chí minh": "Thành phố Hồ Chí Minh",
    "ho chi minh": "Thành phố Hồ Chí Minh",
    "sài gòn": "Thành phố Hồ Chí Minh",
    hcm: "Thành phố Hồ Chí Minh",
    "hà nội": "Thành phố Hà Nội",
    hanoi: "Thành phố Hà Nội",
    "đà nẵng": "Thành phố Đà Nẵng",
    "da nang": "Thành phố Đà Nẵng",
  };

  const normalized = cityName.toLowerCase().trim();
  return cityMap[normalized] || cityName;
};
