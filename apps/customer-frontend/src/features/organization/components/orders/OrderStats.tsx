// src/features/organization/components/orders/OrderStats.tsx
// ✅ SOLID: Single Responsibility - Stats display only

import { Card, CardContent } from "@/shared/components/ui/card";
import { formatCurrency } from "@/shared/utils/formatCurrency";

interface OrderStatsProps {
  stats: {
    totalOrders?: number;
    totalRecipients?: number;
    totalSpent?: number;
    byStatus?: {
      delivered?: { totalRecipients?: number };
    };
  } | null;
}

export function OrderStats({ stats }: OrderStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Card className="border-none shadow-sm">
        <CardContent className="p-4">
          <p className="text-sm text-gray-600">Tổng đơn</p>
          <h3 className="text-2xl font-bold">{stats?.totalOrders || 0}</h3>
        </CardContent>
      </Card>
      <Card className="border-none shadow-sm">
        <CardContent className="p-4">
          <p className="text-sm text-gray-600">Người nhận</p>
          <h3 className="text-2xl font-bold">{stats?.totalRecipients || 0}</h3>
        </CardContent>
      </Card>
      <Card className="border-none shadow-sm">
        <CardContent className="p-4">
          <p className="text-sm text-gray-600">Đã giao</p>
          <h3 className="text-2xl font-bold text-green-600">
            {stats?.byStatus?.delivered?.totalRecipients || 0}
          </h3>
        </CardContent>
      </Card>
      <Card className="border-none shadow-sm">
        <CardContent className="p-4">
          <p className="text-sm text-gray-600">Tổng chi</p>
          <h3 className="text-2xl font-bold text-orange-600">
            {formatCurrency(stats?.totalSpent || 0)}
          </h3>
        </CardContent>
      </Card>
    </div>
  );
}
