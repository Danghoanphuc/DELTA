// useFileActions.ts - Hook for file actions (delete, download, etc.)
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/shared/lib/axios";
import { toast } from "@/shared/utils/toast";
import { downloadFile } from "./file-utils";
import { useSocialChatStore } from "../../hooks/useSocialChatStore";

export function useFileActions(conversationId: string, currentUserId?: string) {
  const queryClient = useQueryClient();

  // Delete message (and its attachments)
  const deleteMessageMutation = useMutation({
    mutationFn: async ({
      messageId,
      deleteForEveryone,
    }: {
      messageId: string;
      deleteForEveryone: boolean;
    }) => {
      const response = await api.delete(`/chat/messages/${messageId}`, {
        data: { deleteForEveryone },
      });
      return response.data;
    },
    onMutate: async ({ messageId }) => {
      // ✅ OPTIMISTIC UPDATE: Xóa ngay khỏi UI
      console.log("[useFileActions] Optimistic delete:", messageId);

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["conversationFiles", conversationId],
      });

      // Snapshot the previous value
      const previousFiles = queryClient.getQueryData([
        "conversationFiles",
        conversationId,
      ]);

      // Optimistically remove the file
      queryClient.setQueryData(
        ["conversationFiles", conversationId],
        (old: any) => {
          if (!Array.isArray(old)) return [];
          const filtered = old.filter(
            (file: any) => file.messageId !== messageId
          );
          console.log(
            `[useFileActions] Filtered ${old.length} -> ${filtered.length} files`
          );
          return filtered;
        }
      );

      // Also update media if needed
      queryClient.setQueryData(
        ["conversationMedia", conversationId],
        (old: any) => {
          if (!Array.isArray(old)) return [];
          return old.filter((media: any) => media.messageId !== messageId);
        }
      );

      return { previousFiles };
    },
    onSuccess: () => {
      console.log("[useFileActions] Delete success - waiting for socket event");
      toast.success("Đã xóa");
      // ✅ KHÔNG refetch ở đây - đợi socket event
    },
    onError: (error: any, variables, context) => {
      console.error("[useFileActions] Delete error:", error);

      // ✅ ROLLBACK: Khôi phục data cũ
      if (context?.previousFiles) {
        queryClient.setQueryData(
          ["conversationFiles", conversationId],
          context.previousFiles
        );
      }

      toast.error(error.response?.data?.message || "Không thể xóa");
    },
  });

  // Download file
  const handleDownload = async (url: string, fileName: string) => {
    try {
      toast.info("Đang tải xuống...");
      await downloadFile(url, fileName);
      toast.success("Đã tải xuống");
    } catch (error) {
      toast.error("Lỗi khi tải xuống");
    }
  };

  // Navigate to message
  const handleGoToMessage = (messageId: string) => {
    // Use store to trigger scroll
    const { setScrollToMessageId, setInfoSidebarOpen } =
      useSocialChatStore.getState();

    // Close info sidebar on mobile
    if (window.innerWidth < 768) {
      setInfoSidebarOpen(false);
    }

    // Set message to scroll to
    setScrollToMessageId(messageId);

    // Reset after scroll
    setTimeout(() => {
      setScrollToMessageId(null);
    }, 2000);
  };

  // Delete file
  const handleDelete = (
    messageId: string,
    senderId: string,
    deleteForEveryone: boolean = false
  ) => {
    // Check if user is sender
    const isSender = senderId === currentUserId;

    if (deleteForEveryone && !isSender) {
      toast.error("Bạn không có quyền xóa cho mọi người");
      return;
    }

    deleteMessageMutation.mutate({ messageId, deleteForEveryone });
  };

  return {
    handleDownload,
    handleGoToMessage,
    handleDelete,
    isDeleting: deleteMessageMutation.isPending,
  };
}
