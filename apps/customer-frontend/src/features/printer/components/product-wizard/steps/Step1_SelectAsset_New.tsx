// apps/customer-frontend/src/features/printer/components/product-wizard/steps/Step1_SelectAsset_New.tsx
// ✨ SMART PIPELINE: Infinite Scroll + Search/Filter

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
}

/**
 * ✨ STEP 1: SELECT ASSET (NEW)
 * - Infinite scroll pagination
 * - Search by name
 * - Filter by category
 * - Load 20 items per page
 */
export function Step1_SelectAsset_New({
  control,
  isExpanded,
  onExpand,
}: StepProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");

  // ✅ Use infinite assets hook
  // Pass empty string to API if category is "all"
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

  // Flatten all pages
  const { privateAssets, publicAssets, allAssets } = flattenAssetPages(data);

  const hasPrivateAssets = privateAssets.length > 0;
  const hasPublicAssets = publicAssets.length > 0;

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

                {/* Search & Filter */}
                <div className="flex gap-2 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Tìm kiếm phôi..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Tất cả danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả danh mục</SelectItem>
                      <SelectItem value="business-card">Card Visit</SelectItem>
                      <SelectItem value="flyer">Flyer</SelectItem>
                      <SelectItem value="banner">Banner</SelectItem>
                      <SelectItem value="brochure">Brochure</SelectItem>
                      <SelectItem value="t-shirt">Áo Thun</SelectItem>
                      <SelectItem value="mug">Cốc/Ly</SelectItem>
                      <SelectItem value="sticker">Sticker</SelectItem>
                      <SelectItem value="packaging">Bao Bì</SelectItem>
                      <SelectItem value="other">Khác</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <FormControl>
                  <div className="space-y-6">
                    {/* Loading State */}
                    {isLoading && (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                        <span className="ml-2 text-muted-foreground">
                          Đang tải phôi...
                        </span>
                      </div>
                    )}

                    {/* Error State */}
                    {isError && (
                      <div className="text-center py-12 bg-red-50 rounded-lg border border-red-200">
                        <p className="text-red-600">
                          Không thể tải danh sách phôi. Vui lòng thử lại.
                        </p>
                      </div>
                    )}

                    {/* Empty State */}
                    {!isLoading && !isError && allAssets.length === 0 && (
                      <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
                        <Inbox className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          {search || category
                            ? "Không tìm thấy phôi phù hợp"
                            : "Chưa có phôi nào"}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                          {search || category ? (
                            "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm"
                          ) : (
                            <>
                              Hãy vào{" "}
                              <strong className="text-orange-600">
                                Kho Phôi (3D/2D)
                              </strong>{" "}
                              để tải lên phôi của bạn
                            </>
                          )}
                        </p>
                      </div>
                    )}

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
                              onClick={() => field.onChange(asset._id)}
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
                              onClick={() => field.onChange(asset._id)}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Load More Button */}
                    {hasNextPage && (
                      <div className="flex justify-center pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fetchNextPage()}
                          disabled={isFetchingNextPage}
                        >
                          {isFetchingNextPage ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Đang tải...
                            </>
                          ) : (
                            "Tải thêm phôi"
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {allAssets.length > 0 && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              💡 <strong>Mẹo:</strong> Nhấp vào phôi để chọn. Sử dụng tìm kiếm
              và bộ lọc để tìm phôi nhanh hơn.
            </p>
          )}
        </CardContent>
      )}
    </Card>
  );
}

