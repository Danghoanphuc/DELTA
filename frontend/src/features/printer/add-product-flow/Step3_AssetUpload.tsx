// frontend/src/features/printer/add-product-flow/Step3_AssetUpload.tsx

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Button } from "@/shared/components/ui/button";
import { Upload, Loader2, Image as ImageIcon } from "lucide-react";

interface Step3Props {
  selectedCategory: string;
  isUploadingAssets: boolean;
  previewImages: string[];
  onUploadCustomAssets: (e: React.FormEvent) => void;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function Step3_AssetUpload({
  selectedCategory,
  isUploadingAssets,
  previewImages,
  onUploadCustomAssets,
  onImageChange,
}: Step3Props) {
  return (
    <>
      {/* Custom 3D Upload */}
      {selectedCategory && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="text-blue-600" />
              Bước 3a: Phôi 3D tùy chỉnh (Tùy chọn)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-gray-500">
              Nếu bạn có file GLB riêng, upload tại đây thay vì dùng phôi mặc
              định
            </p>
            <div>
              <Label>File GLB</Label>
              <Input id="glb-file" type="file" accept=".glb,.gltf" />
            </div>
            <div>
              <Label>File Dieline SVG (Tùy chọn)</Label>
              <Input id="dieline-file" type="file" accept=".svg" />
            </div>
            <Button
              type="button"
              onClick={onUploadCustomAssets}
              disabled={isUploadingAssets}
              variant="outline"
              className="w-full"
            >
              {isUploadingAssets ? (
                <>
                  <Loader2 className="mr-2 animate-spin" size={16} />
                  Đang tải...
                </>
              ) : (
                <>
                  <Upload className="mr-2" size={16} />
                  Tải lên phôi tùy chỉnh
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Image Upload */}
      {selectedCategory && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="text-blue-600" />
              Bước 3b: Ảnh sản phẩm
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Ảnh sản phẩm (Tối đa 5)</Label>
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={onImageChange}
              />
              {previewImages.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {previewImages.map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      alt={`Preview ${i}`}
                      className="w-full h-20 object-cover rounded"
                    />
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
