import api from "@/lib/axios";

export const authService = {
  signUp: async (
    username: string,
    password: string,
    email: string,
    firstName: string,
    lastName: string
  ) => {
    const displayName = `${firstName} ${lastName}`.trim();
    const res = await api.post(
      "/auth/signup",
      { username, password, email, displayName },
      { withCredentials: true }
    );
    return res.data;
  },

  signIn: async (username: string, password: string) => {
    const res = await api.post(
      "/auth/signin",
      { username, password },
      { withCredentials: true }
    );
    // Backend nên trả: { accessToken, refreshToken (cookie) }
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
