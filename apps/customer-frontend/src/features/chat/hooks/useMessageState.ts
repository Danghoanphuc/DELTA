import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { ChatMessage, QuickReply } from "@/types/chat";

export const WELCOME_ID = "welcome_screen";
export const TEMP_AI_ID = "temp_ai_response";

export const WELCOME_MESSAGE: ChatMessage = {
  _id: WELCOME_ID,
  conversationId: "system",
  senderType: "AI",
  type: "text",
  content: { text: "Welcome" },
  createdAt: new Date().toISOString(),
} as ChatMessage;

interface MessageState {
  messages: ChatMessage[];
  quickReplies: QuickReply[];
  isLoadingHistory: boolean;
  isGenerating: boolean;

  setMessages: (messages: ChatMessage[]) => void;
  addMessage: (message: ChatMessage) => void;
  updateMessage: (id: string, updates: Partial<ChatMessage>) => void;
  replaceTempId: (
    tempId: string,
    realId: string,
    conversationId: string
  ) => void;
  appendStreamContent: (id: string, chunk: string) => void;
  removeMessage: (id: string) => void;

  setQuickReplies: (replies: QuickReply[]) => void;
  setLoadingHistory: (loading: boolean) => void;
  setGenerating: (generating: boolean) => void;
  resetState: () => void;
}

export const useMessageState: () => MessageState = create<MessageState>()(
  immer((set) => ({
    messages: [],
    quickReplies: [],
    isLoadingHistory: false,
    isGenerating: false,

    setMessages: (messages) => set({ messages }),

    addMessage: (message) =>
      set((state) => {
        const exists = state.messages.some(
          (m) =>
            m._id === message._id ||
            ((message.metadata as any)?.clientSideId &&
              (m.metadata as any)?.clientSideId ===
                (message.metadata as any)?.clientSideId)
        );
        if (exists) {
          console.log(
            "[MessageState] Message already exists, skipping:",
            message._id
          );
          return state;
        }
        return { messages: [...state.messages, message] };
      }),

    updateMessage: (id, updates) =>
      set((state) => ({
        messages: state.messages.map((m) =>
          m._id === id || (m.metadata as any)?.clientSideId === id
            ? { ...m, ...updates }
            : m
        ),
      })),

    replaceTempId: (tempId, realId, conversationId) =>
      set((state) => ({
        isGenerating: true,
        messages: state.messages.map((m) => {
          if (m._id === tempId || (m.metadata as any)?.tempId === tempId) {
            return {
              ...m,
              _id: realId,
              conversationId,
              content: { text: "" },
              metadata: {
                ...m.metadata,
                status: "streaming",
                tempId: undefined,
              },
            } as ChatMessage;
          }
          return m;
        }),
      })),

    appendStreamContent: (id, chunk) =>
      set((state) => {
        const message = state.messages.find((m) => m._id === id);
        if (!message) return;

        const currentText =
          typeof message.content === "string"
            ? message.content
            : (message.content as any).text || "";

        if (typeof message.content === "object") {
          (message.content as any).text = currentText + chunk;
        }
      }),

    removeMessage: (id) =>
      set((state) => ({
        messages: state.messages.filter((m) => m._id !== id),
      })),

    setQuickReplies: (replies) => set({ quickReplies: replies }),
    setLoadingHistory: (loading) => set({ isLoadingHistory: loading }),
    setGenerating: (generating) => set({ isGenerating: generating }),

    resetState: () =>
      set({
        messages: [],
        quickReplies: [],
        isGenerating: false,
        isLoadingHistory: false,
      }),
  }))
);
