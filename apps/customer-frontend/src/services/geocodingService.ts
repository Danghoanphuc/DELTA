// apps/customer-frontend/src/services/geocodingService.ts
/**
 * Geocoding Service - Reverse Geocoding using Backend Proxy
 * Avoids CORS and API key issues by using backend as proxy
 */

import api from "@/shared/lib/axios";

export interface GeocodingResult {
  city: string;
  district: string;
  ward: string;
  street?: string;
  fullAddress: string;
  lat: number;
  lng: number;
}

/**
 * Reverse geocoding: Chuyển tọa độ (lat, lng) thành địa chỉ
 * Sử dụng Backend Proxy -> Goong.io Geocoding API
 */
export const reverseGeocode = async (
  lat: number,
  lng: number
): Promise<GeocodingResult> => {
  try {
    // ✅ Call backend proxy instead of Goong directly (avoids CORS + API key issues)
    const response = await api.post("/location/reverse-geocode", {
      lat,
      lng,
    });

    const data = response.data?.data;

    if (!data) {
      throw new Error("Không nhận được dữ liệu từ server");
    }

    return {
      city: data.city,
      district: data.district,
      ward: data.ward,
      street: data.street || "",
      fullAddress: data.fullAddress,
      lat: data.lat,
      lng: data.lng,
    };
  } catch (error: any) {
    console.error("Geocoding error:", error);
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Không thể xác định địa chỉ từ tọa độ";
    throw new Error(errorMessage);
  }
};
