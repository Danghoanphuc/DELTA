// src/features/shop/components/SortBar.tsx (ĐÃ VÁ LỖI)
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Button } from "@/shared/components/ui/button";
import { ChevronDown } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface SortBarProps {
  sortBy: string;
  onSortChange: (value: string) => void;
  className?: string;
}

const sortTabs = [
  { label: "Liên quan", value: "popular" },
  { label: "Mới nhất", value: "newest" },
];

export const SortBar = ({ sortBy, onSortChange, className }: SortBarProps) => {
  const isPriceSort = sortBy === "price_asc" || sortBy === "price_desc";

  return (
    // ✅ SỬA 1: Thêm 'min-w-0' (hoặc 'flex-shrink')
    // để component này có thể co lại khi bị đẩy
    <div className={cn("flex items-center gap-2 min-w-0", className)}>
      <Tabs
        value={isPriceSort ? "price" : sortBy}
        onValueChange={(value) => {
          if (value !== "price") {
            onSortChange(value);
          }
        }}
      >
        {/* ✅ SỬA 2: Thêm class để cho phép cuộn ngang trên mobile */}
        <TabsList
          className="h-10 p-1 bg-gray-100 rounded-lg 
                     max-w-full overflow-x-auto hide-scrollbar"
        >
          {sortTabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="px-4 data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-blue-600"
            >
              {tab.label}
            </TabsTrigger>
          ))}

          {/* Nút Giá (Dropdown) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "h-8 px-4 data-[state=open]:bg-gray-200",
                  isPriceSort
                    ? "bg-white shadow-md text-blue-600"
                    : "text-gray-600"
                )}
              >
                Giá
                <ChevronDown className="w-4 h-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => onSortChange("price_asc")}>
                Giá: Thấp → Cao
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => onSortChange("price_desc")}>
                Giá: Cao → Thấp
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TabsList>
      </Tabs>
    </div>
  );
};