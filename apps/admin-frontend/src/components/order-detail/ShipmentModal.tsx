// src/components/order-detail/ShipmentModal.tsx
// ✅ SOLID: Single Responsibility - Modal for shipping

import { X, Truck } from "lucide-react";

interface ShipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCount: number;
  carriers: Array<{ id: string; name: string; available: boolean }>;
  carrier: string;
  trackingNumber: string;
  onCarrierChange: (carrier: string) => void;
  onTrackingChange: (tracking: string) => void;
  onSubmit: () => void;
  isUpdating: boolean;
}

export function ShipmentModal({
  isOpen,
  onClose,
  selectedCount,
  carriers,
  carrier,
  trackingNumber,
  onCarrierChange,
  onTrackingChange,
  onSubmit,
  isUpdating,
}: ShipmentModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold">Gửi hàng</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">
              Đang gửi hàng cho {selectedCount} người nhận
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Đơn vị vận chuyển
            </label>
            <select
              value={carrier}
              onChange={(e) => onCarrierChange(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
            >
              {carriers.map((c) => (
                <option key={c.id} value={c.id} disabled={!c.available}>
                  {c.name} {!c.available && "(Không khả dụng)"}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mã vận đơn
            </label>
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => onTrackingChange(e.target.value)}
              placeholder="Nhập mã vận đơn"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Hủy
          </button>
          <button
            onClick={onSubmit}
            disabled={!trackingNumber || isUpdating}
            className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Truck className="w-4 h-4" />
            {isUpdating ? "Đang xử lý..." : "Xác nhận gửi"}
          </button>
        </div>
      </div>
    </div>
  );
}
