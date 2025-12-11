// features/products/components/PriceCalculator.tsx
/**
 * Component for displaying price breakdown and calculations
 * Phase 3.3.2 - Task: Display base price, volume discount, customization costs, total price
 */

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Separator } from "@/shared/components/ui/separator";
import { Badge } from "@/shared/components/ui/badge";
import { TrendingDown, Info } from "lucide-react";
import { PriceBreakdown } from "../types/customization.types";
import { formatCurrency } from "@/shared/utils/format";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";

interface PriceCalculatorProps {
  priceBreakdown: PriceBreakdown;
  quantity: number;
  loading?: boolean;
}

export const PriceCalculator: React.FC<PriceCalculatorProps> = ({
  priceBreakdown,
  quantity,
  loading = false,
}) => {
  const {
    basePrice,
    customizationCost,
    setupFees,
    volumeDiscount,
    subtotal,
    total,
    unitPrice,
    savings,
    nextTierInfo,
  } = priceBreakdown;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tính giá</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Tính giá</span>
          <Badge variant="secondary">{quantity} sản phẩm</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Base Price */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Giá gốc (x{quantity})</span>
          <span className="font-medium">
            {formatCurrency(basePrice * quantity)}
          </span>
        </div>

        {/* Customization Cost */}
        {customizationCost > 0 && (
          <div className="flex justify-between text-sm">
            <div className="flex items-center gap-1">
              <span className="text-gray-600">Chi phí tùy chỉnh</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info size={14} className="text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Bao gồm chi phí in và cá nhân hóa</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <span className="font-medium">
              {formatCurrency(customizationCost)}
            </span>
          </div>
        )}

        {/* Setup Fees */}
        {setupFees > 0 && (
          <div className="flex justify-between text-sm">
            <div className="flex items-center gap-1">
              <span className="text-gray-600">Phí setup</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info size={14} className="text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Phí chuẩn bị khuôn in (một lần)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <span className="font-medium">{formatCurrency(setupFees)}</span>
          </div>
        )}

        <Separator />

        {/* Subtotal */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Tạm tính</span>
          <span className="font-medium">{formatCurrency(subtotal)}</span>
        </div>

        {/* Volume Discount */}
        {volumeDiscount > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <div className="flex items-center gap-1">
              <TrendingDown size={16} />
              <span>Giảm giá số lượng</span>
            </div>
            <span className="font-medium">
              -{formatCurrency(volumeDiscount)}
            </span>
          </div>
        )}

        <Separator />

        {/* Total */}
        <div className="flex justify-between text-lg font-bold">
          <span>Tổng cộng</span>
          <span className="text-blue-600">{formatCurrency(total)}</span>
        </div>

        {/* Unit Price */}
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Giá mỗi sản phẩm</span>
            <span className="text-lg font-semibold text-blue-600">
              {formatCurrency(unitPrice)}
            </span>
          </div>
        </div>

        {/* Savings */}
        {savings && savings > 0 && (
          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-green-700">
                💰 Bạn tiết kiệm được
              </span>
              <span className="text-lg font-bold text-green-600">
                {formatCurrency(savings)}
              </span>
            </div>
          </div>
        )}

        {/* Next Tier Info */}
        {nextTierInfo && (
          <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
            <p className="text-xs font-medium text-orange-700 mb-1">
              💡 Mua thêm để tiết kiệm hơn!
            </p>
            <p className="text-xs text-gray-600">
              Đặt {nextTierInfo.quantity} sản phẩm để được giá{" "}
              <span className="font-semibold">
                {formatCurrency(nextTierInfo.unitPrice)}
              </span>
              /sp và tiết kiệm thêm{" "}
              <span className="font-semibold text-orange-600">
                {formatCurrency(nextTierInfo.savings)}
              </span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
