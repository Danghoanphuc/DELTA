// apps/customer-frontend/src/features/customer/components/AddressForm/index.tsx
import { useState } from "react";
import { MapPin } from "lucide-react";
import { useAddressForm } from "../../hooks/useAddressForm"; // Hook cũ vẫn dùng tốt cho logic
import { GPSLocationButton } from "./GPSLocationButton";
import { PersonalInfoFields } from "./PersonalInfoFields";
import { AddressEditModal } from "../AddressEditModal";
import { AddressTriggerBox } from "./AddressTriggerBox";

export const AddressForm = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Chúng ta vẫn cần hook này ở đây để handle GPS logic
  // (nếu muốn giữ nút GPS ở ngoài Modal)
  const {
    isDetecting,
    isGPSFilled,
    handleGPSDetect,
    isFieldValid, // Helper để hiện xanh/đỏ cho Personal Info
  } = useAddressForm();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* 1. THÔNG TIN CÁ NHÂN (Vẫn giữ ở ngoài cho dễ điền) */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-600" />
          Thông tin người nhận
        </h3>

        {/* Nút GPS: Có thể để ở đây hoặc đưa vào trong Modal. 
             Để ở đây tiện cho user lười nhập tay */}
        <GPSLocationButton
          isDetecting={isDetecting}
          isGPSFilled={isGPSFilled}
          onDetect={handleGPSDetect}
        />
      </div>

      <div className="bg-white p-1 rounded-2xl space-y-5">
        <PersonalInfoFields isFieldValid={isFieldValid} />
      </div>

      {/* 2. ĐỊA CHỈ GIAO HÀNG (Dùng Modal) */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            Chi tiết địa chỉ
          </h3>
        </div>

        <AddressTriggerBox onClick={() => setIsModalOpen(true)} />

        <AddressEditModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </div>

      {/* Hidden Country Field */}
      <input type="hidden" name="shippingAddress.country" value="Việt Nam" />
    </div>
  );
};
