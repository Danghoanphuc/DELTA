// src/features/admin/components/AssetWizardPage.tsx
// ✅ BẢN VÁ FULL 100%: Sửa lỗi import + Bổ sung Category

import React from "react";
// ✅ SỬA LỖI IMPORT: Trỏ đến file hook CÙNG THƯ MỤC
import { useAddProductFlow } from "../hooks/useAddProductFlow";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  Upload,
  CheckCircle,
  AlertCircle,
  Plus,
  Save,
  Loader2,
  Image as ImageIcon,
  X,
} from "lucide-react";
import { ProductPrice } from "@/types/product";

// Kiểu dữ liệu cho 1 bề mặt (trong wizard)
interface WizardSurface {
  key: string;
  name: string;
  dielineSvgUrl: string | null;
  materialName: string;
  svgUrlValid: boolean;
}

interface AssetWizardPageProps {
  productId?: string;
  onFormClose: () => void;
  onSuccess: () => void;
}

// ✅ BỔ SUNG: Danh mục cơ bản ( khớp với schema của anh)
const phoiCategories = [
  { value: "business-card", label: "Card Visit" },
  { value: "flyer", label: "Tờ rơi" },
  { value: "banner", label: "Banner" },
  { value: "brochure", label: "Brochure" },
  { value: "t-shirt", label: "Áo thun" },
  { value: "mug", label: "Cốc" },
  { value: "sticker", label: "Sticker" },
  { value: "packaging", label: "Bao bì / Hộp" },
  { value: "other", label: "Khác" },
];

export function AssetWizardPage({
  productId,
  onFormClose,
  onSuccess,
}: AssetWizardPageProps) {
  const {
    isEditMode,
    isLoading,
    productName,
    setProductName,
    description,
    setDescription,
    pricing,
    category, // ✅ Lấy
    setCategory, // ✅ Lấy
    modelUrl,
    modelMaterials,
    modelUrlValid,
    surfaces,
    isUploading,
    previewImages,
    existingImageUrls,
    handleImageChange,
    handleGlbUpload,
    addSurface,
    updateSurface,
    handleSvgUpload,
    handleSaveProduct,
    handlePricingChange,
    handleAddPricingTier,
    handleRemovePricingTier,
  } = useAddProductFlow(productId, onSuccess);

  // (Các hàm handler file giữ nguyên)
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    handler: (file: File) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      handler(file);
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleImageChange(e);
  };

  if (isLoading) {
    return (
      <div className="p-8 max-w-4xl mx-auto flex items-center justify-center h-96">
        <Loader2 size={32} className="animate-spin mr-4" />
        <span className="text-lg text-gray-600">Đang tải dữ liệu phôi...</span>
      </div>
    );
  }

  return (
    // Đổi sang <form> để có thể submit bằng Enter (tùy chọn)
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSaveProduct();
      }}
      className="p-8 max-w-4xl mx-auto space-y-6"
    >
      <h1 className="text-2xl font-bold">
        {isEditMode ? "Trợ lý AI (Chế độ Sửa)" : "Trợ lý AI Tạo Phôi Mới"}
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
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="VD: Hộp nắp gài..."
                required
              />
            </div>
            {/* ✅ BỔ SUNG: CHỌN CATEGORY */}
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
              // ✅ Thêm required cho chế độ TẠO MỚI
              required={!isEditMode}
            />
            {modelUrlValid && (
              <div className="flex items-center gap-2 mt-2 text-green-600">
                <CheckCircle size={16} />
                <span>Model 3D đã tải và xác thực OK!</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* BƯỚC 2: MAP VẬT LIỆU (CHỈ HIỆN KHI CÓ VẬT LIỆU) */}
      {modelMaterials.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Bước 2: Các Bề mặt (Surfaces) *</span>
              <Button size="sm" onClick={addSurface} type="button">
                <Plus size={16} className="mr-2" />
                Thêm bề mặt
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {surfaces.map((surface: WizardSurface, index: number) => (
              <div
                key={surface.key}
                className="grid grid-cols-3 gap-4 p-4 border rounded-lg"
              >
                <div className="space-y-2">
                  <Label>Bề mặt {index + 1}</Label>
                  <Input
                    placeholder="Tên (vd: Mặt trước)"
                    value={surface.name}
                    onChange={(e) =>
                      updateSurface(surface.key, "name", e.target.value)
                    }
                    required
                  />
                  <Input
                    placeholder="Key (vd: front)"
                    value={surface.key}
                    onChange={(e) =>
                      updateSurface(surface.key, "key", e.target.value)
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`svgUpload-${surface.key}`}>
                    Khuôn 2D (.svg) *
                  </Label>
                  <Input
                    id={`svgUpload-${surface.key}`}
                    type="file"
                    accept=".svg"
                    onChange={(e) =>
                      handleFileChange(e, (file) =>
                        handleSvgUpload(surface.key, file)
                      )
                    }
                    disabled={isUploading}
                    // ✅ Thêm required nếu chưa có (chế độ sửa)
                    required={!surface.svgUrlValid}
                  />
                  {surface.svgUrlValid && (
                    <div className="flex items-center gap-2 mt-2 text-green-600">
                      <CheckCircle size={16} /> <span>SVG đã xác thực OK!</span>
                    </div>
                  )}
                  {!surface.svgUrlValid && surface.dielineSvgUrl && (
                    <div className="flex items-center gap-2 mt-2 text-red-600">
                      <AlertCircle size={16} /> <span>Lỗi 404!</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Vật liệu 3D (từ file GLB) *</Label>
                  <Select
                    value={surface.materialName}
                    onValueChange={(value) =>
                      updateSurface(surface.key, "materialName", value)
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn vật liệu 3D tương ứng..." />
                    </SelectTrigger>
                    <SelectContent>
                      {modelMaterials.map((matName: string) => (
                        <SelectItem key={matName} value={matName}>
                          {matName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* BƯỚC 3: UPLOAD ẢNH */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="text-blue-600" />
            Bước 3: Ảnh Sản Phẩm {isEditMode ? "(Tùy chọn)" : "*"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="imageUpload">Tải lên (tối đa 5 ảnh)</Label>
          <Input
            id="imageUpload"
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageFileChange}
            disabled={isUploading}
          />
          {/* Preview ảnh */}
          <div className="flex gap-2 flex-wrap">
            {/* Ảnh mới upload (preview) */}
            {previewImages.map((src: string, idx: number) => (
              <img
                key={idx}
                src={src}
                alt="Preview"
                className="w-24 h-24 object-cover rounded-lg border"
              />
            ))}
            {/* Ảnh đã tồn tại (chế độ sửa) */}
            {isEditMode &&
              previewImages.length === 0 &&
              existingImageUrls.map((url: string, idx: number) => (
                <img
                  key={idx}
                  src={url}
                  alt="Existing"
                  className="w-24 h-24 object-cover rounded-lg border"
                />
              ))}
          </div>
        </CardContent>
      </Card>

      {/* BƯỚC 4: GIÁ BÁN */}
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Bước 4: Cấu hình Giá Bán *</span>
            <Button size="sm" onClick={handleAddPricingTier} type="button">
              <Plus size={16} className="mr-2" />
              Thêm bậc giá
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {pricing.map((price: ProductPrice, index: number) => (
            <div
              key={index}
              className="flex items-end gap-3 p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex-1">
                <Label className="text-xs">Số lượng (từ) *</Label>
                <Input
                  type="number"
                  value={price.minQuantity}
                  onChange={(e) =>
                    handlePricingChange(
                      index,
                      "minQuantity",
                      Number(e.target.value)
                    )
                  }
                  placeholder="1"
                  min={1}
                  required
                />
              </div>
              <div className="flex-1">
                <Label className="text-xs">Đơn giá (VND) *</Label>
                <Input
                  type="number"
                  value={price.pricePerUnit}
                  onChange={(e) =>
                    handlePricingChange(
                      index,
                      "pricePerUnit",
                      Number(e.target.value)
                    )
                  }
                  placeholder="1000"
                  min={0}
                  required
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleRemovePricingTier(index)}
                disabled={pricing.length <= 1}
                className="text-red-600"
              >
                <X size={18} />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* BƯỚC 5: LƯU */}
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
          type="submit" // ✅ Đổi sang type="submit"
          disabled={isUploading || !modelUrlValid || surfaces.length === 0}
        >
          {isUploading ? (
            <Loader2 size={18} className="animate-spin mr-2" />
          ) : (
            <Save size={18} className="mr-2" />
          )}
          {isEditMode ? "Lưu Cập Nhật" : "Tạo phôi Mới"}
        </Button>
      </div>
    </form>
  );
}
