// src/features/shop/components/ShopHeader.tsx (FIXED)

import {
  ShoppingCart,
  SlidersHorizontal,
  ChevronDown,
  Search,
  Filter,
  ArrowLeft,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { useNavigate } from "react-router-dom";
import { cn } from "@/shared/lib/utils";
import printzLogo from "@/assets/img/logo-printz.png";
import zinAvatar from "@/assets/img/zin-avatar.png";

interface ShopHeaderProps {
  // Search
  prompt: string;
  onPromptChange: (value: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  // Cart
  cartItemCount: number;
  onCartOpen: () => void;
  // Filters & Sort
  onFilterOpen: () => void;
  sortBy: string;
  onSortChange: (value: string) => void;
}

const sortTabs = [
  { label: "Liên quan", value: "popular" },
  { label: "Mới nhất", value: "newest" },
  { label: "Bán chạy", value: "popular" },
];

export const ShopHeader = ({
  prompt,
  onPromptChange,
  onSearchSubmit,
  cartItemCount,
  onCartOpen,
  onFilterOpen,
  sortBy,
  onSortChange,
}: ShopHeaderProps) => {
  const navigate = useNavigate();
  const isPriceSort = sortBy === "price_asc" || sortBy === "price_desc";

  // (renderMobileHeader)
  const renderMobileHeader = () => (
    <div className="md:hidden fixed top-0 left-0 right-0 z-30 flex flex-col bg-white shadow-sm">
      {/* Hàng 1: Search & Actions */}
      <div className="flex items-center gap-2 p-3">
        <Button
          variant="ghost"
          size="icon"
          className="flex-shrink-0"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={22} />
        </Button>
        <form onSubmit={onSearchSubmit} className="flex-1 relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <Input
            placeholder="Tìm trong PrintZ..."
            className="pl-10 pr-4 h-10 bg-gray-100 border-none rounded-lg focus-visible:ring-blue-500"
            value={prompt}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              onPromptChange(e.target.value)
            }
          />
        </form>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="relative flex-shrink-0"
          onClick={onCartOpen}
        >
          <ShoppingCart size={22} />
          {cartItemCount > 0 && (
            <span
              className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1.5 flex items-center justify-center p-0 rounded-full
                           bg-red-500 text-white text-[10px] font-bold leading-none"
            >
              {cartItemCount}
            </span>
          )}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="flex-shrink-0"
          onClick={onFilterOpen}
        >
          <Filter size={22} />
        </Button>
      </div>
      {/* Hàng 2: Sorting Tabs */}
      <div className="w-full bg-white border-b border-gray-200">
        <Tabs
          value={isPriceSort ? "price" : sortBy}
          onValueChange={(value) => {
            if (value !== "price") {
              onSortChange(value);
            }
          }}
          className="w-full"
        >
          <TabsList className="h-11 w-full justify-around p-0 bg-transparent rounded-none">
            {sortTabs.map((tab) => (
              <TabsTrigger
                // ✅ SỬA LỖI: Dùng tab.label (duy nhất) làm key
                key={tab.label}
                value={tab.value}
                className="flex-1 text-gray-600 rounded-none data-[state=active]:text-blue-600 data-[state=active]:shadow-[inset_0_-2px_0_0_currentColor] data-[state=active]:bg-transparent"
              >
                {tab.label}
              </TabsTrigger>
            ))}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "flex-1 text-gray-600 rounded-none data-[state=open]:bg-gray-100",
                    isPriceSort
                      ? "text-blue-600 shadow-[inset_0_-2px_0_0_currentColor]"
                      : ""
                  )}
                >
                  Giá
                  <ChevronDown className="w-4 h-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => onSortChange("price_asc")}>
                  Giá: Thấp đến Cao
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => onSortChange("price_desc")}>
                  Giá: Cao đến Thấp
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );

  // === RENDER GIAO DIỆN DESKTOP (ĐÃ SỬA) ===
  const renderDesktopHeader = () => (
    <div className="hidden md:flex fixed top-0 left-0 right-0 z-30 flex-col bg-white shadow-sm lg:ml-20">
      {/* Hàng 1: Search & Actions */}
      <div className="flex items-center gap-4 p-4">
        <img
          src={printzLogo}
          alt="PrintZ Logo"
          className="w-10 h-10 cursor-pointer"
          onClick={() => navigate("/")}
        />

        <form
          onSubmit={onSearchSubmit}
          className="flex-1 max-w-3xl mx-auto relative"
        >
          <img
            src={zinAvatar}
            alt="Zin AI Avatar"
            className="w-8 h-8 absolute left-3 top-1/2 -translate-y-1/2 rounded-full"
          />
          <Input
            placeholder="Hỏi Zin: 'Card visit cho quán cafe, vintage'..."
            className="pl-14 pr-14 h-12 text-base bg-gray-100 border-none rounded-lg focus-visible:ring-blue-500"
            value={prompt}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              onPromptChange(e.target.value)
            }
          />
          <Button
            type="submit"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9"
            title="Tìm kiếm"
          >
            <Search size={18} />
          </Button>
        </form>

        <Button
          type="button"
          variant="outline"
          size="icon"
          className="relative w-12 h-12 flex-shrink-0"
          onClick={onCartOpen}
        >
          <ShoppingCart size={20} />
          {cartItemCount > 0 && (
            <span
              className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1.5 flex items-center justify-center p-0 rounded-full
                           bg-blue-600 text-white text-[10px] font-bold leading-none"
            >
              {cartItemCount}
            </span>
          )}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {renderMobileHeader()}
      {renderDesktopHeader()}
    </>
  );
};
