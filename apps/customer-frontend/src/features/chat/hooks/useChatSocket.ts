import { useEffect, useRef } from "react";
import { useSocket } from "@/contexts/SocketProvider";
import { useAuthStore } from "@/stores/useAuthStore";
import { ChatMessage } from "@/types/chat";

interface UseChatSocketProps {
  conversationId: string | null;
  onStreamStart?: (data: { messageId: string; conversationId: string }) => void;
  onStreamChunk?: (data: { messageId: string; text: string }) => void;
  onMessageNew?: (message: ChatMessage) => void;
  onConversationCreated?: (data: {
    conversationId: string;
    title?: string;
  }) => void;
}

export const useChatSocket = ({
  conversationId,
  onStreamStart,
  onStreamChunk,
  onMessageNew,
  onConversationCreated,
}: UseChatSocketProps) => {
  const { pusher, isConnected } = useSocket();
  const { user } = useAuthStore();

  const callbacksRef = useRef({
    onStreamStart,
    onStreamChunk,
    onMessageNew,
    onConversationCreated,
  });

  const conversationIdRef = useRef(conversationId);

  useEffect(() => {
    callbacksRef.current = {
      onStreamStart,
      onStreamChunk,
      onMessageNew,
      onConversationCreated,
    };
  }, [onStreamStart, onStreamChunk, onMessageNew, onConversationCreated]);

  useEffect(() => {
    conversationIdRef.current = conversationId;
  }, [conversationId]);

  useEffect(() => {
    if (!pusher || !user?._id || !isConnected) {
      console.log("[Socket] Not ready:", {
        pusher: !!pusher,
        userId: user?._id,
        isConnected,
      });
      return;
    }

    const channelName = `private-user-${user._id}`;
    let channel = pusher.channel(channelName);

    if (!channel) {
      console.log(`[Socket] Subscribing to ${channelName}`);
      channel = pusher.subscribe(channelName);

      channel.bind("pusher:subscription_succeeded", () => {
        console.log(`[Socket] ✅ Subscription succeeded for ${channelName}`);
      });

      channel.bind("pusher:subscription_error", (error: any) => {
        console.error(
          `[Socket] ❌ Subscription error for ${channelName}:`,
          error
        );
      });
    } else {
      console.log(`[Socket] Reusing existing channel ${channelName}`);
    }

    const handleStreamStart = (data: any) => {
      const currentId = conversationIdRef.current;
      console.log("[Socket] 🚀 ai:stream:start", { data, currentId });

      if (
        !currentId ||
        currentId.startsWith("temp") ||
        data.conversationId === currentId
      ) {
        callbacksRef.current.onStreamStart?.(data);
      }
    };

    const handleStreamChunk = (data: any) => {
      callbacksRef.current.onStreamChunk?.(data);
    };

    const handleMessageNew = (message: any) => {
      const currentId = conversationIdRef.current;
      const willHandle =
        !currentId ||
        currentId.startsWith("temp") ||
        message.conversationId === currentId ||
        message.conversationId?.toString() === currentId?.toString();

      console.log("[Socket] 📨 chat:message:new", {
        messageId: message._id,
        messageConvId: message.conversationId,
        currentId,
        willHandle,
      });

      if (willHandle) {
        callbacksRef.current.onMessageNew?.(message);
      } else {
        console.warn("[Socket] ⚠️ Ignoring message - conversationId mismatch");
      }
    };

    const handleConversationCreated = (data: any) => {
      console.log("[Socket] 🆕 conversation_created/updated", data);
      callbacksRef.current.onConversationCreated?.(data);
    };

    console.log("[Socket] 🔗 Binding events to channel...");

    channel.unbind("ai:stream:start");
    channel.unbind("ai:stream:chunk");
    channel.unbind("chat:message:new");
    channel.unbind("ai:message");
    channel.unbind("chat:message:updated");
    channel.unbind("conversation_created");
    channel.unbind("conversation_updated");

    channel.bind("ai:stream:start", handleStreamStart);
    channel.bind("ai:stream:chunk", handleStreamChunk);
    channel.bind("chat:message:new", handleMessageNew);
    channel.bind("ai:message", handleMessageNew);
    channel.bind("chat:message:updated", handleMessageNew);
    channel.bind("conversation_created", handleConversationCreated);
    channel.bind("conversation_updated", handleConversationCreated);

    console.log("[Socket] ✅ Events bound successfully");

    return () => {
      console.log("[Socket] Cleaning up events");
      channel.unbind("ai:stream:start", handleStreamStart);
      channel.unbind("ai:stream:chunk", handleStreamChunk);
      channel.unbind("chat:message:new", handleMessageNew);
      channel.unbind("ai:message", handleMessageNew);
      channel.unbind("chat:message:updated", handleMessageNew);
      channel.unbind("conversation_created", handleConversationCreated);
      channel.unbind("conversation_updated", handleConversationCreated);
    };
  }, [pusher, user?._id, isConnected]);

  return {};
};
