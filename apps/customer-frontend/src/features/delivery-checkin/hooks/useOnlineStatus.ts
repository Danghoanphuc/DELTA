// apps/customer-frontend/src/features/delivery-checkin/hooks/useOnlineStatus.ts
/**
 * Custom hook for detecting online/offline status
 * Requirements: 8.4, 14.1 - Offline detection
 */

import { useState, useEffect, useCallback } from "react";

interface UseOnlineStatusReturn {
  isOnline: boolean;
  wasOffline: boolean;
  lastOnlineAt: number | null;
  checkConnection: () => Promise<boolean>;
}

export function useOnlineStatus(): UseOnlineStatusReturn {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const [wasOffline, setWasOffline] = useState<boolean>(false);
  const [lastOnlineAt, setLastOnlineAt] = useState<number | null>(
    isOnline ? Date.now() : null
  );

  // Handle online event
  const handleOnline = useCallback(() => {
    setIsOnline(true);
    setLastOnlineAt(Date.now());
    // If we were offline, mark it
    if (!isOnline) {
      setWasOffline(true);
    }
  }, [isOnline]);

  // Handle offline event
  const handleOffline = useCallback(() => {
    setIsOnline(false);
  }, []);

  // Check actual connection by making a request
  const checkConnection = useCallback(async (): Promise<boolean> => {
    try {
      // Try to fetch a small resource to verify actual connectivity
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch("/api/health", {
        method: "HEAD",
        cache: "no-store",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const online = response.ok;
      setIsOnline(online);
      if (online) {
        setLastOnlineAt(Date.now());
      }
      return online;
    } catch {
      // If fetch fails, check navigator.onLine as fallback
      const online = navigator.onLine;
      setIsOnline(online);
      return online;
    }
  }, []);

  useEffect(() => {
    // Add event listeners
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Initial check
    setIsOnline(navigator.onLine);
    if (navigator.onLine) {
      setLastOnlineAt(Date.now());
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [handleOnline, handleOffline]);

  // Reset wasOffline flag after some time
  useEffect(() => {
    if (wasOffline && isOnline) {
      const timer = setTimeout(() => {
        setWasOffline(false);
      }, 10000); // Reset after 10 seconds

      return () => clearTimeout(timer);
    }
  }, [wasOffline, isOnline]);

  return {
    isOnline,
    wasOffline,
    lastOnlineAt,
    checkConnection,
  };
}
