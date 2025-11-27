// apps/customer-frontend/src/features/chat/hooks/useChatWithPrinter.ts
// ✅ SOCIAL: Hook for initiating chat with a printer

import { useMutation } from "@tanstack/react-query";
import { createPrinterConversation } from "../services/chat.api.service";
import { toast } from "@/shared/utils/toast";
import { useNavigate } from "react-router-dom";

export const useChatWithPrinter = () => {
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: (printerId: string) => createPrinterConversation(printerId),
    onSuccess: (data) => {
      const conversation = data.data?.conversation;
      
      if (!conversation) {
        toast.error("Không thể tạo cuộc trò chuyện");
        return;
      }

      if (data.data?.isNew) {
        toast.success("Đã tạo cuộc trò chuyện với nhà in");
      }

      // Navigate to chat with the conversation ID
      navigate(`/chat?conversationId=${conversation._id}`);
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Không thể kết nối với nhà in"
      );
    },
  });

  return {
    startChatWithPrinter: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
};

