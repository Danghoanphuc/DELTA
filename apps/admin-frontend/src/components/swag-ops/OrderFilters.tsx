// apps/admin-frontend/src/components/swag-ops/OrderFilters.tsx
// ✅ SOLID: Single Responsibility - Order filters UI only

import { Search, Filter, Calendar } from "lucide-react";
import { Organization } from "@/services/admin.swag-operations.service";

interface OrderFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  orgFilter: string;
  onOrgChange: (value: string) => void;
  dateFrom: string;
  onDateFromChange: (value: string) => void;
  dateTo: string;
  onDateToChange: (value: string) => void;
  onApplyFilters: () => void;
  organizations: Organization[];
}

export function OrderFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  orgFilter,
  onOrgChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  onApplyFilters,
  organizations,
}: OrderFiltersProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
      <div className="flex flex-wrap gap-4 items-center">
        {/* Search */}
        <div className="flex-1 min-w-64 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo mã đơn hoặc tên..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onApplyFilters()}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => {
            onStatusChange(e.target.value);
            setTimeout(onApplyFilters, 0);
          }}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="paid">Đã thanh toán</option>
          <option value="processing">Đang xử lý</option>
          <option value="kitting">Đang đóng gói</option>
          <option value="shipped">Đã gửi</option>
          <option value="delivered">Đã giao</option>
          <option value="failed">Thất bại</option>
        </select>

        {/* Organization Filter */}
        <select
          value={orgFilter}
          onChange={(e) => {
            onOrgChange(e.target.value);
            setTimeout(onApplyFilters, 0);
          }}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="all">Tất cả tổ chức</option>
          {organizations.map((org) => (
            <option key={org._id} value={org._id}>
              {org.businessName}
            </option>
          ))}
        </select>

        {/* Date Range */}
        <div className="flex items-center gap-2 bg-white border rounded-lg px-3 py-1">
          <Calendar className="w-4 h-4 text-gray-400" />
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => onDateFromChange(e.target.value)}
            className="border-none focus:outline-none text-sm w-32"
            placeholder="Từ ngày"
          />
          <span className="text-gray-400">-</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => onDateToChange(e.target.value)}
            className="border-none focus:outline-none text-sm w-32"
            placeholder="Đến ngày"
          />
        </div>

        <button
          onClick={onApplyFilters}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
        >
          <Filter className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
