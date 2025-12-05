// apps/customer-frontend/src/config/novu.config.ts
// Centralized Novu configuration với auto environment detection

interface NovuConfig {
  applicationIdentifier: string;
  backendUrl?: string;
  socketUrl?: string;
}

/**
 * Lấy Novu config dựa trên môi trường hiện tại
 * Priority: ENV variables > Auto-detect based on MODE
 */
export function getNovuConfig(): NovuConfig {
  const applicationIdentifier =
    import.meta.env.VITE_NOVU_APPLICATION_IDENTIFIER ||
    import.meta.env.VITE_NOVU_APP_ID;

  // 1. Nếu có explicit config trong .env -> Dùng luôn
  const envBackendUrl = import.meta.env.VITE_NOVU_BACKEND_URL;
  const envSocketUrl = import.meta.env.VITE_NOVU_SOCKET_URL;

  if (envBackendUrl || envSocketUrl) {
    return {
      applicationIdentifier,
      backendUrl: envBackendUrl,
      socketUrl: envSocketUrl,
    };
  }

  // 2. Auto-detect dựa trên MODE
  const isDevelopment =
    import.meta.env.MODE === "development" || import.meta.env.DEV;

  if (isDevelopment) {
    // Development: Dùng local Novu hoặc dev instance
    return {
      applicationIdentifier,
      backendUrl: "https://api.novu.co", // Hoặc local nếu bạn self-host
      socketUrl: "https://ws.novu.co",
    };
  }

  // 3. Production: Dùng Novu cloud mặc định (không cần specify)
  return {
    applicationIdentifier,
    // Không set backendUrl/socketUrl -> Novu tự dùng production URLs
  };
}

/**
 * Kiểm tra xem Novu có được config đầy đủ không
 */
export function isNovuConfigured(): boolean {
  const config = getNovuConfig();
  return !!config.applicationIdentifier;
}
