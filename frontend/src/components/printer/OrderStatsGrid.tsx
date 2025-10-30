// src/components/printer/OrderStatsGrid.tsx (COMPONENT MỚI)
import { Card, CardContent } from "@/shared/components/ui/card";

interface OrderStats {
  total: number;
  pending: number;
  printing: number;
  shipping: number;
  completed: number;
}

interface OrderStatsGridProps {
  stats: OrderStats;
}

export function OrderStatsGrid({ stats }: OrderStatsGridProps) {
  const statItems = [
    { label: "Tổng đơn", value: stats.total, color: "blue" },
    { label: "Chờ xác nhận", value: stats.pending, color: "yellow" },
    { label: "Đang in", value: stats.printing, color: "purple" },
    { label: "Đang giao", value: stats.shipping, color: "cyan" },
    { label: "Hoàn thành", value: stats.completed, color: "green" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
      {statItems.map((stat) => (
        <Card key={stat.label} className="border-none shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
