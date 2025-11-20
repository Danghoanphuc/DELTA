// src/features/printer/components/product-wizard/steps/Step1_SelectAsset.tsx (✅ OBJECTIVE 3: Visual Grid)
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
import { ProductWizardFormValues } from "@/features/printer/schemas/productWizardSchema";
import { Asset } from "@/types/asset";
import { Package, Inbox } from "lucide-react";
import { AssetCard } from "@/features/printer/components/AssetCard";

interface StepProps {
  control: Control<ProductWizardFormValues>;
  // ✅ SỬA: Nhận 2 mảng riêng biệt
  privateAssets: Asset[];
  publicAssets: Asset[];
  isExpanded: boolean;
  onExpand: () => void;
}

export function Step1_SelectAsset({
  control,
  privateAssets,
  publicAssets,
  isExpanded,
  onExpand,
}: StepProps) {
  const hasPrivateAssets = privateAssets.length > 0;
  const hasPublicAssets = publicAssets.length > 0;
  const allAssets = [...privateAssets, ...publicAssets];

  return (
    <Card onClick={!isExpanded ? onExpand : undefined} className={!isExpanded ? "cursor-pointer" : ""}>
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
                <FormControl>
                  <div className="space-y-6">
                    {/* Empty State */}
                    {allAssets.length === 0 && (
                      <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
                        <Inbox className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Chưa có phôi nào
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                          Hãy vào <strong className="text-orange-600">Kho Phôi (3D/2D)</strong> để tải lên phôi của bạn
                        </p>
                      </div>
                    )}

                    {/* Private Assets Section */}
                    {hasPrivateAssets && (
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
                    {hasPublicAssets && (
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
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {allAssets.length > 0 && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              💡 <strong>Mẹo:</strong> Nhấp vào phôi để chọn. Phôi có hình ảnh preview giúp bạn dễ dàng nhận biết.
            </p>
          )}
        </CardContent>
      )}
    </Card>
  );
}
