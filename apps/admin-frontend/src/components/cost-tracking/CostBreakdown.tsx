import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export interface CostBreakdownData {
  orderId: string;
  baseProductsCost: number;
  customizationCost: number;
  setupFees: number;
  kittingFee: number;
  packagingCost: number;
  shippingCost: number;
  handlingFee: number;
  totalCost: number;
  totalPrice: number;
  grossMargin: number;
  marginPercentage: number;
}

interface CostBreakdownProps {
  data: CostBreakdownData;
  showChart?: boolean;
}

export function CostBreakdown({ data, showChart = true }: CostBreakdownProps) {
  const isLowMargin = data.marginPercentage < 20;
  const isGoodMargin = data.marginPercentage >= 30;

  const costItems = [
    {
      label: "Base Products",
      value: data.baseProductsCost,
      color: "bg-blue-500",
    },
    {
      label: "Customization",
      value: data.customizationCost,
      color: "bg-purple-500",
    },
    { label: "Setup Fees", value: data.setupFees, color: "bg-indigo-500" },
    { label: "Kitting", value: data.kittingFee, color: "bg-green-500" },
    { label: "Packaging", value: data.packagingCost, color: "bg-yellow-500" },
    { label: "Shipping", value: data.shippingCost, color: "bg-orange-500" },
    { label: "Handling", value: data.handlingFee, color: "bg-red-500" },
  ];

  return (
    <div className="space-y-4">
      {/* Margin Alert */}
      {isLowMargin && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Low margin alert: This order has {data.marginPercentage.toFixed(2)}%
            margin (threshold: 20%)
          </AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Price
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(data.totalPrice)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Cost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(data.totalCost)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Gross Margin
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              {formatCurrency(data.grossMargin)}
              {data.grossMargin > 0 ? (
                <TrendingUp className="h-5 w-5 text-green-500" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-500" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Margin %
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                isLowMargin
                  ? "text-red-500"
                  : isGoodMargin
                  ? "text-green-500"
                  : "text-yellow-500"
              }`}
            >
              {data.marginPercentage.toFixed(2)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cost Breakdown Table */}
      <Card>
        <CardHeader>
          <CardTitle>Cost Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {costItems.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${item.color}`} />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">
                    {((item.value / data.totalCost) * 100).toFixed(1)}%
                  </span>
                  <span className="text-sm font-semibold min-w-[100px] text-right">
                    {formatCurrency(item.value)}
                  </span>
                </div>
              </div>
            ))}
            <div className="pt-3 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold">Total Cost</span>
                <span className="text-sm font-bold">
                  {formatCurrency(data.totalCost)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Visual Chart */}
      {showChart && (
        <Card>
          <CardHeader>
            <CardTitle>Cost Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {costItems.map((item) => {
                const percentage = (item.value / data.totalCost) * 100;
                return (
                  <div key={item.label} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{item.label}</span>
                      <span className="font-medium">
                        {formatCurrency(item.value)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${item.color}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
