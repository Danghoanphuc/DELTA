// src/types/store.ts (CẬP NHẬT)

import { User } from "./user";
import { PrinterProfile } from "./printerProfile"; // <-- Import (đã có từ GĐ1)

export interface AuthState {
  accessToken: string | null;
  user: User | null;
  printerProfile: PrinterProfile | null;
  loading: boolean;

  // --- methods ---
  setAccessToken: (token: string | null) => void;
  setUser: (user: User) => void;
  setPrinterProfile: (profile: PrinterProfile | null) => void;
  clearState: () => void;

  // 👇 *** SỬA LỖI CHÍNH (ĐỔI 5 THAM SỐ CŨ THÀNH 3 MỚI) *** 👇
  signUp: (
    email: string,
    password: string,
    displayName: string
  ) => Promise<void>;
  // --- (HẾT SỬA LỖI) ---

  signIn: (email: string, password: string) => Promise<void>; // <-- Sửa 'username' thành 'email'
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;

  fetchMe: (silent?: boolean) => Promise<void>;
  refresh: () => Promise<void>;
}
