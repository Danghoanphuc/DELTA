// apps/customer-frontend/src/features/rush/hooks/useRush.ts
import { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import api from "@/shared/lib/axios";
import { toast } from "@/shared/utils/toast";

export interface RushSolution {
  printerProfileId: string;
  printerBusinessName: string;
  printerLogoUrl?: string;
  distanceKm: number;
  currentRushQueue: number;
  product: {
    _id: string;
    name: string;
    slug: string;
    category: string;
    basePrice: number;
    estimatedPrice: number;
    rushFee: number;
    productionTime: {
      min?: number;
      max?: number;
    };
    images: Array<{
      url: string;
      isPrimary?: boolean;
    }>;
    specifications?: Record<string, any>;
  };
  rushConfig: {
    acceptsRushOrders: boolean;
    maxRushDistanceKm: number;
    rushFeePercentage: number;
    rushFeeFixed: number;
  };
}

interface SearchPrintersParams {
  file?: File;
  deadlineHours: number;
  location?: { lat: number; lng: number };
  category?: string;
}

interface SearchPrintersResponse {
  success: boolean;
  data: {
    solutions: RushSolution[];
    count: number;
  };
  timestamp?: Date;
}

/**
 * Hook để tìm kiếm printers cho rush orders
 */
export const useRush = () => {
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  /**
   * Lấy vị trí hiện tại của user bằng navigator.geolocation
   */
  const getCurrentLocation = useCallback((): Promise<{
    lat: number;
    lng: number;
  }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Trình duyệt không hỗ trợ Geolocation API"));
        return;
      }

      setIsGettingLocation(true);
      setLocationError(null);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(location);
          setIsGettingLocation(false);
          resolve(location);
        },
        (error) => {
          setIsGettingLocation(false);
          let errorMessage = "Không thể lấy vị trí của bạn.";

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage =
                "Bạn đã từ chối quyền truy cập vị trí. Vui lòng bật lại trong cài đặt trình duyệt.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Thông tin vị trí không khả dụng.";
              break;
            case error.TIMEOUT:
              errorMessage = "Yêu cầu lấy vị trí đã hết thời gian chờ.";
              break;
          }

          setLocationError(errorMessage);
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0, // Không cache, luôn lấy vị trí mới
        }
      );
    });
  }, []);

  /**
   * Tìm kiếm printers gần nhất cho rush order
   */
  const searchPrintersMutation = useMutation({
    mutationFn: async (params: SearchPrintersParams) => {
      const { file, deadlineHours, location, category } = params;

      // Validate deadline
      if (!deadlineHours || deadlineHours <= 0) {
        throw new Error("Thời gian deadline phải lớn hơn 0 giờ.");
      }

      // Lấy vị trí nếu chưa có
      let finalLocation = location || userLocation;
      if (!finalLocation) {
        try {
          finalLocation = await getCurrentLocation();
        } catch (error: any) {
          throw new Error(
            error.message || "Không thể lấy vị trí. Vui lòng thử lại."
          );
        }
      }

      // Gọi API
      const response = await api.post<SearchPrintersResponse>(
        "/rush/solutions",
        {
          lat: finalLocation.lat,
          lng: finalLocation.lng,
          deadlineHours,
          category: category || undefined,
        }
      );

      // Extract data từ response
      const solutions = response.data?.data?.solutions || [];

      return {
        solutions,
        count: solutions.length,
        location: finalLocation,
      };
    },
    onError: (error: any) => {
      console.error("❌ Error searching rush printers:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Không thể tìm kiếm nhà in. Vui lòng thử lại.";
      toast.error(errorMessage);
    },
  });

  /**
   * Wrapper function để search printers
   */
  const searchPrinters = useCallback(
    async (file: File | undefined, deadline: string, category?: string) => {
      // Convert deadline string to hours
      let deadlineHours = 0;
      const now = new Date();
      const todayEnd = new Date(now);
      todayEnd.setHours(23, 59, 59, 999);

      switch (deadline) {
        case "2h":
          deadlineHours = 2;
          break;
        case "4h":
          deadlineHours = 4;
          break;
        case "today":
          const hoursUntilMidnight =
            (todayEnd.getTime() - now.getTime()) / (1000 * 60 * 60);
          deadlineHours = Math.max(1, Math.ceil(hoursUntilMidnight));
          break;
        default:
          deadlineHours = 4; // Default
      }

      return searchPrintersMutation.mutateAsync({
        file,
        deadlineHours,
        category,
      });
    },
    [searchPrintersMutation]
  );

  return {
    searchPrinters,
    searchPrintersMutation,
    userLocation,
    locationError,
    isGettingLocation,
    getCurrentLocation,
  };
};

