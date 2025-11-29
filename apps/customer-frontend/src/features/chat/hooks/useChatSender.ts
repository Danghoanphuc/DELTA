import { useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { toast } from "@/shared/utils/toast";
import * as chatApi from "../services/chat.api.service";
import { useMessageState } from "./useMessageState";
import { useConversationState } from "./useConversationState";
import { useChatContextManager } from "./useChatContextManager";

export const useChatSender = () => {
  const messageState = useMessageState();
  const conversationState = useConversationState();
  const { getContext } = useChatContextManager();

  const onSendText = useCallback(
    async (text: string) => {
      if (!text?.trim()) return;

      const currentConvId = conversationState.currentConversationId;
      const userMsgId = uuidv4();
      const aiTempId = `temp_ai_${Date.now()}`;

      console.log("[Sender] Sending message:", {
        text,
        currentConvId,
        userMsgId,
        aiTempId,
      });

      messageState.addMessage({
        _id: userMsgId,
        conversationId: currentConvId || "temp",
        senderType: "User",
        type: "text",
        content: { text },
        createdAt: new Date().toISOString(),
        metadata: { status: "sending", clientSideId: userMsgId },
      });

      messageState.addMessage({
        _id: aiTempId,
        conversationId: currentConvId || "temp",
        senderType: "AI",
        type: "text",
        content: { text: "" },
        createdAt: new Date().toISOString(),
        metadata: { status: "pending", tempId: aiTempId },
      });

      messageState.setGenerating(true);

      try {
        const context = getContext();

        const response = await chatApi.postChatMessage(
          text,
          currentConvId && !currentConvId.startsWith("temp")
            ? currentConvId
            : null,
          undefined,
          undefined,
          undefined,
          { ...context, clientSideId: userMsgId }
        );

        console.log("[Sender] API response:", response);

        messageState.updateMessage(userMsgId, {
          metadata: { status: "sent", clientSideId: userMsgId },
        });

        if (response?.newConversation) {
          const newId = response.newConversation._id;
          console.log("[Sender] New conversation created:", newId);

          conversationState.addConversation(response.newConversation);
          conversationState.selectConversation(newId);

          messageState.updateMessage(userMsgId, { conversationId: newId });
          messageState.updateMessage(aiTempId, { conversationId: newId });
        }
      } catch (error) {
        console.error("[Sender] Error:", error);

        messageState.removeMessage(aiTempId);
        messageState.setGenerating(false);

        messageState.addMessage({
          _id: `error_${Date.now()}`,
          conversationId: currentConvId || "temp",
          senderType: "AI",
          type: "error",
          content: { text: "⚠️ Hệ thống đang bận, vui lòng thử lại sau." },
          createdAt: new Date().toISOString(),
          metadata: { status: "error" },
        });
      }
    },
    [conversationState, messageState, getContext]
  );

  const onFileUpload = useCallback(async (file: File) => {
    toast.info("Tính năng đang cập nhật");
  }, []);

  return { onSendText, onFileUpload };
};
