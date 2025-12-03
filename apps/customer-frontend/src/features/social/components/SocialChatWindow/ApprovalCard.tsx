// ApprovalCard.tsx - Approval message card component
import { cn } from "@/shared/lib/utils";
import { CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { toast } from "@/shared/utils/toast";
import DOMPurify from "dompurify";

interface ApprovalCardProps {
  message: any;
  onPreview: (file: any) => void;
}

export function ApprovalCard({ message, onPreview }: ApprovalCardProps) {
  const meta = (message as any).metadata || {
    version: "1.0",
    status: "pending",
    approvedAt: null,
  };
  const attachments = (message.content as any)?.attachments || [];
  const imageUrl = (message.content as any).imageUrl || attachments[0]?.url;
  const note = (message.content as any).text;

  const handleAction = (action: "approve" | "reject") => {
    toast.success(
      action === "approve"
        ? "Đã chốt duyệt mẫu in!"
        : "Đã gửi yêu cầu chỉnh sửa"
    );
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden border border-stone-200 shadow-sm w-[280px] sm:w-[320px] select-none">
      {/* Header */}
      <div
        className={cn(
          "px-4 py-2.5 border-b flex justify-between items-center",
          meta.status === "approved"
            ? "bg-green-50 border-green-100"
            : "bg-blue-50 border-blue-100"
        )}
      >
        <div className="flex items-center gap-2">
          {meta.status === "approved" ? (
            <CheckCircle2 size={16} className="text-green-600" />
          ) : (
            <AlertCircle size={16} className="text-blue-600" />
          )}
          <span
            className={cn(
              "text-xs font-bold uppercase tracking-wider",
              meta.status === "approved" ? "text-green-700" : "text-blue-700"
            )}
          >
            {meta.status === "approved" ? "Đã Chốt In" : "Duyệt Mẫu In"}
          </span>
        </div>
        <span className="text-[10px] font-mono font-bold text-stone-500 bg-white/80 px-1.5 py-0.5 rounded border border-stone-200 shadow-sm">
          v{meta.version}
        </span>
      </div>

      {/* Image Preview */}
      {imageUrl && (
        <div
          className="relative aspect-[4/3] bg-stone-100 cursor-pointer group border-b border-stone-100"
          onClick={() =>
            onPreview({
              url: imageUrl,
              type: "image",
              originalName: `Mẫu duyệt v${meta.version}`,
            })
          }
        >
          <img
            src={imageUrl}
            className="w-full h-full object-cover"
            alt="Mẫu in"
          />
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        {note && (
          <div
            className="mb-4 bg-stone-50 p-2.5 rounded-lg border border-stone-100 text-xs text-stone-600 leading-relaxed font-medium"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(note) }}
          />
        )}

        {/* Actions */}
        {meta.status === "pending" ? (
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => handleAction("reject")}
              variant="outline"
              size="sm"
              className="h-9 text-red-600 border-stone-200 bg-white hover:bg-red-50 text-xs font-semibold rounded-lg"
            >
              <XCircle size={14} className="mr-1.5" /> Yêu cầu sửa
            </Button>
            <Button
              onClick={() => handleAction("approve")}
              size="sm"
              className="h-9 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-200 rounded-lg"
            >
              <CheckCircle2 size={14} className="mr-1.5" /> Duyệt ngay
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-3 bg-green-50/50 text-green-700 text-xs rounded-lg border border-green-100 border-dashed">
            <div className="flex items-center gap-1.5 font-bold mb-1">
              <CheckCircle2 size={14} /> Mẫu đã được phê duyệt
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
