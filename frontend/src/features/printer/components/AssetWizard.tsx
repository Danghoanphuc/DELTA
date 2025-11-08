// src/features/printer/components/AssetWizard.tsx
// ✅ ĐÃ CẬP NHẬT: Xóa Bước 3 (Upload Ảnh)

import React from "react";
import { useAssetWizard } from "../hooks/useAssetWizard";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/shared/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Loader2, Save, Plus } from "lucide-react";

// ... (Interface WizardSurface, phoiCategories giữ nguyên) ...
interface WizardSurface {
  surfaceKey: string;
  name: string;
  dielineSvgUrl: string | null;
  materialName: string;
  svgUrlValid: boolean;
}
interface AssetWizardProps {
  productId?: string;
  onFormClose: () => void;
  onSuccess: () => void;
}
const phoiCategories = [
  { value: "business-card", label: "Card Visit" },
  { value: "flyer", label: "Tờ rơi" },
  { value: "banner", label: "Banner" },
  { value: "t-shirt", label: "Áo thun" },
  { value: "mug", label: "Cốc" },
  { value: "packaging", label: "Bao bì" },
  { value: "other", label: "Khác" },
];

export function AssetWizard({
  productId,
  onFormClose,
  onSuccess,
}: AssetWizardProps) {
  const {
    isEditMode,
    isLoading,
    assetName,
    setAssetName,
    description,
    setDescription,
    category,
    setCategory,
    modelUrl,
    modelMaterials,
    modelUrlValid,
    surfaces,
    isUploading,
    // ❌ XÓA: previewImages, existingImageUrls
    // ❌ XÓA: handleImageChange
    handleGlbUpload,
    addSurface,
    updateSurface,
    handleSvgUpload,
    handleSaveAsset,
  } = useAssetWizard(productId, onSuccess);

  // (Các hàm handler file GLB/SVG giữ nguyên)
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    handler: (file: File) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      handler(file);
    }
    e.target.value = "";
  };

  // ❌ XÓA: handleImageFileChange

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="animate-spin" />
        <p className="ml-2">Đang tải dữ liệu phôi...</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSaveAsset();
      }}
      className="p-8 max-w-4xl mx-auto space-y-6"
    >
      <h1 className="text-2xl font-bold">
        {isEditMode ? "Trợ lý AI (Sửa Phôi)" : "Trợ lý AI Tạo Phôi Mới"}
      </h1>

      {/* BƯỚC 1: THÔNG TIN CƠ BẢN */}
      <Card>
        <CardHeader>
          <CardTitle>Bước 1: Thông tin cơ bản</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="productName">Tên phôi *</Label>
              <Input
                id="productName"
                value={assetName}
                onChange={(e) => setAssetName(e.target.value)}
                placeholder="VD: Hộp nắp gài..."
                required
              />
            </div>
            <div>
              <Label htmlFor="category">Danh mục *</Label>
              <Select
                value={category}
                onValueChange={(value) => setCategory(value)}
                required
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Chọn danh mục..." />
                </SelectTrigger>
                <SelectContent>
                  {phoiCategories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả ngắn về phôi, chất liệu..."
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="glbUpload">
              {isEditMode
                ? "Tải file GLB mới (Tùy chọn)"
                : "Tải file 3D (.glb) *"}
            </Label>
            <Input
              id="glbUpload"
              type="file"
              accept=".glb"
              onChange={(e) => handleFileChange(e, handleGlbUpload)}
              disabled={isUploading}
            />
            {modelUrl && modelUrlValid && (
              <p className="text-green-600 text-sm mt-1">✓ Đã tải GLB</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* BƯỚC 2: MAP VẬT LIỆU */}
      {modelMaterials.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Bước 2: Map Vật liệu & Dieline (Bề mặt in)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {surfaces.map((surface, index) => (
              <div
                key={surface.surfaceKey}
                className="grid grid-cols-3 gap-4 border p-3 rounded-lg"
              >
                <Input
                  placeholder="Tên bề mặt (VD: Mặt trước)"
                  value={surface.name}
                  onChange={(e) =>
                    updateSurface(surface.surfaceKey, "name", e.target.value)
                  }
                  required
                />
                <Select
                  value={surface.materialName}
                  onValueChange={(val) =>
                    updateSurface(surface.surfaceKey, "materialName", val)
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn vật liệu 3D..." />
                  </SelectTrigger>
                  <SelectContent>
                    {modelMaterials.map((mat) => (
                      <SelectItem key={mat} value={mat}>
                        {mat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="file"
                  accept=".svg"
                  onChange={(e) =>
                    handleFileChange(e, (file) =>
                      handleSvgUpload(surface.surfaceKey, file)
                    )
                  }
                  disabled={isUploading}
                  required={!surface.dielineSvgUrl}
                />
                {surface.dielineSvgUrl && surface.svgUrlValid && (
                  <p className="text-green-600 text-sm col-span-3">
                    ✓ Đã tải SVG
                  </p>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addSurface}
            >
              <Plus size={16} className="mr-2" /> Thêm bề mặt in
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ❌ BƯỚC 3: UPLOAD ẢNH (ĐÃ BỊ XÓA) */}

      {/* BƯỚC 3 (MỚI): LƯU */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={onFormClose}
          disabled={isUploading}
        >
          Hủy
        </Button>
        <Button
          size="lg"
          type="submit"
          disabled={
            isUploading ||
            !modelUrlValid ||
            surfaces.length === 0 ||
            surfaces.some((s) => !s.svgUrlValid)
          }
        >
          {isUploading ? (
            <Loader2 size={18} className="animate-spin mr-2" />
          ) : (
            <Save size={18} className="mr-2" />
          )}
          {isEditMode ? "Lưu Cập Nhật Phôi" : "Tạo phôi Mới"}
        </Button>
      </div>
    </form>
  );
}
