// apps/customer-frontend/src/features/delivery-checkin/utils/offline-storage.ts
/**
 * Offline Storage Utility
 * Manages local storage queue for offline check-ins
 * Requirements: 8.4, 14.1 - Offline queue and auto-sync
 */

import type { OfflineCheckin, OfflinePhoto, CreateCheckinData } from "../types";
import {
  OFFLINE_STORAGE_KEY,
  MAX_OFFLINE_CHECKINS,
  MAX_RETRY_COUNT,
} from "../types";

/**
 * Generate unique ID for offline check-in
 */
function generateOfflineId(): string {
  return `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Convert File to base64 data URL for storage
 */
export async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

/**
 * Convert base64 data URL back to File
 */
export function dataUrlToFile(
  dataUrl: string,
  filename: string,
  mimeType: string
): File {
  const arr = dataUrl.split(",");
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], filename, { type: mimeType });
}

/**
 * Get all offline check-ins from storage
 */
export function getOfflineCheckins(): OfflineCheckin[] {
  try {
    const stored = localStorage.getItem(OFFLINE_STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as OfflineCheckin[];
  } catch (error) {
    console.error("Failed to read offline check-ins:", error);
    return [];
  }
}

/**
 * Save offline check-ins to storage
 */
export function saveOfflineCheckins(checkins: OfflineCheckin[]): void {
  try {
    localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(checkins));
  } catch (error) {
    console.error("Failed to save offline check-ins:", error);
    // If storage is full, try to remove oldest failed items
    if (error instanceof DOMException && error.name === "QuotaExceededError") {
      const filtered = checkins
        .filter((c) => c.status !== "failed" || c.retryCount < MAX_RETRY_COUNT)
        .slice(-MAX_OFFLINE_CHECKINS);
      localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(filtered));
    }
  }
}

/**
 * Add a new check-in to offline queue
 */
export async function addOfflineCheckin(
  data: CreateCheckinData,
  photos: File[],
  orderNumber?: string
): Promise<OfflineCheckin> {
  const checkins = getOfflineCheckins();

  // Check queue limit
  if (checkins.length >= MAX_OFFLINE_CHECKINS) {
    // Remove oldest completed or failed items
    const pendingCheckins = checkins.filter(
      (c) => c.status === "pending" || c.status === "syncing"
    );
    if (pendingCheckins.length >= MAX_OFFLINE_CHECKINS) {
      throw new Error(
        `Hàng đợi offline đã đầy (${MAX_OFFLINE_CHECKINS} check-in). Vui lòng kết nối mạng để đồng bộ.`
      );
    }
  }

  // Convert photos to data URLs
  const offlinePhotos: OfflinePhoto[] = await Promise.all(
    photos.map(async (file) => ({
      id: `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      dataUrl: await fileToDataUrl(file),
      filename: file.name,
      mimeType: file.type,
      size: file.size,
    }))
  );

  const offlineCheckin: OfflineCheckin = {
    id: generateOfflineId(),
    data,
    photos: offlinePhotos,
    createdAt: Date.now(),
    status: "pending",
    retryCount: 0,
    orderNumber,
  };

  checkins.push(offlineCheckin);
  saveOfflineCheckins(checkins);

  return offlineCheckin;
}

/**
 * Update offline check-in status
 */
export function updateOfflineCheckinStatus(
  id: string,
  status: OfflineCheckin["status"],
  error?: string
): void {
  const checkins = getOfflineCheckins();
  const index = checkins.findIndex((c) => c.id === id);

  if (index !== -1) {
    checkins[index].status = status;
    if (error) {
      checkins[index].lastError = error;
    }
    if (status === "failed") {
      checkins[index].retryCount++;
    }
    saveOfflineCheckins(checkins);
  }
}

/**
 * Remove offline check-in from queue (after successful sync)
 */
export function removeOfflineCheckin(id: string): void {
  const checkins = getOfflineCheckins();
  const filtered = checkins.filter((c) => c.id !== id);
  saveOfflineCheckins(filtered);
}

/**
 * Get pending check-ins for sync
 */
export function getPendingCheckins(): OfflineCheckin[] {
  return getOfflineCheckins().filter(
    (c) => c.status === "pending" && c.retryCount < MAX_RETRY_COUNT
  );
}

/**
 * Get failed check-ins
 */
export function getFailedCheckins(): OfflineCheckin[] {
  return getOfflineCheckins().filter(
    (c) => c.status === "failed" || c.retryCount >= MAX_RETRY_COUNT
  );
}

/**
 * Clear all offline check-ins
 */
export function clearOfflineCheckins(): void {
  localStorage.removeItem(OFFLINE_STORAGE_KEY);
}

/**
 * Get offline queue statistics
 */
export function getOfflineQueueStats(): {
  total: number;
  pending: number;
  syncing: number;
  failed: number;
} {
  const checkins = getOfflineCheckins();
  return {
    total: checkins.length,
    pending: checkins.filter((c) => c.status === "pending").length,
    syncing: checkins.filter((c) => c.status === "syncing").length,
    failed: checkins.filter(
      (c) => c.status === "failed" || c.retryCount >= MAX_RETRY_COUNT
    ).length,
  };
}

/**
 * Retry a failed check-in
 */
export function retryOfflineCheckin(id: string): void {
  const checkins = getOfflineCheckins();
  const index = checkins.findIndex((c) => c.id === id);

  if (index !== -1) {
    checkins[index].status = "pending";
    checkins[index].lastError = undefined;
    saveOfflineCheckins(checkins);
  }
}
