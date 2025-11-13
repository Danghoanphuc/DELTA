// frontend/src/types/store.ts

import { User } from "./user";
import { PrinterProfile } from "./printerProfile";

export interface AuthState {
  accessToken: string | null;
  user: User | null;
  printerProfile: PrinterProfile | null;
  loading: boolean;

  // --- Setters ---
  setAccessToken: (token: string | null) => void;
  setUser: (user: User) => void;
  setPrinterProfile: (profile: PrinterProfile | null) => void;
  clearState: () => void;

  // --- Actions ---
  signUp: (
    email: string,
    password: string,
    displayName: string
  ) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  fetchMe: (silent?: boolean) => Promise<void>;
  refresh: () => Promise<void>;
}
