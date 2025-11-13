// src/components/printer/SettingsHeader.tsx (COMPONENT MỚI)
import { Settings } from "lucide-react";

export function SettingsHeader() {
  return (
    <div className="mb-8 flex items-center gap-2">
      <Settings size={24} className="text-orange-600" />
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Cài đặt Xưởng In
        </h1>
        <p className="text-gray-600">
          Quản lý thông tin và cấu hình xưởng in của bạn (Giao diện tạm thời)
        </p>
      </div>
    </div>
  );
}
