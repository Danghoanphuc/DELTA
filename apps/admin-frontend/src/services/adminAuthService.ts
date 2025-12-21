import api from "@/lib/axios";
import { useAdminAuthStore } from "@/store/useAdminAuthStore";
import { type IAdmin } from "@printz/types";

export const signIn = async (
  email: string,
  password: string
): Promise<IAdmin> => {
  const { setToken, setAdmin, setStatus } = useAdminAuthStore.getState();
  setStatus("loading");
  try {
    const res = await api.post("/admin/auth/signin", { email, password });
    const { accessToken, admin } = res.data.data;
    setToken(accessToken);
    setAdmin(admin);
    setStatus("success");
    return admin;
  } catch (error: any) {
    setStatus("error");
    setToken(null);
    setAdmin(null);
    const message =
      error.response?.data?.message || "Lỗi đăng nhập không xác định";
    throw new Error(message);
  }
};

export const fetchMe = async (): Promise<IAdmin> => {
  const { setAdmin, setStatus } = useAdminAuthStore.getState();
  setStatus("loading");
  try {
    const res = await api.get("/admin/auth/me");
    const admin: IAdmin = res.data.data.admin;
    setAdmin(admin);
    setStatus("success");
    return admin;
  } catch (error: any) {
    setStatus("error");
    const message =
      error.response?.data?.message || "Phiên đăng nhập không hợp lệ";
    throw new Error(message);
  }
};

export const signOut = () => {
  useAdminAuthStore.getState().logout();
};
