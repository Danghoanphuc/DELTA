// apps/customer-frontend/src/features/shop/components/PricingTiers.tsx
// Tiered pricing display inspired by VistaPrint

import { Check, TrendingDown } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Badge } from "@/shared/components/ui/badge";

export interface PricingTier {
  quantity: number;
  pricePerUnit: number;
  totalPrice: number;
  discount: number; // Percentage off
  savings: number; // Dollar amount saved
  badge?: string;
  popular?: boolean;
}

interface PricingTiersProps {
  tiers: PricingTier[];
  selectedQuantity?: number;
  onSelectTier?: (tier: PricingTier) => void;
  currency?: string;
  className?: string;
}

export const PricingTiers = ({
  tiers,
  selectedQuantity,
  onSelectTier,
  currency = "₫",
  className = ""
}: PricingTiersProps) => {
  // Format price for Vietnamese
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  // Sort tiers by quantity
  const sortedTiers = [...tiers].sort((a, b) => a.quantity - b.quantity);

  return (
    <div className={cn("space-y-3", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-gray-900">Chọn số lượng</h4>
        <span className="text-xs text-gray-600">
          <TrendingDown className="w-3 h-3 inline mr-1" />
          Càng nhiều càng rẻ
        </span>
      </div>

      {/* Tier Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {sortedTiers.map((tier) => {
          const isSelected = selectedQuantity === tier.quantity;
          const isPopular = tier.popular;

          return (
            <button
              key={tier.quantity}
              onClick={() => onSelectTier?.(tier)}
              className={cn(
                "relative p-4 rounded-xl border-2 transition-all duration-200 text-left",
                isSelected
                  ? "border-blue-600 bg-blue-50 shadow-lg scale-105"
                  : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md",
                isPopular && !isSelected && "border-orange-300 bg-orange-50/50"
              )}
            >
              {/* Popular Badge */}
              {isPopular && (
                <Badge
                  className="absolute -top-2 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-[10px] px-2 py-0.5"
                >
                  {tier.badge || "PHỔ BIẾN"}
                </Badge>
              )}

              {/* Selected Checkmark */}
              {isSelected && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}

              {/* Quantity */}
              <div className="mb-3">
                <div className="text-2xl font-bold text-gray-900">
                  {tier.quantity}
                </div>
                <div className="text-xs text-gray-600">
                  chiếc
                </div>
              </div>

              {/* Pricing */}
              <div className="space-y-1">
                {/* Per Unit Price */}
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-bold text-green-600">
                    {formatPrice(tier.pricePerUnit)}{currency}
                  </span>
                  <span className="text-xs text-gray-600">/cái</span>
                </div>

                {/* Total Price */}
                <div className="text-sm text-gray-600">
                  Tổng: <span className="font-semibold text-gray-900">
                    {formatPrice(tier.totalPrice)}{currency}
                  </span>
                </div>

                {/* Discount Badge */}
                {tier.discount > 0 && (
                  <Badge
                    variant="secondary"
                    className="bg-red-100 text-red-700 text-[10px] px-1.5 py-0.5"
                  >
                    Giảm {tier.discount}%
                  </Badge>
                )}

                {/* Savings */}
                {tier.savings > 0 && (
                  <div className="text-xs text-orange-600 font-medium">
                    Tiết kiệm {formatPrice(tier.savings)}{currency}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Info Footer */}
      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
        <p className="text-xs text-gray-600">
          Giá có thể thay đổi tùy thuộc vào nhà in và các tùy chọn tùy chỉnh
        </p>
      </div>
    </div>
  );
};

// Helper function to generate typical pricing tiers
export const generatePricingTiers = (
  basePrice: number,
  quantities: number[] = [50, 100, 250, 500]
): PricingTier[] => {
  return quantities.map((qty, index) => {
    // Progressive discounts
    const discountPercentages = [0, 20, 36, 44];
    const discount = discountPercentages[index] || 0;
    const pricePerUnit = basePrice * (1 - discount / 100);
    const totalPrice = pricePerUnit * qty;
    const savings = (basePrice - pricePerUnit) * qty;

    return {
      quantity: qty,
      pricePerUnit,
      totalPrice,
      discount,
      savings,
      badge: index === 1 ? "PHỔ BIẾN" : index === 2 ? "GIÁ TỐT" : undefined,
      popular: index === 1
    };
  });
};

