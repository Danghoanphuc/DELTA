// frontend/src/features/printer/pages/PrinterStudioSidebar.tsx
// ✅ ĐÃ SỬA LỖI DEADLOCK
import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/shared/components/ui/card";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Separator } from "@/shared/components/ui/separator";
import { TextPropertiesPanel } from "@/features/editor/components/TextPropertiesPanel";
import { ImagePropertiesPanel } from "@/features/editor/components/ImagePropertiesPanel";
import ProductViewer3D from "@/features/editor/components/ProductViewer3D";
// import { Loader2 } from "lucide-react"; // ❌ XÓA
import { Product } from "@/types/product";

interface PrinterStudioSidebarProps {
  selectedObject: any;
  onPropertiesUpdate: () => void;
  baseProduct: Product | null;
  phoiAssets: { materialName: string } | null;
  // is2DReady: boolean; // ❌ XÓA
  texturesForViewer: Record<string, string>;
  productId?: string;
  modelUrl: string;
  onModelLoaded: () => void; // ✅ THÊM: Callback để báo 3D đã tải xong
}

export const PrinterStudioSidebar: React.FC<PrinterStudioSidebarProps> = ({
  selectedObject,
  onPropertiesUpdate,
  baseProduct,
  phoiAssets,
  // is2DReady, // ❌ XÓA
  texturesForViewer,
  productId,
  modelUrl,
  onModelLoaded, // ✅ THÊM
}) => {
  return (
    <div className="w-96 bg-white border-l">
      <ScrollArea className="h-full">
        <div className="p-6 space-y-6">
          {/* 1. Contextual Panels */}
          {selectedObject && selectedObject.type === "i-text" && (
            <TextPropertiesPanel
              selectedObject={selectedObject}
              onUpdate={onPropertiesUpdate}
            />
          )}

          {selectedObject && selectedObject.type === "image" && (
            <ImagePropertiesPanel
              selectedObject={selectedObject}
              onUpdate={onPropertiesUpdate}
            />
          )}

          {/* 2. Product Info */}
          {/* ... (Giữ nguyên) ... */}
          {baseProduct && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Thông tin Phôi</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Tên:</span> {baseProduct.name}
                </div>
                {phoiAssets?.materialName && (
                  <div>
                    <span className="font-medium">Material:</span>{" "}
                    <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">
                      {phoiAssets.materialName}
                    </code>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Separator />

          {/* 3. 3D Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">
                Xem trước 3D (Real-time)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-100 rounded-lg overflow-hidden">
                {/* ❌ XÓA: Bỏ skeleton "Đang tải 2D..." */}
                <ProductViewer3D
                  modelUrl={modelUrl}
                  textures={texturesForViewer}
                  onModelLoaded={onModelLoaded} // ✅ THÊM: Gắn callback
                />
              </div>
            </CardContent>
          </Card>

          {/* 4. Tips & Warnings */}
          {/* ... (Giữ nguyên) ... */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <h4 className="font-medium text-sm mb-2 text-blue-900">
                💡 Mẹo thiết kế
              </h4>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• Chọn đối tượng để hiện bảng thuộc tính</li>
                <li>• Nhấn đúp để chỉnh sửa văn bản</li>
                <li>• Dùng phím Space để kéo canvas</li>
                <li>• Lăn chuột để zoom tại vị trí con trỏ</li>
                <li>• Click chuột phải để xem menu nhanh</li>
                <li>• Nhấn "Lưu & Tiếp tục" để đến bước đăng bán</li>
              </ul>
            </CardContent>
          </Card>

          {productId === "new" && (
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="pt-6">
                <h4 className="font-medium text-sm mb-2 text-yellow-900">
                  ⚠️ Lưu ý
                </h4>
                <p className="text-xs text-yellow-700">
                  Bạn đang tạo mẫu từ phôi tạm.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
