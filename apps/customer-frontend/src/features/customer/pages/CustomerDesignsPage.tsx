// src/features/customer/pages/CustomerDesignsPage.tsx

import { useState } from "react";
import { 
  Plus, Search, Filter, LayoutGrid, List, 
  FileImage, Save, History 
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Link } from "react-router-dom";
import { useMyDesigns } from "../hooks/useMyDesigns";
import { DesignCard } from "../components/DesignCard";
import { DesignEmptyState } from "../components/DesignEmptyState";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { cn } from "@/shared/lib/utils";

// Component Loading đẹp hơn
const LoadingSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-pulse">
    {[...Array(8)].map((_, i) => (
      <div key={i} className="space-y-3">
        <Skeleton className="w-full aspect-square rounded-xl" />
        <div className="space-y-2 px-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    ))}
  </div>
);

export const CustomerDesignsPage = () => {
  const { allDesigns, loading, filter, setFilter } = useMyDesigns();
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid"); // Chuẩn bị cho tính năng List view sau này

  // 1. Logic lọc nâng cao (Status + Search)
  const filteredDesigns = allDesigns.filter((design) => {
    const matchesStatus = filter === "all" || design.status === filter || (filter === "saved" && !design.status);
    const matchesSearch = searchTerm === "" || design._id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // 2. Đếm số lượng cho badges
  const draftCount = allDesigns.filter((d) => d.status === "draft").length;
  const savedCount = allDesigns.filter((d) => d.status === "saved" || !d.status).length;

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* === HEADER SECTION === */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Title */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Kho thiết kế</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Quản lý {allDesigns.length} thiết kế của bạn
              </p>
            </div>

            {/* Main Action */}
            <Button asChild className="shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all">
              <Link to="/shop">
                <Plus size={18} className="mr-2" />
                Tạo thiết kế mới
              </Link>
            </Button>
          </div>

          {/* === TOOLBAR (Filters & Search) === */}
          <div className="mt-6 flex flex-col md:flex-row gap-4 md:items-center justify-between">
            
            {/* Filter Pills (Thay thế Tabs cũ) */}
            <div className="flex items-center gap-2 bg-gray-100/50 p-1 rounded-lg w-fit">
              <button
                onClick={() => setFilter("all")}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200",
                  filter === "all" 
                    ? "bg-white text-gray-900 shadow-sm" 
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                )}
              >
                <History size={16} />
                Tất cả
              </button>
              <button
                onClick={() => setFilter("draft")}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200",
                  filter === "draft" 
                    ? "bg-white text-yellow-700 shadow-sm ring-1 ring-black/5" 
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                )}
              >
                <FileImage size={16} />
                Bản nháp
                <span className="ml-1 bg-gray-100 px-1.5 py-0.5 rounded-full text-[10px] text-gray-600">
                  {draftCount}
                </span>
              </button>
              <button
                onClick={() => setFilter("saved")}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200",
                  filter === "saved" 
                    ? "bg-white text-green-700 shadow-sm ring-1 ring-black/5" 
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                )}
              >
                <Save size={16} />
                Đã lưu
                <span className="ml-1 bg-gray-100 px-1.5 py-0.5 rounded-full text-[10px] text-gray-600">
                  {savedCount}
                </span>
              </button>
            </div>

            {/* Search & View Options */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64 group">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <Input 
                  placeholder="Tìm theo ID..." 
                  className="pl-9 bg-gray-50 border-gray-200 focus:bg-white transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              {/* View Toggle (Optional UI) */}
              <div className="hidden md:flex items-center border border-gray-200 rounded-lg bg-white p-1">
                <button 
                  onClick={() => setViewMode("grid")}
                  className={cn("p-2 rounded hover:bg-gray-100 transition-colors", viewMode === 'grid' ? "bg-gray-100 text-gray-900" : "text-gray-400")}
                >
                  <LayoutGrid size={18} />
                </button>
                <button 
                   onClick={() => setViewMode("list")} // Chưa implement logic list view nhưng để UI sẵn
                   className={cn("p-2 rounded hover:bg-gray-100 transition-colors", viewMode === 'list' ? "bg-gray-100 text-gray-900" : "text-gray-400")}
                >
                  <List size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* === CONTENT SECTION === */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {loading ? (
          <LoadingSkeleton />
        ) : filteredDesigns.length === 0 ? (
          searchTerm ? (
             // Empty State khi Search không ra
             <div className="text-center py-20">
                <p className="text-gray-500">Không tìm thấy thiết kế nào khớp với từ khóa.</p>
                <Button variant="link" onClick={() => setSearchTerm("")}>Xóa bộ lọc</Button>
             </div>
          ) : (
             // Empty State khi chưa có data
             <div className="animate-in zoom-in-95 duration-300">
                <DesignEmptyState />
             </div>
          )
        ) : (
          <div className={cn(
            "grid gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500",
            viewMode === "grid" 
              ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4" 
              : "grid-cols-1" // List view placeholder
          )}>
            {filteredDesigns.map((design) => (
              <DesignCard key={design._id} design={design} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};