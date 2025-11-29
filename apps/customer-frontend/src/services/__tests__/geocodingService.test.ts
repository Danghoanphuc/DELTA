// apps/customer-frontend/src/services/__tests__/geocodingService.test.ts
import { reverseGeocode } from "../geocodingService";

describe("geocodingService", () => {
  describe("reverseGeocode", () => {
    it("should return address for valid coordinates (Ho Chi Minh City)", async () => {
      // Coordinates for District 1, Ho Chi Minh City
      const lat = 10.7769;
      const lng = 106.7009;

      const result = await reverseGeocode(lat, lng);

      expect(result).toHaveProperty("city");
      expect(result).toHaveProperty("district");
      expect(result).toHaveProperty("ward");
      expect(result).toHaveProperty("fullAddress");
      expect(result).toHaveProperty("lat", lat);
      expect(result).toHaveProperty("lng", lng);

      // Should normalize city name
      expect(result.city).toContain("Hồ Chí Minh");
    });

    it("should return address for valid coordinates (Hanoi)", async () => {
      // Coordinates for Hoan Kiem, Hanoi
      const lat = 21.0285;
      const lng = 105.8542;

      const result = await reverseGeocode(lat, lng);

      expect(result).toHaveProperty("city");
      expect(result.city).toContain("Hà Nội");
    });

    it("should throw error for invalid coordinates", async () => {
      const lat = 999; // Invalid latitude
      const lng = 999; // Invalid longitude

      await expect(reverseGeocode(lat, lng)).rejects.toThrow();
    });

    it("should handle network errors gracefully", async () => {
      // Mock fetch to simulate network error
      global.fetch = jest.fn(() => Promise.reject(new Error("Network error")));

      const lat = 10.7769;
      const lng = 106.7009;

      await expect(reverseGeocode(lat, lng)).rejects.toThrow(
        "Không thể xác định địa chỉ từ tọa độ"
      );
    });
  });
});
