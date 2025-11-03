// editor/hooks/useDesignEditor.ts
// ✅ ĐÃ SỬA LỖI: Thêm updateLayers() vào các handlers

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom"; // ✅ Thêm
import { toast } from "sonner"; // ✅ Thêm
import { useCartStore } from "@/stores/useCartStore"; // ✅ Thêm
import { Product } from "@/types/product"; // ✅ Thêm
import * as editorService from "../services/editorService"; // ✅ Thêm
import { EditorCanvasRef } from "../components/EditorCanvas"; // ✅ Thêm
import * as fabric from "fabric";
import { type FabricObject } from "fabric";

// ... (Helper ensureObjectId giữ nguyên) ...
const ensureObjectId = (obj: FabricObject) => {
  if (!(obj as any).id) {
    (obj as any).id =
      fabric.util.getRandomInt(1000, 9999).toString() + Date.now();
  }
};

export function useDesignEditor() {
  // ... (State giữ nguyên) ...
  const navigate = useNavigate();
  const { addToCart } = useCartStore();
  const [searchParams] = useSearchParams();
  const productId = searchParams.get("productId");
  const [product, setProduct] = useState<Product | null>(null);
  const [activeSurfaceKey, setActiveSurfaceKey] = useState<string | null>(null);
  const [textures, setTextures] = useState<Record<string, string | null>>({});
  const editorRefs = useRef<Record<string, EditorCanvasRef | null>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [layers, setLayers] = useState<any[]>([]);
  const [activeObjectId, setActiveObjectId] = useState<string | null>(null);
  const [selectedObject, setSelectedObject] = useState<FabricObject | null>(
    null
  );
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);

  // === TẢI SẢN PHẨM === (Giữ nguyên)
  useEffect(() => {
    if (!productId) {
      toast.error("Lỗi: Không tìm thấy ID sản phẩm.");
      navigate("/shop");
      return;
    }
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const fetchedProduct = await editorService.getProductById(productId);
        setProduct(fetchedProduct);
        const initialTextures: Record<string, string | null> = {};
        for (const surface of fetchedProduct.assets.surfaces) {
          initialTextures[surface.materialName] = null;
        }
        setTextures(initialTextures);
        const firstSurface = fetchedProduct.assets.surfaces[0];
        setActiveSurfaceKey(firstSurface.key);
      } catch (err: any) {
        toast.error(err.message || "Không thể tải dữ liệu sản phẩm.");
        navigate("/shop");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [productId, navigate]);

  // === HANDLERS === (Giữ nguyên handleSurfaceUpdate, handleToolbarImageUpload, getActiveEditorRef)
  const handleSurfaceUpdate = useCallback(
    (materialKey: string, base64DataUrl: string) => {
      setTextures((prevTextures) => ({
        ...prevTextures,
        [materialKey]: base64DataUrl,
      }));
    },
    []
  );
  const handleToolbarImageUpload = useCallback((file: File) => {
    toast.success(`Đã thêm ảnh: ${file.name}`);
  }, []);
  const getActiveEditorRef = useCallback(() => {
    if (!activeSurfaceKey) return null;
    return editorRefs.current[activeSurfaceKey];
  }, [activeSurfaceKey]);

  // === Handlers cho LayersPanel (CẬP NHẬT) ===
  const updateLayers = useCallback(() => {
    // ... (logic updateLayers giữ nguyên) ...
    const editor = getActiveEditorRef();
    if (editor) {
      const canvas = editor.getCanvas();
      if (canvas) {
        const objects = canvas.getObjects();
        objects.forEach(ensureObjectId);
        setLayers([...objects]);
        const activeObj = canvas.getActiveObject();
        if (activeObj) {
          ensureObjectId(activeObj);
          setActiveObjectId((activeObj as any).id || null);
          setSelectedObject(activeObj);
        } else {
          setActiveObjectId(null);
          setSelectedObject(null);
        }
      }
    }
  }, [getActiveEditorRef]);

  const handleSelectLayer = useCallback(
    (obj: any) => {
      // ... (logic giữ nguyên) ...
      const editor = getActiveEditorRef();
      if (editor) {
        const canvas = editor.getCanvas();
        if (canvas) {
          canvas.setActiveObject(obj);
          canvas.renderAll();
          updateLayers();
        }
      }
    },
    [getActiveEditorRef, updateLayers]
  );

  const handleMoveLayer = useCallback(
    (obj: any, direction: "up" | "down" | "top" | "bottom") => {
      const editor = getActiveEditorRef();
      if (editor) {
        const canvas = editor.getCanvas();
        if (canvas) {
          switch (direction) {
            case "up":
              (canvas as any).bringForward(obj);
              break;
            case "down":
              (canvas as any).sendBackwards(obj);
              break;
            case "top":
              (canvas as any).bringToFront(obj);
              break;
            case "bottom":
              (canvas as any).sendToBack(obj);
              break;
          }
          canvas.renderAll();
          updateLayers(); // ✅ SỬA LỖI: Thêm updateLayers()
        }
      }
    },
    [getActiveEditorRef, updateLayers] // ✅ Thêm updateLayers vào dependency
  );

  const handleToggleVisibility = useCallback(
    (obj: any) => {
      // ... (logic giữ nguyên) ...
      obj.set("visible", !obj.visible);
      const editor = getActiveEditorRef();
      if (editor) {
        const canvas = editor.getCanvas();
        if (canvas) {
          canvas.renderAll();
          updateLayers();
        }
      }
    },
    [getActiveEditorRef, updateLayers]
  );

  const handleDeleteLayer = useCallback(
    (obj: any) => {
      const editor = getActiveEditorRef();
      if (editor) {
        const canvas = editor.getCanvas();
        if (canvas) {
          canvas.remove(obj);
          updateLayers(); // ✅ SỬA LỖI: Thêm updateLayers()
        }
      }
    },
    [getActiveEditorRef, updateLayers] // ✅ Thêm updateLayers vào dependency
  );

  // === LƯU VÀ THÊM VÀO GIỎ === (Giữ nguyên)
  const handleSaveAndAddToCart = async () => {
    // ... (logic giữ nguyên) ...
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

  // === RETURN === (Giữ nguyên)
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
    layers,
    activeObjectId,
    updateLayers,
    handleSelectLayer,
    handleMoveLayer,
    handleToggleVisibility,
    handleDeleteLayer,
    selectedObject,
    isExportDialogOpen,
    setIsExportDialogOpen,
  };
}
