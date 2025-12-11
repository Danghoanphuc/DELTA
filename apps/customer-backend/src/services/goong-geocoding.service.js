// apps/customer-backend/src/services/goong-geocoding.service.js
/**
 * Goong Geocoding Service
 * Handles GPS verification and address geocoding using Goong.io API
 */

import axios from "axios";
import { config } from "../config/env.config.js";
import { Logger } from "../shared/utils/logger.util.js";
import { ValidationException } from "../shared/exceptions/index.js";

/**
 * GPS Accuracy Threshold (in meters)
 * Coordinates with accuracy below this are considered valid
 */
const GPS_ACCURACY_THRESHOLD = 50;

/**
 * Goong Geocoding Service
 * Provides GPS validation and reverse geocoding functionality
 */
export class GoongGeocodingService {
  constructor() {
    this.apiKey = config.goong?.apiKey;
    this.baseUrl = "https://rsapi.goong.io";

    if (!this.apiKey) {
      Logger.warn(
        "[GoongGeocodingSvc] Goong API key not configured. Geocoding will be disabled."
      );
    }
  }

  /**
   * Reverse geocode coordinates to address
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @returns {Promise<Object>} Address object with formatted address and components
   */
  async reverseGeocode(lat, lng) {
    Logger.debug(
      `[GoongGeocodingSvc] Reverse geocoding coordinates: ${lat}, ${lng}`
    );

    // Validate coordinates
    if (!this.validateCoordinateRange(lat, lng)) {
      throw new ValidationException(
        "Tọa độ GPS không hợp lệ. Vui lòng kiểm tra lại vị trí."
      );
    }

    // If API key not configured, return coordinates only
    if (!this.apiKey) {
      Logger.warn(
        "[GoongGeocodingSvc] API key not configured, returning coordinates only"
      );
      return {
        formatted: `${lat}, ${lng}`,
        street: "",
        ward: "",
        district: "",
        city: "",
        country: "Vietnam",
        components: {},
      };
    }

    try {
      const response = await axios.get(`${this.baseUrl}/Geocode`, {
        params: {
          latlng: `${lat},${lng}`,
          api_key: this.apiKey,
        },
        timeout: 5000, // 5 second timeout
      });

      if (
        !response.data ||
        !response.data.results ||
        response.data.results.length === 0
      ) {
        Logger.warn(
          `[GoongGeocodingSvc] No results from Goong API for ${lat}, ${lng}`
        );
        return this.createFallbackAddress(lat, lng);
      }

      const result = response.data.results[0];
      const address = this.parseGoongResponse(result);

      Logger.success(
        `[GoongGeocodingSvc] Successfully geocoded: ${address.formatted}`
      );
      return address;
    } catch (error) {
      Logger.error(
        `[GoongGeocodingSvc] Failed to reverse geocode:`,
        error.message
      );

      // Return fallback address instead of throwing error
      // This allows check-in to proceed even if geocoding fails
      return this.createFallbackAddress(lat, lng);
    }
  }

  /**
   * Validate GPS coordinates with accuracy threshold
   * @param {Object} gpsData - GPS metadata including accuracy
   * @returns {Object} Validation result with isValid and warning message
   */
  validateCoordinates(gpsData) {
    const { accuracy, latitude, longitude } = gpsData;

    // Validate coordinate range
    if (!this.validateCoordinateRange(latitude, longitude)) {
      return {
        isValid: false,
        warning: "Tọa độ GPS không hợp lệ",
        accuracy: accuracy !== undefined && accuracy !== null ? accuracy : null,
      };
    }

    // Check if accuracy data is provided
    if (accuracy !== undefined && accuracy !== null) {
      // Check accuracy threshold
      if (accuracy <= GPS_ACCURACY_THRESHOLD) {
        return {
          isValid: true,
          warning: null,
          accuracy,
        };
      }

      // Accuracy exceeds threshold - warn but allow
      return {
        isValid: true,
        warning: `Độ chính xác GPS thấp (${Math.round(
          accuracy
        )}m). Vị trí có thể không chính xác.`,
        accuracy,
      };
    }

    // No accuracy data - allow but warn
    return {
      isValid: true,
      warning: "Không có thông tin độ chính xác GPS",
      accuracy: null,
    };
  }

  /**
   * Format address for Vietnamese addresses
   * @param {Object} addressComponents - Address components
   * @returns {string} Formatted address string
   */
  formatAddress(addressComponents) {
    const { street, ward, district, city } = addressComponents;

    const parts = [];
    if (street) parts.push(street);
    if (ward) parts.push(ward);
    if (district) parts.push(district);
    if (city) parts.push(city);

    return parts.join(", ");
  }

  /**
   * Validate coordinate range
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @returns {boolean} True if coordinates are valid
   * @private
   */
  validateCoordinateRange(lat, lng) {
    // Validate latitude range (-90 to 90)
    if (typeof lat !== "number" || lat < -90 || lat > 90) {
      return false;
    }

    // Validate longitude range (-180 to 180)
    if (typeof lng !== "number" || lng < -180 || lng > 180) {
      return false;
    }

    return true;
  }

  /**
   * Parse Goong API response to address object
   * @param {Object} result - Goong API result
   * @returns {Object} Parsed address object
   * @private
   */
  parseGoongResponse(result) {
    const components = {};
    const addressComponents = result.address_components || [];

    // Extract address components
    addressComponents.forEach((component) => {
      const types = component.types || [];

      if (types.includes("street_address") || types.includes("route")) {
        components.street = component.long_name;
      } else if (
        types.includes("sublocality") ||
        types.includes("administrative_area_level_3")
      ) {
        components.ward = component.long_name;
      } else if (types.includes("administrative_area_level_2")) {
        components.district = component.long_name;
      } else if (
        types.includes("administrative_area_level_1") ||
        types.includes("locality")
      ) {
        components.city = component.long_name;
      } else if (types.includes("country")) {
        components.country = component.long_name;
      }
    });

    return {
      formatted: result.formatted_address || "",
      street: components.street || "",
      ward: components.ward || "",
      district: components.district || "",
      city: components.city || "",
      country: components.country || "Vietnam",
      components,
    };
  }

  /**
   * Create fallback address when geocoding fails
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @returns {Object} Fallback address object
   * @private
   */
  createFallbackAddress(lat, lng) {
    return {
      formatted: `${lat}, ${lng}`,
      street: "",
      ward: "",
      district: "",
      city: "",
      country: "Vietnam",
      components: {},
    };
  }

  /**
   * Get accuracy threshold
   * @returns {number} GPS accuracy threshold in meters
   */
  getAccuracyThreshold() {
    return GPS_ACCURACY_THRESHOLD;
  }
}

// Export singleton instance
export const goongGeocodingService = new GoongGeocodingService();
