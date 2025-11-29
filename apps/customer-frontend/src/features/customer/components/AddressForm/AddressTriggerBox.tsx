// apps/customer-frontend/src/features/customer/components/AddressForm/AddressTriggerBox.tsx
import { useFormContext } from "react-hook-form";
import { MapPin, ChevronRight, Plus, Pencil, Navigation } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface AddressTriggerBoxProps {
  onClick: () => void;
}

export const AddressTriggerBox = ({ onClick }: AddressTriggerBoxProps) => {
  const form = useFormContext();
  const street = form.watch("shippingAddress.street");
  const wardName = form.watch("shippingAddress.wardName");
  const districtName = form.watch("shippingAddress.districtName");
  const cityName = form.watch("shippingAddress.cityName");
  const coordinates = form.watch("shippingAddress.coordinates");

  const hasData = !!(street && cityName);
  const hasGPSData = !!(coordinates?.lat && coordinates?.lng);

  const fullAddress = [street, wardName, districtName, cityName]
    .filter(Boolean)
    .join(", ");

  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative w-full rounded-2xl border-2 p-5 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md",
        hasData
          ? hasGPSData
            ? "border-green-300 bg-gradient-to-br from-green-50 to-emerald-50 hover:border-green-400"
            : "border-blue-200 bg-white hover:border-blue-400"
          : "border-dashed border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50/30"
      )}
    >
      <div className="flex items-start gap-4">
        {/* Icon Box */}
        <div
          className={cn(
            "flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl transition-all shadow-sm",
            hasData
              ? hasGPSData
                ? "bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-green-500/30"
                : "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-blue-500/30"
              : "bg-gray-200 text-gray-400 group-hover:bg-blue-100 group-hover:text-blue-600"
          )}
        >
          {hasGPSData ? <Navigation size={24} /> : <MapPin size={24} />}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {hasData ? (
            <>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Địa chỉ giao hàng
                </p>
                {hasGPSData && (
                  <span className="text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full flex items-center gap-1 border border-green-200">
                    <Navigation className="w-3 h-3" />
                    Đã định vị
                  </span>
                )}
              </div>
              <h4 className="text-base font-bold text-gray-900 line-clamp-2 leading-snug mb-2">
                {fullAddress}
              </h4>
              <p className="text-xs text-blue-600 font-semibold flex items-center gap-1.5 group-hover:underline">
                <Pencil size={12} /> Chỉnh sửa địa chỉ
              </p>
            </>
          ) : (
            <div className="flex flex-col h-full justify-center">
              <h4 className="text-base font-bold text-gray-700 group-hover:text-blue-700 mb-1">
                Thêm địa chỉ giao hàng
              </h4>
              <p className="text-sm text-gray-500 font-medium">
                Chọn khu vực và nhập số nhà, tên đường
              </p>
            </div>
          )}
        </div>

        {/* Action Icon */}
        <div
          className={cn(
            "flex h-14 items-center justify-center transition-all",
            hasData
              ? "text-gray-400 group-hover:translate-x-1 group-hover:text-blue-600"
              : "text-gray-300 group-hover:text-blue-500"
          )}
        >
          {hasData ? <ChevronRight size={24} /> : <Plus size={24} />}
        </div>
      </div>
    </div>
  );
};
