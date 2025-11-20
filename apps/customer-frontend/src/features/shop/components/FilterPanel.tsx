// apps/customer-frontend/src/features/shop/components/FilterPanel.tsx
// Advanced filtering panel inspired by VistaPrint

import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group";
import { Label } from "@/shared/components/ui/label";
import { Separator } from "@/shared/components/ui/separator";
import { Badge } from "@/shared/components/ui/badge";
import { ChevronDown, ChevronUp, X, Sparkles } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import type { FilterDimension, FilterState, QuickFilter } from "../types/filter.types";

interface FilterPanelProps {
  filters: FilterDimension[];
  quickFilters?: QuickFilter[];
  activeFilters: FilterState;
  onFilterChange: (filterState: FilterState) => void;
  className?: string;
}

export const FilterPanel = ({
  filters,
  quickFilters = [],
  activeFilters,
  onFilterChange,
  className = "",
}: FilterPanelProps) => {
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  // Toggle section collapse
  const toggleSection = (dimensionId: string) => {
    setCollapsedSections(prev => {
      const next = new Set(prev);
      if (next.has(dimensionId)) {
        next.delete(dimensionId);
      } else {
        next.add(dimensionId);
      }
      return next;
    });
  };

  // Handle checkbox filter change
  const handleCheckboxChange = (dimensionId: string, valueId: string, checked: boolean) => {
    const current = activeFilters[dimensionId] || [];
    const next = checked
      ? [...current, valueId]
      : current.filter(id => id !== valueId);

    onFilterChange({
      ...activeFilters,
      [dimensionId]: next
    });
  };

  // Handle radio filter change
  const handleRadioChange = (dimensionId: string, valueId: string) => {
    onFilterChange({
      ...activeFilters,
      [dimensionId]: [valueId]
    });
  };

  // Apply quick filter
  const applyQuickFilter = (quickFilter: QuickFilter) => {
    const newFilters: FilterState = {};
    Object.entries(quickFilter.filters).forEach(([key, values]) => {
      if (values && values.length > 0) {
        newFilters[key] = values;
      }
    });
    onFilterChange({
      ...activeFilters,
      ...newFilters
    });
  };

  // Clear all filters
  const clearAllFilters = () => {
    onFilterChange({});
  };

  // Count active filters
  const activeFilterCount = Object.values(activeFilters).flat().length;

  // Sort filters by priority
  const sortedFilters = [...filters].sort((a, b) => a.priority - b.priority);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header with Clear All */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Lọc sản phẩm</h3>
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="h-auto px-2 py-1 text-xs text-blue-600 hover:text-blue-700"
          >
            <X className="w-3 h-3 mr-1" />
            Xóa ({activeFilterCount})
          </Button>
        )}
      </div>

      {/* Quick Filters */}
      {quickFilters.length > 0 && (
        <>
          <div className="space-y-2">
            <Label className="text-xs text-gray-600 uppercase tracking-wide">
              Lọc nhanh
            </Label>
            <div className="flex flex-wrap gap-2">
              {quickFilters.map((qf) => (
                <Button
                  key={qf.id}
                  variant="outline"
                  size="sm"
                  onClick={() => applyQuickFilter(qf)}
                  className="h-auto px-3 py-1.5 text-xs rounded-full"
                >
                  {qf.icon && <span className="mr-1.5">{qf.icon}</span>}
                  {qf.label}
                </Button>
              ))}
            </div>
          </div>
          <Separator />
        </>
      )}

      {/* Filter Dimensions */}
      <div className="space-y-4">
        {sortedFilters.map((dimension) => {
          const isCollapsed = collapsedSections.has(dimension.id);
          const activeValues = activeFilters[dimension.id] || [];

          return (
            <div key={dimension.id} className="space-y-3">
              {/* Section Header */}
              <button
                onClick={() => toggleSection(dimension.id)}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <Label className="font-semibold text-gray-900 cursor-pointer">
                    {dimension.label}
                  </Label>
                  {activeValues.length > 0 && (
                    <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                      {activeValues.length}
                    </Badge>
                  )}
                </div>
                {isCollapsed ? (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                )}
              </button>

              {/* Section Content */}
              {!isCollapsed && (
                <div className="space-y-2 pl-1">
                  {/* Checkbox Type */}
                  {dimension.type === 'checkbox' && (
                    <>
                      {dimension.values.map((value) => (
                        <div
                          key={value.id}
                          className="flex items-center justify-between group"
                        >
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`${dimension.id}-${value.id}`}
                              checked={activeValues.includes(value.id)}
                              onCheckedChange={(checked) =>
                                handleCheckboxChange(dimension.id, value.id, checked as boolean)
                              }
                            />
                            <label
                              htmlFor={`${dimension.id}-${value.id}`}
                              className="text-sm text-gray-700 cursor-pointer group-hover:text-gray-900 flex items-center gap-1.5"
                            >
                              {value.icon && <span>{value.icon}</span>}
                              {value.label}
                              {value.premium && (
                                <Sparkles className="w-3 h-3 text-amber-500" />
                              )}
                            </label>
                          </div>
                          {value.count !== undefined && (
                            <span className="text-xs text-gray-400">
                              {value.count}
                            </span>
                          )}
                        </div>
                      ))}
                    </>
                  )}

                  {/* Radio Type */}
                  {dimension.type === 'radio' && (
                    <RadioGroup
                      value={activeValues[0] || ''}
                      onValueChange={(value) => handleRadioChange(dimension.id, value)}
                    >
                      {dimension.values.map((value) => (
                        <div
                          key={value.id}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem
                              value={value.id}
                              id={`${dimension.id}-${value.id}`}
                            />
                            <label
                              htmlFor={`${dimension.id}-${value.id}`}
                              className="text-sm text-gray-700 cursor-pointer flex items-center gap-1.5"
                            >
                              {value.icon && <span>{value.icon}</span>}
                              {value.label}
                              {value.premium && (
                                <Sparkles className="w-3 h-3 text-amber-500" />
                              )}
                            </label>
                          </div>
                          {value.count !== undefined && (
                            <span className="text-xs text-gray-400">
                              {value.count}
                            </span>
                          )}
                        </div>
                      ))}
                    </RadioGroup>
                  )}

                  {/* Color Type */}
                  {dimension.type === 'color' && (
                    <div className="flex flex-wrap gap-2">
                      {dimension.values.map((value) => {
                        const isActive = activeValues.includes(value.id);
                        return (
                          <button
                            key={value.id}
                            onClick={() =>
                              handleCheckboxChange(dimension.id, value.id, !isActive)
                            }
                            className={cn(
                              "relative w-8 h-8 rounded-full border-2 transition-all",
                              isActive
                                ? "border-blue-600 scale-110"
                                : "border-gray-300 hover:border-gray-400"
                            )}
                            style={{ backgroundColor: value.thumbnail }}
                            title={value.label}
                          >
                            {isActive && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded-full border border-gray-800" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              <Separator />
            </div>
          );
        })}
      </div>

      {/* Active Filters Summary */}
      {activeFilterCount > 0 && (
        <div className="p-3 bg-blue-50 rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-900">
              Đã chọn {activeFilterCount} bộ lọc
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="h-auto px-2 py-1 text-xs text-blue-600 hover:text-blue-700"
            >
              Xóa tất cả
            </Button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(activeFilters).flatMap(([dimensionId, valueIds]) => {
              const dimension = filters.find(f => f.id === dimensionId);
              if (!dimension) return [];
              
              return valueIds.map(valueId => {
                const value = dimension.values.find(v => v.id === valueId);
                if (!value) return null;

                return (
                  <Badge
                    key={`${dimensionId}-${valueId}`}
                    variant="secondary"
                    className="h-6 px-2 text-xs bg-white"
                  >
                    {value.label}
                    <button
                      onClick={() =>
                        handleCheckboxChange(dimensionId, valueId, false)
                      }
                      className="ml-1.5 hover:text-gray-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                );
              });
            })}
          </div>
        </div>
      )}
    </div>
  );
};

