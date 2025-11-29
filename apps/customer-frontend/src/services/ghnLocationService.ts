// apps/customer-frontend/src/services/ghnLocationService.ts
import axios from "axios";

// Constants
const GHN_API_URL =
  "https://online-gateway.ghn.vn/shiip/public-api/master-data";
const GHN_TOKEN = import.meta.env.VITE_GHN_TOKEN; // Lưu trong .env

// Interfaces chuẩn của GHN
export interface GHNProvince {
  ProvinceID: number;
  ProvinceName: string;
  Code: string;
}

export interface GHNDistrict {
  DistrictID: number;
  ProvinceID: number;
  DistrictName: string;
  Code: string;
  Type: number;
  SupportType: number;
  // Các trường "bơm" thêm (Optional)
  isNew?: boolean;
  oldName?: string;
  aliases?: string[];
}

export interface GHNWard {
  WardCode: string;
  DistrictID: number;
  WardName: string;
}

// Cấu hình Axios instance
const ghnClient = axios.create({
  baseURL: GHN_API_URL,
  headers: {
    "Content-Type": "application/json",
    token: GHN_TOKEN,
  },
});

// --- SMART DATA DICTIONARY ---
// Đây là nơi "bộ não" ánh xạ nằm. Bạn có thể mở rộng danh sách này tùy ý.
const SMART_MAPPING: Record<string, Partial<GHNDistrict>> = {
  // Key là tên Quận/Huyện mới chuẩn của GHN (viết thường để match)
  "thành phố thủ đức": {
    isNew: true,
    oldName: "Quận 2, Quận 9, Thủ Đức cũ",
    aliases: ["quận 2", "q2", "quận 9", "q9", "thủ đức", "thu duc"],
  },
  // Ví dụ khác: Nếu có sáp nhập huyện Hoành Bồ vào Hạ Long (Quảng Ninh)
  "thành phố hạ long": {
    aliases: ["huyện hoành bồ", "hoanh bo"],
  },
};

export const ghnLocationService = {
  getProvinces: async (): Promise<GHNProvince[]> => {
    try {
      const res = await ghnClient.get("/province");
      return res.data.data || [];
    } catch (error) {
      console.error("Lỗi lấy Tỉnh/Thành GHN:", error);
      return [];
    }
  },

  getDistricts: async (provinceId: number): Promise<GHNDistrict[]> => {
    try {
      const res = await ghnClient.get("/district", {
        params: { province_id: provinceId },
      });
      const rawDistricts: GHNDistrict[] = res.data.data || [];

      // --- AUGMENTATION STEP (Làm giàu dữ liệu) ---
      return rawDistricts.map((d) => {
        const lowerName = d.DistrictName.toLowerCase();
        const smartData = SMART_MAPPING[lowerName];
        if (smartData) {
          return { ...d, ...smartData }; // Merge data thông minh vào data gốc
        }
        return d;
      });
    } catch (error) {
      console.error("Lỗi lấy Quận/Huyện GHN:", error);
      return [];
    }
  },

  getWards: async (districtId: number): Promise<GHNWard[]> => {
    try {
      const res = await ghnClient.get("/ward", {
        params: { district_id: districtId },
      });
      return res.data.data || [];
    } catch (error) {
      console.error("Lỗi lấy Phường/Xã GHN:", error);
      return [];
    }
  },
};
