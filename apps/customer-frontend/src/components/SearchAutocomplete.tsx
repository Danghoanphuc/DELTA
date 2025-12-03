// src/components/SearchAutocomplete.tsx
import { useState, useEffect, useRef } from "react";
import { Search, Loader2, ArrowRight } from "lucide-react";
import { Input } from "@/shared/components/ui/input";
import { cn } from "@/shared/lib/utils";

// ... (Interfaces giữ nguyên) ...
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
  placeholder = "Search collection...",
  className,
}: SearchAutocompleteProps) {
  // ... (State logic giữ nguyên) ...
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  // ... (Effect logic giữ nguyên) ...

  return (
    <div ref={searchRef} className={cn("relative w-full group", className)}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSearchSubmit(searchTerm);
          setIsOpen(false);
        }}
        className="relative"
      >
        {/* INPUT STYLE: Transparent, Border Bottom Only, Font Serif Placeholder */}
        <div className="relative flex items-center border-b border-stone-300 group-focus-within:border-stone-900 transition-colors duration-500 pb-1">
          <Search
            size={16}
            className="text-stone-400 group-focus-within:text-stone-900 transition-colors mr-3"
            strokeWidth={1.5}
          />

          <input
            type="text"
            className="flex-1 bg-transparent border-none outline-none text-stone-900 placeholder:text-stone-400 placeholder:font-serif placeholder:italic text-sm h-9"
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
          />

          {isLoading ? (
            <Loader2 className="w-3 h-3 animate-spin text-stone-400" />
          ) : (
            searchTerm && (
              <button
                type="submit"
                className="text-stone-400 hover:text-stone-900"
              >
                <ArrowRight size={14} />
              </button>
            )
          )}
        </div>
      </form>

      {/* DROPDOWN STYLE: Nền giấy, Shadow nhẹ, Typography tinh tế */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#F9F8F6] border border-stone-100 shadow-xl shadow-stone-200/50 p-4 z-50 animate-in fade-in slide-in-from-top-2">
          {/* Sections... */}
          {/* Render logic giữ nguyên nhưng đổi class style */}
          {suggestions.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setSearchTerm(s.text);
                onSearchSubmit(s.text);
                setIsOpen(false);
              }}
              className="w-full text-left py-2 px-2 hover:bg-stone-100 text-stone-600 hover:text-stone-900 transition-colors text-sm font-sans flex items-center justify-between group/item"
            >
              <span>{s.text}</span>
              <span className="opacity-0 group-hover/item:opacity-100 text-[10px] uppercase tracking-wider text-stone-400">
                Jump to
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
