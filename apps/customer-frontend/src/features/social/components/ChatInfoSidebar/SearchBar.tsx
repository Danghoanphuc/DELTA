// apps/customer-frontend/src/features/social/components/ChatInfoSidebar/SearchBar.tsx
// ✅ Component search bar cho tìm kiếm tin nhắn

import { ArrowLeft, Search, Loader2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";

interface SearchBarProps {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  onSearch: () => void;
  onCancel: () => void;
  isSearching: boolean;
}

export function SearchBar({
  searchQuery,
  onSearchQueryChange,
  onSearch,
  onCancel,
  isSearching,
}: SearchBarProps) {
  return (
    <div className="h-16 px-4 border-b flex items-center gap-2 shrink-0">
      <Button variant="ghost" size="icon" onClick={onCancel}>
        <ArrowLeft size={20} className="text-gray-500" />
      </Button>
      <Input
        autoFocus
        value={searchQuery}
        onChange={(e) => onSearchQueryChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onSearch();
          } else if (e.key === "Escape") {
            onCancel();
          }
        }}
        placeholder="Tìm kiếm tin nhắn..."
        className="flex-1"
      />
      <Button
        variant="ghost"
        size="icon"
        onClick={onSearch}
        disabled={isSearching || !searchQuery.trim()}
      >
        {isSearching ? (
          <Loader2 size={20} className="animate-spin text-gray-400" />
        ) : (
          <Search size={20} className="text-gray-500" />
        )}
      </Button>
    </div>
  );
}

