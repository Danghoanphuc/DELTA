// src/components/SearchAutocomplete.tsx
import { useState, useEffect, useRef } from "react";
import { Search, Loader2, ArrowRight, Clock, Flame } from "lucide-react";
import { cn } from "@/shared/lib/utils";

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
  placeholder = "Tìm kiếm...",
  className,
}: SearchAutocompleteProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Demo Suggestions (Nên thay bằng API call thật)
  useEffect(() => {
    if (searchTerm.length > 1) {
      setSuggestions([
        { id: "1", text: "Bộ ấm trà Tử Sa", type: "product" },
        { id: "2", text: "Trầm hương thượng hạng", type: "trending" },
        { id: "3", text: "Quà tặng sếp nam", type: "recent" },
      ]);
    } else {
      setSuggestions([]);
    }
  }, [searchTerm]);

  return (
    <div
      ref={searchRef}
      className={cn("relative w-full group z-[100]", className)}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSearchSubmit(searchTerm);
          setIsOpen(false);
        }}
        className="relative z-[100]"
      >
        {/* INPUT: Border bottom only (Minimalist) */}
        <div className="relative flex items-center border-b border-stone-300 group-focus-within:border-amber-800 transition-colors duration-500 pb-1 bg-transparent z-[100]">
          <Search
            size={16}
            className="text-stone-400 group-focus-within:text-amber-800 transition-colors mr-3"
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
                className="text-stone-400 hover:text-amber-800 transition-colors"
              >
                <ArrowRight size={14} />
              </button>
            )
          )}
        </div>
      </form>

      {/* DROPDOWN: Giấy Dó Texture */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-3 bg-[#F9F8F6] border border-stone-200 shadow-2xl p-0 z-[9999] animate-in fade-in slide-in-from-top-2 rounded-sm overflow-hidden">
          <div className="bg-stone-100/50 px-4 py-2 border-b border-stone-100 flex justify-between items-center">
            <span className="text-[9px] font-bold uppercase tracking-widest text-stone-400">
              Gợi ý
            </span>
            <span className="text-[9px] font-serif italic text-stone-400">
              An Nam Curator
            </span>
          </div>

          <div className="py-2">
            {suggestions.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setSearchTerm(s.text);
                  onSearchSubmit(s.text);
                  setIsOpen(false);
                }}
                className="w-full text-left py-2.5 px-4 hover:bg-stone-100 text-stone-600 hover:text-stone-900 transition-colors text-sm font-sans flex items-center gap-3 group/item border-l-2 border-transparent hover:border-amber-800"
              >
                {/* Icon loại gợi ý */}
                {s.type === "trending" && (
                  <Flame size={12} className="text-amber-600" />
                )}
                {s.type === "recent" && (
                  <Clock size={12} className="text-stone-400" />
                )}
                {s.type === "product" && (
                  <Search size={12} className="text-stone-400" />
                )}

                <span className="flex-1 font-serif group-hover/item:font-bold transition-all">
                  {s.text}
                </span>

                <ArrowRight
                  size={12}
                  className="opacity-0 -translate-x-2 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all text-amber-800"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
