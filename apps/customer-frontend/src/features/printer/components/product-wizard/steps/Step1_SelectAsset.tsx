// src/features/printer/components/product-wizard/steps/Step1_SelectAsset.tsx (ĐÃ CẬP NHẬT)
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
import {
  Select,
  SelectContent,
  // ✅ MỚI: Import 2 component để tạo nhóm
  SelectGroup,
  SelectLabel,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { ProductWizardFormValues } from "@/features/printer/schemas/productWizardSchema";
import { Asset } from "@/types/asset";
import { Package } from "lucide-react";

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

  return (
    <Card onClick={onExpand} className="cursor-pointer">
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
                <FormLabel>Phôi có sẵn</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn một phôi 3D/2D đã được duyệt" />
                    </SelectTrigger>
                  </FormControl>
                  {/* ✅ SỬA: Dùng SelectGroup để phân loại UI */}
                  <SelectContent>
                    {/* Nhóm 1: Phôi riêng tư */}
                    {hasPrivateAssets && (
                      <SelectGroup>
                        <SelectLabel>Kho Phôi Của Tôi</SelectLabel>
                        {privateAssets.map((asset) => (
                          <SelectItem key={asset._id} value={asset._id}>
                            {asset.name} (Riêng tư)
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    )}
                    {/* Nhóm 2: Phôi công khai */}
                    {hasPublicAssets && (
                      <SelectGroup>
                        <SelectLabel>Kho Phôi Chung (PrintZ)</SelectLabel>
                        {publicAssets.map((asset) => (
                          <SelectItem key={asset._id} value={asset._id}>
                            {asset.name} (Chung)
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    )}
                    {/* Trường hợp không có phôi nào */}
                    {!hasPrivateAssets && !hasPublicAssets && (
                      <SelectItem value="no-asset" disabled>
                        Không tìm thấy phôi nào.
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <p className="text-xs text-gray-500 mt-2">
            Không tìm thấy phôi? Hãy vào{" "}
            <strong className="text-orange-600">Kho Phôi (3D/2D)</strong> để tải
            lên phôi của riêng bạn.
          </p>
        </CardContent>
      )}
    </Card>
  );
}
