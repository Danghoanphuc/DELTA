// src/components/analytics/MetricCard.tsx
// ✅ SOLID: Single Responsibility - Display metric card

import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  icon: LucideIcon;
  iconColor: string;
  label: string;
  value: string | number;
  valueColor?: string;
}

export function MetricCard({
  icon: Icon,
  iconColor,
  label,
  value,
  valueColor = "text-gray-900",
}: MetricCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center gap-3 mb-2">
        <Icon className={`w-5 h-5 ${iconColor}`} />
        <span className="text-sm text-gray-600">{label}</span>
      </div>
      <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
    </div>
  );
}
