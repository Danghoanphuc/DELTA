// apps/customer-frontend/src/features/customer/hooks/useAddressAutocomplete.ts
import { useState, useEffect } from "react";
import { useDebounce } from "@/shared/hooks/useDebounce";

// Lấy Key từ biến môi trường
const GOONG_API_KEY = import.meta.env.VITE_GOONG_API_KEY;

export interface Prediction {
  description: string;
  place_id: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
  // Goong V2 có thể trả thêm field này nếu là địa chỉ cũ
  has_deprecated?: boolean;
}

export const useAddressAutocomplete = (input: string) => {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debouncedInput = useDebounce(input, 300);

  useEffect(() => {
    if (!debouncedInput || debouncedInput.length < 2) {
      setPredictions([]);
      return;
    }

    const fetchPredictions = async () => {
      setIsLoading(true);
      try {
        // ✅ NÂNG CẤP: Dùng API V2 + tham số has_deprecated_administrative_unit
        const url = `https://rsapi.goong.io/v2/place/autocomplete?api_key=${GOONG_API_KEY}&input=${encodeURIComponent(
          debouncedInput
        )}&limit=5&has_deprecated_administrative_unit=true`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.status === "OK") {
          setPredictions(data.predictions);
        } else {
          setPredictions([]);
        }
      } catch (error) {
        console.error("Goong API Error:", error);
        setPredictions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPredictions();
  }, [debouncedInput]);

  return { predictions, isLoading };
};

// ✅ NÂNG CẤP: Hàm lấy chi tiết (V2) để lấy thông tin hành chính chính xác
export const getPlaceDetail = async (placeId: string) => {
  try {
    const url = `https://rsapi.goong.io/v2/place/detail?api_key=${GOONG_API_KEY}&place_id=${placeId}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === "OK") {
      const result = data.result;

      // Phân tích components để lấy Tỉnh/Huyện/Xã chuẩn
      const addressComponents = result.address_components || [];
      const findComponent = (type: string) =>
        addressComponents.find((c: any) => c.types.includes(type))?.long_name;

      return {
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
        // Lấy tên chuẩn từ API (Đã cập nhật theo sáp nhập)
        ward:
          findComponent("administrative_area_level_3") ||
          findComponent("sublocality_level_1"),
        district: findComponent("administrative_area_level_2"),
        province: findComponent("administrative_area_level_1"),
        formatted_address: result.formatted_address,
      };
    }
    return null;
  } catch (error) {
    console.error("Goong Detail Error:", error);
    return null;
  }
};
