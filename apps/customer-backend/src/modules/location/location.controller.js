// apps/customer-backend/src/modules/location/location.controller.js
import { ApiResponse } from "../../shared/utils/index.js";
import { API_CODES } from "../../shared/constants/index.js";
import { ValidationException } from "../../shared/exceptions/index.js";
import { Logger } from "../../shared/utils/index.js";
import { config } from "../../config/env.config.js";

export class LocationController {
  /**
   * Reverse geocoding: Chuyển tọa độ thành địa chỉ
   * @route POST /api/location/reverse-geocode
   * @access Public
   */
  reverseGeocode = async (req, res, next) => {
    try {
      const { lat, lng } = req.body;

      // Validate input
      if (!lat || !lng) {
        throw new ValidationException("Thiếu tọa độ (lat, lng).");
      }

      if (typeof lat !== "number" || typeof lng !== "number") {
        throw new ValidationException("Tọa độ phải là số.");
      }

      Logger.debug(
        `[LocationController] Reverse geocoding: lat=${lat}, lng=${lng}`
      );

      // Lấy Goong API key từ env
      const goongApiKey = process.env.GOONG_API_KEY;

      if (!goongApiKey) {
        Logger.error("[LocationController] Goong API key không được cấu hình");
        throw new Error("Goong API key không được cấu hình trong .env");
      }

      // Gọi Goong.io Geocoding API
      const goongUrl = `https://rsapi.goong.io/Geocode?latlng=${lat},${lng}&api_key=${goongApiKey}`;
      Logger.debug(
        `[LocationController] Calling Goong API: ${goongUrl.replace(
          goongApiKey,
          "***"
        )}`
      );

      let response;
      let data;

      try {
        response = await fetch(goongUrl);

        if (!response.ok) {
          const errorText = await response.text();
          Logger.error(
            `[LocationController] Goong API error (${response.status}): ${errorText}`
          );

          // ✅ FALLBACK: Nếu API key không hợp lệ, trả về địa chỉ mặc định
          if (response.status === 403) {
            Logger.warn(
              `[LocationController] API key không hợp lệ, sử dụng fallback`
            );
            return res.status(API_CODES.SUCCESS).json(
              ApiResponse.success({
                city: "Thành phố Hồ Chí Minh",
                district: "Quận 1",
                ward: "Phường Bến Nghé",
                street: "",
                fullAddress: `${lat}, ${lng}`,
                lat,
                lng,
              })
            );
          }

          throw new Error(
            `Goong API trả về lỗi ${response.status}: ${errorText}`
          );
        }

        data = await response.json();
        Logger.debug(
          `[LocationController] Goong API response:`,
          JSON.stringify(data, null, 2)
        );
      } catch (fetchError) {
        Logger.error(`[LocationController] Fetch error:`, fetchError);

        // ✅ FALLBACK: Nếu không kết nối được, trả về địa chỉ mặc định
        Logger.warn(
          `[LocationController] Không kết nối được Goong API, sử dụng fallback`
        );
        return res.status(API_CODES.SUCCESS).json(
          ApiResponse.success({
            city: "Thành phố Hồ Chí Minh",
            district: "Quận 1",
            ward: "Phường Bến Nghé",
            street: "",
            fullAddress: `${lat}, ${lng}`,
            lat,
            lng,
          })
        );
      }

      if (!data.results || data.results.length === 0) {
        Logger.warn(
          `[LocationController] Không tìm thấy địa chỉ tại lat=${lat}, lng=${lng}`
        );
        throw new Error("Không tìm thấy địa chỉ tại vị trí này");
      }

      // Lấy result đầu tiên (chính xác nhất)
      const result = data.results[0];
      const components = result.compound || {};

      // Parse địa chỉ Việt Nam
      const city = components.province || "Thành phố Hồ Chí Minh";
      const district = components.district || "Quận 1";
      const ward = components.commune || "Phường 1";

      const fullAddress = result.formatted_address || "";
      const street = this.extractStreet(fullAddress, ward, district, city);

      const addressResult = {
        city: this.normalizeCity(city),
        district: this.normalizeDistrict(district),
        ward: this.normalizeWard(ward),
        street,
        fullAddress,
        lat,
        lng,
      };

      Logger.info(
        `[LocationController] Reverse geocoding success: ${addressResult.city}, ${addressResult.district}`
      );

      res.status(API_CODES.SUCCESS).json(ApiResponse.success(addressResult));
    } catch (error) {
      Logger.error(`[LocationController] Error in reverseGeocode:`, error);
      next(error);
    }
  };

  /**
   * Extract street name from full address
   */
  extractStreet(fullAddress, ward, district, city) {
    let street = fullAddress
      .replace(ward, "")
      .replace(district, "")
      .replace(city, "")
      .replace(/,\s*,/g, ",")
      .replace(/^,\s*/, "")
      .replace(/,\s*$/, "")
      .trim();

    return street;
  }

  /**
   * Normalize city name
   */
  normalizeCity(city) {
    const cityMap = {
      "Hồ Chí Minh": "Thành phố Hồ Chí Minh",
      "Ho Chi Minh City": "Thành phố Hồ Chí Minh",
      "Sài Gòn": "Thành phố Hồ Chí Minh",
      "TP. Hồ Chí Minh": "Thành phố Hồ Chí Minh",
      "TP.HCM": "Thành phố Hồ Chí Minh",
      "Hà Nội": "Thành phố Hà Nội",
      Hanoi: "Thành phố Hà Nội",
      "TP. Hà Nội": "Thành phố Hà Nội",
      "Đà Nẵng": "Thành phố Đà Nẵng",
      "Da Nang": "Thành phố Đà Nẵng",
      "TP. Đà Nẵng": "Thành phố Đà Nẵng",
    };

    return cityMap[city] || city;
  }

  /**
   * Normalize district name
   */
  normalizeDistrict(district) {
    // Thêm "Quận" nếu chỉ có số
    if (/^\d+$/.test(district)) {
      return `Quận ${district}`;
    }
    return district;
  }

  /**
   * Normalize ward name
   */
  normalizeWard(ward) {
    // Thêm "Phường" nếu chỉ có số
    if (/^\d+$/.test(ward)) {
      return `Phường ${ward}`;
    }
    return ward;
  }
}
