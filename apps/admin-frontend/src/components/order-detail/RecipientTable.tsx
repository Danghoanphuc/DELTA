// src/components/order-detail/RecipientTable.tsx
// ✅ SOLID: Single Responsibility - Display recipients with selection

import { MapPin, Truck, CheckCircle } from "lucide-react";

interface RecipientTableProps {
  recipients: any[];
  selectedRecipients: string[];
  onToggleRecipient: (recipientId: string) => void;
  onToggleAll: () => void;
  onViewTracking: (recipientId: string) => void;
}

const SHIPMENT_STATUS_CONFIG: Record<string, { label: string; color: string }> =
  {
    pending: { label: "Chờ xử lý", color: "bg-gray-100 text-gray-700" },
    processing: { label: "Đang xử lý", color: "bg-blue-100 text-blue-700" },
    shipped: { label: "Đã gửi", color: "bg-cyan-100 text-cyan-700" },
    in_transit: {
      label: "Đang vận chuyển",
      color: "bg-indigo-100 text-indigo-700",
    },
    out_for_delivery: {
      label: "Đang giao",
      color: "bg-orange-100 text-orange-700",
    },
    delivered: { label: "Đã giao", color: "bg-green-100 text-green-700" },
    failed: { label: "Thất bại", color: "bg-red-100 text-red-700" },
  };

export function RecipientTable({
  recipients,
  selectedRecipients,
  onToggleRecipient,
  onToggleAll,
  onViewTracking,
}: RecipientTableProps) {
  const selectableRecipients = recipients.filter(
    (s) => s.status !== "delivered" && s.status !== "shipped"
  );

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-900">
          Danh sách người nhận ({recipients.length})
        </h2>
        {selectableRecipients.length > 0 && (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={
                selectedRecipients.length === selectableRecipients.length
              }
              onChange={onToggleAll}
              className="w-4 h-4 text-orange-500 rounded"
            />
            <span className="text-sm text-gray-600">Chọn tất cả</span>
          </label>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                Chọn
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                Người nhận
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                Địa chỉ
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                Trạng thái
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                Tracking
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {recipients.map((shipment, index) => {
              // ✅ FIX: Đọc recipientInfo thay vì recipientData
              const recipient = shipment.recipientInfo || {};
              const statusConfig =
                SHIPMENT_STATUS_CONFIG[shipment.status] ||
                SHIPMENT_STATUS_CONFIG.pending;
              const isSelectable =
                shipment.status !== "delivered" &&
                shipment.status !== "shipped";

              // Use _id or index as key
              const shipmentKey = shipment._id || `shipment-${index}`;

              return (
                <tr key={shipmentKey} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    {isSelectable && (
                      <input
                        type="checkbox"
                        checked={selectedRecipients.includes(shipmentKey)}
                        onChange={() => onToggleRecipient(shipmentKey)}
                        className="w-4 h-4 text-orange-500 rounded"
                      />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-900">
                        {recipient.firstName} {recipient.lastName}
                      </p>
                      <p className="text-sm text-gray-500">{recipient.email}</p>
                      {recipient.phone && (
                        <p className="text-sm text-gray-500">
                          {recipient.phone}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-600">
                        {shipment.shippingAddress?.street ||
                          shipment.shippingAddress?.formatted ||
                          "Chưa có địa chỉ"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}
                    >
                      {statusConfig.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {shipment.trackingNumber ? (
                      <button
                        onClick={() => onViewTracking(shipmentKey)}
                        className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                      >
                        <Truck className="w-4 h-4" />
                        {shipment.trackingNumber}
                      </button>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
