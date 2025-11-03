// frontend/src/features/editor/hooks/useDesignEditor.ts
// ✅ PHIÊN BẢN CẢI TIẾN - Áp dụng chuẩn 2D-3D từ PrinterStudio

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { useCartStore } from "@/stores/useCartStore";
import { Product } from "@/types/product";
import * as editorService from "../services/editorService";

// ✅ THÊM: Import ref type cho DesignSurfaceEditor
export interface DesignSurfaceEditorRef {
  addText: (text: string) => void;
  addImage: (imageUrl: string) => void;
  addShape: (shape: "rect" | "circle" | "triangle" | "line") => void;
  getJSON: () => string;
  getCanvas: () => any;
  undo: () => void;
  redo: () => void;
  deleteSelected: () => void;
  duplicateSelected: () => void;
  setZoom: (zoom: number) => void;
}

export function useDesignEditor() {
  const navigate = useNavigate();
  const { addToCart } = useCartStore();
  const [searchParams] = useSearchParams();
  const productId = searchParams.get("productId");

  // === STATE ===
  const [product, setProduct] = useState<Product | null>(null);
  const [activeSurfaceKey, setActiveSurfaceKey] = useState<string | null>(null);

  // ✅ QUAN TRỌNG: textures object với key là materialName
  const [textures, setTextures] = useState<Record<string, string | null>>({});

  // ✅ THÊM: Refs cho từng surface editor
  const editorRefs = useRef<Record<string, DesignSurfaceEditorRef | null>>({});

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // ✅ THÊM: Trạng thái tải 3D model
  const [isModelLoaded, setIsModelLoaded] = useState(false);

  // ✅ THÊM: State cho LayersPanel
  const [layers, setLayers] = useState<any[]>([]);
  const [activeObjectId, setActiveObjectId] = useState<string | null>(null);

  // === TẢI SẢN PHẨM ===
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

        // Khởi tạo texture cho từng surface
        const initialTextures: Record<string, string | null> = {};
        for (const surface of fetchedProduct.assets.surfaces) {
          initialTextures[surface.materialName] = null;
        }
        setTextures(initialTextures);

        // Set surface đầu tiên là active
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

  // === HANDLERS ===

  // ✅ QUAN TRỌNG: Callback từ DesignSurfaceEditor
  // Signature: (materialKey: string, base64DataUrl: string) => void
  const handleSurfaceUpdate = useCallback(
    (materialKey: string, base64DataUrl: string) => {
      console.log(
        `[useDesignEditor] Surface Update: ${materialKey}, size: ${base64DataUrl.length}`
      );
      setTextures((prevTextures) => ({
        ...prevTextures,
        [materialKey]: base64DataUrl,
      }));
    },
    []
  );

  const handleToolbarImageUpload = useCallback((file: File) => {
    console.log("Image added via toolbar:", file.name);
    toast.success(`Đã thêm ảnh: ${file.name}`);
  }, []);

  const getActiveEditorRef = useCallback(() => {
    if (!activeSurfaceKey) return null;
    return editorRefs.current[activeSurfaceKey];
  }, [activeSurfaceKey]);

  // ✅ THÊM: Handlers cho LayersPanel
  const updateLayers = useCallback(() => {
    const editor = getActiveEditorRef();
    if (editor) {
      const canvas = editor.getCanvas();
      if (canvas) {
        const objects = canvas.getObjects();
        setLayers([...objects]);

        const activeObj = canvas.getActiveObject();
        if (activeObj) {
          setActiveObjectId((activeObj as any).id || null);
        } else {
          setActiveObjectId(null);
        }
      }
    }
  }, [getActiveEditorRef]);

  const handleSelectLayer = useCallback(
    (obj: any) => {
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
              canvas.bringForward(obj);
              break;
            case "down":
              canvas.sendBackwards(obj);
              break;
            case "top":
              canvas.bringToFront(obj);
              break;
            case "bottom":
              canvas.sendToBack(obj);
              break;
          }
          canvas.renderAll();
        }
      }
    },
    [getActiveEditorRef]
  );

  const handleToggleVisibility = useCallback(
    (obj: any) => {
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
        }
      }
    },
    [getActiveEditorRef]
  );

  // === LƯU VÀ THÊM VÀO GIỎ ===
  const handleSaveAndAddToCart = async () => {
    if (!product || !product.assets?.surfaces) return;

    setIsSaving(true);
    try {
      // Thu thập editorData từ tất cả surfaces
      const editorDataPerSurface: Record<string, any> = {};
      for (const surface of product.assets.surfaces) {
        const editor = editorRefs.current[surface.key];
        if (editor) {
          editorDataPerSurface[surface.key] = JSON.parse(editor.getJSON());
        }
      }

      // Dùng texture của surface đầu tiên làm preview
      const finalPreviewImageUrl =
        textures[product.assets.surfaces[0].materialName] ||
        product.images?.[0]?.url;

      // Lưu thiết kế
      const newCustomizedDesignId = await editorService.saveCustomDesign(
        product._id,
        editorDataPerSurface,
        finalPreviewImageUrl
      );

      // Thêm vào giỏ
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
    // ✅ THÊM: Layers handlers
    layers,
    activeObjectId,
    updateLayers,
    handleSelectLayer,
    handleMoveLayer,
    handleToggleVisibility,
    handleDeleteLayer,
  };
}
