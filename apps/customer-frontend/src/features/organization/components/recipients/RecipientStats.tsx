// src/features/organization/components/recipients/RecipientStats.tsx
// ✅ SOLID: Single Responsibility - Stats display only

import { Card, CardContent } from "@/shared/components/ui/card";
import { FilterOptions } from "../../services/recipient.service";

interface RecipientStatsProps {
  filterOptions: FilterOptions | null;
  selectedCount: number;
}

export function RecipientStats({
  filterOptions,
  selectedCount,
}: RecipientStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card className="border-none shadow-sm">
        <CardContent className="p-4">
          <p className="text-sm text-gray-600">Tổng người nhận</p>
          <h3 className="text-2xl font-bold">
            {filterOptions?.totalCount || 0}
          </h3>
        </CardContent>
      </Card>
      <Card className="border-none shadow-sm">
        <CardContent className="p-4">
          <p className="text-sm text-gray-600">Phòng ban</p>
          <h3 className="text-2xl font-bold">
            {filterOptions?.departments?.length || 0}
          </h3>
        </CardContent>
      </Card>
      <Card className="border-none shadow-sm">
        <CardContent className="p-4">
          <p className="text-sm text-gray-600">Tags</p>
          <h3 className="text-2xl font-bold">
            {filterOptions?.tags?.length || 0}
          </h3>
        </CardContent>
      </Card>
      <Card className="border-none shadow-sm">
        <CardContent className="p-4">
          <p className="text-sm text-gray-600">Đã chọn</p>
          <h3 className="text-2xl font-bold">{selectedCount}</h3>
        </CardContent>
      </Card>
    </div>
  );
}
