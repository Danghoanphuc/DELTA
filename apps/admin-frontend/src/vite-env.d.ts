/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ADMIN_API_URL: string;
  // Thêm các biến môi trường khác nếu có
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

