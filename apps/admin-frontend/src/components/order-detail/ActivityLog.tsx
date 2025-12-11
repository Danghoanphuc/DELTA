// src/components/order-detail/ActivityLog.tsx
// ✅ SOLID: Single Responsibility - Display activity timeline

import { History, Clock } from "lucide-react";

interface ActivityLogProps {
  activities: any[];
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export function ActivityLog({ activities }: ActivityLogProps) {
  if (!activities || activities.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <History className="w-5 h-5" />
          Lịch sử hoạt động
        </h2>
        <p className="text-sm text-gray-500 text-center py-8">
          Chưa có hoạt động nào
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <History className="w-5 h-5" />
        Lịch sử hoạt động
      </h2>
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div key={index} className="flex gap-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                <Clock className="w-4 h-4 text-orange-600" />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                {activity.action}
              </p>
              <p className="text-xs text-gray-500">
                {formatDate(activity.timestamp)}
              </p>
              {activity.details && (
                <p className="text-sm text-gray-600 mt-1">{activity.details}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
