// apps/customer-frontend/src/services/__tests__/geocodingService.test.ts

// Mock the axios module before importing the service
jest.mock("@/shared/lib/axios", () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
    get: jest.fn(),
  },
}));

import { reverseGeocode } from "../geocodingService";
import api from "@/shared/lib/axios";

const mockApi = api as jest.Mocked<typeof api>;

describe("geocodingService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("reverseGeocode", () => {
    it("should return address for valid coordinates (Ho Chi Minh City)", async () => {
      // Coordinates for District 1, Ho Chi Minh City
      const lat = 10.7769;
      const lng = 106.7009;

      // Mock the API response
      (mockApi.post as jest.Mock).mockResolvedValueOnce({
        data: {
          data: {
            city: "Thành phố Hồ Chí Minh",
            district: "Quận 1",
            ward: "Phường Bến Nghé",
            street: "Đường Nguyễn Huệ",
            fullAddress:
              "Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, Thành phố Hồ Chí Minh",
            lat,
            lng,
          },
        },
      });

      const result = await reverseGeocode(lat, lng);

      expect(result).toHaveProperty("city");
      expect(result).toHaveProperty("district");
      expect(result).toHaveProperty("ward");
      expect(result).toHaveProperty("fullAddress");
      expect(result).toHaveProperty("lat", lat);
      expect(result).toHaveProperty("lng", lng);

      // Should contain city name
      expect(result.city).toContain("Hồ Chí Minh");
    });

    it("should return address for valid coordinates (Hanoi)", async () => {
      // Coordinates for Hoan Kiem, Hanoi
      const lat = 21.0285;
      const lng = 105.8542;

      // Mock the API response
      (mockApi.post as jest.Mock).mockResolvedValueOnce({
        data: {
          data: {
            city: "Thành phố Hà Nội",
            district: "Quận Hoàn Kiếm",
            ward: "Phường Hàng Trống",
            street: "",
            fullAddress: "Phường Hàng Trống, Quận Hoàn Kiếm, Thành phố Hà Nội",
            lat,
            lng,
          },
        },
      });

      const result = await reverseGeocode(lat, lng);

      expect(result).toHaveProperty("city");
      expect(result.city).toContain("Hà Nội");
    });

    it("should throw error when API returns no data", async () => {
      const lat = 999; // Invalid latitude
      const lng = 999; // Invalid longitude

      // Mock the API to return empty data
      (mockApi.post as jest.Mock).mockResolvedValueOnce({
        data: {
          data: null,
        },
      });

      await expect(reverseGeocode(lat, lng)).rejects.toThrow(
        "Không nhận được dữ liệu từ server"
      );
    });

    it("should handle network errors gracefully", async () => {
      const lat = 10.7769;
      const lng = 106.7009;

      // Mock the API to throw an error
      (mockApi.post as jest.Mock).mockRejectedValueOnce(
        new Error("Network error")
      );

      await expect(reverseGeocode(lat, lng)).rejects.toThrow("Network error");
    });

    it("should handle API error responses", async () => {
      const lat = 10.7769;
      const lng = 106.7009;

      // Mock the API to return an error response
      (mockApi.post as jest.Mock).mockRejectedValueOnce({
        response: {
          data: {
            message: "Không thể xác định địa chỉ từ tọa độ",
          },
        },
      });

      await expect(reverseGeocode(lat, lng)).rejects.toThrow(
        "Không thể xác định địa chỉ từ tọa độ"
      );
    });
  });
});
