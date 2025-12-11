// apps/customer-frontend/src/features/delivery-checkin/components/CheckinHistoryFilters.tsx
/**
 * Filters component for check-in history
 * Includes date range filter and order status filter
 *
 * Requirements: 9.3 - filtering by date range and order status
 */

import { useState } from "react";
import { Calendar, Filter, X, ChevronDown } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import type { CheckinFilters } from "../hooks/useShipperCheckins";

interface CheckinHistoryFiltersProps {
  filters: CheckinFilters;
  onFiltersChange: (filters: CheckinFilters) => void;
  onClearFilters: () => void;
}

const ORDER_STATUS_OPTIONS = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "pending", label: "Đang xử lý" },
  { value: "completed", label: "Hoàn thành" },
  { value: "failed", label: "Thất bại" },
];

export function CheckinHistoryFilters({
  filters,
  onFiltersChange,
  onClearFilters,
}: CheckinHistoryFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<CheckinFilters>(filters);

  const hasActiveFilters =
    filters.startDate || filters.endDate || filters.status;

  const activeFilterCount = [
    filters.startDate,
    filters.endDate,
    filters.status,
  ].filter(Boolean).length;

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
    setIsOpen(false);
  };

  const handleClearFilters = () => {
    const clearedFilters: CheckinFilters = {
      startDate: null,
      endDate: null,
      status: null,
    };
    setLocalFilters(clearedFilters);
    onClearFilters();
    setIsOpen(false);
  };

  const handleStartDateChange = (value: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      startDate: value || null,
    }));
  };

  const handleEndDateChange = (value: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      endDate: value || null,
    }));
  };

  const handleStatusChange = (value: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      status: value || null,
    }));
  };

  // Quick date range presets
  const setDatePreset = (preset: "today" | "week" | "month") => {
    const today = new Date();
    const endDate = today.toISOString().split("T")[0];
    let startDate: string;

    switch (preset) {
      case "today":
        startDate = endDate;
        break;
      case "week":
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        startDate = weekAgo.toISOString().split("T")[0];
        break;
      case "month":
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        startDate = monthAgo.toISOString().split("T")[0];
        break;
    }

    setLocalFilters((prev) => ({
      ...prev,
      startDate,
      endDate,
    }));
  };

  return (
    <div className="flex items-center gap-2">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={hasActiveFilters ? "default" : "outline"}
            size="sm"
            className="gap-2"
          >
            <Filter className="w-4 h-4" />
            <span>Bộ lọc</span>
            {activeFilterCount > 0 && (
              <span className="bg-white/20 text-xs px-1.5 py-0.5 rounded-full">
                {activeFilterCount}
              </span>
            )}
            <ChevronDown className="w-4 h-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4" align="end">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900">Bộ lọc</h4>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  className="text-gray-500 hover:text-gray-700 h-auto p-1"
                >
                  <X className="w-4 h-4 mr-1" />
                  Xóa bộ lọc
                </Button>
              )}
            </div>

            {/* Date Range Filter */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700">
                Khoảng thời gian
              </Label>

              {/* Quick presets */}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setDatePreset("today")}
                  className="flex-1 text-xs"
                >
                  Hôm nay
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setDatePreset("week")}
                  className="flex-1 text-xs"
                >
                  7 ngày
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setDatePreset("month")}
                  className="flex-1 text-xs"
                >
                  30 ngày
                </Button>
              </div>

              {/* Custom date range */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-gray-500">Từ ngày</Label>
                  <div className="relative">
                    <Calendar className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="date"
                      value={localFilters.startDate || ""}
                      onChange={(e) => handleStartDateChange(e.target.value)}
                      className="pl-8 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Đến ngày</Label>
                  <div className="relative">
                    <Calendar className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="date"
                      value={localFilters.endDate || ""}
                      onChange={(e) => handleEndDateChange(e.target.value)}
                      className="pl-8 text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Trạng thái
              </Label>
              <Select
                value={localFilters.status || ""}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  {ORDER_STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Apply Button */}
            <Button onClick={handleApplyFilters} className="w-full">
              Áp dụng bộ lọc
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      {/* Active filter badges */}
      {hasActiveFilters && (
        <div className="flex items-center gap-1 flex-wrap">
          {filters.startDate && filters.endDate && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
              <Calendar className="w-3 h-3" />
              {filters.startDate} - {filters.endDate}
              <button
                onClick={() =>
                  onFiltersChange({
                    ...filters,
                    startDate: null,
                    endDate: null,
                  })
                }
                className="hover:bg-blue-200 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.status && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
              {ORDER_STATUS_OPTIONS.find((o) => o.value === filters.status)
                ?.label || filters.status}
              <button
                onClick={() => onFiltersChange({ ...filters, status: null })}
                className="hover:bg-green-200 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
