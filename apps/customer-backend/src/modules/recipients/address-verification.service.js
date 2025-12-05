// src/modules/recipients/address-verification.service.js
// ✅ Address Verification Service - Xác minh địa chỉ giao hàng

import { Logger } from "../../shared/utils/index.js";

// Vietnam provinces/cities for validation
const VIETNAM_CITIES = [
  "TP. Hồ Chí Minh",
  "Hà Nội",
  "Đà Nẵng",
  "Cần Thơ",
  "Hải Phòng",
  "Biên Hòa",
  "Nha Trang",
  "Huế",
  "Buôn Ma Thuột",
  "Thái Nguyên",
  "Nam Định",
  "Quy Nhơn",
  "Vũng Tàu",
  "Long Xuyên",
  "Hạ Long",
  "Phan Thiết",
  "Cà Mau",
  "Vinh",
  "Mỹ Tho",
  "Đà Lạt",
  "Bắc Ninh",
  "Thủ Dầu Một",
  "Thanh Hóa",
  "Rạch Giá",
  "Tây Ninh",
  "Bình Dương",
  "Đồng Nai",
  "Long An",
  "Bà Rịa - Vũng Tàu",
  "Bình Thuận",
  "An Giang",
  "Kiên Giang",
  "Tiền Giang",
  "Bến Tre",
  "Vĩnh Long",
  "Đồng Tháp",
  "Trà Vinh",
  "Sóc Trăng",
  "Bạc Liêu",
  "Hậu Giang",
];

export class AddressVerificationService {
  /**
   * Verify and normalize address
   */
  async verifyAddress(address) {
    Logger.debug("[AddressVerify] Verifying address:", address);

    const result = {
      isValid: false,
      isComplete: false,
      normalizedAddress: null,
      suggestions: [],
      issues: [],
    };

    // Check required fields
    if (!address.street) {
      result.issues.push("Thiếu địa chỉ (số nhà, đường)");
    }
    if (!address.district) {
      result.issues.push("Thiếu quận/huyện");
    }
    if (!address.city) {
      result.issues.push("Thiếu tỉnh/thành phố");
    }

    // Validate city
    if (address.city) {
      const normalizedCity = this._normalizeCity(address.city);
      if (!normalizedCity) {
        result.issues.push("Tỉnh/thành phố không hợp lệ");
        result.suggestions = this._suggestCities(address.city);
      } else {
        address.city = normalizedCity;
      }
    }

    // Check completeness
    result.isComplete = result.issues.length === 0;
    result.isValid = result.isComplete;

    if (result.isValid) {
      result.normalizedAddress = {
        street: this._normalizeStreet(address.street),
        ward: address.ward || "",
        district: this._normalizeDistrict(address.district),
        city: address.city,
        country: "Vietnam",
        postalCode: address.postalCode || "",
      };
    }

    Logger.debug("[AddressVerify] Result:", result);
    return result;
  }

  /**
   * Bulk verify addresses
   */
  async bulkVerify(addresses) {
    const results = await Promise.all(
      addresses.map((addr) => this.verifyAddress(addr))
    );

    return {
      total: addresses.length,
      valid: results.filter((r) => r.isValid).length,
      invalid: results.filter((r) => !r.isValid).length,
      results,
    };
  }

  /**
   * Get delivery estimate based on address
   */
  getDeliveryEstimate(address) {
    const city = address.city?.toLowerCase() || "";

    // Major cities - faster delivery
    const majorCities = ["tp. hồ chí minh", "hà nội", "đà nẵng"];
    if (majorCities.some((c) => city.includes(c))) {
      return {
        standard: { min: 2, max: 3, unit: "ngày" },
        express: { min: 1, max: 2, unit: "ngày" },
        overnight: { min: 0, max: 1, unit: "ngày" },
      };
    }

    // Other cities
    return {
      standard: { min: 3, max: 5, unit: "ngày" },
      express: { min: 2, max: 3, unit: "ngày" },
      overnight: { min: 1, max: 2, unit: "ngày" },
    };
  }

  /**
   * Calculate shipping cost based on address
   */
  calculateShippingCost(address, method = "standard") {
    const city = address.city?.toLowerCase() || "";

    // Base costs
    const baseCosts = {
      standard: 30000,
      express: 50000,
      overnight: 100000,
    };

    // Major cities - no surcharge
    const majorCities = ["tp. hồ chí minh", "hà nội", "đà nẵng"];
    if (majorCities.some((c) => city.includes(c))) {
      return baseCosts[method] || baseCosts.standard;
    }

    // Remote areas - add surcharge
    const remoteSurcharge = 20000;
    return (baseCosts[method] || baseCosts.standard) + remoteSurcharge;
  }

  // === PRIVATE HELPERS ===

  _normalizeCity(city) {
    if (!city) return null;

    const normalized = city.trim();

    // Exact match
    const exactMatch = VIETNAM_CITIES.find(
      (c) => c.toLowerCase() === normalized.toLowerCase()
    );
    if (exactMatch) return exactMatch;

    // Partial match
    const partialMatch = VIETNAM_CITIES.find(
      (c) =>
        c.toLowerCase().includes(normalized.toLowerCase()) ||
        normalized.toLowerCase().includes(c.toLowerCase())
    );
    if (partialMatch) return partialMatch;

    return null;
  }

  _suggestCities(input) {
    if (!input) return [];

    const normalized = input.toLowerCase();
    return VIETNAM_CITIES.filter((c) =>
      c.toLowerCase().includes(normalized)
    ).slice(0, 5);
  }

  _normalizeStreet(street) {
    if (!street) return "";

    return street
      .trim()
      .replace(/\s+/g, " ")
      .replace(/đường/gi, "Đường")
      .replace(/số/gi, "Số");
  }

  _normalizeDistrict(district) {
    if (!district) return "";

    return district
      .trim()
      .replace(/\s+/g, " ")
      .replace(/quận/gi, "Quận")
      .replace(/huyện/gi, "Huyện")
      .replace(/thị xã/gi, "Thị xã");
  }
}
