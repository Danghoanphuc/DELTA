// src/features/editor/DesignEditorPage.tsx
// ✅ BẢN SỬA LỖI CUỐI CÙNG: TRÌ HOÃN RENDER TOÀN BỘ EDITOR 2D

import React, { useRef, useState, useCallback, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { Save, ArrowLeft, Loader2 } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
import {
  FabricCanvasEditor,
  FabricCanvasEditorRef,
} from "./components/FabricCanvasEditor";
import ProductViewer3D from "./components/ProductViewer3D";
import { EditorToolbar } from "./components/EditorToolbar";
import api from "@/shared/lib/axios";
import { useCartStore } from "@/stores/useCartStore";
import { Product } from "@/types/product";

// Skeleton (Loading)
const EditorLoadingSkeleton = () => (
  <div className="flex h-screen w-full items-center justify-center bg-gray-100">
    <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
    <p className="ml-4 text-gray-600">Đang tải dữ liệu sản phẩm...</p>
  </div>
);

// ✅ THÊM SKELETON CHO CANVAS
const CanvasWaitingSkeleton = () => (
  <div className="w-full h-full min-h-[600px] flex items-center justify-center bg-gray-50 shadow-inner rounded-lg">
    <div className="text-center space-y-3">
      <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto" />
      <p className="text-sm text-gray-600">Đang chờ phôi 3D tải xong...</p>
    </div>
  </div>
);

export function DesignEditorPage() {
  const navigate = useNavigate();
  const { addToCart } = useCartStore();

  const [searchParams] = useSearchParams();
  const productId = searchParams.get("productId");

  const [product, setProduct] = useState<Product | null>(null);
  const [activeSurfaceKey, setActiveSurfaceKey] = useState<string | null>(null);
  const [textures, setTextures] = useState<Record<string, string | null>>({});
  const editorRefs = useRef<Record<string, FabricCanvasEditorRef | null>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // State chìa khóa
  const [isModelLoaded, setIsModelLoaded] = useState(false);

  // === TẢI DỮ LIỆU SẢN PHẨM (Giữ nguyên) ===
  useEffect(() => {
    if (!productId) {
      toast.error("Lỗi: Không tìm thấy ID sản phẩm.");
      navigate("/shop");
      return;
    }
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const res = await api.get(`/products/${productId}`);
        const fetchedProduct: Product = res.data?.data?.product;
        if (!fetchedProduct || !fetchedProduct.assets?.surfaces?.length) {
          throw new Error(
            "Sản phẩm này không hỗ trợ chỉnh sửa (thiếu 'surfaces')."
          );
        }
        setProduct(fetchedProduct);
        const firstSurface = fetchedProduct.assets.surfaces[0];
        setActiveSurfaceKey(firstSurface.key);
        const initialTextures: Record<string, string | null> = {};
        for (const surface of fetchedProduct.assets.surfaces) {
          initialTextures[surface.materialName] = null;
        }
        setTextures(initialTextures);
      } catch (err: any) {
        toast.error(err.message || "Không thể tải dữ liệu sản phẩm.");
        navigate("/shop");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [productId, navigate]);

  // === HANDLERS (Giữ nguyên) ===
  const handleSurfaceUpdate = useCallback(
    (materialKey: string, base64DataUrl: string) => {
      setTextures((prevTextures) => ({
        ...prevTextures,
        [materialKey]: base64DataUrl,
      }));
    },
    []
  );
  const handleToolbarImageUpload = (file: File) => {
    console.log("Image added via toolbar:", file.name);
  };
  const getActiveEditorRef = () => {
    if (!activeSurfaceKey) return null;
    return editorRefs.current[activeSurfaceKey];
  };

  // === LƯU VÀ THÊM VÀO GIỎ (Giữ nguyên) ===
  const handleSaveAndAddToCart = async () => {
    // ... (Toàn bộ logic lưu giữ nguyên)
    if (!product || !product.assets?.surfaces) return;
    setIsSaving(true);
    try {
      const editorDataPerSurface: Record<string, any> = {};
      for (const surface of product.assets.surfaces) {
        const editor = editorRefs.current[surface.key];
        if (editor) {
          editorDataPerSurface[surface.key] = JSON.parse(editor.getJSON());
        }
      }
      const finalPreviewImageUrl =
        textures[product.assets.surfaces[0].materialName] ||
        product.images?.[0]?.url;
      const res = await api.post("/designs/customized", {
        baseProductId: product._id,
        editorData: editorDataPerSurface,
        finalPreviewImageUrl: finalPreviewImageUrl,
      });
      const newCustomizedDesignId = res.data?.data?.design?._id;
      if (!newCustomizedDesignId) {
        throw new Error("Không nhận được ID thiết kế đã lưu");
      }
      await addToCart({
        productId: product._id,
        quantity: product.pricing[0]?.minQuantity || 1,
        selectedPriceIndex: 0,
        customization: {
          notes: `Thiết kế tùy chỉnh ${product.name}`,
          customizedDesignId: newCustomizedDesignId,
        },
      });
      toast.success("Đã lưu thiết kế và thêm vào giỏ hàng!");
      navigate("/checkout");
    } catch (err) {
      console.error("Lỗi khi lưu thiết kế:", err);
      toast.error("Không thể lưu thiết kế của bạn.");
    } finally {
      setIsSaving(false);
    }
  };

  // ==================== RENDER (ĐÃ THAY ĐỔI) ====================
  if (isLoading || !product) {
    return <EditorLoadingSkeleton />;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <EditorToolbar
        editorRef={{ current: getActiveEditorRef() }}
        onImageUpload={handleToolbarImageUpload}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar (Giữ nguyên) */}
        <div className="h-16 bg-white border-b flex items-center justify-between px-6 flex-shrink-0">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft />
          </Button>
          <h1 className="text-lg font-semibold">{product.name}</h1>
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={handleSaveAndAddToCart}
            disabled={isSaving}
          >
            {isSaving ? <Loader2 className="animate-spin" /> : <Save />}
            Lưu & Thêm vào giỏ
          </Button>
        </div>

        {/* Main Content (Giữ nguyên) */}
        <div className="flex-1 flex overflow-hidden">
          {/* 2D Editor (ĐÃ SỬA) */}
          <div className="flex-1 flex flex-col items-center justify-center p-4 overflow-auto bg-gray-200">
            <Tabs
              value={activeSurfaceKey || ""}
              onValueChange={setActiveSurfaceKey}
              className="w-full max-w-[600px] flex flex-col"
            >
              <TabsList className="mb-2">
                {product.assets.surfaces.map((surface) => (
                  <TabsTrigger key={surface.key} value={surface.key}>
                    {surface.name}
                  </TabsTrigger>
                ))}
              </TabsList>

              {product.assets.surfaces.map((surface) => (
                <TabsContent
                  key={surface.key}
                  value={surface.key}
                  className="m-0"
                  style={{ width: 600, height: 600 }} // Đảm bảo kích thước
                >
                  {/* ✅ SỬA LỖI: CHỈ RENDER EDITOR 2D KHI 3D ĐÃ SẴN SÀNG */}
                  {!isModelLoaded ? (
                    <>
                      {/* Thêm log này để kiểm tra */}
                      {console.log(
                        `--- [2D] ĐANG CHỜ 3D (Surface: ${surface.key}) ---`
                      )}
                      <CanvasWaitingSkeleton />
                    </>
                  ) : (
                    <>
                      {/* Thêm log này để kiểm tra */}
                      {console.log(
                        `--- [2D] 3D ĐÃ XONG, ĐANG RENDER 2D EDITOR (Surface: ${surface.key}) ---`
                      )}
                      <FabricCanvasEditor
                        ref={(el) => (editorRefs.current[surface.key] = el)}
                        materialKey={surface.materialName}
                        dielineSvgUrl={surface.dielineSvgUrl}
                        onCanvasUpdate={handleSurfaceUpdate}
                        onObjectChange={() => {
                          // Callback
                        }}
                        width={600}
                        height={600}
                        isReadyToLoad={isModelLoaded}
                      />
                    </>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </div>

          {/* 3D Viewer (Giữ nguyên) */}
          <div className="w-full h-full bg-gray-100">
            <ProductViewer3D
              modelUrl={product.assets.modelUrl!}
              textures={textures}
              // ✅ THÊM LOG VÀO ĐÂY
              onModelLoaded={() => {
                console.log("✅✅✅ 3D ĐÃ TẢI XONG (onModelLoaded fired)!");
                setIsModelLoaded(true);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
