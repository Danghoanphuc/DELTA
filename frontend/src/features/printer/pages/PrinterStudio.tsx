// src/features/printer/pages/PrinterStudio.tsx
// ✅ BẢN SỬA LỖI CUỐI CÙNG (Dùng display:none để tránh UNMOUNT)

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import api from "@/shared/lib/axios";

// Core Components
import ProductViewer3D from "@/features/editor/components/ProductViewer3D";
import {
  FabricCanvasEditor,
  FabricCanvasEditorRef,
} from "@/features/editor/components/FabricCanvasEditor";
import { EditorToolbar } from "@/features/editor/components/EditorToolbar";

// UI Components
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
import { Badge } from "@/shared/components/ui/badge";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Separator } from "@/shared/components/ui/separator";
import { Save, ArrowLeft, Eye, Loader2 } from "lucide-react";

// Types
type TemplateFormData = {
  name: string;
  description: string;
  isPublic: boolean;
  tags: string;
};
interface PhoiAssets {
  modelUrl: string;
  dielineUrl: string;
}
import { Product } from "@/types/product";

// Utility (Giữ nguyên)
function dataURLtoBlob(dataurl: string): Blob {
  const arr = dataurl.split(",");
  const mime = arr[0].match(/:(.*?);/)?.[1] || "image/png";
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

// Skeleton cho Canvas (Giữ nguyên)
const CanvasWaitingSkeleton = () => (
  <div className="w-full h-full min-h-[600px] flex items-center justify-center bg-gray-50 shadow-inner rounded-lg">
    <div className="text-center space-y-3">
      <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto" />
      <p className="text-sm text-gray-600">Đang chờ phôi 3D tải xong...</p>
    </div>
  </div>
);

export function PrinterStudio() {
  const navigate = useNavigate();
  const { productId } = useParams();
  const editorRef = useRef<FabricCanvasEditorRef>(null);

  // ==================== STATE (Giữ nguyên) ====================
  const [baseProduct, setBaseProduct] = useState<Product | null>(null);
  const [phoiAssets, setPhoiAssets] = useState<PhoiAssets | null>(null);
  const [textureData, setTextureData] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewMode, setPreviewMode] = useState<"2d" | "3d">("3d");

  const [is3DMainLoaded, setIs3DMainLoaded] = useState(false);
  const [is2DReady, setIs2DReady] = useState(false);

  // Form (Giữ nguyên)
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<TemplateFormData>({
    defaultValues: { name: "", description: "", isPublic: true, tags: "" },
  });
  const watchedName = watch("name");
  const watchedDescription = watch("description");

  // ==================== FETCH PRODUCT (Giữ nguyên) ====================
  useEffect(() => {
    let isCancelled = false;
    const controller = new AbortController();
    const fetchAssets = async () => {
      try {
        setIsLoading(true);
        let modelUrl: string | undefined;
        let dielineUrl: string | undefined;
        let productName: string | undefined;
        let productData: Product | null = null;
        if (productId === "new") {
          const tempData = localStorage.getItem("tempProductAssets");
          console.log("--- BƯỚC 2a: NHẬN DỮ LIỆU THÔ ---");
          console.log("Dữ liệu thô từ localStorage (tempData):", tempData);
          if (!tempData)
            throw new Error("Không tìm thấy dữ liệu phôi tạm thời");
          const parsed = JSON.parse(tempData);
          modelUrl = parsed.assets?.modelUrl;
          dielineUrl = parsed.assets?.surfaces?.[0]?.dielineSvgUrl;
          productName = `Phôi ${parsed.category} (Tạm)`;
          console.log("--- BƯỚC 2b: KIỂM TRA PARSING ---");
          console.log("modelUrl sau khi parse:", modelUrl);
          console.log("dielineUrl sau khi parse (PHÔI 2D):", dielineUrl);
          if (!modelUrl || !dielineUrl)
            throw new Error(
              "Dữ liệu phôi tạm thời không đầy đủ (thiếu model/surface)"
            );
          productData = {
            _id: "temp",
            name: productName,
            assets: parsed.assets,
          } as any;
        } else {
          const res = await api.get(`/products/${productId}`, {
            signal: controller.signal,
          });
          if (isCancelled) return;
          const product: Product = res.data?.data?.product;
          productData = product;
          modelUrl = product?.assets?.modelUrl;
          dielineUrl = product?.assets?.surfaces?.[0]?.dielineSvgUrl;
          if (!product || !modelUrl || !dielineUrl)
            throw new Error(
              "Phôi này thiếu file 3D hoặc file Dieline SVG (surfaces)."
            );
        }
        setBaseProduct(productData);
        setPhoiAssets({ modelUrl, dielineUrl });
      } catch (err: any) {
        if (err.name === "AbortError" || err.name === "CanceledError") return;
        if (!isCancelled) {
          toast.error(err.message || "Không thể tải dữ liệu Phôi");
          navigate("/printer/dashboard/products");
        }
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    };
    fetchAssets();
    return () => {
      isCancelled = true;
      controller.abort();
    };
  }, [productId, navigate]);

  // ==================== HANDLERS (Giữ nguyên) ====================
  const handleCanvasUpdate = useCallback(
    (base64Image: string, jsonData: object) => {
      setTextureData(base64Image);
    },
    []
  );

  // ✅ Giữ nguyên useCallback VỚI DEPENDENCY RỖNG
  const handleDielineLoaded = useCallback(() => {
    console.log("✅ 2D Editor (Main) Loaded. Unlocking 3D Sidebar.");
    setIs2DReady(true);
  }, []); // <-- Dependency rỗng là đúng

  const handleImageUpload = (file: File) => {
    toast.success(`Đã tải ảnh: ${file.name}`);
  };

  const createCanvasSnapshot = useCallback((): {
    json: string;
    previewBlob: Blob;
    productionBlob: Blob;
  } | null => {
    if (!editorRef.current) return null;
    const canvas = editorRef.current.getCanvas();
    if (!canvas) return null;
    canvas.discardActiveObject();
    canvas.renderAll();
    const json = editorRef.current.getJSON();
    const parsedJson = JSON.parse(json);
    if (!parsedJson.objects || parsedJson.objects.length === 0) {
      toast.error("Canvas trống! Hãy thêm ít nhất 1 đối tượng.");
      return null;
    }
    const previewDataURL = canvas.toDataURL({ format: "png", quality: 0.8 });
    const previewBlob = dataURLtoBlob(previewDataURL);
    const svgString = canvas.toSVG();
    const productionBlob = new Blob([svgString], { type: "image/svg+xml" });
    return { json, previewBlob, productionBlob };
  }, []);

  // ==================== SUBMIT (Giữ nguyên) ====================
  const onSubmit = async (data: TemplateFormData) => {
    if (!editorRef.current) {
      toast.error("Lỗi: Trình chỉnh sửa chưa sẵn sàng");
      return;
    }
    const baseProductId = baseProduct?._id;
    if (!baseProductId) {
      toast.error("Lỗi: Không tìm thấy ID Phôi (Base Product ID).");
      return;
    }
    if (productId === "new") {
      toast.warning("Lưu ý: Bạn đang tạo mẫu từ phôi tạm.", {
        description: "Mẫu này sẽ được liên kết với phôi sau khi phôi được tạo.",
      });
    }
    setIsSubmitting(true);
    toast.info("Đang tạo snapshot 2D...");
    const snapshot = createCanvasSnapshot();
    if (!snapshot) {
      setIsSubmitting(false);
      return;
    }
    try {
      if (snapshot.previewBlob.size > 5 * 1024 * 1024)
        throw new Error("Ảnh xem trước quá lớn (>5MB)");
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("description", data.description);
      formData.append("isPublic", String(data.isPublic));
      formData.append("baseProductId", baseProductId);
      formData.append("editorData", snapshot.json);
      formData.append("previewFile", snapshot.previewBlob, "preview.png");
      formData.append("productionFile", snapshot.productionBlob, "design.svg");
      if (data.tags) {
        const tagsArray = data.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean);
        formData.append("tags", JSON.stringify(tagsArray));
      }
      toast.info("Đang upload dữ liệu mẫu...");
      await api.post("/designs/templates", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 30000,
      });
      toast.success("🎉 Đăng bán mẫu thành công!");
      localStorage.removeItem("tempProductAssets");
      navigate("/printer/dashboard/products");
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Lỗi khi lưu mẫu thiết kế");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==================== LOADING STATE (Giữ nguyên) ====================
  if (isLoading || !phoiAssets) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Đang tải Studio và dữ liệu Phôi...</p>
        </div>
      </div>
    );
  }

  // ==================== RENDER (ĐÃ SỬA) ====================
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex h-screen bg-gray-100"
    >
      {/* LEFT: TOOLBAR (Giữ nguyên) */}
      <EditorToolbar editorRef={editorRef} onImageUpload={handleImageUpload} />

      {/* CENTER: EDITOR (Đã sửa) */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar (Giữ nguyên) */}
        <div className="h-16 bg-white border-b flex items-center px-6 justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              type="button"
              onClick={() => {
                localStorage.removeItem("tempProductAssets");
                navigate("/printer/dashboard/products");
              }}
            >
              <ArrowLeft size={20} />
            </Button>
            <div>
              <h1 className="text-lg font-semibold">
                {watchedName || "Chưa đặt tên"}
              </h1>
              <p className="text-xs text-gray-500">Phôi: {baseProduct?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {productId === "new" ? "Chế độ tạo mới" : "Chế độ chỉnh sửa"}
            </Badge>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-orange-500 hover:bg-orange-600"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang lưu...
                </>
              ) : (
                <>
                  <Save size={18} className="mr-2" /> Lưu & Đăng bán
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Canvas Area (✅ SỬA LỖI: Dùng `display: none`) */}
        <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
          {/* Wrapper cho cả 2D và 3D Main */}
          <div className="w-full h-full max-w-4xl max-h-[800px] relative">
            {/* 3D Viewer (Main) - LUÔN RENDER, chỉ ẩn đi */}
            <div
              style={{
                display: previewMode === "3d" ? "block" : "none",
                width: "100%",
                height: "100%",
              }}
            >
              <ProductViewer3D
                modelUrl={phoiAssets.modelUrl}
                textures={{ Dieline: textureData }}
                onModelLoaded={() => {
                  if (!is3DMainLoaded) {
                    console.log(
                      "✅ 3D View (Main) Loaded. Unlocking 2D background load."
                    );
                    setIs3DMainLoaded(true);
                  }
                }}
              />
            </div>

            {/* 2D Editor (Main) - Chỉ render sau khi 3D-Main đã tải */}
            {/* và LUÔN RENDER (chỉ ẩn đi) sau khi đã tải */}
            {is3DMainLoaded && (
              <div
                style={{
                  display: previewMode === "2d" ? "block" : "none",
                  width: "600px", // Đảm bảo kích thước
                  height: "600px", // Đảm bảo kích thước
                }}
              >
                <FabricCanvasEditor
                  ref={editorRef}
                  dielineImageUrl={phoiAssets.dielineUrl}
                  onCanvasUpdate={handleCanvasUpdate}
                  width={600}
                  height={600}
                  isReadyToLoad={is3DMainLoaded}
                  onDielineLoaded={handleDielineLoaded}
                />
              </div>
            )}

            {/* Skeleton nếu user chuyển sang 2D quá nhanh */}
            {previewMode === "2d" && !is3DMainLoaded && (
              <CanvasWaitingSkeleton />
            )}
          </div>
        </div>

        {/* Bottom Bar - Preview Toggle (Giữ nguyên) */}
        <div className="h-16 bg-white border-t flex items-center justify-center px-6">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant={previewMode === "2d" ? "default" : "outline"}
              onClick={() => setPreviewMode("2d")}
            >
              Chế độ 2D
            </Button>
            <Button
              type="button"
              variant={previewMode === "3d" ? "default" : "outline"}
              onClick={() => setPreviewMode("3d")}
            >
              <Eye size={16} className="mr-2" />
              Xem trước 3D
            </Button>
          </div>
        </div>
      </div>

      {/* RIGHT: FORM & PREVIEW (Giữ nguyên) */}
      <ScrollArea className="w-96 bg-white border-l">
        <div className="p-6 space-y-6">
          {/* Product Info (Giữ nguyên) */}
          {baseProduct && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Thông tin Phôi</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Tên:</span> {baseProduct.name}
                </div>
                {baseProduct.description && (
                  <div>
                    <span className="font-medium">Mô tả:</span>{" "}
                    {baseProduct.description}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Separator />

          {/* Template Form (Giữ nguyên) */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin Mẫu thiết kế</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="templateName">
                  Tên Mẫu <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="templateName"
                  {...register("name", {
                    required: "Tên mẫu là bắt buộc",
                    minLength: {
                      value: 3,
                      message: "Tên mẫu phải có ít nhất 3 ký tự",
                    },
                  })}
                  placeholder="VD: Mẫu card visit Giáng Sinh"
                />
                {errors.name && (
                  <p className="text-xs text-red-500">{errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  placeholder="Mô tả ngắn về mẫu thiết kế..."
                  rows={3}
                />
                <p className="text-xs text-gray-500">
                  {watchedDescription?.length || 0}/500 ký tự
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags">Tags (phân tách bằng dấu phẩy)</Label>
                <Input
                  id="tags"
                  {...register("tags")}
                  placeholder="VD: card visit, giáng sinh, đỏ"
                />
                <p className="text-xs text-gray-500">
                  Giúp khách hàng dễ tìm kiếm mẫu của bạn
                </p>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <Label htmlFor="isPublic" className="font-medium">
                    Đăng bán công khai
                  </Label>
                  <p className="text-xs text-gray-500">
                    Customer có thể thấy và sử dụng mẫu này
                  </p>
                </div>
                <Switch
                  id="isPublic"
                  {...register("isPublic")}
                  defaultChecked
                />
              </div>
            </CardContent>
          </Card>

          {/* 3D Preview Card (Giữ nguyên logic chờ 2D) */}
          {previewMode === "2d" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Xem trước 3D</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gray-100 rounded-lg overflow-hidden">
                  {!is2DReady ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                      <span className="text-xs text-gray-500 ml-2">
                        Đang tải 2D...
                      </span>
                    </div>
                  ) : (
                    <ProductViewer3D
                      modelUrl={phoiAssets.modelUrl}
                      textures={{ Dieline: textureData }}
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tips (Giữ nguyên) */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <h4 className="font-medium text-sm mb-2 text-blue-900">
                💡 Mẹo thiết kế
              </h4>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• Sử dụng phím tắt để làm việc nhanh hơn</li>
                <li>• Đặt tên rõ ràng để dễ quản lý</li>
                <li>• Thêm mô tả giúp khách hàng hiểu mẫu</li>
                <li>• Sử dụng tags để tăng khả năng tìm kiếm</li>
                <li>• Kiểm tra xem trước 3D trước khi lưu</li>
              </ul>
            </CardContent>
          </Card>

          {/* Warning (Giữ nguyên) */}
          {productId === "new" && (
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="pt-6">
                <h4 className="font-medium text-sm mb-2 text-yellow-900">
                  ⚠️ Lưu ý
                </h4>
                <p className="text-xs text-yellow-700">
                  Bạn đang tạo mẫu từ phôi tạm. Mẫu này sẽ được liên kết tự động
                  sau khi phôi được tạo.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>
    </form>
  );
}
