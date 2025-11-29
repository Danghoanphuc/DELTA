import { useState, useEffect } from "react";
import {
  Plus,
  Check,
  Edit2,
  Trash2,
  Star,
  MapPin,
  Phone,
  BadgeCheck,
  X,
  User,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { ResponsiveModal } from "@/shared/components/ui/responsive-modal";
import { cn } from "@/shared/lib/utils";
import { useSavedAddresses } from "../../hooks/useSavedAddresses";
import { AddressFormWithGPS } from "./AddressFormWithGPS";
import type { SavedAddress } from "@/types/address";
import { ScrollArea } from "@/shared/components/ui/scroll-area";

interface AddressManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAddress: (address: SavedAddress) => void;
  initialMode?: "list" | "form";
  initialEditAddress?: SavedAddress | null;
  currentAddress?: { street?: string; city?: string };
}

export const AddressManagementModal = ({
  isOpen,
  onClose,
  onSelectAddress,
  initialMode = "list",
  initialEditAddress = null,
  currentAddress,
}: AddressManagementModalProps) => {
  const { addresses, isLoading, deleteAddress, setAsDefault } =
    useSavedAddresses();
  const [mode, setMode] = useState<"list" | "form">("list");
  const [editingAddress, setEditingAddress] = useState<SavedAddress | null>(
    null
  );

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setEditingAddress(initialEditAddress);
    }
  }, [isOpen, initialMode, initialEditAddress]);

  const selectedAddress = addresses.find(
    (addr) =>
      addr.street === currentAddress?.street &&
      addr.city === currentAddress?.city
  );

  const handleEdit = (address: SavedAddress, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingAddress(address);
    setMode("form");
  };

  const handleDelete = async (addressId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Bạn có chắc muốn xóa địa chỉ này?")) {
      await deleteAddress(addressId);
    }
  };

  const formatAddressString = (addr: SavedAddress) => {
    const parts = [addr.street, addr.ward, addr.district, addr.city];
    return parts
      .filter((part) => part && part.trim().length > 0 && part !== "undefined")
      .join(", ");
  };

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onOpenChange={(open) => !open && onClose()}
      title=""
      className={cn(
        // ✅ FIX QUAN TRỌNG: Dùng bg-gray-100 (Solid) thay vì bg-gray-50/50
        // Giúp che hoàn toàn nội dung phía sau và làm nổi bật Card trắng
        "bg-gray-100 p-0 gap-0 overflow-hidden flex flex-col",
        mode === "list"
          ? "h-[85vh] sm:h-auto sm:max-w-[600px]"
          : "h-[90vh] sm:h-auto sm:max-w-[700px]"
      )}
    >
      {/* CUSTOM HEADER (Nền trắng đặc) */}
      <div className="bg-white px-5 py-4 border-b border-gray-200 flex items-center justify-between shrink-0 z-20 relative shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            {mode === "list"
              ? "Sổ địa chỉ"
              : editingAddress
              ? "Cập nhật địa chỉ"
              : "Thêm địa chỉ mới"}
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {mode === "list"
              ? "Chọn địa chỉ nhận hàng"
              : "Điền thông tin chi tiết"}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8 rounded-full bg-gray-50 text-gray-500 hover:bg-gray-200"
        >
          <X size={18} />
        </Button>
      </div>

      {mode === "list" ? (
        // === VIEW 1: LIST ===
        <div className="flex flex-col flex-1 min-h-0 relative">
          {isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 p-12 text-gray-500">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-medium">Đang tải dữ liệu...</p>
            </div>
          ) : addresses.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center m-4 bg-white rounded-2xl border border-dashed border-gray-300 shadow-sm">
              <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mb-3">
                <MapPin className="w-7 h-7 text-blue-500" />
              </div>
              <h3 className="text-gray-900 font-bold text-base">
                Chưa có địa chỉ nào
              </h3>
              <p className="text-gray-500 text-xs mb-5 mt-1">
                Lưu địa chỉ để đặt hàng nhanh hơn.
              </p>
              <Button
                onClick={() => setMode("form")}
                className="rounded-full px-6 bg-blue-600 text-white font-semibold shadow-lg shadow-blue-200 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" /> Thêm địa chỉ mới
              </Button>
            </div>
          ) : (
            <>
              {/* ScrollArea giữ nguyên */}
              <ScrollArea className="flex-1 w-full">
                <div className="space-y-3 p-4 pb-32">
                  {addresses.map((address) => {
                    const isSelected = selectedAddress?._id === address._id;
                    return (
                      <div
                        key={address._id}
                        onClick={() => {
                          onSelectAddress(address);
                          onClose();
                        }}
                        className={cn(
                          // ✅ Card nền trắng đặc (bg-white) để nổi trên nền xám
                          "relative overflow-hidden rounded-xl border-2 transition-all cursor-pointer bg-white shadow-sm",
                          isSelected
                            ? "border-blue-600 shadow-md ring-0"
                            : "border-transparent hover:border-blue-200"
                        )}
                      >
                        {/* Selected Indicator */}
                        {isSelected && (
                          <div className="absolute top-0 right-0 bg-blue-600 text-white pl-2 pb-1.5 pt-0.5 pr-0.5 rounded-bl-xl shadow-sm z-10">
                            <Check size={14} strokeWidth={3} />
                          </div>
                        )}

                        <div className="flex flex-col">
                          {/* BODY */}
                          <div className="p-4 flex gap-3 items-start">
                            <div
                              className={cn(
                                "w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-xs font-bold border mt-0.5",
                                isSelected
                                  ? "bg-blue-50 text-blue-700 border-blue-200"
                                  : "bg-gray-100 text-gray-500 border-gray-200"
                              )}
                            >
                              {address.recipientName.charAt(0).toUpperCase()}
                            </div>

                            <div className="flex-1 min-w-0">
                              {/* Tên & Badge */}
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <h4 className="font-bold text-gray-900 text-sm leading-tight">
                                  {address.recipientName}
                                </h4>
                                {address.isDefault && (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide bg-blue-600 text-white shadow-sm">
                                    Mặc định
                                  </span>
                                )}
                              </div>

                              <div className="space-y-1">
                                {address.phone && (
                                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                    <Phone size={12} className="shrink-0" />
                                    <span className="font-mono pt-0.5">
                                      {address.phone}
                                    </span>
                                  </div>
                                )}
                                <div className="flex items-start gap-1.5 text-xs text-gray-700 bg-gray-50 p-2 rounded-lg border border-gray-100 leading-relaxed">
                                  <MapPin
                                    size={12}
                                    className="text-blue-500 mt-0.5 shrink-0"
                                  />
                                  <span>{formatAddressString(address)}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* FOOTER ACTIONS */}
                          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border-t border-gray-100">
                            <div className="flex-1">
                              {!address.isDefault && (
                                <button
                                  className="text-[11px] font-medium text-gray-500 hover:text-blue-600 flex items-center gap-1 px-1 py-1"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setAsDefault(address._id);
                                  }}
                                >
                                  <Star size={12} /> Đặt mặc định
                                </button>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 px-3 text-xs bg-white border-gray-200 text-gray-700 hover:text-blue-600 hover:border-blue-300 shadow-sm"
                                onClick={(e) => handleEdit(address, e)}
                              >
                                <Edit2 size={12} className="mr-1.5" /> Sửa
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 px-3 text-xs bg-white border-gray-200 text-gray-700 hover:text-red-600 hover:border-red-300 shadow-sm"
                                onClick={(e) => handleDelete(address._id, e)}
                              >
                                <Trash2 size={12} className="mr-1.5" /> Xóa
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>

              {/* STICKY BOTTOM BUTTON (Nền trắng đặc) */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 z-30 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                <Button
                  size="lg"
                  className="w-full h-11 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 active:scale-[0.98] transition-transform"
                  onClick={() => {
                    setEditingAddress(null);
                    setMode("form");
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" /> Thêm địa chỉ mới
                </Button>
              </div>
            </>
          )}
        </div>
      ) : (
        // === VIEW 2: FORM ===
        <div className="flex-1 flex flex-col min-h-0 bg-white">
          <ScrollArea className="flex-1">
            <div className="p-5 pb-8">
              <AddressFormWithGPS
                address={editingAddress}
                onSuccess={(addr) => {
                  onSelectAddress(addr);
                  onClose();
                }}
                onCancel={() => {
                  if (addresses.length > 0) setMode("list");
                  else onClose();
                }}
              />
            </div>
          </ScrollArea>
        </div>
      )}
    </ResponsiveModal>
  );
};
