import { useState } from "react";
import {
  MapPin,
  Edit2,
  Plus,
  Star,
  ChevronRight,
  Navigation,
  Phone,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { useSavedAddresses } from "../../hooks/useSavedAddresses";
import { AddressManagementModal } from "./AddressManagementModal";
import type { SavedAddress } from "@/types/address";

interface SmartAddressSelectorProps {
  onSelectAddress: (address: SavedAddress) => void;
  currentAddress?: {
    fullName?: string;
    phone?: string;
    street?: string;
    city?: string;
  };
}

export const SmartAddressSelector = ({
  onSelectAddress,
  currentAddress,
}: SmartAddressSelectorProps) => {
  const { addresses, defaultAddress, isLoading } = useSavedAddresses();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [initialMode, setInitialMode] = useState<"list" | "form">("list");
  const [targetEditAddress, setTargetEditAddress] =
    useState<SavedAddress | null>(null);

  const selectedAddress = addresses.find(
    (addr) =>
      addr.street === currentAddress?.street &&
      addr.city === currentAddress?.city
  );

  const displayAddress = selectedAddress || defaultAddress;
  const hasAddresses = addresses.length > 0;

  // ✅ LOGIC MỚI: Hỗ trợ mở thẳng vào Form Edit
  const handleOpenModal = (
    mode: "list" | "form",
    addressToEdit?: SavedAddress
  ) => {
    setInitialMode(mode);
    setTargetEditAddress(addressToEdit || null);
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="w-full h-32 rounded-2xl border border-gray-100 bg-gray-50 animate-pulse" />
    );
  }

  return (
    <>
      <div className="w-full transition-all duration-300">
        {displayAddress ? (
          // === CARD ĐỊA CHỈ ĐANG CHỌN ===
          <div className="group relative bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-600" />

            <div className="flex flex-col md:flex-row">
              <div
                className="flex-1 p-5 pl-6 cursor-pointer"
                onClick={() => handleOpenModal("list")}
              >
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <h3 className="font-bold text-gray-900 text-lg leading-tight">
                    {displayAddress.recipientName}
                  </h3>
                  {displayAddress.isDefault && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide bg-blue-50 text-blue-700 border border-blue-100">
                      <Star className="w-3 h-3 mr-1 fill-blue-700" />
                      Mặc định
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-500 font-medium mb-3">
                  <Phone size={14} />
                  {displayAddress.phone}
                </div>

                <div className="flex items-start gap-2 text-gray-700 text-sm leading-relaxed bg-gray-50/80 p-3 rounded-lg border border-gray-100">
                  <MapPin size={16} className="text-blue-600 shrink-0 mt-0.5" />
                  <span>
                    {displayAddress.street}, {displayAddress.ward},{" "}
                    {displayAddress.district}, {displayAddress.city}
                  </span>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex flex-row md:flex-col items-center justify-center gap-2 p-4 bg-gray-50/50 border-t md:border-t-0 md:border-l border-gray-100">
                {/* Nút Sửa: Link thẳng tới Form Edit */}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenModal("form", displayAddress);
                  }}
                  className="flex-1 md:flex-none w-full bg-white hover:bg-blue-50 hover:text-blue-600 border-gray-200"
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Sửa
                </Button>

                {/* Nút Đổi: Link tới List */}
                {hasAddresses && addresses.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenModal("list")}
                    className="flex-1 md:flex-none w-full text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                  >
                    Đổi
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        ) : (
          // === EMPTY STATE ===
          <button
            type="button"
            onClick={() => handleOpenModal("form")}
            className="group w-full relative overflow-hidden rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50/30 p-8 text-center transition-all hover:border-blue-400 hover:bg-blue-50/30 hover:shadow-sm"
          >
            {/* (Giữ nguyên phần Empty State Animation từ lần trước) */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-blue-200 opacity-20 animate-ping duration-[2000ms]" />
                <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm border border-gray-100 group-hover:scale-110 transition-transform duration-300">
                  <Plus className="h-8 w-8 text-blue-600" />
                </div>
                <Navigation className="absolute -right-4 -top-2 w-5 h-5 text-gray-300 rotate-12 group-hover:text-blue-400 transition-all duration-500" />
                <MapPin className="absolute -left-4 -bottom-1 w-5 h-5 text-gray-300 -rotate-12 group-hover:text-red-400 transition-all duration-500" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                  Thêm địa chỉ mới
                </h3>
                <p className="text-sm text-gray-500 max-w-xs mx-auto">
                  Bạn chưa có địa chỉ nào. Thêm ngay để nhận hàng nhanh chóng
                  nhé!
                </p>
              </div>
            </div>
          </button>
        )}
      </div>

      <AddressManagementModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectAddress={(address) => {
          onSelectAddress(address);
          setIsModalOpen(false);
        }}
        initialMode={initialMode}
        initialEditAddress={targetEditAddress} // Truyền địa chỉ cần sửa (nếu có)
        currentAddress={currentAddress}
      />
    </>
  );
};
