// apps/admin-frontend/src/components/kitting/KittingChecklist.tsx
// ✅ Kitting Checklist Component - Phase 6.2.2
// Display items to pack with scan functionality

import { useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import type { KittingChecklist as KittingChecklistType } from "../../services/admin.kitting.service";

interface Props {
  checklist: KittingChecklistType;
  onScanItem: (sku: string, quantity?: number) => Promise<void>;
  isScanning: boolean;
}

export function KittingChecklist({ checklist, onScanItem, isScanning }: Props) {
  const [skuInput, setSkuInput] = useState("");
  const [quantityInput, setQuantityInput] = useState("");

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!skuInput.trim()) return;

    try {
      const quantity = quantityInput ? parseInt(quantityInput) : undefined;
      await onScanItem(skuInput.trim(), quantity);

      // Clear inputs
      setSkuInput("");
      setQuantityInput("");
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleQuickScan = async (sku: string, quantity: number) => {
    try {
      await onScanItem(sku, quantity);
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-medium text-gray-900">Tiến độ</h3>
          <span className="text-sm text-gray-600">
            {checklist.progress.packedItems} / {checklist.progress.totalItems}{" "}
            items
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className="bg-blue-600 h-4 rounded-full transition-all duration-300"
            style={{ width: `${checklist.progress.percentComplete}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          {checklist.progress.percentComplete}% hoàn tất
        </p>
      </div>

      {/* Scan Input */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Scan Item</h3>
        <form onSubmit={handleScan} className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SKU
            </label>
            <input
              type="text"
              value={skuInput}
              onChange={(e) => setSkuInput(e.target.value)}
              placeholder="Nhập hoặc scan SKU"
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              disabled={isScanning}
              autoFocus
            />
          </div>
          <div className="w-32">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Số lượng
            </label>
            <input
              type="number"
              value={quantityInput}
              onChange={(e) => setQuantityInput(e.target.value)}
              placeholder="Auto"
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              disabled={isScanning}
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={isScanning || !skuInput.trim()}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isScanning ? "Đang scan..." : "Scan"}
            </button>
          </div>
        </form>
      </div>

      {/* Checklist Items */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Danh sách items ({checklist.totalRecipients} người nhận)
          </h3>
        </div>
        <div className="divide-y divide-gray-200">
          {checklist.items.map((item) => (
            <div
              key={item.skuVariantId}
              className={`p-6 ${
                item.isPacked ? "bg-green-50" : "bg-white"
              } hover:bg-gray-50 transition-colors`}
            >
              <div className="flex items-start gap-4">
                {/* Product Image */}
                {item.productImage && (
                  <img
                    src={item.productImage}
                    alt={item.productName}
                    className="w-16 h-16 object-cover rounded"
                  />
                )}

                {/* Product Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        {item.productName}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        SKU: {item.sku}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.isPacked ? (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      ) : (
                        <XCircle className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* Quantity */}
                  <div className="mt-3 flex items-center justify-between">
                    <div>
                      <span className="text-sm text-gray-600">
                        Cần: {item.quantityNeeded} | Đã đóng:{" "}
                        {item.quantityPacked}
                      </span>
                    </div>
                    {!item.isPacked && (
                      <button
                        onClick={() =>
                          handleQuickScan(item.sku, item.quantityNeeded)
                        }
                        disabled={isScanning}
                        className="text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
                      >
                        Quick Scan
                      </button>
                    )}
                  </div>

                  {/* Scan Info */}
                  {item.scannedAt && (
                    <div className="mt-2 text-xs text-gray-500">
                      Đã scan lúc {new Date(item.scannedAt).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
