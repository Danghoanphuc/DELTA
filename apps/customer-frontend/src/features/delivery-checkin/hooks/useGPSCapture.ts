// apps/customer-frontend/src/features/delivery-checkin/hooks/useGPSCapture.ts
/**
 * Custom hook for GPS capture with accuracy indicator
 * Handles GPS position acquisition and validation
 */

import { useState, useCallback, useEffect, useRef } from "react";
import type { GPSPosition, GPSStatus } from "../types";
import { GPS_ACCURACY_THRESHOLD, GPS_ACCURACY_WARNING } from "../types";

interface UseGPSCaptureOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  autoCapture?: boolean;
}

interface UseGPSCaptureReturn {
  position: GPSPosition | null;
  status: GPSStatus;
  capturePosition: () => void;
  clearPosition: () => void;
  isGoodAccuracy: boolean;
  isAcceptableAccuracy: boolean;
  accuracyLevel: "good" | "acceptable" | "poor" | "unknown";
}

export function useGPSCapture(
  options: UseGPSCaptureOptions = {}
): UseGPSCaptureReturn {
  const {
    enableHighAccuracy = true,
    timeout = 30000,
    maximumAge = 0,
    autoCapture = false,
  } = options;

  const [position, setPosition] = useState<GPSPosition | null>(null);
  const [status, setStatus] = useState<GPSStatus>({
    isCapturing: false,
    hasPosition: false,
    accuracy: null,
    error: null,
  });

  const watchIdRef = useRef<number | null>(null);

  const clearWatch = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  const handleSuccess = useCallback(
    (pos: GeolocationPosition) => {
      const newPosition: GPSPosition = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
        altitude: pos.coords.altitude ?? undefined,
        heading: pos.coords.heading ?? undefined,
        speed: pos.coords.speed ?? undefined,
        timestamp: pos.timestamp,
      };

      setPosition(newPosition);
      setStatus({
        isCapturing: false,
        hasPosition: true,
        accuracy: pos.coords.accuracy,
        error: null,
      });

      // Stop watching once we have a good position
      if (pos.coords.accuracy <= GPS_ACCURACY_THRESHOLD) {
        clearWatch();
      }
    },
    [clearWatch]
  );

  const handleError = useCallback(
    (error: GeolocationPositionError) => {
      let errorMessage: string;

      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage =
            "Quyền truy cập vị trí bị từ chối. Vui lòng cho phép truy cập GPS trong cài đặt.";
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage =
            "Không thể xác định vị trí. Vui lòng kiểm tra GPS của thiết bị.";
          break;
        case error.TIMEOUT:
          errorMessage = "Hết thời gian chờ xác định vị trí. Vui lòng thử lại.";
          break;
        default:
          errorMessage = "Không thể lấy vị trí GPS. Vui lòng thử lại.";
      }

      setStatus({
        isCapturing: false,
        hasPosition: false,
        accuracy: null,
        error: errorMessage,
      });
      clearWatch();
    },
    [clearWatch]
  );

  const capturePosition = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus({
        isCapturing: false,
        hasPosition: false,
        accuracy: null,
        error:
          "Trình duyệt không hỗ trợ GPS. Vui lòng sử dụng trình duyệt khác.",
      });
      return;
    }

    // Clear any existing watch
    clearWatch();

    setStatus({
      isCapturing: true,
      hasPosition: false,
      accuracy: null,
      error: null,
    });

    const geoOptions: PositionOptions = {
      enableHighAccuracy,
      timeout,
      maximumAge,
    };

    // Use watchPosition for continuous updates until we get good accuracy
    watchIdRef.current = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      geoOptions
    );

    // Set a timeout to stop watching after the specified time
    setTimeout(() => {
      if (watchIdRef.current !== null) {
        clearWatch();
        setStatus((prev) => ({
          ...prev,
          isCapturing: false,
          error: prev.hasPosition ? null : "Hết thời gian chờ xác định vị trí.",
        }));
      }
    }, timeout);
  }, [
    enableHighAccuracy,
    timeout,
    maximumAge,
    handleSuccess,
    handleError,
    clearWatch,
  ]);

  const clearPosition = useCallback(() => {
    clearWatch();
    setPosition(null);
    setStatus({
      isCapturing: false,
      hasPosition: false,
      accuracy: null,
      error: null,
    });
  }, [clearWatch]);

  // Auto capture on mount if enabled
  useEffect(() => {
    if (autoCapture) {
      capturePosition();
    }
    return () => {
      clearWatch();
    };
  }, [autoCapture, capturePosition, clearWatch]);

  // Calculate accuracy levels
  const isGoodAccuracy =
    status.accuracy !== null && status.accuracy <= GPS_ACCURACY_THRESHOLD;
  const isAcceptableAccuracy =
    status.accuracy !== null && status.accuracy <= GPS_ACCURACY_WARNING;

  const accuracyLevel: "good" | "acceptable" | "poor" | "unknown" =
    status.accuracy === null
      ? "unknown"
      : status.accuracy <= GPS_ACCURACY_THRESHOLD
      ? "good"
      : status.accuracy <= GPS_ACCURACY_WARNING
      ? "acceptable"
      : "poor";

  return {
    position,
    status,
    capturePosition,
    clearPosition,
    isGoodAccuracy,
    isAcceptableAccuracy,
    accuracyLevel,
  };
}
