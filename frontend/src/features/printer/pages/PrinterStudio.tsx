// frontend/src/features/printer/pages/PrinterStudio.tsx
// ✅ TASK 1 + TASK 4: TÁCH BIỆT + CONTEXTUAL SIDEBAR - Không có Form, chỉ Sáng tạo

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "@/shared/lib/axios";

// Core Components
import ProductViewer3D from "@/features/editor/components/ProductViewer3D";
import {
  FabricCanvasEditor,
  FabricCanvasEditorRef,
} from "@/features/editor/components/FabricCanvasEditor";
import { EditorToolbar } from "@/features/editor/components/EditorToolbar";

// ✅ TASK 4: Import Contextual Panels
import { TextPropertiesPanel } from "@/features/editor/components/TextPropertiesPanel";
import { ImagePropertiesPanel } from "@/features/editor/components/ImagePropertiesPanel";

// UI Components
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Separator } from "@/shared/components/ui/separator";
import { Save, ArrowLeft, Eye, Loader2 } from "lucide-react";

// Types
interface PhoiAssets {
  modelUrl: string;
  dielineUrl: string;
  materialName?: string;
}
import { Product } from "@/types/product";

// Utility
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

// Skeleton
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

  // ==================== STATE ====================
  const [baseProduct, setBaseProduct] = useState<Product | null>(null);
  const [phoiAssets, setPhoiAssets] = useState<PhoiAssets | null>(null);
  const [textureData, setTextureData] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [previewMode, setPreviewMode] = useState<"2d" | "3d">("3d");
  const [is3DMainLoaded, setIs3DMainLoaded] = useState(false);
  const [is2DReady, setIs2DReady] = useState(false);

  // ✅ TASK 4: State cho Contextual Panel
  const [selectedObject, setSelectedObject] = useState<any>(null);

  // ==================== ✅ TASK 4: LISTEN TO SELECTION EVENTS ====================
  useEffect(() => {
    const canvas = editorRef.current?.getCanvas();
    if (!canvas) return;

    const handleSelection = (e: any) => {
      const activeObject = canvas.getActiveObject();
      setSelectedObject(activeObject);
      console.log("🎯 [PrinterStudio] Selected:", activeObject?.type);
    };

    const handleClear = () => {
      setSelectedObject(null);
      console.log("🎯 [PrinterStudio] Selection cleared");
    };

    canvas.on("selection:created", handleSelection);
    canvas.on("selection:updated", handleSelection);
    canvas.on("selection:cleared", handleClear);

    return () => {
      canvas.off("selection:created", handleSelection);
      canvas.off("selection:updated", handleSelection);
      canvas.off("selection:cleared", handleClear);
    };
  }, [is2DReady]); // Chỉ chạy khi 2D đã ready

  // ==================== FETCH PRODUCT ====================
  useEffect(() => {
    let isCancelled = false;
    const controller = new AbortController();
    const fetchAssets = async () => {
      try {
        setIsLoading(true);
        let modelUrl: string | undefined;
        let dielineUrl: string | undefined;
        let materialName: string | undefined;
        let productName: string | undefined;
        let productData: Product | null = null;

        if (productId === "new") {
          const tempData = localStorage.getItem("tempProductAssets");
          console.log("🔍 [PrinterStudio] Nhận dữ liệu thô:", tempData);

          if (!tempData)
            throw new Error("Không tìm thấy dữ liệu phôi tạm thời");

          const parsed = JSON.parse(tempData);
          modelUrl = parsed.assets?.modelUrl;
          dielineUrl = parsed.assets?.surfaces?.[0]?.dielineSvgUrl;
          materialName = parsed.assets?.surfaces?.[0]?.materialName;
          productName = `Phôi ${parsed.category} (Tạm)`;

          console.log("✅ [PrinterStudio] Parsed:", {
            modelUrl,
            dielineUrl,
            materialName,
          });

          if (!modelUrl || !dielineUrl)
            throw new Error("Dữ liệu phôi tạm thời không đầy đủ");

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
          materialName = product?.assets?.surfaces?.[0]?.materialName;

          if (!product || !modelUrl || !dielineUrl)
            throw new Error("Phôi này thiếu file 3D hoặc file Dieline SVG");
        }

        setBaseProduct(productData);
        setPhoiAssets({ modelUrl, dielineUrl, materialName });

        console.log("🎯 [PrinterStudio] phoiAssets set:", {
          modelUrl,
          dielineUrl,
          materialName,
        });
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

  // ==================== HANDLERS ====================
  const handleCanvasUpdate = useCallback(
    (base64Image: string, jsonData: object) => {
      console.log(
        "🎨 [PrinterStudio] Canvas Updated! Texture size:",
        base64Image.length
      );
      setTextureData(base64Image);
    },
    []
  );

  const handleDielineLoaded = useCallback(() => {
    console.log("✅ [PrinterStudio] 2D Editor Loaded");
    setIs2DReady(true);
  }, []);

  const handleImageUpload = (file: File) => {
    toast.success(`Đã tải ảnh: ${file.name}`);
  };

  const createCanvasSnapshot = useCallback((): {
    json: string;
    previewBlob: Blob;
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
    return { json, previewBlob };
  }, []);

  // ==================== ✅ TASK 1: SAVE & EXIT (Không submit API) ====================
  const handleSaveAndExit = useCallback(() => {
    if (!editorRef.current) {
      toast.error("Lỗi: Trình chỉnh sửa chưa sẵn sàng");
      return;
    }
    const baseProductId = baseProduct?._id;
    if (!baseProductId) {
      toast.error("Lỗi: Không tìm thấy ID Phôi");
      return;
    }

    toast.info("Đang lưu thiết kế tạm thời...");
    const snapshot = createCanvasSnapshot();
    if (!snapshot) return;

    // Lưu vào sessionStorage
    const tempDesignData = {
      baseProductId,
      editorJson: snapshot.json,
      previewDataUrl: snapshot.previewBlob, // Lưu dạng blob URL
      timestamp: Date.now(),
    };

    // Convert blob to base64 để lưu vào storage
    const reader = new FileReader();
    reader.onloadend = () => {
      tempDesignData.previewDataUrl = reader.result as string;
      sessionStorage.setItem("tempDesignData", JSON.stringify(tempDesignData));

      toast.success("✅ Đã lưu thiết kế tạm thời!");
      console.log(
        "💾 [PrinterStudio] Saved to sessionStorage:",
        tempDesignData
      );

      // Điều hướng sang trang Publish
      navigate("/printer/publish-template");
    };
    reader.readAsDataURL(snapshot.previewBlob);
  }, [baseProduct, createCanvasSnapshot, navigate]);

  // ==================== ✅ TASK 4: CALLBACK CHO PROPERTIES PANEL ====================
  const handlePropertiesUpdate = useCallback(() => {
    // Trigger canvas re-render và texture update
    const canvas = editorRef.current?.getCanvas();
    if (canvas) {
      canvas.renderAll();
      // Có thể gọi generateTexture nếu cần
    }
  }, []);

  // ==================== TEXTURES ====================
  const texturesForViewer = useMemo(() => {
    if (!textureData) return {};

    console.log(
      "🎨 [PrinterStudio] Creating textures object with materialName:",
      phoiAssets?.materialName
    );

    const result: Record<string, string> = {};

    if (phoiAssets?.materialName) {
      result[phoiAssets.materialName] = textureData;
    }

    // Backup keys
    result["Dieline"] = textureData;
    result["Material_Lid"] = textureData;
    result["main_surface"] = textureData;
    result["DefaultMaterial"] = textureData;

    console.log("🎯 [PrinterStudio] Final textures keys:", Object.keys(result));
    return result;
  }, [textureData, phoiAssets]);

  // ==================== LOADING STATE ====================
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

  // ==================== RENDER ====================
  return (
    <div className="flex h-screen bg-gray-100">
      {/* LEFT: TOOLBAR */}
      <EditorToolbar editorRef={editorRef} onImageUpload={handleImageUpload} />

      {/* CENTER: EDITOR */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
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
              <h1 className="text-lg font-semibold">Studio - Thiết kế</h1>
              <p className="text-xs text-gray-500">Phôi: {baseProduct?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {productId === "new" ? "Chế độ tạo mới" : "Chế độ chỉnh sửa"}
            </Badge>
            {textureData && (
              <Badge variant="secondary" className="text-xs">
                🎨 Texture: {(textureData.length / 1024).toFixed(1)}KB
              </Badge>
            )}
            {/* ✅ TASK 1: Nút "Lưu & Tiếp tục" thay vì Submit */}
            <Button
              type="button"
              onClick={handleSaveAndExit}
              className="bg-orange-500 hover:bg-orange-600"
            >
              <Save size={18} className="mr-2" />
              Lưu & Tiếp tục
            </Button>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
          <div className="w-full h-full max-w-4xl max-h-[800px] relative">
            {/* 3D Viewer (Main) */}
            <div
              style={{
                display: previewMode === "3d" ? "block" : "none",
                width: "100%",
                height: "100%",
              }}
            >
              <ProductViewer3D
                modelUrl={phoiAssets.modelUrl}
                textures={texturesForViewer}
                onModelLoaded={() => {
                  if (!is3DMainLoaded) {
                    console.log("✅ [PrinterStudio] 3D Main Loaded");
                    setIs3DMainLoaded(true);
                  }
                }}
              />
            </div>

            {/* 2D Editor (Main) */}
            {is3DMainLoaded && (
              <div
                style={{
                  display: previewMode === "2d" ? "block" : "none",
                  width: "600px",
                  height: "600px",
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

            {/* Skeleton */}
            {previewMode === "2d" && !is3DMainLoaded && (
              <CanvasWaitingSkeleton />
            )}
          </div>
        </div>

        {/* Bottom Bar - Toggle 2D/3D */}
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

      {/* ✅ TASK 4: RIGHT SIDEBAR - CONTEXTUAL PROPERTIES PANEL */}
      <div className="w-96 bg-white border-l">
        <ScrollArea className="h-full">
          <div className="p-6 space-y-6">
            {/* ✅ TASK 4: CONDITIONAL RENDERING */}
            {selectedObject && selectedObject.type === "i-text" && (
              <TextPropertiesPanel
                selectedObject={selectedObject}
                onUpdate={handlePropertiesUpdate}
              />
            )}

            {selectedObject && selectedObject.type === "image" && (
              <ImagePropertiesPanel
                selectedObject={selectedObject}
                onUpdate={handlePropertiesUpdate}
              />
            )}

            {/* Product Info - Luôn hiển thị */}
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
                  {phoiAssets.materialName && (
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

            {/* 3D Preview Card (Sidebar) - Luôn hiển thị */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">
                  Xem trước 3D (Real-time)
                </CardTitle>
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
                      textures={texturesForViewer}
                    />
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
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
                  <li>• Nhấn "Lưu & Tiếp tục" để đến bước đăng bán</li>
                </ul>
              </CardContent>
            </Card>

            {/* Warning */}
            {productId === "new" && (
              <Card className="bg-yellow-50 border-yellow-200">
                <CardContent className="pt-6">
                  <h4 className="font-medium text-sm mb-2 text-yellow-900">
                    ⚠️ Lưu ý
                  </h4>
                  <p className="text-xs text-yellow-700">
                    Bạn đang tạo mẫu từ phôi tạm. Mẫu này sẽ được liên kết tự
                    động sau khi phôi được tạo.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
