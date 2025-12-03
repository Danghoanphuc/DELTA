// apps/customer-frontend/src/features/social/components/ChatInfoSidebar/ChatInfoSidebar.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  X,
  Receipt,
  Zap,
  ChevronRight,
  ShieldCheck,
  ImageIcon,
} from "lucide-react";

// UI Components
import { Button } from "@/shared/components/ui/button";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { cn } from "@/shared/lib/utils";

// Stores
import { useSocialChatStore } from "../../hooks/useSocialChatStore";
import { useAuthStore } from "@/stores/useAuthStore";

// Custom Hooks
import { useConversationBusinessContext } from "./useConversationBusinessContext";
import { useConversationMedia } from "./useConversationMedia";
import { useConversationFiles } from "./useConversationFiles";
import { useLightbox } from "./useLightbox";
import { useSearchMessages } from "./useSearchMessages";
import { useMuteConversation } from "./useMuteConversation";
import { useBlockUser } from "./useBlockUser";
import { useConfirmDialog } from "@/shared/hooks/useConfirmDialog";
import { ConfirmDialog } from "@/shared/components/ui/ConfirmDialog";

// Sub Components
import { LightboxModal } from "./LightboxModal";
import { FilesList } from "./FilesList";
import { MediaGrid } from "./MediaGrid";
import { QuickActions } from "./QuickActions";
import { ProfileSection } from "./ProfileSection";
import { SearchBar } from "./SearchBar";
import { SearchResults } from "./SearchResults";

// --- HELPERS ---
const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    amount
  );

const StatusBadge = ({ status }: { status: string }) => {
  const styles: any = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    processing: "bg-blue-50 text-blue-700 border-blue-200",
    completed: "bg-green-50 text-green-700 border-green-200",
    cancelled: "bg-stone-50 text-stone-500 border-stone-200",
  };
  const labels: any = {
    pending: "Chờ xử lý",
    processing: "Đang in",
    completed: "Hoàn thành",
    cancelled: "Đã hủy",
  };
  return (
    <span
      className={cn(
        "px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border",
        styles[status] || "bg-gray-50 border-gray-200"
      )}
    >
      {labels[status] || status}
    </span>
  );
};

interface ChatInfoSidebarProps {
  conversation: any;
  onClose?: () => void;
}

export function ChatInfoSidebar({
  conversation,
  onClose,
}: ChatInfoSidebarProps) {
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const { toggleInfoSidebar, setScrollToMessageId } = useSocialChatStore();
  const confirmDialog = useConfirmDialog();

  // 1. STATE: Quản lý chế độ Search
  const [isSearching, setIsSearching] = useState(false);

  // 2. HOOKS: Logic Search
  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    handleSearch,
    clearSearch,
    isSearching: isApiSearching,
  } = useSearchMessages(conversation._id);

  // 3. HOOKS: Logic Data (Business, Media, Files)
  const isBusinessChat =
    conversation.type === "customer-printer" ||
    conversation.context === "business" ||
    conversation.context === "printer";

  const { data: businessContext, isLoading: isLoadingBusiness } =
    useConversationBusinessContext(conversation._id, isBusinessChat);
  const { data: mediaData, isLoading: isLoadingMedia } = useConversationMedia(
    conversation._id
  );
  // FilesList tự fetch bên trong component con

  const lightbox = useLightbox(conversation._id);

  // 4. HOOKS: Actions (Mute, Block)
  const {
    isMuted,
    toggleMute,
    isPending: isMuting,
  } = useMuteConversation(conversation);

  // Logic tìm Partner (cho 1-1 chat)
  const isGroup = conversation.type === "group";
  const partner = !isGroup
    ? conversation.participants?.find(
        (p: any) => (p.userId?._id || p.userId) !== currentUser?._id
      )?.userId
    : null;

  const {
    isBlocked,
    toggleBlock,
    confirmBlock,
    isPending: isBlocking,
  } = useBlockUser(partner?._id, isGroup);

  // Data processing
  const orders = businessContext?.activeOrders || businessContext?.orders || [];
  const mediaFiles = mediaData?.media || mediaData || [];
  const totalDue = orders.reduce(
    (sum: number, o: any) => sum + (o.totalAmount || 0),
    0
  );
  const totalPaid = orders.reduce(
    (sum: number, o: any) => sum + (o.paidAmount || 0),
    0
  );

  // --- HANDLERS ---
  const handleBlockAction = () => {
    if (!partner?._id) return;
    const needsConfirm = toggleBlock(partner._id);
    if (needsConfirm) {
      confirmDialog.confirm(
        {
          title: "Chặn người dùng này?",
          description: "Họ sẽ không thể nhắn tin cho bạn nữa.",
          confirmText: "Chặn ngay",
          variant: "danger",
        },
        () => confirmBlock(partner._id)
      );
    }
  };

  const handleSearchResultClick = (messageId: string) => {
    setScrollToMessageId(messageId);
    // Nếu trên mobile thì đóng sidebar
    if (window.innerWidth < 1024 && onClose) onClose();
  };

  const handleCloseSearch = () => {
    setIsSearching(false);
    clearSearch();
  };

  return (
    <>
      <div className="flex h-full w-full flex-col border-l border-stone-200 bg-white md:w-[350px] overflow-hidden">
        {/* === A. HEADER AREA === */}
        {isSearching ? (
          <SearchBar
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            onSearch={handleSearch}
            onCancel={handleCloseSearch}
            isSearching={isApiSearching}
          />
        ) : (
          <div className="flex h-14 shrink-0 items-center justify-between border-b border-stone-100 px-4 bg-white/80 backdrop-blur-sm z-10">
            <h3 className="font-bold text-stone-800 flex items-center gap-2">
              <ShieldCheck size={16} className="text-blue-600" />
              Thông tin hội thoại
            </h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose || toggleInfoSidebar}
              className="h-8 w-8 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded-full"
            >
              <X size={18} />
            </Button>
          </div>
        )}

        {/* === B. CONTENT AREA === */}
        {isSearching ? (
          <ScrollArea className="flex-1">
            <SearchResults
              results={searchResults}
              onResultClick={handleSearchResultClick}
            />
          </ScrollArea>
        ) : (
          <ScrollArea className="flex-1">
            {/* 1. Profile Section */}
            <ProfileSection
              conversation={conversation}
              partner={partner}
              isGroup={isGroup}
            />

            {/* 2. Quick Actions (Mute, Search, Block) */}
            <QuickActions
              isMuted={isMuted}
              isBlocked={isBlocked}
              isGroup={isGroup}
              isMuting={isMuting}
              isBlocking={isBlocking}
              onMuteToggle={toggleMute}
              onSearchClick={() => setIsSearching(true)}
              onBlockToggle={handleBlockAction}
            />

            <div className="p-4 pr-6 space-y-6">
              {/* 3. Financial Card (Only Business) */}
              {orders.length > 0 && (
                <div className="relative overflow-hidden rounded-xl bg-stone-900 text-white shadow-xl shadow-stone-200 group transition-all hover:shadow-2xl">
                  <div className="absolute top-0 right-0 p-3 opacity-10">
                    <Receipt size={80} />
                  </div>
                  <div className="relative z-10 p-5">
                    <div className="mb-1 text-[10px] uppercase tracking-widest text-stone-400 font-bold">
                      Công nợ dự án
                    </div>
                    <div className="text-3xl font-serif font-bold tracking-tight mb-4">
                      {formatCurrency(totalDue - totalPaid)}
                    </div>

                    <div className="flex items-center gap-4 text-xs border-t border-white/10 pt-3">
                      <div className="flex flex-col">
                        <span className="text-stone-500 text-[10px]">
                          Tổng cộng
                        </span>
                        <span className="font-mono font-bold">
                          {formatCurrency(totalDue)}
                        </span>
                      </div>
                      <div className="w-px h-6 bg-white/10"></div>
                      <div className="flex flex-col">
                        <span className="text-stone-500 text-[10px]">
                          Đã thanh toán
                        </span>
                        <span className="font-mono font-bold text-green-400">
                          {formatCurrency(totalPaid)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. Orders List (Only Business) */}
              {isBusinessChat && (
                <section>
                  <div className="mb-3 flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-2">
                      Đơn hàng ({orders.length})
                    </h4>
                    <button
                      onClick={() => navigate("/quotes/create")}
                      className="text-[10px] font-bold text-blue-600 hover:bg-blue-50 px-2 py-1 rounded flex items-center gap-1 transition-colors"
                    >
                      <Zap size={12} /> Tạo mới
                    </button>
                  </div>

                  {isLoadingBusiness ? (
                    <div className="space-y-2">
                      {[1, 2].map((i) => (
                        <div
                          key={i}
                          className="h-16 rounded-lg bg-stone-50 animate-pulse"
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {orders.map((order: any) => (
                        <div
                          key={order._id}
                          onClick={() => navigate(`/orders/${order._id}`)}
                          className="group relative rounded-lg border border-stone-100 bg-stone-50/50 p-3 hover:bg-white hover:border-blue-200 hover:shadow-md transition-all cursor-pointer"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-mono text-xs font-bold text-stone-900 group-hover:text-blue-700 transition-colors">
                              {order.orderNumber}
                            </span>
                            <StatusBadge status={order.status} />
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-stone-600 font-medium truncate max-w-[120px]">
                              {order.itemSummary || "In ấn theo yêu cầu"}
                            </span>
                            <span className="font-bold text-stone-900">
                              {formatCurrency(order.totalAmount)}
                            </span>
                          </div>
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity -mr-4 group-hover:mr-0">
                            <ChevronRight size={16} className="text-blue-400" />
                          </div>
                        </div>
                      ))}
                      {orders.length === 0 && (
                        <div className="rounded-lg border border-dashed border-stone-200 p-6 text-center text-xs text-stone-400 bg-stone-50/30">
                          Chưa có đơn hàng nào
                        </div>
                      )}
                    </div>
                  )}
                </section>
              )}

              {/* 5. Files List (Smart Categorized) */}
              <section className="pt-2 border-t border-stone-100">
                <FilesList conversationId={conversation._id} />
              </section>

              {/* 6. Media Gallery */}
              <section className="pt-2 border-t border-stone-100">
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-2">
                    <ImageIcon size={12} className="text-purple-600" />
                    Ảnh mẫu ({mediaFiles.length})
                  </h4>
                </div>
                <MediaGrid media={mediaFiles} isLoading={isLoadingMedia} />
              </section>
            </div>
          </ScrollArea>
        )}
      </div>

      {/* === C. MODALS & DIALOGS === */}
      {/* Lightbox */}
      {lightbox.lightboxImage && (
        <LightboxModal
          imageUrl={lightbox.lightboxImage}
          onClose={lightbox.closeLightbox}
          onPrev={lightbox.goToPrev}
          onNext={lightbox.goToNext}
          hasPrev={lightbox.hasPrev}
          hasNext={lightbox.hasNext}
        />
      )}

      {/* Confirm Block Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={confirmDialog.handleClose}
        onConfirm={confirmDialog.handleConfirm}
        title={confirmDialog.options.title}
        description={confirmDialog.options.description}
        confirmText={confirmDialog.options.confirmText}
        cancelText={confirmDialog.options.cancelText}
        variant={confirmDialog.options.variant}
        isLoading={isBlocking}
      />
    </>
  );
}
