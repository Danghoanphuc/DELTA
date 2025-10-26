// src/components/printer/StatCard.tsx (COMPONENT MỚI)
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
}

export function StatCard({
  title,
  value,
  change,
  icon: Icon,
  color,
  bgColor,
}: StatCardProps) {
  return (
    <Card className="border-none shadow-sm hover:shadow-md transition-shadow bg-white">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{value}</h3>
            <span className={`text-sm font-medium ${color}`}>{change}</span>
          </div>
          <div
            className={`w-12 h-12 rounded-xl ${bgColor} flex items-center justify-center`}
          >
            <Icon className={color} size={24} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
