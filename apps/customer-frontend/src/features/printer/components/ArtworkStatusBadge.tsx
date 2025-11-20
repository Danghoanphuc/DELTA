// src/features/printer/components/ArtworkStatusBadge.tsx
// Badge component cho artwork status với color coding

import { Badge } from "@/shared/components/ui/badge";
import { FileCheck, Clock, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/shared/lib/utils";

type ArtworkStatus = "pending_upload" | "pending_approval" | "approved" | "rejected";

interface ArtworkStatusBadgeProps {
  status: ArtworkStatus;
  className?: string;
}

const STATUS_CONFIG = {
  pending_upload: {
    label: "Chờ tải proof",
    icon: Clock,
    className: "bg-gray-100 text-gray-700 border-gray-300",
  },
  pending_approval: {
    label: "Chờ khách duyệt",
    icon: FileCheck,
    className: "bg-yellow-100 text-yellow-700 border-yellow-300",
  },
  approved: {
    label: "Đã duyệt",
    icon: CheckCircle,
    className: "bg-green-100 text-green-700 border-green-300",
  },
  rejected: {
    label: "Bị từ chối",
    icon: XCircle,
    className: "bg-red-100 text-red-700 border-red-300",
  },
};

export function ArtworkStatusBadge({ status, className }: ArtworkStatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={cn(
        "px-3 py-1 font-medium border-2",
        config.className,
        className
      )}
    >
      <Icon className="w-4 h-4 mr-1.5" />
      {config.label}
    </Badge>
  );
}

