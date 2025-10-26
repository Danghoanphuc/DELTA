// src/services/printerService.ts (TỆP MỚI)
import api from "@/lib/axios";
import { PrinterProfile } from "@/types/printerProfile";

export const printerService = {
  getMyProfile: async (): Promise<PrinterProfile> => {
    const res = await api.get("/printer/my-profile");
    // API của chúng ta trả về { profile: ... }
    return res.data?.profile;
  },

  // (Sau này bạn có thể thêm hàm updateMyProfile ở đây)
};
