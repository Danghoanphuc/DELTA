// src/features/organization/pages/OrderManagement.tsx
// ✅ B2B Organization Order Management

import { useState } from "react";
import { Package, Search, Filter, Plus } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";

export function OrderManagement() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Đơn hàng</h1>
            <p className="text-gray-600">Quản lý tất cả đơn hàng của tổ chức</p>
          </div>
          <Button className="bg-orange-500 hover:bg-orange-600">
            <Plus className="w-4 h-4 mr-2" />
            Đặt hàng mới
          </Button>
        </div>

        {/* Filters */}
        <Card className="border-none shadow-sm mb-6">
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm đơn hàng..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Lọc
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle>Danh sách đơn hàng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-gray-500">
              <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">Chưa có đơn hàng nào</p>
              <p className="text-sm mb-6">
                Bắt đầu đặt hàng để xem danh sách tại đây
              </p>
              <Button className="bg-orange-500 hover:bg-orange-600">
                <Plus className="w-4 h-4 mr-2" />
                Đặt hàng đầu tiên
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default OrderManagement;
