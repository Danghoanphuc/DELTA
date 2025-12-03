// apps/customer-frontend/src/features/social/components/ChatInfoSidebar/FilesList.tsx
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Loader2,
  FileText,
  Image as ImageIcon,
  Receipt,
  Package,
} from "lucide-react"; // Thay FileBox bằng Package cho đẹp
import { getConversationFiles } from "../../../chat/services/chat.api.service";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/shared/lib/utils";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { useAuthStore } from "@/stores/useAuthStore";
import { FileItemMenuSimple } from "./FileItemMenuSimple";
import { useFileActions } from "./useFileActions";
import { categorizeFiles, formatFileSize } from "./file-utils";
import type { FileItem } from "./types";

interface FilesListProps {
  conversationId: string;
}

export function FilesList({ conversationId }: FilesListProps) {
  const currentUser = useAuthStore((s) => s.user);
  const {
    data: files,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["conversationFiles", conversationId],
    queryFn: () => getConversationFiles(conversationId),
    staleTime: 5000, // ✅ Giảm staleTime để refetch nhanh hơn
    refetchOnWindowFocus: true, // ✅ Refetch khi focus lại window
  });

  const { handleDownload, handleGoToMessage, handleDelete, isDeleting } =
    useFileActions(conversationId, currentUser?._id);

  const groups = useMemo(() => {
    // ✅ Ensure files is an array
    const fileArray = Array.isArray(files) ? files : [];

    if (fileArray.length === 0) {
      return { contracts: [], production: [], media: [], documents: [] };
    }

    // 🔍 Debug logging
    console.log("[FilesList] Files received:", fileArray.length);
    if (fileArray.length > 0) {
      console.log("[FilesList] Sample file:", fileArray[0]);
    }

    const categorized = categorizeFiles(fileArray);
    console.log("[FilesList] Categorized:", {
      contracts: categorized.contracts.length,
      production: categorized.production.length,
      media: categorized.media.length,
      documents: categorized.documents.length,
    });

    return categorized;
  }, [files]);

  // Show loading only on initial load
  if (isLoading && !files)
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="animate-spin text-stone-300" size={20} />
      </div>
    );

  // ✅ Check if files is array and has items
  const fileArray = Array.isArray(files) ? files : [];
  if (fileArray.length === 0)
    return (
      <div className="text-center py-8 text-xs text-stone-400 italic">
        Chưa có tài liệu nào
      </div>
    );

  // --- SUB COMPONENT: FILE ITEM (Clean Style) ---
  const FileItemComponent = ({
    file,
    icon: Icon,
    colorClass,
  }: {
    file: FileItem;
    icon: any;
    colorClass: string;
  }) => {
    const isSender = file.sender?._id === currentUser?._id;
    return (
      <div className="group flex items-center gap-3 py-2.5 px-2 hover:bg-stone-50 rounded-lg transition-all cursor-pointer relative">
        {/* Icon nền nhẹ */}
        <div
          className={cn(
            "w-9 h-9 rounded-lg flex items-center justify-center shrink-0 shadow-sm",
            colorClass
          )}
        >
          <Icon size={18} strokeWidth={2} />
        </div>

        {/* Info */}
        <div
          className="flex-1 min-w-0"
          onClick={() => window.open(file.url, "_blank")}
        >
          <p className="text-[13px] font-medium text-stone-700 truncate group-hover:text-blue-600 transition-colors">
            {file.name || "File không tên"}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[10px] font-bold text-stone-400 uppercase bg-stone-100 px-1 rounded">
              {file.name?.split(".").pop()}
            </span>
            {file.size > 0 && (
              <span className="text-[10px] text-stone-400">
                {formatFileSize(file.size)}
              </span>
            )}
            <span className="text-[10px] text-stone-300">•</span>
            <span className="text-[10px] text-stone-400">
              {formatDistanceToNow(new Date(file.createdAt), {
                locale: vi,
                addSuffix: false,
              })}
            </span>
          </div>
        </div>

        {/* Actions - Luôn render nhưng ẩn để tránh unmount */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <FileItemMenuSimple
            file={file}
            isSender={isSender}
            onDownload={() => handleDownload(file.url, file.name)}
            onGoToMessage={() => handleGoToMessage(file.messageId)}
            onDelete={(deleteForEveryone) =>
              handleDelete(
                file.messageId,
                file.sender?._id || "",
                deleteForEveryone
              )
            }
            isDeleting={isDeleting}
          />
        </div>
      </div>
    );
  };

  return (
    <Tabs defaultValue="production" className="w-full relative">
      {/* ✅ Refetching indicator */}
      {isFetching && (
        <div className="absolute top-0 right-0 z-10">
          <Loader2 className="animate-spin text-primary" size={14} />
        </div>
      )}

      {/* TABS HEADER: Style Text (Modern) */}
      <div className="w-full overflow-x-auto no-scrollbar border-b border-stone-100 mb-2">
        <TabsList className="flex w-max h-9 p-0 bg-transparent gap-4">
          <StyledTrigger
            value="contracts"
            label="Hợp đồng"
            count={groups.contracts.length}
          />
          <StyledTrigger
            value="production"
            label="File in"
            count={groups.production.length}
          />
          <StyledTrigger
            value="media"
            label="Ảnh"
            count={groups.media.length}
          />
          <StyledTrigger
            value="documents"
            label="Khác"
            count={groups.documents.length}
          />
        </TabsList>
      </div>

      <ScrollArea className="h-[280px]">
        <div className="px-1">
          <TabsContent value="contracts" className="mt-0 space-y-0.5">
            {groups.contracts.length === 0 ? (
              <EmptyState text="Chưa có hợp đồng/hóa đơn" />
            ) : (
              groups.contracts.map((f) => (
                <FileItemComponent
                  key={f._id}
                  file={f}
                  icon={Receipt}
                  colorClass="bg-orange-50 text-orange-600 border border-orange-100"
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="production" className="mt-0 space-y-0.5">
            {groups.production.length === 0 ? (
              <EmptyState text="Chưa có file thiết kế" />
            ) : (
              groups.production.map((f) => (
                <FileItemComponent
                  key={f._id}
                  file={f}
                  icon={Package}
                  colorClass="bg-blue-50 text-blue-600 border border-blue-100"
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="media" className="mt-0 space-y-0.5">
            {groups.media.length === 0 ? (
              <EmptyState text="Chưa có ảnh" />
            ) : (
              groups.media.map((f) => (
                <FileItemComponent
                  key={f._id}
                  file={f}
                  icon={ImageIcon}
                  colorClass="bg-purple-50 text-purple-600 border border-purple-100"
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="documents" className="mt-0 space-y-0.5">
            {groups.documents.length === 0 ? (
              <EmptyState text="Chưa có tài liệu" />
            ) : (
              groups.documents.map((f) => (
                <FileItemComponent
                  key={f._id}
                  file={f}
                  icon={FileText}
                  colorClass="bg-emerald-50 text-emerald-600 border border-emerald-100"
                />
              ))
            )}
          </TabsContent>
        </div>
      </ScrollArea>
    </Tabs>
  );
}

// --- HELPERS COMPONENTS ---
const StyledTrigger = ({ value, label, count }: any) => (
  <TabsTrigger
    value={value}
    className="rounded-none border-b-2 border-transparent px-1 pb-2 pt-1 text-[11px] font-bold uppercase text-stone-500 data-[state=active]:border-stone-900 data-[state=active]:text-stone-900 data-[state=active]:bg-transparent transition-all"
  >
    {label}{" "}
    <span className="ml-1 text-[9px] font-normal opacity-70 bg-stone-100 px-1.5 rounded-full">
      {count}
    </span>
  </TabsTrigger>
);

const EmptyState = ({ text }: { text: string }) => (
  <div className="flex flex-col items-center justify-center py-8 text-stone-300">
    <Package size={32} strokeWidth={1} className="mb-2 opacity-50" />
    <p className="text-xs">{text}</p>
  </div>
);
