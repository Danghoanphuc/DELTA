// frontend/src/features/admin/components/AssetWizardPage.tsx
// ✅ BẢN VÁ 100%: Sửa lỗi import path

import React from "react";
// ✅ SỬA LỖI PATH: Đường dẫn đúng là '../hooks/useAddProductFlow'
import { useAddProductFlow } from "../hooks/useAddProductFlow";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
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
} from "lucide-react";

// ✅ BỔ SUNG: Cho phép truyền productId
interface AssetWizardPageProps {
  productId?: string;
}

export function AssetWizardPage({ productId }: AssetWizardPageProps) {
  const {
    isEditMode,
    isLoading, // ✅ Trạng thái tải phôi
    productName,
    setProductName,
    modelUrl,
    modelMaterials,
    modelUrlValid,
    surfaces,
    isUploading,
    handleGlbUpload,
    addSurface,
    updateSurface,
    handleSvgUpload,
    handleSaveProduct, // ✅ Đổi tên hàm
  } = useAddProductFlow(productId); // ✅ Truyền productId vào hook

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    handler: (file: File) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      handler(file);
    }
  };

  // ✅ Hiển thị loading nếu đang tải phôi cũ
  if (isLoading) {
    return (
      <div className="p-8 max-w-4xl mx-auto flex items-center justify-center h-96">
        <Loader2 size={32} className="animate-spin mr-4" />
        <span className="text-lg text-gray-600">Đang tải dữ liệu phôi...</span>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">
        {isEditMode ? "Trợ lý AI (Chế độ Sửa)" : "Trợ lý AI Tạo Phôi Mới"}
      </h1>

      {/* BƯỚC 1: THÔNG TIN CƠ BẢN */}
      <Card>
        <CardHeader>
          <CardTitle>Bước 1: Thông tin cơ bản</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="productName">Tên phôi</Label>
            <Input
              id="productName"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="glbUpload">
              {isEditMode
                ? "Tải file GLB mới (Tùy chọn)"
                : "Tải file 3D (.glb)"}
            </Label>
            <Input
              id="glbUpload"
              type="file"
              accept=".glb"
              onChange={(e) => handleFileChange(e, handleGlbUpload)}
              disabled={isUploading}
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
              <span>Bước 2: Các Bề mặt (Surfaces)</span>
              <Button size="sm" onClick={addSurface}>
                <Plus size={16} className="mr-2" />
                Thêm bề mặt
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {surfaces.map((surface, index) => (
              <div
                key={surface.key}
                className="grid grid-cols-3 gap-4 p-4 border rounded-lg"
              >
                {/* Cột 1: Thông tin 2D */}
                <div className="space-y-2">
                  <Label>Bề mặt {index + 1}</Label>
                  <Input
                    placeholder="Tên (vd: Mặt trước)"
                    value={surface.name}
                    onChange={(e) =>
                      updateSurface(surface.key, "name", e.target.value)
                    }
                  />
                  <Input
                    placeholder="Key (vd: front)"
                    value={surface.key}
                    onChange={(e) =>
                      updateSurface(surface.key, "key", e.target.value)
                    }
                  />
                </div>

                {/* Cột 2: File SVG */}
                <div className="space-y-2">
                  <Label htmlFor={`svgUpload-${surface.key}`}>
                    Khuôn 2D (.svg)
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

                {/* CỘT 3: 🔥 TRÁI TIM CỦA AI WIZARD 🔥 */}
                <div className="space-y-2">
                  <Label>Vật liệu 3D (từ file GLB)</Label>
                  <Select
                    value={surface.materialName}
                    onValueChange={(value) =>
                      updateSurface(surface.key, "materialName", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn vật liệu 3D tương ứng..." />
                    </SelectTrigger>
                    <SelectContent>
                      {/* Chỉ hiển thị các vật liệu CÓ THẬT */}
                      {modelMaterials.map((matName) => (
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

      {/* BƯỚC 3: LƯU */}
      <Button
        size="lg"
        onClick={handleSaveProduct} // ✅ Đổi tên hàm
        disabled={isUploading || !modelUrlValid || surfaces.length === 0}
        className="w-full"
      >
        {isUploading ? (
          <Loader2 size={18} className="animate-spin mr-2" />
        ) : (
          <Save size={18} className="mr-2" />
        )}
        {isEditMode ? "Lưu Cập Nhật" : "Tạo phôi Mới"}
      </Button>
    </div>
  );
}
