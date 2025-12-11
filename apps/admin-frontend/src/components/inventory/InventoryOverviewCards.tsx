// src/components/inventory/InventoryOverviewCards.tsx
// ✅ SOLID: Single Responsibility - Display overview stats

import { Package, AlertTriangle, TrendingUp, DollarSign } from "lucide-react";
import { InventoryOverview } from "@/services/admin.inventory.service";

interface Props {
  overview: InventoryOverview;
}

export function InventoryOverviewCards({ overview }: Props) {
  const cards = [
    {
      title: "Tổng số Variants",
      value: overview.totalVariants.toLocaleString(),
      icon: Package,
      color: "blue",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      title: "Tồn kho khả dụng",
      value: overview.totalAvailable.toLocaleString(),
      subtitle: `${overview.totalReserved.toLocaleString()} đã đặt trước`,
      icon: TrendingUp,
      color: "green",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      title: "Giá trị tồn kho",
      value: `${(overview.totalValue / 1000000).toFixed(1)}M VNĐ`,
      subtitle: `${overview.totalOnHand.toLocaleString()} units`,
      icon: DollarSign,
      color: "purple",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    {
      title: "Sắp hết hàng",
      value: overview.lowStockCount.toLocaleString(),
      subtitle: `${overview.outOfStockCount} hết hàng`,
      icon: AlertTriangle,
      color: "yellow",
      bgColor: "bg-yellow-50",
      iconColor: "text-yellow-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {cards.map((card) => (
        <div key={card.title} className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm text-gray-600 mb-1">{card.title}</p>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              {card.subtitle && (
                <p className="text-xs text-gray-500 mt-1">{card.subtitle}</p>
              )}
            </div>
            <div className={`${card.bgColor} p-3 rounded-lg`}>
              <card.icon className={`w-6 h-6 ${card.iconColor}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
