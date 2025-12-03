// Chat feature - Components exports
// Tổ chức exports để dễ import và bảo trì

// ===== NAVIGATION =====
export { ContextNav } from "../../main/components/ContextNav";
export { MobileHomeHeader } from "../../main/components/MobileHomeHeader";
export { CategorySidebar } from "../../main/components/CategorySidebar";

// ===== CHAT CORE =====
export { ChatInterface } from "./ChatInterface";
export { MessageList } from "./MessageList";
export { MessageBubble } from "./MessageBubble";
export { MessageContent } from "./MessageContent";
export { ChatInput } from "./ChatInput";
// ❌ REMOVED: ChatBar export (file không tồn tại)
export { ChatWelcome } from "./ChatWelcome";
export { QuickReplyButtons } from "./QuickReplyButtons";

// ===== UI ELEMENTS =====
export { BotAvatar } from "./BotAvatar";
export { UserAvatarComponent } from "./UserAvatarComponent";
export { ChatErrorBoundary } from "./ChatErrorBoundary";

// ===== BUSINESS/PRODUCTS =====
export { BusinessComboGrid } from "../../main/components/BusinessComboGrid";
export { ChatProductCarousel } from "./ChatProductCarousel";
export { ChatOrderCarousel } from "./ChatOrderCarousel";
export { ChatPrinterCarousel } from "./ChatPrinterCarousel";

// ===== HERO/BANNER =====
export { BannerHero } from "../../main/components/BannerHero";
export { AiFab } from "./AiFab";

// ===== HISTORY =====
export { ChatHistorySidebar } from "./ChatHistorySidebar";

// ===== PAYMENT =====
export { ChatPaymentCard } from "./ChatPaymentCard";

// ===== MESSAGES (Subfolder) =====
export * from "./messages";
