// apps/customer-frontend/src/features/chat/hooks/useChatWithUser.ts
// ✅ SOCIAL: Hook for initiating P2P chat with a friend

import { useMutation } from "@tanstack/react-query";
import { createPeerConversation } from "../services/chat.api.service";
import { toast } from "@/shared/utils/toast";
import { useNavigate } from "react-router-dom";
import { useConnectionStore } from "@/stores/useConnectionStore";

export const useChatWithUser = () => {
  const navigate = useNavigate();
  const { isFriend } = useConnectionStore();

  const mutation = useMutation({
    mutationFn: (userId: string) => {
      // Check if they are friends first
      if (!isFriend(userId)) {
        throw new Error("Bạn phải kết bạn trước khi có thể chat");
      }
      return createPeerConversation(userId);
    },
    onSuccess: (data) => {
      const conversation = data.data?.conversation;

      if (!conversation) {
        toast.error("Không thể tạo cuộc trò chuyện");
        return;
      }

      if (data.data?.isNew) {
        toast.success("Đã tạo cuộc trò chuyện");
      }

      // Navigate to chat with the conversation ID
      navigate(`/chat?conversationId=${conversation._id}`);
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Không thể tạo cuộc trò chuyện"
      );
    },
  });

  return {
    startChatWithUser: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
};
