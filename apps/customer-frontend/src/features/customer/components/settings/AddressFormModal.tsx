import { useState, useEffect } from "react";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { toast } from "@/shared/utils/toast";
import { User, Phone, MapPin } from "lucide-react";
import { useSavedAddresses } from "../../hooks/useSavedAddresses";
import { SmartLocationInput } from "../AddressForm/SmartLocationInput";
import { ResponsiveModal } from "@/shared/components/ui/responsive-modal"; // Wrapper mới
import type { SavedAddress } from "@/types/address";
import { cn } from "@/shared/lib/utils";

interface AddressFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  address?: SavedAddress | null;
}

export const AddressFormModal = ({
  isOpen,
  onClose,
  address,
}: AddressFormModalProps) => {
  const { addAddress, updateAddress } = useSavedAddresses();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State kiểm soát chế độ hiển thị
  const [isSearching, setIsSearching] = useState(false);

  const [formData, setFormData] = useState({
    recipientName: "",
    phone: "",
    street: "",
    ward: "",
    district: "",
    city: "",
    isDefault: false,
  });

  // Load data & Reset state
  useEffect(() => {
    if (isOpen) {
      setIsSearching(false); // Reset search mode
      if (address) {
        setFormData({
          recipientName: address.recipientName,
          phone: address.phone,
          street: address.street,
          ward: address.ward,
          district: address.district,
          city: address.city,
          isDefault: address.isDefault,
        });
      } else {
        setFormData({
          recipientName: "",
          phone: "",
          street: "",
          ward: "",
          district: "",
          city: "",
          isDefault: false,
        });
      }
    }
  }, [address, isOpen]);

  const handleGoongSelect = (detail: any) => {
    setFormData((prev) => ({
      ...prev,
      street: detail.street || prev.street,
      ward: detail.ward || "",
      district: detail.district || "",
      city: detail.province || detail.city || "",
    }));
    setIsSearching(false); // Chọn xong -> Tắt chế độ search -> Hiện form
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validate nhanh
    if (!formData.recipientName || !formData.phone || !formData.city) {
      return toast.error("Vui lòng điền đủ thông tin");
    }

    setIsSubmitting(true);
    try {
      if (address) await updateAddress(address._id, formData);
      else await addAddress(formData);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onOpenChange={(open) => !open && onClose()}
      title={address ? "Cập nhật địa chỉ" : "Thêm địa chỉ mới"}
    >
      <div className="space-y-6 mt-2">
        {/* KHU VỰC TÌM KIẾM - Luôn hiển thị ở trên cùng */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-gray-700">
            Tìm địa chỉ (Goong Maps)
          </Label>
          <SmartLocationInput
            onSelect={handleGoongSelect}
            onSearchStateChange={setIsSearching}
            defaultValue={
              address
                ? `${address.street}, ${address.ward}, ${address.district}, ${address.city}`
                : ""
            }
          />
        </div>

        {/* LOGIC ẨN HIỆN THÔNG MINH:
            Nếu đang Search (isSearching = true) -> Ẩn toàn bộ Form bên dưới đi.
            Giúp giao diện không bị dài dòng, không bị che khuất bởi bàn phím, tập trung hoàn toàn vào kết quả tìm kiếm.
        */}
        <div
          className={cn(
            "space-y-5 transition-all duration-300",
            isSearching
              ? "opacity-30 pointer-events-none hidden"
              : "opacity-100 block"
          )}
        >
          {/* THÔNG TIN LIÊN HỆ */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-500">Tên người nhận</Label>
              <div className="relative">
                <User
                  size={14}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <Input
                  className="pl-8 h-10 bg-gray-50 border-transparent focus:bg-white"
                  placeholder="Tên"
                  value={formData.recipientName}
                  onChange={(e) =>
                    setFormData({ ...formData, recipientName: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-500">SĐT</Label>
              <div className="relative">
                <Phone
                  size={14}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <Input
                  className="pl-8 h-10 bg-gray-50 border-transparent focus:bg-white"
                  placeholder="SĐT"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          {/* CHI TIẾT ĐỊA CHỈ (Auto-fill) */}
          <div className="space-y-3 pt-2 border-t border-dashed border-gray-100">
            <div className="flex items-center gap-2 mb-1">
              <MapPin size={14} className="text-blue-600" />
              <span className="text-sm font-semibold text-gray-900">
                Chi tiết (Tự động điền)
              </span>
            </div>

            <Input
              placeholder="Số nhà, tên đường"
              className="bg-white"
              value={formData.street}
              onChange={(e) =>
                setFormData({ ...formData, street: e.target.value })
              }
            />

            <div className="grid grid-cols-3 gap-2">
              <Input
                placeholder="Phường/Xã"
                className="text-xs px-2"
                value={formData.ward}
                onChange={(e) =>
                  setFormData({ ...formData, ward: e.target.value })
                }
              />
              <Input
                placeholder="Quận/Huyện"
                className="text-xs px-2"
                value={formData.district}
                onChange={(e) =>
                  setFormData({ ...formData, district: e.target.value })
                }
              />
              <Input
                placeholder="Tỉnh/Thành"
                className="text-xs px-2 font-medium text-blue-700 bg-blue-50 border-blue-100"
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isDefault"
              checked={formData.isDefault}
              onCheckedChange={(c) =>
                setFormData({ ...formData, isDefault: c as boolean })
              }
            />
            <Label htmlFor="isDefault" className="cursor-pointer text-sm">
              Đặt làm địa chỉ mặc định
            </Label>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? "Đang lưu..." : "Lưu Địa Chỉ"}
          </Button>
        </div>
      </div>
    </ResponsiveModal>
  );
};
