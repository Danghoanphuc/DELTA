// src/services/printerService.ts

import api from "@/shared/lib/axios";
import { PrinterProfile } from "@/types/printerProfile";

export const printerService = {
  // ✅ FIX: Correctly access the nested profile object from API response
  getMyProfile: async (): Promise<PrinterProfile> => {
    try {
      const res = await api.get("/printers/my-profile", { timeout: 5000 });

      // ✅ FIX: Check res.data.data.profile (API structure) first, then res.data.profile (if un-wrapped)
      const profile = res.data?.data?.profile || res.data?.profile;

      if (!profile) {
        // Now checking for the actual profile object
        throw new Error(
          "Invalid profile response from server: missing profile data"
        );
      }

      return profile;
    } catch (error: any) {
      // ✅ FIX: Xử lý lỗi connection refused
      if (error.code === "ECONNREFUSED" || error.message?.includes("ERR_CONNECTION_REFUSED")) {
        console.error("❌ Error fetching printer profile: Backend không khả dụng");
        throw new Error("Không thể kết nối đến server. Vui lòng thử lại sau.");
      }
      console.error("❌ Error fetching printer profile:", error);
      throw error; // Re-throw để caller xử lý
    }
  },

  // ✅ FIX: Update profile method (also needs correct extraction)
  updateMyProfile: async (profileData: Partial<PrinterProfile>) => {
    try {
      const res = await api.put("/printers/profile", profileData);

      const profile = res.data?.data?.profile || res.data?.profile;

      if (!profile) {
        throw new Error("Invalid update response: missing profile data");
      }

      return profile;
    } catch (error) {
      console.error("❌ Error updating printer profile:", error);
      throw error;
    }
  },

  // ✅ validateProfileExistence (Relies on HTTP status)
  validateProfileExistence: async (): Promise<boolean> => {
    try {
      // Giả định endpoint nhẹ nhàng chỉ trả về status 200 nếu tồn tại
      // Anh cần đảm bảo backend có route GET /api/printers/profile-exists
      await api.get("/printers/profile-exists", { timeout: 5000 });
      return true;
    } catch (error: any) {
      // ✅ FIX: Xử lý lỗi connection refused hoặc network error
      if (error.code === "ECONNREFUSED" || error.message?.includes("ERR_CONNECTION_REFUSED")) {
        console.warn("⚠️ [printerService] Backend không khả dụng, giả định profile tồn tại");
        // Nếu backend không khả dụng, giả định profile tồn tại để không block user
        return true;
      }
      // Nếu 404 (Không tìm thấy) hoặc bất cứ lỗi nào khác, coi như không tồn tại
      if (error.response?.status === 404) {
        return false;
      }
      // Nếu là lỗi khác (500, network), ta coi như tồn tại để người dùng thử lại
      console.warn("⚠️ [printerService] Lỗi khi kiểm tra profile:", error.message);
      return true;
    }
  },
};
