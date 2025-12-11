// apps/customer-frontend/src/features/delivery-checkin/hooks/useCheckinForm.ts
/**
 * Custom hook for check-in form state management
 * Orchestrates GPS capture, photo management, form submission, and offline support
 * Requirements: 8.3, 8.4, 14.1 - EXIF GPS extraction and offline support
 */

import { useState, useCallback, useMemo } from "react";
import { toast } from "@/shared/utils/toast";
import { deliveryCheckinService } from "../services/delivery-checkin.service";
import { useEnhancedGPS } from "./useEnhancedGPS";
import { usePhotoCapture } from "./usePhotoCapture";
import { useOnlineStatus } from "./useOnlineStatus";
import { useOfflineQueue } from "./useOfflineQueue";
import { extractGPSFromPhoto } from "../utils/exif-gps";
import type {
  DeliveryCheckin,
  AssignedOrder,
  CreateCheckinData,
  GPSPosition,
  OfflineQueueStatus,
  OfflineCheckin,
} from "../types";

interface UseCheckinFormOptions {
  onSuccess?: (checkin: DeliveryCheckin) => void;
  onError?: (error: Error) => void;
  onOfflineQueued?: (offlineCheckin: OfflineCheckin) => void;
}

interface UseCheckinFormReturn {
  // Form state
  selectedOrder: AssignedOrder | null;
  setSelectedOrder: (order: AssignedOrder | null) => void;
  notes: string;
  setNotes: (notes: string) => void;

  // GPS
  gps: ReturnType<typeof useEnhancedGPS>;

  // Photos
  photos: ReturnType<typeof usePhotoCapture>;

  // Submission
  isSubmitting: boolean;
  uploadProgress: number;
  submitCheckin: () => Promise<void>;

  // Validation
  isValid: boolean;
  validationErrors: string[];

  // Reset
  resetForm: () => void;

  // Offline support
  isOnline: boolean;
  offlineStatus: OfflineQueueStatus;
  offlineCheckins: OfflineCheckin[];
  syncOfflineQueue: () => Promise<void>;
  retryOfflineCheckin: (id: string) => void;
  removeOfflineCheckin: (id: string) => void;

  // EXIF GPS
  extractGPSFromPhotos: () => Promise<GPSPosition | null>;
}

export function useCheckinForm(
  options: UseCheckinFormOptions = {}
): UseCheckinFormReturn {
  const { onSuccess, onError, onOfflineQueued } = options;

  // Form state
  const [selectedOrder, setSelectedOrder] = useState<AssignedOrder | null>(
    null
  );
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Enhanced GPS capture with geofencing
  const gps = useEnhancedGPS({
    autoCapture: true,
    enableBackgroundTracking: true,
    targetLocation: selectedOrder
      ? {
          latitude: selectedOrder.latitude || 0,
          longitude: selectedOrder.longitude || 0,
        }
      : undefined,
    geofenceRadius: 200, // 200m radius
  });

  // Photo capture
  const photos = usePhotoCapture();

  // Online status
  const { isOnline } = useOnlineStatus();

  // Offline queue
  const offlineQueue = useOfflineQueue();

  // Extract GPS from photos (EXIF data) - Requirements: 8.3
  const extractGPSFromPhotos =
    useCallback(async (): Promise<GPSPosition | null> => {
      for (const photo of photos.photos) {
        const exifGPS = await extractGPSFromPhoto(photo.file);
        if (exifGPS.latitude !== null && exifGPS.longitude !== null) {
          return {
            latitude: exifGPS.latitude,
            longitude: exifGPS.longitude,
            accuracy: 10, // EXIF GPS is typically accurate
            altitude: exifGPS.altitude ?? undefined,
            timestamp: exifGPS.timestamp ?? Date.now(),
          };
        }
      }
      return null;
    }, [photos.photos]);

  // Validation - allow offline submission even without GPS if photos have EXIF
  const validationErrors = useMemo(() => {
    const errors: string[] = [];

    if (!selectedOrder) {
      errors.push("Vui lòng chọn đơn hàng");
    }

    if (!gps.status.hasPosition && isOnline) {
      errors.push("Vui lòng bật GPS và cho phép truy cập vị trí");
    }

    if (photos.photos.length === 0) {
      errors.push("Vui lòng chụp ít nhất 1 ảnh giao hàng");
    }

    return errors;
  }, [selectedOrder, gps.status.hasPosition, photos.photos.length, isOnline]);

  const isValid: boolean =
    validationErrors.length === 0 ||
    (!isOnline && !!selectedOrder && photos.photos.length > 0);

  // Submit check-in (online or offline)
  const submitCheckin = useCallback(async () => {
    if (!selectedOrder) {
      toast.error("Vui lòng chọn đơn hàng");
      return;
    }

    if (photos.photos.length === 0) {
      toast.error("Vui lòng chụp ít nhất 1 ảnh giao hàng");
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      // Try to get GPS from device or EXIF
      let position = gps.position;

      // If no device GPS, try to extract from photo EXIF
      if (!position) {
        const exifPosition = await extractGPSFromPhotos();
        if (exifPosition) {
          position = exifPosition;
          toast.info("Đã sử dụng GPS từ ảnh");
        }
      }

      // If still no GPS and offline, queue for later
      if (!position && !isOnline) {
        toast.error("Không có GPS. Vui lòng bật GPS hoặc chụp ảnh có GPS.");
        setIsSubmitting(false);
        return;
      }

      // If no GPS and online, show error
      if (!position) {
        toast.error("Vui lòng bật GPS và cho phép truy cập vị trí");
        setIsSubmitting(false);
        return;
      }

      const checkinData: CreateCheckinData = {
        orderId: selectedOrder._id,
        latitude: position.latitude,
        longitude: position.longitude,
        accuracy: position.accuracy,
        altitude: position.altitude,
        heading: position.heading,
        speed: position.speed,
        gpsTimestamp: position.timestamp,
        gpsSource: gps.position ? "browser" : "manual",
        notes: notes.trim() || undefined,
      };

      const photoFiles = photos.photos.map((p) => p.file);

      // If offline, queue the check-in - Requirements: 8.4, 14.1
      if (!isOnline) {
        const offlineCheckin = await offlineQueue.queueCheckin(
          checkinData,
          photoFiles,
          selectedOrder.orderNumber
        );
        onOfflineQueued?.(offlineCheckin);
        resetFormState();
        return;
      }

      // Online submission
      photos.photos.forEach((photo) => {
        photos.updatePhotoStatus(photo.id, "uploading");
      });

      const checkin = await deliveryCheckinService.createCheckin(
        checkinData,
        photoFiles,
        (progress) => {
          setUploadProgress(progress);
          photos.photos.forEach((photo) => {
            photos.updatePhotoProgress(photo.id, progress);
          });
        }
      );

      photos.photos.forEach((photo) => {
        photos.updatePhotoStatus(photo.id, "uploaded");
      });

      toast.success("Check-in thành công!");
      onSuccess?.(checkin);
      resetFormState();
    } catch (error: any) {
      console.error("Check-in error:", error);

      // If network error and we have data, queue offline
      if (!isOnline || error.message?.includes("Network Error")) {
        try {
          const position = gps.position || (await extractGPSFromPhotos());
          if (position) {
            const checkinData: CreateCheckinData = {
              orderId: selectedOrder._id,
              latitude: position.latitude,
              longitude: position.longitude,
              accuracy: position.accuracy,
              altitude: position.altitude,
              heading: position.heading,
              speed: position.speed,
              gpsTimestamp: position.timestamp,
              gpsSource: "browser",
              notes: notes.trim() || undefined,
            };
            const photoFiles = photos.photos.map((p) => p.file);
            const offlineCheckin = await offlineQueue.queueCheckin(
              checkinData,
              photoFiles,
              selectedOrder.orderNumber
            );
            onOfflineQueued?.(offlineCheckin);
            resetFormState();
            return;
          }
        } catch (queueError) {
          console.error("Failed to queue offline:", queueError);
        }
      }

      photos.photos.forEach((photo) => {
        photos.updatePhotoStatus(photo.id, "failed", error.message);
      });

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Không thể tạo check-in";
      toast.error(errorMessage);
      onError?.(error);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    selectedOrder,
    gps.position,
    notes,
    photos,
    isOnline,
    offlineQueue,
    extractGPSFromPhotos,
    onSuccess,
    onError,
    onOfflineQueued,
  ]);

  // Reset form state helper
  const resetFormState = useCallback(() => {
    setSelectedOrder(null);
    setNotes("");
    setUploadProgress(0);
    gps.clearPosition();
    photos.clearPhotos();
  }, [gps, photos]);

  // Reset form (public)
  const resetForm = useCallback(() => {
    resetFormState();
  }, [resetFormState]);

  return {
    // Form state
    selectedOrder,
    setSelectedOrder,
    notes,
    setNotes,

    // GPS
    gps,

    // Photos
    photos,

    // Submission
    isSubmitting,
    uploadProgress,
    submitCheckin,

    // Validation
    isValid,
    validationErrors,

    // Reset
    resetForm,

    // Offline support
    isOnline,
    offlineStatus: offlineQueue.status,
    offlineCheckins: offlineQueue.checkins,
    syncOfflineQueue: offlineQueue.syncQueue,
    retryOfflineCheckin: offlineQueue.retryCheckin,
    removeOfflineCheckin: offlineQueue.removeCheckin,

    // EXIF GPS
    extractGPSFromPhotos,
  };
}
