// src/components/inventory/RecordPurchaseModal.tsx
// ✅ SOLID: Single Responsibility - Record purchase form

import { useState, useEffect } from "react";
import { X, AlertCircle } from "lucide-react";
import { useVariantInventory } from "@/hooks/useInventoryManagement";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  variantId: string | null;
  onSubmit: (
    variantId: string,
    quantity: number,
    unitCost: number,
    purchaseOrderNumber?: string,
    notes?: string
  ) => Promise<void>;
  isSubmitting: boolean;
}

export function RecordPurchaseModal({
  isOpen,
  onClose,
  variantId,
  onSubmit,
  isSubmitting,
}: Props) {
  const { variant, isLoading } = useVariantInventory(variantId);
  const [quantity, setQuantity] = useState<string>("");
  const [unitCost, setUnitCost] = useState<string>("");
  const [purchaseOrderNumber, setPurchaseOrderNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen && variant) {
      setQuantity("");
      setUnitCost(variant.cost.toString());
      setPurchaseOrderNumber("");
      setNotes("");
      setError("");
    }
  }, [isOpen, variant]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const qty = parseInt(quantity);
    const cost = parseFloat(unitCost);

    if (isNaN(qty) || qty <= 0) {
      setError("Vui lòng nhập số lượng hợp lệ");
      return;
    }

    if (isNaN(cost) || cost < 0) {
      setError("Vui lòng nhập giá nhập hợp lệ");
      return;
    }

    if (!variantId) return;

    try {
      await onSubmit(
        variantId,
        qty,
        cost,
        purchaseOrderNumber || undefined,
        notes || undefined
      );
      onClose();
    } catch (err) {
      // Error handled by hook
    }
  };

  const totalCost = (parseInt(quantity) || 0) * (parseFloat(unitCost) || 0);
  const newQuantity = variant
    ? variant.inventory.onHand + (parseInt(quantity) || 0)
    : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Ghi nhận nhập hàng
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
                <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Tồn kho hiện tại</p>
                    <p className="font-semibold text-gray-900">
                      {variant.inventory.onHand} units
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Giá vốn hiện tại</p>
                    <p className="font-semibold text-gray-900">
                      {variant.cost.toLocaleString()} VNĐ
                    </p>
                  </div>
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số lượng nhập *
                </label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="Nhập số lượng"
                  min="1"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              {/* Unit Cost */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giá nhập (VNĐ/unit) *
                </label>
                <input
                  type="number"
                  value={unitCost}
                  onChange={(e) => setUnitCost(e.target.value)}
                  placeholder="Nhập giá nhập"
                  min="0"
                  step="1000"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              {/* Preview */}
              {quantity && unitCost && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-900">Tồn kho mới:</span>
                    <span className="font-semibold text-blue-900">
                      {variant.inventory.onHand} → {newQuantity} units
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-900">Tổng giá trị:</span>
                    <span className="font-semibold text-blue-900">
                      {totalCost.toLocaleString()} VNĐ
                    </span>
                  </div>
                </div>
              )}

              {/* Purchase Order Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số PO (tùy chọn)
                </label>
                <input
                  type="text"
                  value={purchaseOrderNumber}
                  onChange={(e) => setPurchaseOrderNumber(e.target.value)}
                  placeholder="PO-2024-001"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ghi chú
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Thêm ghi chú về đợt nhập hàng..."
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
              className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Đang xử lý..." : "Xác nhận nhập hàng"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
