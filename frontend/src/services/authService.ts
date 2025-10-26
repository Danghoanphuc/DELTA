import api from "@/lib/axios";

export const authService = {
  signUp: async (email: string, password: string, displayName: string) => {
    const res = await api.post(
      "/auth/signup",
      { username: email, password, email, displayName }, // Gửi username = email
      { withCredentials: true }
    );
    return res.data;
  },
  // --- (HÀM MỚI) ---
  signUpPrinter: async (
    displayName: string, // Tên xưởng in
    email: string,
    password: string
  ) => {
    const res = await api.post(
      "/auth/signup-printer",
      { displayName, email, password },
      { withCredentials: true }
    );
    return res.data;
  },
  signIn: async (email: string, password: string) => {
    // Tham số phải là email
    const res = await api.post(
      "/auth/signin",
      { email, password }, // <-- Dữ liệu gửi đi PHẢI LÀ { email, password }
      { withCredentials: true }
    );
    return res.data;
  },

  signOut: async () => {
    const res = await api.post("/auth/signout", {}, { withCredentials: true });
    return res.data;
  },

  fetchMe: async () => {
    const res = await api.get("/users/me", { withCredentials: true });
    return res.data?.user;
  },

  refresh: async () => {
    const res = await api.post("/auth/refresh", {}, { withCredentials: true });
    return res.data; // backend nên trả { accessToken }
  },
};
