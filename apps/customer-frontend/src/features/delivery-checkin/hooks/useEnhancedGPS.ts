// apps/customer-frontend/src/features/delivery-checkin/hooks/useEnhancedGPS.ts
/**
 * Enhanced GPS Hook - Optimized for delivery apps
 * Features:
 * - Fast initial position with progressive accuracy
 * - Background position tracking
 * - Geofencing validation
 * - Battery-efficient
 */

import { useState, useCallback, useEffect, useRef } from "react";
import type { GPSPosition, GPSStatus } from "../types";
import { GPS_ACCURACY_THRESHOLD, GPS_ACCURACY_WARNING } from "../types";

interface UseEnhancedGPSOptions {
  enableHighAccuracy?: boolean;
  enableBackgroundTracking?: boolean;
  autoCapture?: boolean;
  geofenceRadius?: number; // meters
  targetLocation?: { latitude: number; longitude: number };
}

interface UseEnhancedGPSReturn {
  position: GPSPosition | null;
  status: GPSStatus;
  capturePosition: () => void;
  clearPosition: () => void;
  isGoodAccuracy: boolean;
  isAcceptableAccuracy: boolean;
  accuracyLevel: "good" | "acceptable" | "poor" | "unknown";
  distanceToTarget: number | null;
  isWithinGeofence: boolean;
  startBackgroundTracking: () => void;
  stopBackgroundTracking: () => void;
}

export function useEnhancedGPS(
  options: UseEnhancedGPSOptions = {}
): UseEnhancedGPSReturn {
  const {
    enableHighAccuracy = true,
    enableBackgroundTracking = false,
    autoCapture = false,
    geofenceRadius = 100, // 100m default
    targetLocation,
  } = options;

  const [position, setPosition] = useState<GPSPosition | null>(null);
  const [status, setStatus] = useState<GPSStatus>({
    isCapturing: false,
    hasPosition: false,
    accuracy: null,
    error: null,
  });

  const watchIdRef = useRef<number | null>(null);
  const backgroundWatchIdRef = useRef<number | null>(null);
  const bestPositionRef = useRef<GPSPosition | null>(null);
  const captureStartTimeRef = useRef<number>(0);

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = useCallback(
    (lat1: number, lon1: number, lat2: number, lon2: number): number => {
      const R = 6371e3; // Earth radius in meters
      const φ1 = (lat1 * Math.PI) / 180;
      const φ2 = (lat2 * Math.PI) / 180;
      const Δφ = ((lat2 - lat1) * Math.PI) / 180;
      const Δλ = ((lon2 - lon1) * Math.PI) / 180;

      const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      return R * c; // Distance in meters
    },
    []
  );

  // Calculate distance to target
  const distanceToTarget =
    position && targetLocation
      ? calculateDistance(
          position.latitude,
          position.longitude,
          targetLocation.latitude,
          targetLocation.longitude
        )
      : null;

  // Check if within geofence
  const isWithinGeofence =
    distanceToTarget !== null && distanceToTarget <= geofenceRadius;

  const clearWatch = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  const clearBackgroundWatch = useCallback(() => {
    if (backgroundWatchIdRef.current !== null) {
      navigator.geolocation.clearWatch(backgroundWatchIdRef.current);
      backgroundWatchIdRef.current = null;
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

      // Keep track of best position (most accurate)
      if (
        !bestPositionRef.current ||
        newPosition.accuracy < bestPositionRef.current.accuracy
      ) {
        bestPositionRef.current = newPosition;
      }

      // Update position immediately for fast feedback
      setPosition(newPosition);
      setStatus({
        isCapturing: false,
        hasPosition: true,
        accuracy: newPosition.accuracy,
        error: null,
      });

      // Stop watching if we have good accuracy or timeout reached
      const elapsedTime = Date.now() - captureStartTimeRef.current;
      if (
        newPosition.accuracy <= GPS_ACCURACY_THRESHOLD ||
        elapsedTime > 10000
      ) {
        // 10s max
        clearWatch();
        // Use best position
        if (bestPositionRef.current) {
          setPosition(bestPositionRef.current);
          setStatus({
            isCapturing: false,
            hasPosition: true,
            accuracy: bestPositionRef.current.accuracy,
            error: null,
          });
        }
      }
    },
    [clearWatch]
  );

  const handleError = useCallback(
    (error: GeolocationPositionError) => {
      let errorMessage: string;

      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = "Vui lòng cho phép truy cập GPS trong cài đặt";
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = "Không thể xác định vị trí. Vui lòng bật GPS";
          break;
        case error.TIMEOUT:
          // If we have a position from before, use it
          if (bestPositionRef.current) {
            setPosition(bestPositionRef.current);
            setStatus({
              isCapturing: false,
              hasPosition: true,
              accuracy: bestPositionRef.current.accuracy,
              error: null,
            });
            return;
          }
          errorMessage = "Hết thời gian chờ. Vui lòng thử lại";
          break;
        default:
          errorMessage = "Không thể lấy vị trí GPS";
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

  // Fast capture with progressive accuracy
  const capturePosition = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus({
        isCapturing: false,
        hasPosition: false,
        accuracy: null,
        error: "Trình duyệt không hỗ trợ GPS",
      });
      return;
    }

    clearWatch();
    bestPositionRef.current = null;
    captureStartTimeRef.current = Date.now();

    setStatus({
      isCapturing: true,
      hasPosition: false,
      accuracy: null,
      error: null,
    });

    // Strategy: Get quick position first, then improve accuracy
    // Step 1: Quick position (low accuracy, fast)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const quickPosition: GPSPosition = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          altitude: pos.coords.altitude ?? undefined,
          heading: pos.coords.heading ?? undefined,
          speed: pos.coords.speed ?? undefined,
          timestamp: pos.timestamp,
        };

        bestPositionRef.current = quickPosition;
        setPosition(quickPosition);
        setStatus({
          isCapturing: true, // Still capturing for better accuracy
          hasPosition: true,
          accuracy: quickPosition.accuracy,
          error: null,
        });

        // Step 2: Watch for better accuracy
        watchIdRef.current = navigator.geolocation.watchPosition(
          handleSuccess,
          handleError,
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          }
        );
      },
      (error) => {
        // If quick position fails, try high accuracy directly
        watchIdRef.current = navigator.geolocation.watchPosition(
          handleSuccess,
          handleError,
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0,
          }
        );
      },
      {
        enableHighAccuracy: false, // Quick, low accuracy first
        timeout: 5000,
        maximumAge: 60000, // Accept 1-minute old position for speed
      }
    );
  }, [handleSuccess, handleError, clearWatch]);

  const clearPosition = useCallback(() => {
    clearWatch();
    clearBackgroundWatch();
    setPosition(null);
    bestPositionRef.current = null;
    setStatus({
      isCapturing: false,
      hasPosition: false,
      accuracy: null,
      error: null,
    });
  }, [clearWatch, clearBackgroundWatch]);

  // Background tracking for continuous position updates
  const startBackgroundTracking = useCallback(() => {
    if (!navigator.geolocation) return;

    clearBackgroundWatch();

    backgroundWatchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
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
        setStatus((prev) => ({
          ...prev,
          hasPosition: true,
          accuracy: newPosition.accuracy,
        }));
      },
      (error) => {
        console.warn("Background GPS error:", error);
      },
      {
        enableHighAccuracy: false, // Battery-efficient
        timeout: 30000,
        maximumAge: 30000, // Accept 30s old position
      }
    );
  }, [clearBackgroundWatch]);

  const stopBackgroundTracking = useCallback(() => {
    clearBackgroundWatch();
  }, [clearBackgroundWatch]);

  // Auto capture on mount
  useEffect(() => {
    if (autoCapture) {
      capturePosition();
    }
    return () => {
      clearWatch();
      clearBackgroundWatch();
    };
  }, [autoCapture, capturePosition, clearWatch, clearBackgroundWatch]);

  // Auto start background tracking
  useEffect(() => {
    if (enableBackgroundTracking) {
      startBackgroundTracking();
    }
    return () => {
      stopBackgroundTracking();
    };
  }, [
    enableBackgroundTracking,
    startBackgroundTracking,
    stopBackgroundTracking,
  ]);

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
    distanceToTarget,
    isWithinGeofence,
    startBackgroundTracking,
    stopBackgroundTracking,
  };
}
