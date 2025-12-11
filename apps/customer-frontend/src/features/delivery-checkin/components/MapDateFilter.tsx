// apps/customer-frontend/src/features/delivery-checkin/components/MapDateFilter.tsx
/**
 * Map Date Filter Component
 * Timeline date range filter for the map view
 *
 * Requirements: 5.6
 */

import type { ChangeEvent } from "react";
import { X, Calendar } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { format, subDays, subMonths, startOfMonth, endOfMonth } from "date-fns";
import type { DateRangeFilter } from "../types";

interface MapDateFilterProps {
  dateRange: DateRangeFilter;
  onDateRangeChange: (range: DateRangeFilter) => void;
  onClear: () => void;
  onClose: () => void;
}

export function MapDateFilter({
  dateRange,
  onDateRangeChange,
  onClear,
  onClose,
}: MapDateFilterProps) {
  const today = new Date();

  // Quick filter presets
  const presets = [
    {
      label: "Hôm nay",
      getValue: () => ({
        startDate: format(today, "yyyy-MM-dd"),
        endDate: format(today, "yyyy-MM-dd"),
      }),
    },
    {
      label: "7 ngày qua",
      getValue: () => ({
        startDate: format(subDays(today, 7), "yyyy-MM-dd"),
        endDate: format(today, "yyyy-MM-dd"),
      }),
    },
    {
      label: "30 ngày qua",
      getValue: () => ({
        startDate: format(subDays(today, 30), "yyyy-MM-dd"),
        endDate: format(today, "yyyy-MM-dd"),
      }),
    },
    {
      label: "Tháng này",
      getValue: () => ({
        startDate: format(startOfMonth(today), "yyyy-MM-dd"),
        endDate: format(endOfMonth(today), "yyyy-MM-dd"),
      }),
    },
    {
      label: "Tháng trước",
      getValue: () => {
        const lastMonth = subMonths(today, 1);
        return {
          startDate: format(startOfMonth(lastMonth), "yyyy-MM-dd"),
          endDate: format(endOfMonth(lastMonth), "yyyy-MM-dd"),
        };
      },
    },
  ];

  const handlePresetClick = (preset: (typeof presets)[0]) => {
    onDateRangeChange(preset.getValue());
  };

  const handleStartDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    onDateRangeChange({
      ...dateRange,
      startDate: e.target.value || null,
    });
  };

  const handleEndDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    onDateRangeChange({
      ...dateRange,
      endDate: e.target.value || null,
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-xl p-4 w-72">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-orange-500" />
          <span className="font-medium text-gray-900">Lọc theo thời gian</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* Quick presets */}
      <div className="flex flex-wrap gap-2 mb-4">
        {presets.map((preset) => (
          <button
            key={preset.label}
            onClick={() => handlePresetClick(preset)}
            className="px-2 py-1 text-xs bg-gray-100 hover:bg-orange-100 hover:text-orange-700 rounded-full transition-colors"
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Custom date range */}
      <div className="space-y-3">
        <div>
          <Label htmlFor="startDate" className="text-xs text-gray-600">
            Từ ngày
          </Label>
          <Input
            id="startDate"
            type="date"
            value={dateRange.startDate || ""}
            onChange={handleStartDateChange}
            max={dateRange.endDate || format(today, "yyyy-MM-dd")}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="endDate" className="text-xs text-gray-600">
            Đến ngày
          </Label>
          <Input
            id="endDate"
            type="date"
            value={dateRange.endDate || ""}
            onChange={handleEndDateChange}
            min={dateRange.startDate || undefined}
            max={format(today, "yyyy-MM-dd")}
            className="mt-1"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={onClear}
          className="flex-1"
          disabled={!dateRange.startDate && !dateRange.endDate}
        >
          Xóa bộ lọc
        </Button>
        <Button size="sm" onClick={onClose} className="flex-1">
          Áp dụng
        </Button>
      </div>
    </div>
  );
}
