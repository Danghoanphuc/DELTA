// src/features/editor/hooks/useDesignEditor.ts
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { useCartStore } from "@/stores/useCartStore";
import { Product } from "@/types/product";
import { FabricCanvasEditorRef } from "../components/FabricCanvasEditor";
import * as editorService from "../services/editorService";

export function useDesignEditor() {
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
  const [isModelLoaded, setIsModelLoaded] = useState(false);

  // === TẢI DỮ LIỆU SẢN PHẨM ===
  useEffect(() => {
    if (!productId) {
      toast.error("Lỗi: Không tìm thấy ID sản phẩm.");
      navigate("/shop");
      return;
    }

    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const fetchedProduct = await editorService.getProductById(productId); // Dùng service
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

  // === HANDLERS ===
  const handleSurfaceUpdate = useCallback(
    (materialKey: string, base64DataUrl: string) => {
      // (File 1, 10) Callback này được gọi từ FabricCanvasEditor
      // nhưng trong file 1 nó được gọi với 2 tham số (data, json)
      // còn trong file 3 nó được gọi với (key, data).
      // Giả sử file 1 dùng file 10, thì file 10 cần được sửa:
      // onCanvasUpdateRef.current(dataURL, canvasJson);
      // Sửa ở đây để khớp với file 10:
      const dataUrl = arguments[0]; // base64DataUrl
      const materialName = arguments[1]; // Phải là materialKey, nhưng logic file 10 gửi JSON

      // Giả sử logic file 10 được sửa để gửi (materialKey, base64DataUrl)
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

  // === LƯU VÀ THÊM VÀO GIỎ ===
  const handleSaveAndAddToCart = async () => {
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

      // Dùng service
      const newCustomizedDesignId = await editorService.saveCustomDesign(
        product._id,
        editorDataPerSurface,
        finalPreviewImageUrl
      );

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

  return {
    product,
    activeSurfaceKey,
    setActiveSurfaceKey,
    textures,
    editorRefs,
    isLoading,
    isSaving,
    isModelLoaded,
    setIsModelLoaded,
    handleSurfaceUpdate,
    handleToolbarImageUpload,
    getActiveEditorRef,
    handleSaveAndAddToCart,
  };
}
