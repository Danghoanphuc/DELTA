import { useState, useEffect } from "react";
import { Search, MapPin, Loader2, X } from "lucide-react";
import { Input } from "@/shared/components/ui/input";
import {
  useAddressAutocomplete,
  getPlaceDetail,
} from "../../hooks/useAddressAutocomplete";
import { toast } from "@/shared/utils/toast";
import { cn } from "@/shared/lib/utils";

interface SmartLocationInputProps {
  onSelect: (detail: any) => void;
  defaultValue?: string;
  // Callback để báo cho cha biết đang search -> Cha sẽ ẩn form đi cho gọn
  onSearchStateChange?: (isSearching: boolean) => void;
}

export const SmartLocationInput = ({
  onSelect,
  defaultValue = "",
  onSearchStateChange,
}: SmartLocationInputProps) => {
  const [value, setValue] = useState(defaultValue);
  // Hook Goong
  const { predictions, isLoading } = useAddressAutocomplete(value);

  // Báo cho cha biết khi nào có kết quả search để ẩn form
  useEffect(() => {
    if (onSearchStateChange) {
      // Đang có text và có kết quả -> Đang search
      const isSearching = value.length > 0 && predictions.length > 0;
      onSearchStateChange(isSearching);
    }
  }, [predictions, value, onSearchStateChange]);

  const handleSelect = async (placeId: string, mainText: string) => {
    setValue(mainText);
    // Reset state search để hiện lại form
    onSearchStateChange?.(false);

    const toastId = toast.loading("Đang lấy chi tiết...");
    try {
      const detail = await getPlaceDetail(placeId);
      if (detail) {
        onSelect(detail);
        toast.success("Đã điền địa chỉ!", { id: toastId });
      }
    } catch {
      toast.error("Lỗi kết nối", { id: toastId });
    }
  };

  const clearInput = () => {
    setValue("");
    onSearchStateChange?.(false);
  };

  return (
    <div className="w-full space-y-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Tìm nhanh (VD: Landmark 81...)"
          className="pl-9 pr-9 h-11 bg-gray-50 border-transparent focus:bg-white focus:border-blue-500 transition-all rounded-xl"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-blue-500" />
        )}
        {value && !isLoading && (
          <button
            type="button"
            onClick={clearInput}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* RESULT LIST: Render Inline (Không dùng absolute) */}
      {predictions.length > 0 && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-200">
          <p className="text-xs font-semibold text-gray-400 mb-2 uppercase px-1">
            Kết quả gợi ý
          </p>
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden divide-y divide-gray-50 shadow-sm">
            {predictions.map((item) => (
              <button
                key={item.place_id}
                type="button"
                onClick={() =>
                  handleSelect(
                    item.place_id,
                    item.structured_formatting.main_text
                  )
                }
                className="w-full text-left px-4 py-3 hover:bg-blue-50 active:bg-blue-100 flex items-start gap-3 transition-colors"
              >
                <div className="mt-0.5 w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0 text-blue-500">
                  <MapPin size={14} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 line-clamp-1">
                    {item.structured_formatting.main_text}
                  </p>
                  <p className="text-xs text-gray-500 line-clamp-1">
                    {item.structured_formatting.secondary_text}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
