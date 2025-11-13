// frontend/src/services/authService.ts

import api from "@/shared/lib/axios";

export const authService = {
  signUp: async (email: string, password: string, displayName: string) => {
    // ✅ SỬA: Bỏ username vì backend không cần field này
    const res = await api.post(
      "/auth/signup",
      { password, email, displayName },
      { withCredentials: true }
    );
    return res.data;
  },

  signUpPrinter: async (
    displayName: string,
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
    const res = await api.post(
      "/auth/signin",
      { email, password },
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
    return res.data.data.user;
  },

  refresh: async () => {
    const res = await api.post("/auth/refresh", {}, { withCredentials: true });
    return res.data;
  },
};
