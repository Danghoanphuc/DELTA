// frontend/src/features/printer/add-product-flow/RightSidebarPreview.tsx

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Eye, Edit, Loader2 } from "lucide-react";
import ProductViewer3D from "@/features/editor/components/ProductViewer3D";

interface Assets {
  modelUrl: string;
  dielineUrl: string;
}

interface RightSidebarPreviewProps {
  selectedCategory: string;
  defaultAssets: Assets | null;
  customAssets: Assets | null;
  onEditInStudio: () => void;
}

export function RightSidebarPreview({
  selectedCategory,
  defaultAssets,
  customAssets,
  onEditInStudio,
}: RightSidebarPreviewProps) {
  const activeAssets = customAssets || defaultAssets;

  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye size={18} />
          Preview 3D
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!selectedCategory ? (
          <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Chọn danh mục để xem phôi 3D</p>
          </div>
        ) : !activeAssets ? (
          <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
            <Loader2 className="animate-spin" size={32} />
          </div>
        ) : (
          <div className="space-y-3">
            <div className="h-96 bg-gray-50 rounded-lg overflow-hidden">
              <ProductViewer3D modelUrl={activeAssets.modelUrl} textures={{}} />
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={onEditInStudio}
                className="flex-1 bg-orange-500 hover:bg-orange-600"
              >
                <Edit className="mr-2" size={16} />
                Chỉnh sửa trong Studio
              </Button>
            </div>
            <p className="text-xs text-gray-500 text-center">
              {customAssets
                ? "Đang dùng phôi tùy chỉnh"
                : "Đang dùng phôi mặc định"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
