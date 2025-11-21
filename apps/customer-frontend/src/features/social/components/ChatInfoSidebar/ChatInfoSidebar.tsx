// apps/customer-frontend/src/features/social/components/ChatInfoSidebar/ChatInfoSidebar.tsx
// ✅ REFACTORED: Main ChatInfoSidebar component - Clean và dễ quản lý

import { useState } from "react";
import { X, Trash2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { ConfirmDialog } from "@/shared/components/ui/ConfirmDialog";
import { useSocialChatStore } from "../../hooks/useSocialChatStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { cn } from "@/shared/lib/utils";
import { MediaGrid } from "./MediaGrid";
import { FilesList } from "./FilesList";
import { LightboxModal } from "./LightboxModal";
import { ProfileSection } from "./ProfileSection";
import { QuickActions } from "./QuickActions";
import { SearchBar } from "./SearchBar";
import { SearchResults } from "./SearchResults";
import { useMuteConversation } from "./useMuteConversation";
import { useBlockUser } from "./useBlockUser";
import { useSearchMessages } from "./useSearchMessages";
import { useLightbox } from "./useLightbox";

interface ChatInfoSidebarProps {
  conversation: any;
  onClose?: () => void;
  className?: string;
}

export function ChatInfoSidebar({ conversation, onClose, className }: ChatInfoSidebarProps) {
  const currentUser = useAuthStore((s) => s.user);
  const { toggleInfoSidebar, setScrollToMessageId } = useSocialChatStore();
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);

  // ✅ Xử lý cả group chat và peer-to-peer
  const isGroup = conversation.type === "group";
  const partner = isGroup
    ? null
    : conversation.participants.find(
        (p: any) => (p.userId?._id || p.userId) !== currentUser?._id
      )?.userId || {};

  const partnerId = partner?._id || partner?.userId;

  // ✅ Custom hooks
  const { isMuted, toggleMute, isPending: isMuting } = useMuteConversation(conversation);
  const { isBlocked, toggleBlock, confirmBlock, isPending: isBlocking } = useBlockUser(
    partnerId,
    isGroup
  );
  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    handleSearch,
    clearSearch,
  } = useSearchMessages(conversation._id);
  const {
    lightboxImage,
    mediaList,
    openLightbox,
    closeLightbox,
    goToPrev,
    goToNext,
    hasPrev,
    hasNext,
  } = useLightbox(conversation._id);

  // ✅ Handlers
  const handleSearchModeToggle = () => {
    setIsSearchMode(true);
  };

  const handleSearchCancel = () => {
    setIsSearchMode(false);
    clearSearch();
  };

  const handleClickSearchResult = (messageId: string) => {
    setScrollToMessageId(messageId);
    setIsSearchMode(false);
    clearSearch();
  };

  const handleBlockToggle = () => {
    if (!partnerId || isGroup) return;
    const shouldShowConfirm = toggleBlock(partnerId);
    if (shouldShowConfirm) {
      setShowBlockConfirm(true);
    }
  };

  const handleConfirmBlock = () => {
    if (!partnerId) return;
    confirmBlock(partnerId);
    setShowBlockConfirm(false);
  };

  return (
    <>
      <div className={cn("flex flex-col h-full bg-white border-l border-gray-200", className)}>
        {/* Header - Dynamic: Normal hoặc Search Mode */}
        {isSearchMode ? (
          <SearchBar
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            onSearch={handleSearch}
            onCancel={handleSearchCancel}
            isSearching={isSearching}
          />
        ) : (
          <div className="h-16 px-4 border-b flex items-center justify-between shrink-0">
            <h3 className="font-semibold text-gray-900">Thông tin hội thoại</h3>
            <Button variant="ghost" size="icon" onClick={onClose || toggleInfoSidebar}>
              <X size={20} className="text-gray-500" />
            </Button>
          </div>
        )}

        <ScrollArea className="flex-1">
          {/* Search Results */}
          {isSearchMode && (
            <SearchResults results={searchResults} onResultClick={handleClickSearchResult} />
          )}

          {/* Main Content */}
          {!isSearchMode && (
            <>
              {/* Profile Section */}
              <ProfileSection conversation={conversation} partner={partner} isGroup={isGroup} />

              {/* Quick Actions */}
              <QuickActions
                isMuted={isMuted}
                isBlocked={isBlocked}
                isGroup={isGroup}
                isMuting={isMuting}
                isBlocking={isBlocking}
                onMuteToggle={toggleMute}
                onSearchClick={handleSearchModeToggle}
                onBlockToggle={handleBlockToggle}
              />

              {/* Media & Files */}
              <div className="p-4 space-y-4">
                {/* Media Section */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between w-full text-sm font-medium text-gray-900">
                    <span>Ảnh & Video</span>
                  </div>
                  <MediaGrid conversationId={conversation._id} onImageClick={openLightbox} />
                </div>

                {/* Files Section */}
                <div className="space-y-2 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between w-full text-sm font-medium text-gray-900">
                    <span>File đã chia sẻ</span>
                  </div>
                  <FilesList conversationId={conversation._id} />
                </div>
              </div>

              {/* Danger Zone */}
              <div className="p-4 mt-4">
                <Button
                  variant="outline"
                  className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-100 justify-start h-10"
                >
                  <Trash2 size={16} className="mr-2" /> Xóa cuộc trò chuyện
                </Button>
              </div>
            </>
          )}
        </ScrollArea>
      </div>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <LightboxModal
          imageUrl={lightboxImage}
          onClose={closeLightbox}
          onPrev={goToPrev}
          onNext={goToNext}
          hasPrev={hasPrev}
          hasNext={hasNext}
        />
      )}

      {/* Block Confirm Dialog */}
      <ConfirmDialog
        isOpen={showBlockConfirm}
        onClose={() => setShowBlockConfirm(false)}
        onConfirm={handleConfirmBlock}
        title="Chặn người dùng"
        description={`Bạn có chắc chắn muốn chặn ${partner?.displayName || partner?.username || "người dùng này"}? Bạn sẽ không thể nhận tin nhắn từ họ.`}
        confirmText="Chặn"
        cancelText="Hủy"
        variant="warning"
        isLoading={isBlocking}
      />
    </>
  );
}

