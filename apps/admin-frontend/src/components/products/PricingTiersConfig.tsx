// apps/admin-frontend/src/components/products/PricingTiersConfig.tsx
// ✅ SOLID: Single Responsibility - Pricing Tiers Configuration UI

import { useState } from "react";
import { Plus, Trash2, TrendingDown } from "lucide-react";

export interface PricingTier {
  minQty: number;
  maxQty?: number;
  pricePerUnit: number;
  discount?: number;
}

interface PricingTiersConfigProps {
  pricingTiers: PricingTier[];
  baseCost: number;
  basePrice: number;
  onChange: (tiers: PricingTier[]) => void;
}

export function PricingTiersConfig({
  pricingTiers,
  baseCost,
  basePrice,
  onChange,
}: PricingTiersConfigProps) {
  const [showPreview, setShowPreview] = useState(false);

  const addTier = () => {
    const lastTier = pricingTiers[pricingTiers.length - 1];
    const newMinQty = lastTier ? (lastTier.maxQty || lastTier.minQty) + 1 : 1;

    const newTier: PricingTier = {
      minQty: newMinQty,
      maxQty: undefined,
      pricePerUnit: basePrice,
      discount: 0,
    };

    onChange([...pricingTiers, newTier]);
  };

  const removeTier = (index: number) => {
    onChange(pricingTiers.filter((_, i) => i !== index));
  };

  const updateTier = (index: number, updates: Partial<PricingTier>) => {
    const updated = [...pricingTiers];
    updated[index] = { ...updated[index], ...updates };

    // Auto-calculate discount if price changed
    if (updates.pricePerUnit !== undefined && basePrice > 0) {
      const discount = ((basePrice - updates.pricePerUnit) / basePrice) * 100;
      updated[index].discount = Math.round(discount * 10) / 10;
    }

    onChange(updated);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const calculateMargin = (price: number) => {
    if (baseCost === 0) return 0;
    return ((price - baseCost) / price) * 100;
  };

  const getTierLabel = (tier: PricingTier) => {
    if (tier.maxQty) {
      return `${tier.minQty} - ${tier.maxQty}`;
    }
    return `${tier.minQty}+`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Pricing Tiers</h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50"
          >
            {showPreview ? "Ẩn Preview" : "Xem Preview"}
          </button>
          <button
            type="button"
            onClick={addTier}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
          >
            <Plus className="w-4 h-4" />
            Thêm Tier
          </button>
        </div>
      </div>

      {/* Base Info */}
      <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
        <div>
          <label className="block text-sm font-medium mb-1">Base Cost</label>
          <div className="text-lg font-semibold text-gray-700">
            {formatCurrency(baseCost)}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Base Price</label>
          <div className="text-lg font-semibold text-gray-700">
            {formatCurrency(basePrice)}
          </div>
        </div>
      </div>

      {pricingTiers.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Chưa có pricing tier nào. Click "Thêm Tier" để bắt đầu.
        </div>
      )}

      {/* Tiers List */}
      <div className="space-y-3">
        {pricingTiers.map((tier, index) => (
          <div key={index} className="border rounded-lg p-4">
            <div className="flex items-start gap-4">
              {/* Quantity Range */}
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">
                  Số lượng
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={tier.minQty}
                    onChange={(e) =>
                      updateTier(index, {
                        minQty: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-24 px-3 py-2 border rounded-lg"
                    placeholder="Min"
                  />
                  <span>-</span>
                  <input
                    type="number"
                    value={tier.maxQty || ""}
                    onChange={(e) =>
                      updateTier(index, {
                        maxQty: e.target.value
                          ? parseInt(e.target.value)
                          : undefined,
                      })
                    }
                    className="w-24 px-3 py-2 border rounded-lg"
                    placeholder="Max (∞)"
                  />
                </div>
              </div>

              {/* Price Per Unit */}
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">
                  Giá / đơn vị
                </label>
                <input
                  type="number"
                  value={tier.pricePerUnit}
                  onChange={(e) =>
                    updateTier(index, {
                      pricePerUnit: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                />
                <span className="text-xs text-gray-500">
                  {formatCurrency(tier.pricePerUnit)}
                </span>
              </div>

              {/* Discount */}
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">
                  Discount
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={tier.discount || 0}
                    onChange={(e) =>
                      updateTier(index, {
                        discount: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-20 px-3 py-2 border rounded-lg"
                    step="0.1"
                  />
                  <span className="text-sm">%</span>
                  {tier.discount && tier.discount > 0 && (
                    <div className="flex items-center gap-1 text-green-600">
                      <TrendingDown className="w-4 h-4" />
                      <span className="text-xs font-medium">
                        -{formatCurrency(basePrice - tier.pricePerUnit)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Margin */}
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">Margin</label>
                <div className="text-lg font-semibold">
                  {calculateMargin(tier.pricePerUnit).toFixed(1)}%
                </div>
                <span className="text-xs text-gray-500">
                  {formatCurrency(tier.pricePerUnit - baseCost)}
                </span>
              </div>

              {/* Actions */}
              <button
                type="button"
                onClick={() => removeTier(index)}
                className="mt-7 p-2 text-red-600 hover:bg-red-50 rounded"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Preview Table */}
      {showPreview && pricingTiers.length > 0 && (
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-2 font-medium">
            Preview Pricing Table
          </div>
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Số lượng</th>
                <th className="px-4 py-2 text-right">Giá / đơn vị</th>
                <th className="px-4 py-2 text-right">Discount</th>
                <th className="px-4 py-2 text-right">Tổng tiền</th>
                <th className="px-4 py-2 text-right">Tiết kiệm</th>
              </tr>
            </thead>
            <tbody>
              {pricingTiers.map((tier, index) => {
                const sampleQty = tier.minQty;
                const totalPrice = sampleQty * tier.pricePerUnit;
                const baseTotalPrice = sampleQty * basePrice;
                const savings = baseTotalPrice - totalPrice;

                return (
                  <tr key={index} className="border-t">
                    <td className="px-4 py-2">{getTierLabel(tier)}</td>
                    <td className="px-4 py-2 text-right">
                      {formatCurrency(tier.pricePerUnit)}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {tier.discount ? `${tier.discount}%` : "-"}
                    </td>
                    <td className="px-4 py-2 text-right font-medium">
                      {formatCurrency(totalPrice)}
                    </td>
                    <td className="px-4 py-2 text-right text-green-600">
                      {savings > 0 ? formatCurrency(savings) : "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
