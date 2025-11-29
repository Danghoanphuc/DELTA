import { useState, useEffect } from "react";
import {
  MapPin,
  Loader2,
  Check,
  User,
  Phone,
  Navigation,
  Building2,
  Map,
  Home,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { toast } from "@/shared/utils/toast";
import { useGPSLocation } from "../../hooks/useGPSLocation";
import { useSavedAddresses } from "../../hooks/useSavedAddresses";
import { LocationMap } from "../LocationMap";
import { cn } from "@/shared/lib/utils";
import type { SavedAddress } from "@/types/address";

interface AddressFormWithGPSProps {
  address?: SavedAddress | null;
  onSuccess: (address: SavedAddress) => void;
  onCancel: () => void;
}

export const AddressFormWithGPS = ({
  address,
  onSuccess,
  onCancel,
}: AddressFormWithGPSProps) => {
  const { addAddress, updateAddress } = useSavedAddresses();
  const { detectLocation, detectedLocation, isDetecting } = useGPSLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    recipientName: "",
    phone: "",
    street: "",
    ward: "",
    district: "",
    city: "",
    isDefault: false,
  });

  useEffect(() => {
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
    }
  }, [address]);

  useEffect(() => {
    if (detectedLocation) {
      setFormData((prev) => ({
        ...prev,
        street: detectedLocation.street || prev.street,
        ward: detectedLocation.ward || prev.ward,
        district: detectedLocation.district || prev.district,
        city: detectedLocation.city || prev.city,
      }));
    }
  }, [detectedLocation]);

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.recipientName.trim())
      return toast.error("Thiếu tên người nhận");
    if (!formData.phone.trim()) return toast.error("Thiếu số điện thoại");
    if (!formData.street.trim()) return toast.error("Thiếu địa chỉ chi tiết");
    if (!formData.city.trim()) return toast.error("Thiếu Tỉnh/Thành phố");

    setIsSubmitting(true);
    try {
      let savedAddress: SavedAddress;
      if (address) savedAddress = await updateAddress(address._id, formData);
      else savedAddress = await addAddress(formData);
      onSuccess(savedAddress);
    } catch (error) {
      // Error handled in hook
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* 1. GPS BANNER (Compact) */}
      <div className="relative overflow-hidden rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 p-3.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-white rounded-lg text-blue-600 shadow-sm border border-blue-50">
            <Navigation size={16} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-xs uppercase tracking-wide">
              Định vị tự động
            </h3>
            <p className="text-[11px] text-gray-500 hidden sm:block">
              Điền nhanh địa chỉ từ vị trí hiện tại.
            </p>
          </div>
        </div>

        <Button
          type="button"
          onClick={() => detectLocation()}
          disabled={isDetecting}
          size="sm"
          className={cn(
            "h-8 rounded-lg font-medium shadow-sm text-xs px-3 transition-all",
            detectedLocation
              ? "bg-green-600 hover:bg-green-700 text-white border-transparent"
              : "bg-white text-blue-700 hover:bg-blue-50 border border-blue-200"
          )}
        >
          {isDetecting ? (
            <>
              <Loader2 className="w-3 h-3 mr-1.5 animate-spin" /> Đang dò...
            </>
          ) : detectedLocation ? (
            <>
              <Check className="w-3 h-3 mr-1.5" /> Đã xong
            </>
          ) : (
            "Bật GPS"
          )}
        </Button>
      </div>

      {/* Map Preview (Chỉ hiện khi có GPS) */}
      {detectedLocation && (
        <div className="h-28 w-full rounded-xl overflow-hidden border border-blue-200 shadow-inner animate-in zoom-in-95">
          <LocationMap
            lat={detectedLocation.lat}
            lng={detectedLocation.lng}
            address={detectedLocation.fullAddress}
            className="w-full h-full"
          />
        </div>
      )}

      {/* 2. THÔNG TIN LIÊN HỆ */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
          <User size={14} className="text-gray-400" />
          <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
            Thông tin liên hệ
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-gray-600">
              Họ và tên <span className="text-red-500">*</span>
            </Label>
            <Input
              value={formData.recipientName}
              onChange={(e) => handleChange("recipientName", e.target.value)}
              placeholder="VD: Nguyễn Văn A"
              className="h-10 bg-gray-50/50 border-gray-200 focus:bg-white focus:border-blue-500 rounded-lg text-sm transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-gray-600">
              Số điện thoại <span className="text-red-500">*</span>
            </Label>
            <Input
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              placeholder="VD: 0901234567"
              className="h-10 bg-gray-50/50 border-gray-200 focus:bg-white focus:border-blue-500 rounded-lg text-sm transition-all"
            />
          </div>
        </div>
      </div>

      {/* 3. ĐỊA CHỈ GIAO HÀNG */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
          <MapPin size={14} className="text-gray-400" />
          <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
            Địa chỉ nhận hàng
          </h4>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-gray-600">
            Địa chỉ chi tiết <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Home className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              value={formData.street}
              onChange={(e) => handleChange("street", e.target.value)}
              placeholder="Số nhà, tên đường..."
              className="pl-9 h-10 bg-gray-50/50 border-gray-200 focus:bg-white focus:border-blue-500 rounded-lg text-sm transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-gray-600">
              Phường / Xã
            </Label>
            <Input
              value={formData.ward}
              onChange={(e) => handleChange("ward", e.target.value)}
              className="h-10 text-sm bg-gray-50/50 border-gray-200 focus:bg-white focus:border-blue-500 rounded-lg"
              placeholder="Nhập phường..."
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-gray-600">
              Quận / Huyện
            </Label>
            <Input
              value={formData.district}
              onChange={(e) => handleChange("district", e.target.value)}
              className="h-10 text-sm bg-gray-50/50 border-gray-200 focus:bg-white focus:border-blue-500 rounded-lg"
              placeholder="Nhập quận..."
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-blue-700">
              Tỉnh / Thành phố <span className="text-red-500">*</span>
            </Label>
            <Input
              value={formData.city}
              onChange={(e) => handleChange("city", e.target.value)}
              className="h-10 text-sm bg-blue-50/30 border-blue-100 focus:bg-white focus:border-blue-500 text-blue-900 font-medium rounded-lg"
              placeholder="Nhập tỉnh..."
            />
          </div>
        </div>
      </div>

      {/* Checkbox Default */}
      <div className="flex items-center space-x-2.5 p-3 bg-gray-50/50 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
        <Checkbox
          id="isDefault"
          checked={formData.isDefault}
          onCheckedChange={(checked) =>
            handleChange("isDefault", checked as boolean)
          }
          className="border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 rounded"
        />
        <Label
          htmlFor="isDefault"
          className="cursor-pointer text-xs font-medium text-gray-700 select-none"
        >
          Đặt làm địa chỉ mặc định
        </Label>
      </div>

      {/* FOOTER ACTIONS */}
      <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-100">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="col-span-1 h-10 rounded-lg border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-100"
          disabled={isSubmitting}
        >
          Hủy
        </Button>
        <Button
          type="submit"
          className="col-span-2 h-10 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-md shadow-blue-500/20 active:scale-[0.98] transition-all"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> Đang lưu...
            </>
          ) : address ? (
            "Cập nhật thay đổi"
          ) : (
            "Lưu địa chỉ mới"
          )}
        </Button>
      </div>
    </form>
  );
};
