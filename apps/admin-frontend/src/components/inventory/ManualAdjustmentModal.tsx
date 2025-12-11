// src/components/inventory/ManualAdjustmentModal.tsx
// ✅ SOLID: Single Responsibility - Manual adjustment form

import { useState, useEffect } from "react";
import { X, AlertCircle } from "lucide-react";
import { useVariantInventory } from "@/hooks/useInventoryManagement";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  variantId: string | null;
  onSubmit: (
    variantId: string,
    quantityChange: number,
    reason: string,
    notes?: string
  ) => Promise<void>;
  isSubmitting: boolean;
}

const ADJUSTMENT_REASONS = [
  "Physical count adjustment",
  "Damaged goods",
  "Lost inventory",
  "Found inventory",
  "Correction",
  "Other",
];

export function ManualAdjustmentModal({
  isOpen,
  onClose,
  variantId,
  onSubmit,
  isSubmitting,
}: Props) {
  const { variant, isLoading } = useVariantInventory(variantId);
  const [quantityChange, setQuantityChange] = useState<string>("");
  const [reason, setReason] = useState(ADJUSTMENT_REASONS[0]);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setQuantityChange("");
      setReason(ADJUSTMENT_REASONS[0]);
      setNotes("");
      setError("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const change = parseInt(quantityChange);
    if (isNaN(change) || change === 0) {
      setError("Vui lòng nhập số lượng thay đổi hợp lệ");
      return;
    }

    if (!variantId) return;

    try {
      await onSubmit(variantId, change, reason, notes || undefined);
      onClose();
    } catch (err) {
      // Error handled by hook
    }
  };

  const newQuantity = variant
    ? variant.inventory.onHand + (parseInt(quantityChange) || 0)
    : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Điều chỉnh tồn kho
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
            </div>
          ) : variant ? (
            <>
              {/* Variant Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="font-medium text-gray-900">
                  {variant.productName}
                </p>
                <p className="text-sm text-gray-600 mt-1">SKU: {variant.sku}</p>
                <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Tồn kho</p>
                    <p className="font-semibold text-gray-900">
                      {variant.inventory.onHand}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Đã đặt</p>
                    <p className="font-semibold text-gray-900">
                      {variant.inventory.reserved}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Khả dụng</p>
                    <p className="font-semibold text-gray-900">
                      {variant.inventory.available}
                    </p>
                  </div>
                </div>
              </div>

              {/* Quantity Change */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số lượng thay đổi *
                </label>
                <input
                  type="number"
                  value={quantityChange}
                  onChange={(e) => setQuantityChange(e.target.value)}
                  placeholder="Nhập số dương để tăng, số âm để giảm"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Ví dụ: +50 để thêm 50 units, -20 để giảm 20 units
                </p>
              </div>

              {/* Preview */}
              {quantityChange && !isNaN(parseInt(quantityChange)) && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-900">
                    Tồn kho mới:{" "}
                    <span className="font-semibold">
                      {variant.inventory.onHand} → {newQuantity}
                    </span>
                  </p>
                </div>
              )}

              {/* Reason */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lý do *
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                >
                  {ADJUSTMENT_REASONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ghi chú
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Thêm ghi chú chi tiết..."
                  rows={3}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Không tìm thấy variant
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isLoading || !variant}
              className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Đang xử lý..." : "Xác nhận"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
