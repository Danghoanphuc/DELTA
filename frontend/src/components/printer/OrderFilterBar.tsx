// src/components/printer/OrderFilterBar.tsx (COMPONENT MỚI)
import { Search, Download } from "lucide-react";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { OrderStatus } from "@/types/order";

interface OrderFilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: OrderStatus | "all";
  onStatusChange: (value: OrderStatus | "all") => void;
  sortBy: string;
  onSortChange: (value: string) => void;
}

export function OrderFilterBar({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  sortBy,
  onSortChange,
}: OrderFilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mt-4">
      {/* Search */}
      <div className="relative flex-1">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <Input
          placeholder="Tìm kiếm đơn hàng (mã, khách hàng...)"
          className="pl-10"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* Status Filter */}
      <Select
        value={statusFilter}
        onValueChange={(v: any) => onStatusChange(v)}
      >
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue placeholder="Trạng thái" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tất cả</SelectItem>
          <SelectItem value="pending">Chờ xác nhận</SelectItem>
          <SelectItem value="confirmed">Đã xác nhận</SelectItem>
          <SelectItem value="printing">Đang in</SelectItem>
          <SelectItem value="shipping">Đang giao</SelectItem>
          <SelectItem value="completed">Hoàn thành</SelectItem>
          <SelectItem value="cancelled">Đã hủy</SelectItem>
        </SelectContent>
      </Select>

      {/* Sort */}
      <Select value={sortBy} onValueChange={(v: any) => onSortChange(v)}>
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue placeholder="Sắp xếp" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Mới nhất</SelectItem>
          <SelectItem value="oldest">Cũ nhất</SelectItem>
          <SelectItem value="highest">Giá cao nhất</SelectItem>
          <SelectItem value="lowest">Giá thấp nhất</SelectItem>
        </SelectContent>
      </Select>

      {/* Export Button */}
      <Button variant="outline" className="gap-2">
        <Download size={16} />
        Xuất file
      </Button>
    </div>
  );
}
