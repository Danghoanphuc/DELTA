// apps/customer-frontend/src/features/social/components/ChatInfoSidebar/useSearchMessages.ts
// ✅ Custom hook cho search messages logic

import { useState } from "react";
import { searchMessages } from "../../../chat/services/chat.api.service";
import { toast } from "sonner";
import type { ChatMessage } from "@/types/chat";

export function useSearchMessages(conversationId: string) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ChatMessage[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const results = await searchMessages(conversationId, searchQuery.trim());
      setSearchResults(results);
      if (results.length === 0) {
        toast.info("Không tìm thấy kết quả");
      }
    } catch (error) {
      toast.error("Lỗi khi tìm kiếm");
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
  };

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    handleSearch,
    clearSearch,
  };
}

