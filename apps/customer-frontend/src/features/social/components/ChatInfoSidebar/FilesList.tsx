// apps/customer-frontend/src/features/social/components/ChatInfoSidebar/FilesList.tsx
// ✅ Component hiển thị files list với icons theo loại file

import { useQuery } from "@tanstack/react-query";
import {
  File,
  FileImage,
  FileVideo,
  FileSpreadsheet,
  FileText,
  Loader2,
} from "lucide-react";
import { getConversationFiles } from "../../../chat/services/chat.api.service";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/shared/lib/utils";

interface FilesListProps {
  conversationId: string;
}

export function FilesList({ conversationId }: FilesListProps) {
  const { data: files, isLoading } = useQuery({
    queryKey: ["conversationFiles", conversationId],
    queryFn: () => getConversationFiles(conversationId),
    staleTime: 30000,
  });

  const getFileIcon = (fileName: string, fileType?: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase() || "";

    if (fileType?.startsWith("image/")) {
      return <FileImage size={16} className="text-blue-600" />;
    }
    if (fileType?.startsWith("video/")) {
      return <FileVideo size={16} className="text-purple-600" />;
    }

    switch (ext) {
      case "pdf":
        return <FileText size={16} className="text-red-600" />;
      case "doc":
      case "docx":
        return <FileText size={16} className="text-blue-600" />;
      case "xls":
      case "xlsx":
        return <FileSpreadsheet size={16} className="text-green-600" />;
      case "txt":
        return <FileText size={16} className="text-gray-600" />;
      default:
        return <File size={16} className="text-gray-600" />;
    }
  };

  const getFileIconBg = (fileName: string, fileType?: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase() || "";

    if (fileType?.startsWith("image/")) {
      return "bg-blue-100";
    }
    if (fileType?.startsWith("video/")) {
      return "bg-purple-100";
    }

    switch (ext) {
      case "pdf":
        return "bg-red-100";
      case "doc":
      case "docx":
        return "bg-blue-100";
      case "xls":
      case "xlsx":
        return "bg-green-100";
      default:
        return "bg-gray-100";
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="animate-spin text-gray-400" size={20} />
      </div>
    );
  }

  if (!files || files.length === 0) {
    return (
      <div className="text-center py-4 text-xs text-gray-400">
        Chưa có file nào được chia sẻ
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {files.slice(0, 5).map((file: any) => {
        const fileName = file.content?.fileName || "File không tên";
        const fileType = file.content?.fileType || file.type;
        return (
          <div
            key={file._id}
            className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition"
            onClick={() => window.open(file.content?.fileUrl, "_blank")}
          >
            <div
              className={cn(
                "w-8 h-8 rounded flex items-center justify-center shrink-0",
                getFileIconBg(fileName, fileType)
              )}
            >
              {getFileIcon(fileName, fileType)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{fileName}</p>
              <p className="text-[10px] text-gray-500">
                {file.content?.fileSize
                  ? `${(file.content.fileSize / 1024 / 1024).toFixed(2)} MB`
                  : ""}{" "}
                •{" "}
                {file.createdAt &&
                  formatDistanceToNow(new Date(file.createdAt), {
                    addSuffix: true,
                    locale: vi,
                  })}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

