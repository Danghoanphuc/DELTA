// src/features/printer/pages/PrinterStudio.tsx (✅ BẢN VÁ LỖI "SVG NOT ALLOWED" + SỬA LỖI UPLOAD ẢNH)
import React, { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import api from "@/shared/lib/axios";

// Import 3 Lõi
import ProductViewer3D from "@/features/editor/components/ProductViewer3D";
import {
  FabricCanvasEditor,
  FabricCanvasEditorRef,
} from "@/features/editor/components/FabricCanvasEditor";

// Import UI components
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/shared/components/ui/card";
import { Switch } from "@/shared/components/ui/switch";
import { Text, Image, Save, ArrowLeft } from "lucide-react";

// Form data types
type TemplateFormData = {
  name: string;
  isPublic: boolean;
};

// Utility function (Giữ nguyên)
function dataURLtoBlob(dataurl: string): Blob {
  // ... (code giữ nguyên)
  const arr = dataurl.split(",");
  const mime = arr[0].match(/:(.*?);/)?.[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

export function PrinterStudio() {
  const navigate = useNavigate();
  const { productId } = useParams();
  const editorRef = useRef<FabricCanvasEditorRef>(null);
  const imageInputRef = useRef<HTMLInputElement>(null); // <-- 1. THÊM REF CHO INPUT

  // === STATE MANAGEMENT ===
  // ... (Giữ nguyên)
  const [baseProductId, setBaseProductId] = useState<string | null>(null);
  const [phoiAssets, setPhoiAssets] = useState<{
    modelUrl: string;
    dielineUrl: string;
  } | null>(null);
  const [textureData, setTextureData] = useState<string | null>(null);
  const [editorData, setEditorData] = useState<object | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form management (Giữ nguyên)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TemplateFormData>({
    defaultValues: { name: "", isPublic: true },
  });

  // === FETCH PRODUCT (Giữ nguyên) ===
  useEffect(() => {
    // ... (code giữ nguyên)
    if (!productId) {
      toast.error(
        "Lỗi: Không tìm thấy 'productId'. Bạn cần chọn một Phôi trước."
      );
      navigate("/printer/dashboard/products");
      return;
    }
    setBaseProductId(productId);
    // ... (code fetch)
  }, [productId, navigate]);

  // === HÀM CẬP NHẬT (Giữ nguyên) ===
  const handleCanvasUpdate = useCallback(
    (base64Image: string, jsonData: object) => {
      setTextureData(base64Image);
      setEditorData(jsonData);
    },
    []
  );

  // === TOOLBAR ACTIONS (SỬA LẠI) ===
  const handleAddText = () => {
    editorRef.current?.addText("Sửa chữ này");
  };

  // 2. SỬA HÀM NÀY: Đổi tên và chức năng
  const handleAddImageClick = () => {
    // Mở trình chọn file thay vì prompt
    imageInputRef.current?.click();
  };

  // 3. THÊM HÀM NÀY: Xử lý file ảnh được chọn
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      toast.error("Chỉ hỗ trợ file ảnh dưới 5MB");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Chỉ hỗ trợ file ảnh (PNG, JPG, WEBP).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataURL = event.target?.result as string;
      if (dataURL) {
        // Gửi dataURL (base64) vào canvas editor
        // Hàm addImage trong FabricCanvasEditor đã hỗ trợ dataURL
        editorRef.current?.addImage(dataURL);
      }
    };
    reader.onerror = () => {
      toast.error("Không thể đọc file ảnh này.");
    };
    reader.readAsDataURL(file);

    // Reset input để có thể tải lại cùng 1 file
    if (e.target) e.target.value = "";
  };

  // === CREATE SNAPSHOT & SUBMIT (Giữ nguyên) ===
  const createCanvasSnapshot = useCallback((): {
    // ... (code giữ nguyên)
  } | null => {
    // ... (code giữ nguyên)
    if (!editorRef.current) return null;
    // ... (code giữ nguyên)
  }, [editorData]);

  const onSubmit = async (data: TemplateFormData) => {
    // ... (code giữ nguyên)
    // ... (code snapshot)
    // ... (code formData)
    // ... (BẢN VÁ SVG NOT ALLOWED giữ nguyên)
    // ... (code api.post)
  };

  // === LOADING STATE (Giữ nguyên) ===
  if (isLoading || !phoiAssets) {
    // ... (code giữ nguyên)
  }

  // === RENDER ===
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex h-screen bg-gray-100"
    >
      {/* 4. THÊM INPUT ẨN NÀY */}
      <input
        type="file"
        ref={imageInputRef}
        className="hidden"
        accept="image/png, image/jpeg, image/webp"
        onChange={handleImageFileChange}
      />

      {/* TOOLBAR */}
      <div className="w-20 flex-shrink-0 bg-white border-r border-gray-200 p-2 flex flex-col items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          type="button"
          onClick={() => navigate("/printer/dashboard/products")}
        >
          <ArrowLeft size={20} />
        </Button>
        <div className="my-2 w-full border-t"></div>
        <Button
          variant="outline"
          size="icon"
          title="Thêm Chữ"
          type="button"
          onClick={handleAddText}
        >
          <Text size={20} />
        </Button>
        <Button
          variant="outline"
          size="icon"
          title="Thêm Ảnh"
          type="button"
          onClick={handleAddImageClick} // <-- 5. SỬA onClick
        >
          <Image size={20} />
        </Button>
      </div>

      {/* 2D EDITOR */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
        <FabricCanvasEditor
          ref={editorRef}
          dielineUrl={phoiAssets.dielineUrl}
          onCanvasUpdate={handleCanvasUpdate}
        />
      </div>

      {/* 3D VIEWER & FORM */}
      <div className="w-80 flex-shrink-0 bg-white border-l border-gray-200 p-4 overflow-y-auto">
        {/* ... (Toàn bộ phần Card 3D, Card Form, Nút Lưu giữ nguyên) ... */}
        <Card>
          <CardHeader>
            <CardTitle>Xem trước 3D (Real-time)</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ProductViewer3D
              modelUrl={phoiAssets.modelUrl}
              textureData={textureData}
            />
          </CardContent>
        </Card>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Thông tin Mẫu</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="templateName">Tên Mẫu thiết kế *</Label>
              <Input
                id="templateName"
                {...register("name", { required: "Tên mẫu là bắt buộc" })}
                placeholder="VD: Mẫu card visit Giáng Sinh"
              />
              {errors.name && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="isPublic">Đăng bán công khai?</Label>
              <Switch
                id="isPublic"
                {...register("isPublic")}
                defaultChecked={true}
              />
            </div>
            <p className="text-xs text-gray-500">
              Nếu bật, Customer có thể thấy và sử dụng mẫu này trong kho mẫu.
            </p>
          </CardContent>
        </Card>

        <Button
          type="submit"
          className="w-full mt-6 bg-orange-500 hover:bg-orange-600"
          size="lg"
          disabled={isSubmitting}
        >
          <Save size={18} className="mr-2" />
          {isSubmitting ? "Đang lưu..." : "Lưu & Đăng bán Mẫu"}
        </Button>
      </div>
    </form>
  );
}
