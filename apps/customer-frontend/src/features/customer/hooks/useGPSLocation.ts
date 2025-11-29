// apps/customer-frontend/src/features/customer/hooks/useGPSLocation.ts
/**
 * Custom hook for GPS location detection
 * Separates GPS logic from UI components
 */

import { useState } from "react";
import { toast } from "@/shared/utils/toast";
import { reverseGeocode } from "@/services/geocodingService";

export interface GPSLocation {
  lat: number;
  lng: number;
  fullAddress: string;
  city?: string;
  district?: string;
  ward?: string;
  street?: string;
}

export const useGPSLocation = () => {
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectedLocation, setDetectedLocation] = useState<GPSLocation | null>(
    null
  );

  const detectLocation = async (): Promise<GPSLocation | null> => {
    if (!navigator.geolocation) {
      toast.error("Trình duyệt không hỗ trợ định vị");
      return null;
    }

    setIsDetecting(true);

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          try {
            const result = await reverseGeocode(latitude, longitude);

            const location: GPSLocation = {
              lat: latitude,
              lng: longitude,
              fullAddress: result.fullAddress,
              city: result.city,
              district: result.district,
              ward: result.ward,
              street: result.street,
            };

            setDetectedLocation(location);
            toast.success("Đã định vị thành công!", {
              description: result.fullAddress,
            });

            resolve(location);
          } catch (error) {
            console.error("Geocoding error:", error);
            toast.error("Không thể lấy địa chỉ chi tiết");
            resolve(null);
          } finally {
            setIsDetecting(false);
          }
        },
        (error) => {
          setIsDetecting(false);

          const errorMessages: Record<number, string> = {
            [error.PERMISSION_DENIED]: "Vui lòng cho phép truy cập vị trí",
            [error.POSITION_UNAVAILABLE]: "Không thể xác định vị trí",
            [error.TIMEOUT]: "Hết thời gian chờ",
          };

          toast.error(
            errorMessages[error.code] || "Không thể lấy vị trí của bạn"
          );
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  };

  const clearLocation = () => {
    setDetectedLocation(null);
    toast.info("Đã xóa thông tin định vị");
  };

  return {
    isDetecting,
    detectedLocation,
    detectLocation,
    clearLocation,
  };
};
