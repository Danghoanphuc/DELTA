import { useState, useRef, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { ResponsiveModal } from "@/shared/components/ui/responsive-modal"; // Wrapper mới
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import {
  MapPin,
  Check,
  Search,
  Loader2,
  Sparkles,
  AlertCircle,
  X,
  Navigation,
} from "lucide-react";
import { LocationMap } from "./LocationMap";
import { cn } from "@/shared/lib/utils";
import { toast } from "@/shared/utils/toast";
import { useMediaQuery } from "@/shared/hooks/useMediaQuery";

import {
  useAddressAutocomplete,
  getPlaceDetail,
} from "../hooks/useAddressAutocomplete";
import { findMatchingProvince } from "../utils/addressMatchers";
import { useGHNLocations } from "../hooks/useGHNLocations";

interface AddressEditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddressEditModal = ({
  isOpen,
  onClose,
}: AddressEditModalProps) => {
  const form = useFormContext();
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Data
  const { provinces, loadDistricts } = useGHNLocations();
  const street = form.watch("shippingAddress.street");
  const coordinates = form.watch("shippingAddress.coordinates");
  const city = form.watch("shippingAddress.cityName");
  const district = form.watch("shippingAddress.districtName");
  const ward = form.watch("shippingAddress.wardName");

  const hasGPSData = !!(coordinates?.lat && coordinates?.lng);

  // UI States
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const { predictions, isLoading: isGoongLoading } =
    useAddressAutocomplete(street);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Đóng gợi ý khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- Handlers ---
  const handleSelectPrediction = async (prediction: any) => {
    setShowSuggestions(false);
    setIsSearching(false); // Mobile: Hiện lại map sau khi chọn

    form.setValue(
      "shippingAddress.street",
      prediction.structured_formatting.main_text
    );

    // Logic lấy chi tiết từ Goong (giữ nguyên logic cũ của bạn)
    const placeDetail = await getPlaceDetail(prediction.place_id);
    if (placeDetail) {
      form.setValue("shippingAddress.coordinates", {
        lat: placeDetail.lat,
        lng: placeDetail.lng,
      });

      // Map Province/District/Ward logic...
      if (placeDetail.province) {
        const matchedProvince = findMatchingProvince(
          placeDetail.province,
          provinces
        );
        if (matchedProvince) {
          form.setValue(
            "shippingAddress.provinceId",
            matchedProvince.ProvinceID
          );
          form.setValue(
            "shippingAddress.cityName",
            matchedProvince.ProvinceName
          );
          loadDistricts(matchedProvince.ProvinceID);
        } else {
          form.setValue("shippingAddress.cityName", placeDetail.province);
        }
      }
      form.setValue("shippingAddress.districtName", placeDetail.district);
      form.setValue("shippingAddress.wardName", placeDetail.ward);
      toast.success("Đã cập nhật vị trí");
    }
  };

  const handleSave = () => {
    if (!street || street.length < 5) {
      toast.error("Vui lòng nhập địa chỉ cụ thể");
      return;
    }
    onClose();
  };

  const previewAddress = [street, ward, district, city]
    .filter(Boolean)
    .join(", ");

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onOpenChange={(open) => !open && onClose()}
      title="Xác nhận địa chỉ"
      className="sm:max-w-[900px] p-0 gap-0 overflow-hidden flex flex-col"
    >
      <div className="flex flex-col md:flex-row h-full md:h-[600px]">
        {/* === MAP SECTION === 
            Mobile: Ẩn khi đang search để bàn phím không che
        */}
        <div
          className={cn(
            "relative bg-gray-100 transition-all duration-300",
            isMobile
              ? isSearching
                ? "h-0 overflow-hidden"
                : "h-[200px] shrink-0"
              : "md:w-1/2 h-full border-r border-gray-200"
          )}
        >
          {hasGPSData ? (
            <LocationMap
              lat={coordinates.lat}
              lng={coordinates.lng}
              address={previewAddress}
              className="w-full h-full"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
              <MapPin size={32} className="mb-2 opacity-50" />
              <span className="text-xs">Chưa có tọa độ</span>
            </div>
          )}

          {/* Badge GPS on Map */}
          {hasGPSData && (
            <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur px-2 py-1 rounded-md text-[10px] font-mono shadow-sm border border-gray-200">
              GPS: {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}
            </div>
          )}
        </div>

        {/* === FORM SECTION === */}
        <div className="flex-1 flex flex-col bg-white h-full relative">
          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
            {/* Input Address */}
            <div className="space-y-3" ref={wrapperRef}>
              <Label className="text-sm font-semibold text-gray-900">
                Địa chỉ cụ thể <span className="text-red-500">*</span>
              </Label>
              <div className="relative group">
                <Input
                  value={street}
                  onChange={(e) => {
                    form.setValue("shippingAddress.street", e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => {
                    if (isMobile) setIsSearching(true);
                    setShowSuggestions(true);
                  }}
                  // Mobile: Nút X để thoát chế độ search
                  onBlur={() => {
                    // Delay để kịp click vào suggestion
                    setTimeout(() => {
                      if (isMobile && !street) setIsSearching(false);
                    }, 200);
                  }}
                  placeholder="Nhập số nhà, tên đường, tòa nhà..."
                  className="pl-10 h-12 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-blue-500 transition-all"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {isGoongLoading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Search size={18} />
                  )}
                </div>

                {/* Nút thoát search trên mobile */}
                {isMobile && isSearching && (
                  <button
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 bg-gray-200 rounded-full"
                    onClick={() => {
                      setIsSearching(false);
                      setShowSuggestions(false);
                    }}
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Suggestions Dropdown */}
              {showSuggestions && predictions.length > 0 && (
                <div className="absolute z-50 left-0 right-0 mt-1 mx-4 md:mx-0 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden max-h-[250px] overflow-y-auto animate-in zoom-in-95">
                  {predictions.map((p) => (
                    <div
                      key={p.place_id}
                      onClick={() => handleSelectPrediction(p)}
                      className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-0 flex gap-3"
                    >
                      <MapPin
                        size={16}
                        className="mt-1 text-gray-400 shrink-0"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {p.structured_formatting.main_text}
                        </p>
                        <p className="text-xs text-gray-500">
                          {p.structured_formatting.secondary_text}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div className="bg-gray-50 p-1 text-[10px] text-center text-gray-400">
                    Powered by Goong
                  </div>
                </div>
              )}
            </div>

            {/* Smart Analysis Box */}
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 space-y-2">
              <div className="flex items-center gap-2 text-blue-800 font-semibold text-sm">
                <Sparkles size={16} />
                <span>Dữ liệu hành chính</span>
              </div>
              <div className="grid grid-cols-1 gap-2 text-sm text-gray-700">
                <div className="bg-white p-2 rounded border border-blue-100/50">
                  <span className="text-gray-400 text-xs block">
                    Tỉnh/Thành
                  </span>
                  {city || "---"}
                </div>
                <div className="flex gap-2">
                  <div className="bg-white p-2 rounded border border-blue-100/50 flex-1">
                    <span className="text-gray-400 text-xs block">
                      Quận/Huyện
                    </span>
                    {district || "---"}
                  </div>
                  <div className="bg-white p-2 rounded border border-blue-100/50 flex-1">
                    <span className="text-gray-400 text-xs block">
                      Phường/Xã
                    </span>
                    {ward || "---"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 md:p-6 border-t border-gray-100 bg-gray-50/50 mt-auto">
            <Button
              onClick={handleSave}
              className="w-full h-12 text-base font-bold shadow-lg shadow-blue-500/20"
            >
              Xác nhận địa chỉ
            </Button>
          </div>
        </div>
      </div>
    </ResponsiveModal>
  );
};
