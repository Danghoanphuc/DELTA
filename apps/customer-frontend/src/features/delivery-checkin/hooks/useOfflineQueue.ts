// apps/customer-frontend/src/features/delivery-checkin/hooks/useOfflineQueue.ts
/**
 * Custom hook for offline check-in queue management
 * Handles queuing, syncing, and status tracking
 * Requirements: 8.4, 14.1 - Offline queue and auto-sync
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "@/shared/utils/toast";
import { deliveryCheckinService } from "../services/delivery-checkin.service";
import { useOnlineStatus } from "./useOnlineStatus";
import {
  getOfflineCheckins,
  getPendingCheckins,
  addOfflineCheckin,
  updateOfflineCheckinStatus,
  removeOfflineCheckin,
  getOfflineQueueStats,
  dataUrlToFile,
  retryOfflineCheckin,
} from "../utils/offline-storage";
import type {
  OfflineCheckin,
  OfflineQueueStatus,
  CreateCheckinData,
} from "../types";

interface UseOfflineQueueReturn {
  // Queue status
  status: OfflineQueueStatus;
  checkins: OfflineCheckin[];

  // Actions
  queueCheckin: (
    data: CreateCheckinData,
    photos: File[],
    orderNumber?: string
  ) => Promise<OfflineCheckin>;
  syncQueue: () => Promise<void>;
  retryCheckin: (id: string) => void;
  removeCheckin: (id: string) => void;

  // Sync state
  isSyncing: boolean;
  syncProgress: { current: number; total: number };
}

export function useOfflineQueue(): UseOfflineQueueReturn {
  const { isOnline, wasOffline } = useOnlineStatus();
  const [checkins, setCheckins] = useState<OfflineCheckin[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState({ current: 0, total: 0 });
  const [lastSyncAt, setLastSyncAt] = useState<number | null>(null);
  const syncInProgressRef = useRef(false);

  // Load checkins from storage
  const loadCheckins = useCallback(() => {
    const stored = getOfflineCheckins();
    setCheckins(stored);
  }, []);

  // Calculate queue status
  const status: OfflineQueueStatus = {
    isOnline,
    pendingCount: checkins.filter((c) => c.status === "pending").length,
    syncingCount: checkins.filter((c) => c.status === "syncing").length,
    failedCount: checkins.filter((c) => c.status === "failed").length,
    isSyncing,
    lastSyncAt,
  };

  // Queue a new check-in for offline storage
  const queueCheckin = useCallback(
    async (
      data: CreateCheckinData,
      photos: File[],
      orderNumber?: string
    ): Promise<OfflineCheckin> => {
      try {
        const offlineCheckin = await addOfflineCheckin(
          data,
          photos,
          orderNumber
        );
        loadCheckins();
        toast.info(
          "Check-in đã được lưu offline. Sẽ tự động đồng bộ khi có mạng."
        );
        return offlineCheckin;
      } catch (error: any) {
        toast.error(error.message || "Không thể lưu check-in offline");
        throw error;
      }
    },
    [loadCheckins]
  );

  // Sync a single check-in
  const syncSingleCheckin = useCallback(
    async (checkin: OfflineCheckin): Promise<boolean> => {
      try {
        // Update status to syncing
        updateOfflineCheckinStatus(checkin.id, "syncing");
        loadCheckins();

        // Convert stored photos back to Files
        const photoFiles = checkin.photos.map((photo) =>
          dataUrlToFile(photo.dataUrl, photo.filename, photo.mimeType)
        );

        // Submit to server
        await deliveryCheckinService.createCheckin(checkin.data, photoFiles);

        // Remove from queue on success
        removeOfflineCheckin(checkin.id);
        loadCheckins();

        return true;
      } catch (error: any) {
        console.error(`Failed to sync check-in ${checkin.id}:`, error);
        updateOfflineCheckinStatus(
          checkin.id,
          "failed",
          error.response?.data?.message || error.message
        );
        loadCheckins();
        return false;
      }
    },
    [loadCheckins]
  );

  // Sync all pending check-ins
  const syncQueue = useCallback(async (): Promise<void> => {
    if (syncInProgressRef.current || !isOnline) {
      return;
    }

    const pending = getPendingCheckins();
    if (pending.length === 0) {
      return;
    }

    syncInProgressRef.current = true;
    setIsSyncing(true);
    setSyncProgress({ current: 0, total: pending.length });

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < pending.length; i++) {
      const checkin = pending[i];
      setSyncProgress({ current: i + 1, total: pending.length });

      const success = await syncSingleCheckin(checkin);
      if (success) {
        successCount++;
      } else {
        failCount++;
      }

      // Small delay between syncs to avoid overwhelming the server
      if (i < pending.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    setIsSyncing(false);
    setLastSyncAt(Date.now());
    syncInProgressRef.current = false;

    // Show summary toast
    if (successCount > 0 && failCount === 0) {
      toast.success(`Đã đồng bộ ${successCount} check-in thành công!`);
    } else if (successCount > 0 && failCount > 0) {
      toast.warning(
        `Đã đồng bộ ${successCount} check-in. ${failCount} check-in thất bại.`
      );
    } else if (failCount > 0) {
      toast.error(`Không thể đồng bộ ${failCount} check-in. Vui lòng thử lại.`);
    }
  }, [isOnline, syncSingleCheckin]);

  // Retry a failed check-in
  const retryCheckinHandler = useCallback(
    (id: string) => {
      retryOfflineCheckin(id);
      loadCheckins();

      // If online, try to sync immediately
      if (isOnline) {
        syncQueue();
      }
    },
    [isOnline, loadCheckins, syncQueue]
  );

  // Remove a check-in from queue
  const removeCheckinHandler = useCallback(
    (id: string) => {
      removeOfflineCheckin(id);
      loadCheckins();
      toast.info("Đã xóa check-in khỏi hàng đợi");
    },
    [loadCheckins]
  );

  // Load checkins on mount
  useEffect(() => {
    loadCheckins();
  }, [loadCheckins]);

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && wasOffline) {
      // Delay sync slightly to ensure connection is stable
      const timer = setTimeout(() => {
        syncQueue();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline, syncQueue]);

  // Periodic sync check (every 30 seconds when online)
  useEffect(() => {
    if (!isOnline) return;

    const interval = setInterval(() => {
      const pending = getPendingCheckins();
      if (pending.length > 0 && !syncInProgressRef.current) {
        syncQueue();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isOnline, syncQueue]);

  return {
    status,
    checkins,
    queueCheckin,
    syncQueue,
    retryCheckin: retryCheckinHandler,
    removeCheckin: removeCheckinHandler,
    isSyncing,
    syncProgress,
  };
}
