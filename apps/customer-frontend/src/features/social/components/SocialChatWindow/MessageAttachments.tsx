// MessageAttachments.tsx - Message attachments display
import { cn } from "@/shared/lib/utils";
import {
  FileText,
  FileImage,
  FileSpreadsheet,
  FileArchive,
  File,
} from "lucide-react";

const getFileTheme = (fileName: string) => {
  const ext = fileName.split(".").pop()?.toLowerCase() || "default";
  if (["jpg", "png", "jpeg", "webp"].includes(ext))
    return { icon: FileImage, color: "text-purple-700", bg: "bg-purple-100" };
  if (["pdf"].includes(ext))
    return { icon: FileText, color: "text-rose-700", bg: "bg-rose-100" };
  if (["xls", "xlsx", "csv"].includes(ext))
    return {
      icon: FileSpreadsheet,
      color: "text-emerald-700",
      bg: "bg-emerald-100",
    };
  if (["zip", "rar"].includes(ext))
    return { icon: FileArchive, color: "text-amber-700", bg: "bg-amber-100" };
  return { icon: File, color: "text-slate-700", bg: "bg-slate-100" };
};

interface MessageAttachmentsProps {
  attachments: any[];
  isMe: boolean;
  onImageClick: (url: string, name: string) => void;
  onFileClick: (file: any) => void;
}

export function MessageAttachments({
  attachments,
  isMe,
  onImageClick,
  onFileClick,
}: MessageAttachmentsProps) {
  return (
    <div
      className={cn(
        "grid gap-1 mb-1.5",
        attachments.length > 1 ? "grid-cols-2" : "grid-cols-1"
      )}
    >
      {attachments.map((file: any, idx: number) => {
        const isImg =
          file.type === "image" ||
          file.url?.match(/\.(jpeg|jpg|png|webp|heic)$/i);

        if (isImg) {
          return (
            <div
              key={idx}
              onClick={() =>
                onImageClick(file.url, file.originalName || "Image")
              }
              className="cursor-pointer overflow-hidden rounded-lg bg-stone-100 border border-stone-200/50 aspect-square sm:aspect-auto sm:max-h-[200px] relative group"
            >
              <img
                src={file.url}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                loading="lazy"
                alt="Attachment"
              />
            </div>
          );
        }

        const theme = getFileTheme(file.originalName || "");
        const FileIcon = theme.icon;

        return (
          <div
            key={idx}
            onClick={() => onFileClick(file)}
            className={cn(
              "flex items-center gap-2 rounded-lg p-2 max-w-[240px] cursor-pointer hover:brightness-95 transition-all",
              isMe
                ? "bg-white border border-stone-200/50"
                : "bg-stone-50 border border-stone-200"
            )}
          >
            <div
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
                theme.bg,
                theme.color
              )}
            >
              <FileIcon size={16} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] font-bold text-stone-700">
                {file.originalName}
              </p>
              <p className="text-[9px] text-stone-400">
                {(file.size / 1024 / 1024).toFixed(1)} MB
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
