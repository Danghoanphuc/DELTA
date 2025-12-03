// apps/customer-frontend/src/features/chat/index.ts
/**
 * 🔥 CHAT FEATURE - BARREL EXPORT
 * Central export point for all chat-related modules
 */

// ===== CORE LIBRARIES =====
export * from "./lib";

// ===== HOOKS =====
export { useChat } from "./hooks/useChat";
export { useChatSender } from "./hooks/useChatSender";
export { useEnhancedChatSender } from "./hooks/useChatSender.enhanced";
export { useNetworkStatus } from "./hooks/useNetworkStatus";
export { useMessageState } from "./hooks/useMessageState";
export { useConversationState } from "./hooks/useConversationState";

// ===== STORES =====
export { useChatStore } from "./stores/useChatStore";
export { useEnhancedChatStore } from "./stores/useChatStore.enhanced";

// ===== COMPONENTS =====
export { ChatInterface } from "./components/ChatInterface";
export { MessageList } from "./components/MessageList";
export { MessageBubble } from "./components/MessageBubble";
export { ChatInput } from "./components/ChatInput";
export { ChatWelcome } from "./components/ChatWelcome";

// Message Status Components
export * from "./components/message-status";

// Offline Components
export * from "./components/offline";

// ===== SERVICES =====
export * from "./services/chat.api.service";

// ===== PAGES =====
export { default as ChatPage } from "./pages/ChatPage";
export { default as AppPage } from "../main/pages/AppPage";
