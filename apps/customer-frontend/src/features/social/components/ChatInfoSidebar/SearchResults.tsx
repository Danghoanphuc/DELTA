// apps/customer-frontend/src/features/social/components/ChatInfoSidebar/SearchResults.tsx
// ✅ Component hiển thị kết quả tìm kiếm tin nhắn

import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import type { ChatMessage } from "@/types/chat";
import { getMessageText } from "./message.utils";

interface SearchResultsProps {
  results: ChatMessage[];
  onResultClick: (messageId: string) => void;
}

export function SearchResults({ results, onResultClick }: SearchResultsProps) {
  if (results.length === 0) return null;

  return (
    <div className="p-4 border-b border-gray-100">
      <div className="text-sm font-medium text-gray-900 mb-2">
        {results.length} kết quả tìm thấy
      </div>
      <div className="space-y-2">
        {results.map((msg) => (
          <div
            key={msg._id}
            onClick={() => onResultClick(msg._id)}
            className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition"
          >
            <p className="text-sm text-gray-900 line-clamp-2">
              {getMessageText(msg)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {msg.createdAt &&
                formatDistanceToNow(new Date(msg.createdAt), {
                  addSuffix: true,
                  locale: vi,
                })}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

