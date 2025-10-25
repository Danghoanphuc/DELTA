// src/types/store.ts

import { User } from "./user"; // 👈 *** 1. IMPORT User đầy đủ từ file user.ts ***

// ❌ 2. Xóa interface User đơn giản (nếu có) ở đây

export interface AuthState {
  accessToken: string | null;
  user: User | null; // 👈 3. Dùng User đầy đủ
  loading: boolean;

  // --- methods ---
  setAccessToken: (token: string | null) => void;
  setUser: (user: User) => void; // 👈 *** 4. THÊM setUser ***
  clearState: () => void;

  // 👇 *** 5. Sửa lỗi cú pháp ...args ***
  signUp: (
    username: string,
    password: string,
    email: string,
    firstName: string,
    lastName: string
  ) => Promise<void>;
  signIn: (username: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;

  fetchMe: (silent?: boolean) => Promise<void>;
  refresh: () => Promise<void>;
}
