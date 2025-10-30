// ============================================
// NEW FILE: frontend/src/services/printerService.ts
// ============================================

import api from "@/shared/lib/axios";
import { PrinterProfile } from "@/types/printerProfile";

export const printerService = {
  // ✅ FIXED: Added error handling and null check
  getMyProfile: async (): Promise<PrinterProfile> => {
    try {
      const res = await api.get("/printer/my-profile");

      // ✅ CHECK: Response structure
      if (!res.data?.profile) {
        throw new Error(
          "Invalid profile response from server: missing profile data"
        );
      }

      return res.data.profile;
    } catch (error) {
      console.error("❌ Error fetching printer profile:", error);
      throw error; // Re-throw để caller xử lý
    }
  },

  // ✅ CÓ THỂ THÊM: Update profile method
  updateMyProfile: async (profileData: Partial<PrinterProfile>) => {
    try {
      const res = await api.put("/printer/profile", profileData);

      if (!res.data?.profile) {
        throw new Error("Invalid update response");
      }

      return res.data.profile;
    } catch (error) {
      console.error("❌ Error updating printer profile:", error);
      throw error;
    }
  },
};
