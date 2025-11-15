// src/components/SearchAutocomplete.tsx
import { useState, useEffect, useRef } from "react";
import { Search, Loader2, Clock, TrendingUp } from "lucide-react";
import { Input } from "@/shared/components/ui/input";
import { cn } from "@/shared/lib/utils";
import { useNavigate } from "react-router-dom";

interface SearchSuggestion {
  id: string;
  text: string;
  type: "recent" | "trending" | "product";
}

interface SearchAutocompleteProps {
  onSearchSubmit: (term: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchAutocomplete({
  onSearchSubmit,
  placeholder = "Tìm kiếm mẫu thiết kế, sản phẩm...",
  className,
}: SearchAutocompleteProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Load recent searches from localStorage
  useEffect(() => {
    const recent = JSON.parse(
      localStorage.getItem("searchHistory") || "[]"
    ) as string[];
    const recentSuggestions: SearchSuggestion[] = recent
      .slice(0, 5)
      .map((term) => ({
        id: `recent-${term}`,
        text: term,
        type: "recent",
      }));
    setSuggestions(recentSuggestions);
  }, []);

  // Mock trending searches (in real app, fetch from API)
  const trendingSearches: SearchSuggestion[] = [
    { id: "trend-1", text: "Card visit", type: "trending" },
    { id: "trend-2", text: "Áo thun", type: "trending" },
    { id: "trend-3", text: "Bao bì", type: "trending" },
  ];

  // Handle input change with debounce
  useEffect(() => {
    if (!searchTerm.trim()) {
      const recent = JSON.parse(
        localStorage.getItem("searchHistory") || "[]"
      ) as string[];
      const recentSuggestions: SearchSuggestion[] = recent
        .slice(0, 5)
        .map((term) => ({
          id: `recent-${term}`,
          text: term,
          type: "recent",
        }));
      setSuggestions([...recentSuggestions, ...trendingSearches]);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(() => {
      // Mock autocomplete suggestions (in real app, fetch from API)
      const mockSuggestions: SearchSuggestion[] = [
        { id: "sug-1", text: searchTerm, type: "product" },
        { id: "sug-2", text: `${searchTerm} in 3D`, type: "product" },
        { id: "sug-3", text: `${searchTerm} giá rẻ`, type: "product" },
      ];
      setSuggestions(mockSuggestions);
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent, term?: string) => {
    e.preventDefault();
    const finalTerm = term || searchTerm.trim();
    if (!finalTerm) return;

    // Save to recent searches
    const recent = JSON.parse(
      localStorage.getItem("searchHistory") || "[]"
    ) as string[];
    const updated = [
      finalTerm,
      ...recent.filter((item) => item !== finalTerm),
    ].slice(0, 10);
    localStorage.setItem("searchHistory", JSON.stringify(updated));

    onSearchSubmit(finalTerm);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setSearchTerm(suggestion.text);
    handleSearch(new Event("submit") as any, suggestion.text);
  };

  const clearHistory = () => {
    localStorage.removeItem("searchHistory");
    setSuggestions(trendingSearches);
  };

  return (
    <div ref={searchRef} className={cn("relative w-full", className)}>
      <form onSubmit={(e) => handleSearch(e)} className="relative">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10"
        />
        <Input
          placeholder={placeholder}
          className="pl-10 pr-10 h-10 bg-gray-100 border-none rounded-lg focus-visible:ring-blue-500 focus-visible:ring-2"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          aria-label="Search"
          aria-expanded={isOpen}
          aria-controls="search-suggestions"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />
        )}
      </form>

      {/* Suggestions Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div
          id="search-suggestions"
          className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto"
        >
          <div className="p-2">
            {suggestions
              .filter((s) => s.type === "recent")
              .length > 0 && (
              <div className="mb-2">
                <div className="flex items-center justify-between px-2 py-1.5">
                  <span className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1">
                    <Clock size={12} />
                    Tìm kiếm gần đây
                  </span>
                  <button
                    onClick={clearHistory}
                    className="text-xs text-blue-600 hover:text-blue-700"
                  >
                    Xóa
                  </button>
                </div>
                {suggestions
                  .filter((s) => s.type === "recent")
                  .map((suggestion) => (
                    <button
                      key={suggestion.id}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 transition-colors flex items-center gap-2"
                    >
                      <Clock size={14} className="text-gray-400" />
                      <span className="text-sm">{suggestion.text}</span>
                    </button>
                  ))}
              </div>
            )}

            {suggestions.filter((s) => s.type === "trending").length > 0 && (
              <div className="mb-2">
                <div className="px-2 py-1.5">
                  <span className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1">
                    <TrendingUp size={12} />
                    Đang thịnh hành
                  </span>
                </div>
                {suggestions
                  .filter((s) => s.type === "trending")
                  .map((suggestion) => (
                    <button
                      key={suggestion.id}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 transition-colors flex items-center gap-2"
                    >
                      <TrendingUp size={14} className="text-blue-500" />
                      <span className="text-sm">{suggestion.text}</span>
                    </button>
                  ))}
              </div>
            )}

            {suggestions.filter((s) => s.type === "product").length > 0 && (
              <div>
                {suggestions
                  .filter((s) => s.type === "product")
                  .map((suggestion) => (
                    <button
                      key={suggestion.id}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 transition-colors flex items-center gap-2"
                    >
                      <Search size={14} className="text-gray-400" />
                      <span className="text-sm">{suggestion.text}</span>
                    </button>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

