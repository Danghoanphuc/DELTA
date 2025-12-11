// src/components/shipping/CreateShipmentModal.tsx
// ✅ Create Shipment Modal - Form để tạo vận đơn cho recipient

import { useState, useEffect } from "react";
import { useShipping } from "@/hooks/useShipping";
import type { PackageDetails } from "@/services/admin.shipping.service";

interface CreateShipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  recipient: {
    _id: string;
    name: string;
    phone: string;
    address: {
      fullAddress: string;
      district?: string;
      city?: string;
    };
  };
  onSuccess?: () => void;
}

export function CreateShipmentModal({
  isOpen,
  onClose,
  orderId,
  recipient,
  onSuccess,
}: CreateShipmentModalProps) {
  const { carriers, fetchCarriers, createShipment, calculateFee, isLoading } =
    useShipping();

  const [selectedCarrier, setSelectedCarrier] = useState("");
  const [packageDetails, setPackageDetails] = useState<PackageDetails>({
    weight: 500,
    dimensions: {
      length: 30,
      width: 20,
      height: 10,
    },
    value: 500000,
    notes: "",
  });
  const [estimatedFee, setEstimatedFee] = useState<{
    fee: number;
    estimatedDays: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchCarriers();
    }
  }, [isOpen, fetchCarriers]);

  // Calculate fee when carrier or weight changes
  useEffect(() => {
    if (selectedCarrier && recipient.address.district) {
      calculateFee(
        selectedCarrier,
        recipient.address.district,
        packageDetails.weight
      )
        .then(setEstimatedFee)
        .catch(() => setEstimatedFee(null));
    }
  }, [selectedCarrier, packageDetails.weight, recipient.address.district]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCarrier) {
      return;
    }

    try {
      await createShipment({
        orderId,
        recipientId: recipient._id,
        carrierId: selectedCarrier,
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
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Tạo Vận Đơn</h2>
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

          {/* Recipient Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">Thông Tin Người Nhận</h3>
            <p className="text-sm">
              <span className="font-medium">Tên:</span> {recipient.name}
            </p>
            <p className="text-sm">
              <span className="font-medium">SĐT:</span> {recipient.phone}
            </p>
            <p className="text-sm">
              <span className="font-medium">Địa chỉ:</span>{" "}
              {recipient.address.fullAddress}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Carrier Selection */}
            <div className="mb-4">
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

            {/* Package Details */}
            <div className="mb-4">
              <h3 className="font-semibold mb-3">Thông Tin Kiện Hàng</h3>

              <div className="grid grid-cols-2 gap-4">
                {/* Weight */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Khối Lượng (gram) *
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
                    required
                  />
                </div>

                {/* Value */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giá Trị (VND) *
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
                    required
                  />
                </div>
              </div>

              {/* Dimensions */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kích Thước (cm)
                </label>
                <div className="grid grid-cols-3 gap-4">
                  <div>
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
                  </div>
                  <div>
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
                  </div>
                  <div>
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

              {/* Notes */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ghi Chú
                </label>
                <textarea
                  value={packageDetails.notes}
                  onChange={(e) =>
                    setPackageDetails({
                      ...packageDetails,
                      notes: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="Ghi chú cho đơn vị vận chuyển..."
                />
              </div>
            </div>

            {/* Estimated Fee */}
            {estimatedFee && (
              <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Phí Vận Chuyển Ước Tính:</span>
                  <span className="text-lg font-bold text-blue-600">
                    {estimatedFee.fee.toLocaleString("vi-VN")} đ
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Thời gian dự kiến: {estimatedFee.estimatedDays} ngày
                </p>
              </div>
            )}

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
                disabled={isLoading || !selectedCarrier}
              >
                {isLoading ? "Đang tạo..." : "Tạo Vận Đơn"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
