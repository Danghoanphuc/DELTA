// src/features/printer/components/product-wizard/steps/Step1_SelectAsset_New.tsx

import { useState } from "react";
import { Control } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Button } from "@/shared/components/ui/button";
import { ProductWizardFormValues } from "@/features/printer/schemas/productWizardSchema";
import {
  Inbox,
  Search,
  Loader2,
  Filter,
  Box,
  ScanLine,
  CheckCircle2,
  Ruler,
} from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { AssetCard } from "@/features/printer/components/AssetCard";
import {
  useInfiniteAssets,
  flattenAssetPages,
} from "@/features/printer/hooks/useInfiniteAssets";
import { cn } from "@/shared/lib/utils";

interface StepProps {
  control: Control<ProductWizardFormValues>;
  isExpanded: boolean;
  onExpand: () => void;
  onSelectAsset?: (assetId: string) => void;
}

const CATEGORY_OPTIONS = [
  { value: "all", label: "Tất cả danh mục" },
  { value: "business-card", label: "Danh thiếp" },
  { value: "flyer", label: "Tờ rơi" },
  { value: "banner", label: "Banner" },
  { value: "t-shirt", label: "Áo thun" },
  { value: "mug", label: "Cốc/Ly" },
  { value: "packaging", label: "Bao bì" },
  { value: "sticker", label: "Sticker" },
  { value: "other", label: "Khác" },
];

export function Step1_SelectAsset_New({
  control,
  onSelectAsset,
}: StepProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteAssets({
    search,
    category: category === "all" ? "" : category,
  });

  const { privateAssets, publicAssets, allAssets } = flattenAssetPages(data);
  const hasPrivateAssets = privateAssets.length > 0;
  const hasPublicAssets = publicAssets.length > 0;
  const isEmpty = allAssets.length === 0;

  // Wrapper function để xử lý click
  const handleAssetClick = (
    assetId: string,
    fieldOnChange: (val: string) => void
  ) => {
    if (onSelectAsset) {
      onSelectAsset(assetId);
    } else {
      fieldOnChange(assetId);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* --- INTRO HEADER (Thêm chút text dẫn dắt) --- */}
      <div className="flex items-center justify-between pb-4 border-b border-dashed border-gray-300">
        <div>
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Box className="w-5 h-5 text-orange-600" />
            Kho Phôi In Ấn
          </h3>
          <p className="text-sm text-slate-500">Chọn vật liệu nền để bắt đầu quy trình sản xuất.</p>
        </div>
        {/* Filter rút gọn */}
        <div className="flex gap-2">
           {/* ... (Code Search/Filter cũ) ... */}
        </div>
      </div>

      {/* --- ASSET GRID (STYLE MỚI) --- */}
      <FormField
        control={control}
        name="assetId"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <div className="space-y-8 min-h-[300px]">
                
                {/* ... (Loading/Empty State giữ nguyên) ... */}

                {!isLoading && !isEmpty && (
                  <>
                    {/* Render List */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                      {[...privateAssets, ...publicAssets].map((asset) => {
                        const isSelected = field.value === asset._id;
                        return (
                          <button
                            key={asset._id}
                            type="button"
                            onClick={() => handleAssetClick(asset._id, field.onChange)}
                            // ✅ ÁP DỤNG STYLE "CARD-TECH" (Có dấu xén crop marks)
                            className={cn(
                              "card-tech group relative flex flex-col rounded-xl overflow-hidden text-left h-full",
                              isSelected ? "selected" : "hover:border-orange-300"
                            )}
                          >
                            {/* Hình ảnh Phôi */}
                            <div className="aspect-[4/3] w-full bg-gray-100 relative overflow-hidden border-b border-gray-100">
                              <img
                                src={asset.images?.[0]?.url || "/placeholder.png"}
                                alt={asset.name}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                              
                              {/* Overlay thông số kỹ thuật (Hiện khi hover) */}
                              <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-4">
                                <ScanLine className="w-8 h-8 mb-2 opacity-80" />
                                <span className="text-xs font-mono tracking-wider">VIEW SPECS</span>
                              </div>

                              {/* Selected Checkmark */}
                              {isSelected && (
                                <div className="absolute top-2 right-2 bg-orange-500 text-white w-6 h-6 rounded-full flex items-center justify-center shadow-md z-10">
                                  <CheckCircle2 className="w-4 h-4" />
                                </div>
                              )}
                            </div>

                            {/* Thông tin Phôi */}
                            <div className="p-3 flex-1 flex flex-col">
                              <div className="flex justify-between items-start gap-2 mb-1">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter font-mono">
                                  #{asset._id.slice(-4)}
                                </span>
                                <Badge variant="secondary" className="h-5 text-[10px] px-1.5 bg-slate-100 text-slate-600 rounded-sm">
                                  {asset.category}
                                </Badge>
                              </div>
                              
                              <h4 className={cn("font-semibold text-sm leading-tight mb-2 line-clamp-2", isSelected ? "text-orange-700" : "text-slate-700")}>
                                {asset.name}
                              </h4>

                              {/* Footer thông số (Giả lập) */}
                              <div className="mt-auto pt-3 border-t border-dashed border-gray-200 flex items-center gap-3 text-[11px] text-slate-500 font-mono">
                                <div className="flex items-center gap-1">
                                  <Ruler className="w-3 h-3" /> 
                                  <span>{(asset as any).dimensions || "Std"}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <span className="w-2 h-2 rounded-full bg-cyan-500 opacity-50"></span>
                                  <span>{(asset.assets?.surfaces?.length || 1)} mặt</span>
                                </div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}