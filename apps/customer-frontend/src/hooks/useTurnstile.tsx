// apps/customer-frontend/src/hooks/useTurnstile.tsx
// ✅ Custom Hook để tích hợp Cloudflare Turnstile (Captcha) chống spam

import React, { useEffect, useRef, useState } from "react";

interface UseTurnstileReturn {
  TurnstileWidget: () => React.JSX.Element | null;
  token: string | null;
  resetTurnstile: () => void;
  isLoading: boolean;
}

/**
 * Hook để tích hợp Cloudflare Turnstile
 *
 * @returns {UseTurnstileReturn} Object chứa Widget component, token và reset function
 *
 * @example
 * const { TurnstileWidget, token, resetTurnstile } = useTurnstile();
 *
 * // Render widget
 * <TurnstileWidget />
 *
 * // Kiểm tra token trước khi submit
 * if (!token) {
 *   toast.error('Vui lòng xác thực bạn không phải robot');
 *   return;
 * }
 */
export function useTurnstile(): UseTurnstileReturn {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const widgetRef = useRef<string | null>(null); // ID của widget để reset
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Lấy sitekey từ biến môi trường - Force convert to string
  const rawSitekey = import.meta.env.VITE_CLOUDFLARE_SITE_KEY;
  const sitekey =
    typeof rawSitekey === "string" ? rawSitekey : String(rawSitekey || "");

  // Debug log
  console.log("[Turnstile] Raw sitekey:", rawSitekey);
  console.log("[Turnstile] Sitekey type:", typeof sitekey);
  console.log("[Turnstile] Sitekey value:", sitekey);

  // BƯỚC 1: Inject Turnstile script vào <head> nếu chưa có
  useEffect(() => {
    // Kiểm tra xem script đã được load chưa
    const existingScript = document.querySelector(
      'script[src*="challenges.cloudflare.com/turnstile"]'
    );

    if (existingScript) {
      setScriptLoaded(true);
      setIsLoading(false);
      return;
    }

    // Tạo script tag mới - Thêm ?render=explicit để tránh auto-render
    const script = document.createElement("script");
    script.src =
      "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.defer = true;

    script.onload = () => {
      console.log("[Turnstile] Script loaded successfully");
      setScriptLoaded(true);
      setIsLoading(false);
    };

    script.onerror = () => {
      console.error("[Turnstile] Failed to load script");
      setIsLoading(false);
    };

    document.head.appendChild(script);

    // Cleanup: Xóa script khi component unmount (tùy chọn)
    return () => {
      // Không xóa script vì có thể cần dùng lại ở component khác
    };
  }, []);

  // BƯỚC 2: Render widget khi script đã load
  useEffect(() => {
    if (!scriptLoaded || !containerRef.current || !sitekey) {
      console.log("[Turnstile] Skipping render:", {
        scriptLoaded,
        hasContainer: !!containerRef.current,
        sitekey,
      });
      return;
    }

    // Validate sitekey is string
    if (typeof sitekey !== "string") {
      console.error(
        "[Turnstile] Invalid sitekey type:",
        typeof sitekey,
        sitekey
      );
      return;
    }

    // Đợi window.turnstile available
    const checkTurnstile = setInterval(() => {
      if (window.turnstile) {
        clearInterval(checkTurnstile);

        try {
          console.log("[Turnstile] Rendering widget with sitekey:", sitekey);

          // Render widget
          widgetRef.current = window.turnstile.render(containerRef.current, {
            sitekey: String(sitekey), // Ensure it's a string
            callback: (verifiedToken: string) => {
              console.log("[Turnstile] Verification successful");
              setToken(verifiedToken);
            },
            "error-callback": () => {
              console.error("[Turnstile] Verification failed");
              setToken(null);
            },
            "expired-callback": () => {
              console.warn("[Turnstile] Token expired, resetting...");
              setToken(null);
              // Tự động reset khi token hết hạn
              if (widgetRef.current && window.turnstile) {
                window.turnstile.reset(widgetRef.current);
              }
            },
            theme: "light",
            size: "normal",
          });
        } catch (error) {
          console.error("[Turnstile] Render error:", error);
        }
      }
    }, 100);

    // Cleanup sau 5 giây nếu không load được
    const timeout = setTimeout(() => {
      clearInterval(checkTurnstile);
    }, 5000);

    return () => {
      clearInterval(checkTurnstile);
      clearTimeout(timeout);
    };
  }, [scriptLoaded, sitekey]);

  // BƯỚC 3: Hàm reset widget
  const resetTurnstile = () => {
    if (widgetRef.current && window.turnstile) {
      try {
        window.turnstile.reset(widgetRef.current);
        setToken(null);
        console.log("[Turnstile] Widget reset");
      } catch (error) {
        console.error("[Turnstile] Reset error:", error);
      }
    }
  };

  // BƯỚC 4: Component Widget để render
  const TurnstileWidget = () => {
    if (!sitekey) {
      console.warn("[Turnstile] Missing VITE_CLOUDFLARE_SITE_KEY in .env");
      return null;
    }

    return (
      <div className="flex justify-center my-4">
        <div ref={containerRef} className="cf-turnstile" />
      </div>
    );
  };

  return {
    TurnstileWidget,
    token,
    resetTurnstile,
    isLoading,
  };
}

// Extend Window interface để TypeScript nhận biết window.turnstile
declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement | null,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "error-callback": () => void;
          "expired-callback": () => void;
          theme?: "light" | "dark" | "auto";
          size?: "normal" | "compact";
        }
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}
