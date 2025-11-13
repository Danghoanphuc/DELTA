// apps/admin-frontend/src/components/ui/StatusBadge.tsx
import React from "react";

interface StatusBadgeProps {
  isActive: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ isActive }) => {
  const statusConfig = isActive
    ? {
        text: "Active",
        bg: "bg-green-100",
        textCol: "text-green-800",
      }
    : {
        text: "Banned",
        bg: "bg-red-100",
        textCol: "text-red-800",
      };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusConfig.bg} ${statusConfig.textCol}`}
    >
      {statusConfig.text}
    </span>
  );
};
