// src/features/printer/components/ProofHistory.tsx
// Component hiển thị lịch sử các proof files

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Download, FileImage, FileText, CheckCircle, XCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface ProofFile {
  url: string;
  version: number;
  uploadedAt: string | Date;
  fileName?: string;
  fileType?: string;
  status: "current" | "superseded" | "rejected";
}

interface ProofHistoryProps {
  proofs: ProofFile[];
}

export function ProofHistory({ proofs }: ProofHistoryProps) {
  if (!proofs || proofs.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FileImage className="w-12 h-12 mx-auto mb-2 text-gray-400" />
        <p>Chưa có proof nào được tải lên</p>
      </div>
    );
  }

  // Sort by version descending (newest first)
  const sortedProofs = [...proofs].sort((a, b) => b.version - a.version);

  return (
    <div className="space-y-3">
      <h4 className="font-semibold text-sm text-gray-700">Lịch sử Proof</h4>
      <div className="space-y-2">
        {sortedProofs.map((proof) => (
          <ProofFileItem key={proof.version} proof={proof} />
        ))}
      </div>
    </div>
  );
}

function ProofFileItem({ proof }: { proof: ProofFile }) {
  const getStatusBadge = () => {
    switch (proof.status) {
      case "current":
        return (
          <Badge variant="default" className="bg-blue-600">
            <CheckCircle className="w-3 h-3 mr-1" />
            Hiện tại
          </Badge>
        );
      case "superseded":
        return (
          <Badge variant="secondary">
            <Clock className="w-3 h-3 mr-1" />
            Đã thay thế
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Bị từ chối
          </Badge>
        );
    }
  };

  const getFileIcon = () => {
    if (proof.fileType?.startsWith("image/")) {
      return <FileImage className="w-5 h-5 text-blue-600" />;
    }
    return <FileText className="w-5 h-5 text-red-600" />;
  };

  const formatDate = (date: string | Date) => {
    try {
      return format(new Date(date), "dd/MM/yyyy HH:mm", { locale: vi });
    } catch {
      return "N/A";
    }
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
      {/* Icon */}
      <div className="flex-shrink-0">{getFileIcon()}</div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-sm">Version {proof.version}</span>
          {getStatusBadge()}
        </div>
        <p className="text-xs text-gray-500 truncate">
          {proof.fileName || "proof-file"}
        </p>
        <p className="text-xs text-gray-400">{formatDate(proof.uploadedAt)}</p>
      </div>

      {/* Actions */}
      <div className="flex-shrink-0">
        <Button
          variant="ghost"
          size="sm"
          asChild
        >
          <a
            href={proof.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1"
          >
            <Download className="w-4 h-4" />
            Tải về
          </a>
        </Button>
      </div>
    </div>
  );
}

