// src/features/printer/pages/PrinterStudio.tsx (✅ FULL PRODUCTION VERSION)
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
import { Textarea } from "@/shared/components/ui/textarea";
import { Text, Image, Save, ArrowLeft } from "lucide-react";

// Form data types
type TemplateFormData = {
  name: string;
  isPublic: boolean;
};

// Utility function
function dataURLtoBlob(dataurl: string): Blob {
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

  // === STATE MANAGEMENT ===
  const [baseProductId, setBaseProductId] = useState<string | null>(null);
  const [phoiAssets, setPhoiAssets] = useState<{
    modelUrl: string;
    dielineUrl: string;
  } | null>(null);
  const [textureData, setTextureData] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form management
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TemplateFormData>({
    defaultValues: { name: "", isPublic: true },
  });

  // === ✅ FIX 1: FETCH PRODUCT WITH ABORT CONTROLLER ===
  useEffect(() => {
    if (!productId) {
      toast.error("Lỗi: Không tìm thấy 'productId'. Bạn cần chọn một Phôi trước.");
      navigate("/printer/dashboard/products");
      return;
    }

    setBaseProductId(productId);

    let isCancelled = false;
    const controller = new AbortController();

    const fetchBaseProduct = async () => {
      try {
        setIsLoading(true);
        const res = await api.get(`/products/${productId}`, {
          signal: controller.signal,
        });

        if (isCancelled) return;

        const product = res.data?.data?.product;

        if (
          !product ||
          !product.assets?.modelUrl ||
          !product.assets?.dielineUrl
        ) {
          throw new Error("Phôi này bị lỗi hoặc thiếu file 3D/Dieline.");
        }

        setPhoiAssets({
          modelUrl: product.assets.modelUrl,
          dielineUrl: product.assets.dielineUrl,
        });
      } catch (err: any) {
        if (err.name === "AbortError" || err.name === "CanceledError") return;

        if (!isCancelled) {
          toast.error(err.message || "Không thể tải dữ liệu Phôi.");
          navigate("/printer/dashboard/products");
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchBaseProduct();

    return () => {
      isCancelled = true;
      controller.abort();
    };
  }, [productId, navigate]);

  // === ✅ FIX 2: OPTIMIZED CANVAS UPDATE WITH CALLBACK ===
  const handleCanvasUpdate = useCallback((base64Image: string) => {
    setTextureData(base64Image);
  }, []);

  // === TOOLBAR ACTIONS ===
  const handleAddText = () => {
    editorRef.current?.addText("Sửa chữ này");
  };

  const handleAddImage = () => {
    const url = prompt("Nhập URL ảnh:", "https://printz.vn/logo.png");
    if (url) editorRef.current?.addImage(url);
  };

  // === ✅ FIX 3: ATOMIC SNAPSHOT + VALIDATION ===
  const createCanvasSnapshot = useCallback((): {
    json: string;
    previewBlob: Blob;
    productionBlob: Blob;
  } | null => {
    if (!editorRef.current) return null;

    const canvas = editorRef.current.getCanvas();
    if (!canvas) return null;

    // Lock canvas
    canvas.discardActiveObject();
    canvas.renderAll();

    // Get JSON
    const json = editorRef.current.getJSON();
    const parsedJson = JSON.parse(json);

    // ✅ Validate minimum complexity
    if (!parsedJson.objects || parsedJson.objects.length === 0) {
      toast.error("Canvas trống! Hãy thêm ít nhất 1 đối tượng.");
      return null;
    }

    // Create preview + production atomically
    const previewDataURL = canvas.toDataURL({ format: "png", quality: 0.8 });
    const previewBlob = dataURLtoBlob(previewDataURL);

    const svgString = canvas.toSVG();
    const productionBlob = new Blob([svgString], { type: "image/svg+xml" });

    return { json, previewBlob, productionBlob };
  }, []);

  // === ✅ FIX 4: SUBMIT WITH VALIDATION & ERROR HANDLING ===
  const onSubmit = async (data: TemplateFormData) => {
    if (!editorRef.current || !baseProductId) {
      toast.error("Lỗi: Trình chỉnh sửa chưa sẵn sàng.");
      return;
    }

    setIsSubmitting(true);
    toast.info("Đang tạo snapshot...");

    const snapshot = createCanvasSnapshot();
    if (!snapshot) {
      setIsSubmitting(false);
      return;
    }

    try {
      // ✅ Validate file size
      if (snapshot.previewBlob.size > 5 * 1024 * 1024) {
        throw new Error("Preview image quá lớn (>5MB)");
      }

      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("isPublic", String(data.isPublic));
      formData.append("baseProductId", baseProductId);
      formData.append("editorData", snapshot.json);
      formData.append("previewFile", snapshot.previewBlob, "preview.png");
      formData.append("productionFile", snapshot.productionBlob, "design.svg");

      toast.info("Đang upload...");
      await api.post("/designs/templates", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 30000,
      });

      toast.success("🎉 Đăng bán mẫu thành công!");
      navigate("/printer/dashboard/products");
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Lỗi khi lưu mẫu thiết kế.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // === LOADING STATE ===
  if (isLoading || !phoiAssets) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Đang tải Studio và dữ liệu Phôi...</p>
      </div>
    );
  }

  // === RENDER ===
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex h-screen bg-gray-100"
    >
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
          onClick={handleAddImage}
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
