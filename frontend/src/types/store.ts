// src/types/store.ts

export interface User {
  _id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  username?: string;
}

export interface AuthState {
  accessToken: string | null;
  user: User | null;
  loading: boolean;

  // --- methods ---
  setAccessToken: (token: string | null) => void;
  clearState: () => void;

  signUp: (...args: any[]) => Promise<void>;
  signIn: (username: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;

  fetchMe: (silent?: boolean) => Promise<void>;
  refresh: () => Promise<void>;
}
