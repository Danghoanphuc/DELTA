// apps/customer-frontend/src/features/delivery-checkin/components/GPSIndicator.tsx
/**
 * GPS Accuracy Indicator Component
 * Displays GPS status and accuracy level with visual feedback
 */

import {
  MapPin,
  Loader2,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import type { GPSStatus } from "../types";
import { GPS_ACCURACY_THRESHOLD, GPS_ACCURACY_WARNING } from "../types";

interface GPSIndicatorProps {
  status: GPSStatus;
  accuracyLevel: "good" | "acceptable" | "poor" | "unknown";
  onRetry: () => void;
}

export function GPSIndicator({
  status,
  accuracyLevel,
  onRetry,
}: GPSIndicatorProps) {
  const getStatusColor = () => {
    if (status.error) return "text-red-500";
    if (status.isCapturing) return "text-yellow-500";
    switch (accuracyLevel) {
      case "good":
        return "text-green-500";
      case "acceptable":
        return "text-yellow-500";
      case "poor":
        return "text-orange-500";
      default:
        return "text-gray-400";
    }
  };

  const getBackgroundColor = () => {
    if (status.error) return "bg-red-50 border-red-200";
    if (status.isCapturing) return "bg-yellow-50 border-yellow-200";
    switch (accuracyLevel) {
      case "good":
        return "bg-green-50 border-green-200";
      case "acceptable":
        return "bg-yellow-50 border-yellow-200";
      case "poor":
        return "bg-orange-50 border-orange-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const getIcon = () => {
    if (status.error) {
      return <XCircle className="w-5 h-5 text-red-500" />;
    }
    if (status.isCapturing) {
      return <Loader2 className="w-5 h-5 text-yellow-500 animate-spin" />;
    }
    if (status.hasPosition) {
      switch (accuracyLevel) {
        case "good":
          return <CheckCircle className="w-5 h-5 text-green-500" />;
        case "acceptable":
          return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
        case "poor":
          return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      }
    }
    return <MapPin className="w-5 h-5 text-gray-400" />;
  };

  const getStatusText = () => {
    if (status.error) {
      return status.error;
    }
    if (status.isCapturing) {
      return "Đang xác định vị trí...";
    }
    if (status.hasPosition && status.accuracy !== null) {
      const accuracyText = `Độ chính xác: ${Math.round(status.accuracy)}m`;
      switch (accuracyLevel) {
        case "good":
          return `${accuracyText} (Tốt)`;
        case "acceptable":
          return `${accuracyText} (Chấp nhận được)`;
        case "poor":
          return `${accuracyText} (Kém - Vui lòng di chuyển ra ngoài trời)`;
      }
    }
    return "Chưa xác định vị trí";
  };

  const getAccuracyBar = () => {
    if (!status.hasPosition || status.accuracy === null) return null;

    // Calculate percentage (inverse - lower accuracy value = better)
    const maxAccuracy = 200; // meters
    const percentage = Math.max(
      0,
      Math.min(100, ((maxAccuracy - status.accuracy) / maxAccuracy) * 100)
    );

    return (
      <div className="mt-2">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              accuracyLevel === "good"
                ? "bg-green-500"
                : accuracyLevel === "acceptable"
                ? "bg-yellow-500"
                : "bg-orange-500"
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Kém</span>
          <span>Tốt (&lt;{GPS_ACCURACY_THRESHOLD}m)</span>
        </div>
      </div>
    );
  };

  return (
    <div className={`p-4 rounded-lg border ${getBackgroundColor()}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`font-medium ${getStatusColor()}`}>GPS</span>
            {status.hasPosition && !status.error && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/50">
                {accuracyLevel === "good" ? "✓ Sẵn sàng" : "Đang cải thiện..."}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 mt-1">{getStatusText()}</p>
          {getAccuracyBar()}
        </div>
        {(status.error || (!status.isCapturing && !status.hasPosition)) && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="flex-shrink-0"
          >
            Thử lại
          </Button>
        )}
      </div>
    </div>
  );
}
