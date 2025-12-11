// src/components/shipping/BulkShipmentModal.tsx
// ✅ Bulk Shipment Modal - Tạo nhiều vận đơn cùng lúc

import { useState, useEffect } from "react";
import { useShipping } from "@/hooks/useShipping";
import type { PackageDetails } from "@/services/admin.shipping.service";

interface BulkShipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  recipients: Array<{
    _id: string;
    name: string;
    phone: string;
    shipment?: { trackingNumber?: string };
  }>;
  onSuccess?: () => void;
}

export function BulkShipmentModal({
  isOpen,
  onClose,
  orderId,
  recipients,
  onSuccess,
}: BulkShipmentModalProps) {
  const { carriers, fetchCarriers, createBulkShipments, isLoading } =
    useShipping();

  const [selectedCarrier, setSelectedCarrier] = useState("");
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [packageDetails, setPackageDetails] = useState<PackageDetails>({
    weight: 500,
    dimensions: {
      length: 30,
      width: 20,
      height: 10,
    },
    value: 500000,
  });

  // Filter recipients without shipment
  const availableRecipients = recipients.filter(
    (r) => !r.shipment?.trackingNumber
  );

  useEffect(() => {
    if (isOpen) {
      fetchCarriers();
      // Select all available recipients by default
      setSelectedRecipients(availableRecipients.map((r) => r._id));
    }
  }, [isOpen]);

  const handleToggleRecipient = (recipientId: string) => {
    setSelectedRecipients((prev) =>
      prev.includes(recipientId)
        ? prev.filter((id) => id !== recipientId)
        : [...prev, recipientId]
    );
  };

  const handleSelectAll = () => {
    if (selectedRecipients.length === availableRecipients.length) {
      setSelectedRecipients([]);
    } else {
      setSelectedRecipients(availableRecipients.map((r) => r._id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCarrier || selectedRecipients.length === 0) {
      return;
    }

    try {
      await createBulkShipments({
        orderId,
        carrierId: selectedCarrier,
        recipientIds: selectedRecipients,
        packageDetails,
      });

      onSuccess?.();
      onClose();
    } catch (error) {
      // Error handled by hook
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Tạo Vận Đơn Hàng Loạt</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Carrier Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Đơn Vị Vận Chuyển *
              </label>
              <select
                value={selectedCarrier}
                onChange={(e) => setSelectedCarrier(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">-- Chọn carrier --</option>
                {carriers
                  .filter((c) => c.isActive)
                  .map((carrier) => (
                    <option key={carrier.id} value={carrier.id}>
                      {carrier.name}
                    </option>
                  ))}
              </select>
            </div>

            {/* Recipients Selection */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold">
                  Chọn Người Nhận ({selectedRecipients.length}/
                  {availableRecipients.length})
                </h3>
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  {selectedRecipients.length === availableRecipients.length
                    ? "Bỏ chọn tất cả"
                    : "Chọn tất cả"}
                </button>
              </div>

              <div className="border rounded-lg max-h-60 overflow-y-auto">
                {availableRecipients.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    Tất cả recipients đã có vận đơn
                  </div>
                ) : (
                  availableRecipients.map((recipient) => (
                    <label
                      key={recipient._id}
                      className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                    >
                      <input
                        type="checkbox"
                        checked={selectedRecipients.includes(recipient._id)}
                        onChange={() => handleToggleRecipient(recipient._id)}
                        className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium">{recipient.name}</p>
                        <p className="text-sm text-gray-600">
                          {recipient.phone}
                        </p>
                      </div>
                    </label>
                  ))
                )}
              </div>
            </div>

            {/* Default Package Details */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3">
                Thông Tin Kiện Hàng Mặc Định
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Áp dụng cho tất cả vận đơn
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Khối Lượng (gram)
                  </label>
                  <input
                    type="number"
                    value={packageDetails.weight}
                    onChange={(e) =>
                      setPackageDetails({
                        ...packageDetails,
                        weight: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giá Trị (VND)
                  </label>
                  <input
                    type="number"
                    value={packageDetails.value}
                    onChange={(e) =>
                      setPackageDetails({
                        ...packageDetails,
                        value: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kích Thước (cm)
                </label>
                <div className="grid grid-cols-3 gap-4">
                  <input
                    type="number"
                    placeholder="Dài"
                    value={packageDetails.dimensions.length}
                    onChange={(e) =>
                      setPackageDetails({
                        ...packageDetails,
                        dimensions: {
                          ...packageDetails.dimensions,
                          length: parseInt(e.target.value) || 0,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                  />
                  <input
                    type="number"
                    placeholder="Rộng"
                    value={packageDetails.dimensions.width}
                    onChange={(e) =>
                      setPackageDetails({
                        ...packageDetails,
                        dimensions: {
                          ...packageDetails.dimensions,
                          width: parseInt(e.target.value) || 0,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                  />
                  <input
                    type="number"
                    placeholder="Cao"
                    value={packageDetails.dimensions.height}
                    onChange={(e) =>
                      setPackageDetails({
                        ...packageDetails,
                        dimensions: {
                          ...packageDetails.dimensions,
                          height: parseInt(e.target.value) || 0,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                  />
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-700">
                Sẽ tạo{" "}
                <span className="font-bold">{selectedRecipients.length}</span>{" "}
                vận đơn với carrier{" "}
                <span className="font-bold">
                  {carriers.find((c) => c.id === selectedCarrier)?.name ||
                    "..."}
                </span>
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                disabled={isLoading}
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                disabled={
                  isLoading ||
                  !selectedCarrier ||
                  selectedRecipients.length === 0
                }
              >
                {isLoading
                  ? "Đang tạo..."
                  : `Tạo ${selectedRecipients.length} Vận Đơn`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
