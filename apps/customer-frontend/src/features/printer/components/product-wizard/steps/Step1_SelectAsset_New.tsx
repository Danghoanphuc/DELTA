// src/features/printer/components/product-wizard/steps/Step1_SelectAsset_New.tsx
import { useState } from "react";
import { Control } from "react-hook-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
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
import { Package, Inbox, Search, Loader2 } from "lucide-react";
import { AssetCard } from "@/features/printer/components/AssetCard";
import {
  useInfiniteAssets,
  flattenAssetPages,
} from "@/features/printer/hooks/useInfiniteAssets";

interface StepProps {
  control: Control<ProductWizardFormValues>;
  isExpanded: boolean;
  onExpand: () => void;
  // ✅ THÊM: Prop để nhận hàm xử lý từ hook
  onSelectAsset?: (assetId: string) => void; 
}

export function Step1_SelectAsset_New({
  control,
  isExpanded,
  onExpand,
  onSelectAsset, // ✅
}: StepProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteAssets({ 
    search, 
    category: category === "all" ? "" : category 
  });

  const { privateAssets, publicAssets, allAssets } = flattenAssetPages(data);
  const hasPrivateAssets = privateAssets.length > 0;
  const hasPublicAssets = publicAssets.length > 0;

  // ✅ Wrapper function để xử lý click
  const handleAssetClick = (assetId: string, fieldOnChange: (val: string) => void) => {
    if (onSelectAsset) {
      // Nếu có prop handle riêng (từ useSmartWizard), dùng nó
      onSelectAsset(assetId);
    } else {
      // Fallback (cho trường hợp cũ)
      fieldOnChange(assetId);
    }
  };

  return (
    <Card
      onClick={!isExpanded ? onExpand : undefined}
      className={!isExpanded ? "cursor-pointer" : ""}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="text-blue-600" />
          Bước 1: Chọn Phôi (Từ Kho Phôi của bạn)
        </CardTitle>
      </CardHeader>
      {isExpanded && (
        <CardContent>
          <FormField
            control={control}
            name="assetId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold">
                  Chọn phôi 3D/2D
                </FormLabel>

                {/* Search & Filter (Giữ nguyên) */}
                <div className="flex gap-2 mb-4">
                   {/* ... Input search & Select category ... */}
                   {/* (Code UI giữ nguyên để ngắn gọn) */}
                   <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Tìm kiếm phôi..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                <FormControl>
                  <div className="space-y-6">
                    {/* ... Loading/Error/Empty states giữ nguyên ... */}

                    {/* Private Assets Section */}
                    {!isLoading && hasPrivateAssets && (
                      <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Kho Phôi Của Tôi ({privateAssets.length})
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {privateAssets.map((asset) => (
                            <AssetCard
                              key={asset._id}
                              asset={asset}
                              isSelected={field.value === asset._id}
                              // ✅ GỌI WRAPPER FUNCTION
                              onClick={() => handleAssetClick(asset._id, field.onChange)}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Public Assets Section */}
                    {!isLoading && hasPublicAssets && (
                      <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Kho Phôi Chung - PrintZ ({publicAssets.length})
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {publicAssets.map((asset) => (
                            <AssetCard
                              key={asset._id}
                              asset={asset}
                              isSelected={field.value === asset._id}
                              // ✅ GỌI WRAPPER FUNCTION
                              onClick={() => handleAssetClick(asset._id, field.onChange)}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ... Load More giữ nguyên ... */}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      )}
    </Card>
  );
}