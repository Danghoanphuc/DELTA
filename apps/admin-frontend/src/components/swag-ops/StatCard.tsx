// apps/admin-frontend/src/components/swag-ops/StatCard.tsx
// ✅ SOLID: Single Responsibility - Stat card UI only

import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  onClick?: () => void;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  color,
  bgColor,
  onClick,
}: StatCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
        </div>
        <div
          className={`w-12 h-12 rounded-xl ${bgColor} flex items-center justify-center`}
        >
          <Icon className={color} size={24} />
        </div>
      </div>
    </div>
  );
}
