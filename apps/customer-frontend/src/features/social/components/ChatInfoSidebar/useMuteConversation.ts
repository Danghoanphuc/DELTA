// apps/customer-frontend/src/features/social/components/ChatInfoSidebar/useMuteConversation.ts
// ✅ Custom hook cho mute conversation logic

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { muteConversation } from "../../../chat/services/chat.api.service";
import { toast } from "@/shared/utils/toast";

export function useMuteConversation(conversation: any) {
  const [isMuted, setIsMuted] = useState(false);
  const queryClient = useQueryClient();

  // Fetch initial mute status
  useEffect(() => {
    if (conversation._id) {
      // Tìm participant của current user và lấy isMuted
      const currentUserParticipant = conversation.participants?.find(
        (p: any) => p.userId?._id || p.userId
      );
      setIsMuted(currentUserParticipant?.isMuted || false);
    }
  }, [conversation._id, conversation.participants]);

  const mutation = useMutation({
    mutationFn: ({ conversationId, isMuted }: { conversationId: string; isMuted: boolean }) =>
      muteConversation(conversationId, isMuted),
    onSuccess: (_, variables) => {
      setIsMuted(variables.isMuted);
      toast.success(variables.isMuted ? "Đã tắt thông báo" : "Đã bật thông báo");
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: () => {
      toast.error("Không thể cập nhật cài đặt thông báo");
    },
  });

  const toggleMute = () => {
    if (!conversation._id) return;
    mutation.mutate({
      conversationId: conversation._id,
      isMuted: !isMuted,
    });
  };

  return {
    isMuted,
    toggleMute,
    isPending: mutation.isPending,
  };
}

