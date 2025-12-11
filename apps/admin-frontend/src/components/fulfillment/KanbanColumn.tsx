// src/components/fulfillment/KanbanColumn.tsx
// ✅ SOLID: Single Responsibility - Kanban column with drag & drop

import { DragEvent, ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface KanbanColumnProps {
  title: string;
  count: number;
  icon: LucideIcon;
  iconColor: string;
  bgColor: string;
  isDragOver?: boolean;
  onDragOver?: (e: DragEvent) => void;
  onDragLeave?: () => void;
  onDrop?: (e: DragEvent) => void;
  children: ReactNode;
  emptyIcon: LucideIcon;
  emptyMessage: string;
}

export function KanbanColumn({
  title,
  count,
  icon: Icon,
  iconColor,
  bgColor,
  isDragOver = false,
  onDragOver,
  onDragLeave,
  onDrop,
  children,
  emptyIcon: EmptyIcon,
  emptyMessage,
}: KanbanColumnProps) {
  return (
    <div
      className={`bg-gray-50 rounded-xl p-4 transition-colors ${
        isDragOver ? `${bgColor} ring-2 ring-opacity-50` : ""
      }`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className={`p-2 rounded-lg ${iconColor}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-semibold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-500">{count} đơn</p>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-3 min-h-32">
        {count === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <EmptyIcon className="w-12 h-12 mx-auto mb-2" />
            <p>{emptyMessage}</p>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
