// apps/customer-frontend/src/features/chat/hooks/useNetworkStatus.ts
/**
 * 🔥 NETWORK STATUS HOOK
 * Detect online/offline và auto-flush offline queue
 */

import { useState, useEffect, useCallback } from "react";
import { toast } from "@/shared/utils/toast";
import { offlineQueue } from "../lib";

export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);

  const handleOnline = useCallback(() => {
    console.log("[NetworkStatus] Back online");
    setIsOnline(true);

    // Nếu trước đó offline, hiện toast và flush queue
    if (wasOffline) {
      toast.success("🌐 Đã kết nối lại");
      setWasOffline(false);

      // Auto-flush offline queue sau 1s
      setTimeout(() => {
        const queueSize = offlineQueue.size();
        if (queueSize > 0) {
          console.log(`[NetworkStatus] Auto-flushing ${queueSize} messages`);
          // Trigger flush event
          window.dispatchEvent(new CustomEvent("flush-offline-queue"));
        }
      }, 1000);
    }
  }, [wasOffline]);

  const handleOffline = useCallback(() => {
    console.log("[NetworkStatus] Gone offline");
    setIsOnline(false);
    setWasOffline(true);
    toast.warning("📡 Mất kết nối - Tin nhắn sẽ được lưu");
  }, []);

  useEffect(() => {
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [handleOnline, handleOffline]);

  return {
    isOnline,
    wasOffline,
  };
};
