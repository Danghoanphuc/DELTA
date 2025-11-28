// Chat feature - Components exports
// Tổ chức exports để dễ import và bảo trì

// ===== NAVIGATION =====
export { ContextNav } from "./ContextNav";
export { MobileHomeHeader } from "./MobileHomeHeader";
export { CategorySidebar } from "./CategorySidebar";

// ===== CHAT CORE =====
export { ChatContainer } from "./ChatContainer";
export { ChatInterface } from "./ChatInterface";
export { ChatMessages } from "./ChatMessages";
export { MessageList } from "./MessageList";
export { MessageBubble } from "./MessageBubble";
export { MessageContent } from "./MessageContent";
export { ChatInput } from "./ChatInput";
export { ChatBar } from "./Chatbar";
export { ChatWelcome } from "./ChatWelcome";
export { QuickReplyButtons } from "./QuickReplyButtons";

// ===== UI ELEMENTS =====
export { BotAvatar } from "./BotAvatar";
export { UserAvatarComponent } from "./UserAvatarComponent";
export { ChatErrorBoundary } from "./ChatErrorBoundary";

// ===== BUSINESS/PRODUCTS =====
export { BusinessComboGrid } from "./BusinessComboGrid";
export { ChatProductCarousel } from "./ChatProductCarousel";
export { ChatOrderCarousel } from "./ChatOrderCarousel";
export { ChatPrinterCarousel } from "./ChatPrinterCarousel";

// ===== HERO/BANNER =====
export { BannerHero } from "./BannerHero";
export { AiFab } from "./AiFab";

// ===== HISTORY =====
export { ChatHistorySidebar } from "./ChatHistorySidebar";

// ===== PAYMENT =====
export { ChatPaymentCard } from "./ChatPaymentCard";

// ===== MESSAGES (Subfolder) =====
export * from "./messages";

