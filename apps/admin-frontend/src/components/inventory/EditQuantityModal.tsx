// src/components/inventory/EditQuantityModal.tsx
// ✅ SOLID: Single Responsibility - Modal for editing inventory quantity

import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { InventoryItem } from "@/hooks/useInventory";

interface EditQuantityModalProps {
  item: InventoryItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    itemId: string,
    data: { quantity: number; operation: "add" | "subtract" | "set" }
  ) => Promise<void>;
  isUpdating: boolean;
}

export function EditQuantityModal({
  item,
  isOpen,
  onClose,
  onSubmit,
  isUpdating,
}: EditQuantityModalProps) {
  const [quantity, setQuantity] = useState(0);
  const [operation, setOperation] = useState<"add" | "subtract" | "set">("add");

  if (!isOpen || !item) return null;

  const handleSubmit = async () => {
    await onSubmit(item._id, { quantity, operation });
    onClose();
  };

  const calculateNewQuantity = () => {
    switch (operation) {
      case "add":
        return item.quantity + quantity;
      case "subtract":
        return Math.max(0, item.quantity - quantity);
      case "set":
        return quantity;
      default:
        return item.quantity;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Cập nhật số lượng</h3>
        <p className="text-gray-600 mb-4">{item.name}</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Thao tác
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setOperation("add")}
                className={`flex-1 py-2 rounded-lg border ${
                  operation === "add"
                    ? "bg-green-50 border-green-500 text-green-700"
                    : ""
                }`}
              >
                <Plus className="w-4 h-4 inline mr-1" />
                Thêm
              </button>
              <button
                onClick={() => setOperation("subtract")}
                className={`flex-1 py-2 rounded-lg border ${
                  operation === "subtract"
                    ? "bg-red-50 border-red-500 text-red-700"
                    : ""
                }`}
              >
                <Minus className="w-4 h-4 inline mr-1" />
                Trừ
              </button>
              <button
                onClick={() => setOperation("set")}
                className={`flex-1 py-2 rounded-lg border ${
                  operation === "set"
                    ? "bg-blue-50 border-blue-500 text-blue-700"
                    : ""
                }`}
              >
                Đặt
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Số lượng
            </label>
            <input
              type="number"
              min="0"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div className="text-sm text-gray-500">
            Hiện tại: {item.quantity} →{" "}
            <span className="font-medium">{calculateNewQuantity()}</span>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={isUpdating}
            className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
          >
            {isUpdating ? "Đang cập nhật..." : "Cập nhật"}
          </button>
        </div>
      </div>
    </div>
  );
}
