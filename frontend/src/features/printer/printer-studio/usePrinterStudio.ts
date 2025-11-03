// frontend/src/features/printer/pages/usePrinterStudio.ts
// ✅ ĐÃ SỬA LỖI DEADLOCK
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "@/shared/lib/axios";
import { Product } from "@/types/product";
import { DesignSurfaceEditorRef } from "@/features/editor/hooks/useDesignEditor";

// === TYPES ===
interface PhoiAssets {
  modelUrl: string;
  dielineUrl: string;
  materialName: string;
}

// === HELPERS === (Giữ nguyên)
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

const ensureObjectId = (obj: any) => {
  if (!obj.id) {
    obj.id = `obj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
};
// ====================
// === MAIN HOOK ===
// ====================
export function usePrinterStudio() {
  const navigate = useNavigate();
  const { productId } = useParams();
  const editorRef = useRef<DesignSurfaceEditorRef>(null);

  // === STATE ===
  const [baseProduct, setBaseProduct] = useState<Product | null>(null);
  const [phoiAssets, setPhoiAssets] = useState<PhoiAssets | null>(null);
  const [textureData, setTextureData] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [is3DMainLoaded, setIs3DMainLoaded] = useState(false); // <-- Giữ lại
  // const [is2DReady, setIs2DReady] = useState(false); // ❌ XÓA BỎ STATE NÀY
  const [selectedObject, setSelectedObject] = useState<any>(null);
  const [layers, setLayers] = useState<any[]>([]);
  const [activeObjectId, setActiveObjectId] = useState<string | null>(null);

  // === DATA FETCHING ===
  useEffect(() => {
    // ... (Toàn bộ logic fetch giữ nguyên) ...
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
          if (!tempData)
            throw new Error("Không tìm thấy dữ liệu phôi tạm thời");

          const parsed = JSON.parse(tempData);
          modelUrl = parsed.assets?.modelUrl;
          dielineUrl = parsed.assets?.surfaces?.[0]?.dielineSvgUrl;
          materialName =
            parsed.assets?.surfaces?.[0]?.materialName || "DefaultMaterial";
          productName = `Phôi ${parsed.category} (Tạm)`;

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
          materialName =
            product?.assets?.surfaces?.[0]?.materialName || "DefaultMaterial";

          if (!product || !modelUrl || !dielineUrl)
            throw new Error("Phôi này thiếu file 3D hoặc file Dieline SVG");
        }

        setBaseProduct(productData);
        setPhoiAssets({ modelUrl, dielineUrl, materialName });
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

  // === HANDLERS ===

  // (Layers)
  const updateLayers = useCallback(() => {
    // ... (Logic giữ nguyên) ...
    const canvas = editorRef.current?.getCanvas();
    if (!canvas) return;
    const objects = canvas.getObjects();
    objects.forEach(ensureObjectId);
    setLayers([...objects]);
    const activeObj = canvas.getActiveObject();
    if (activeObj) {
      ensureObjectId(activeObj);
      setActiveObjectId(activeObj.id);
      setSelectedObject(activeObj);
    } else {
      setActiveObjectId(null);
      setSelectedObject(null);
    }
  }, []);

  const handleSelectLayer = useCallback(
    (obj: any) => {
      // ... (Logic giữ nguyên) ...
      const canvas = editorRef.current?.getCanvas();
      if (canvas) {
        canvas.setActiveObject(obj);
        canvas.renderAll();
        updateLayers();
      }
    },
    [updateLayers]
  );

  const handleMoveLayer = useCallback(
    (obj: any, direction: "up" | "down" | "top" | "bottom") => {
      // ... (Logic giữ nguyên) ...
      const canvas = editorRef.current?.getCanvas();
      if (!canvas) return;
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
      updateLayers();
    },
    [updateLayers]
  );

  const handleToggleVisibility = useCallback(
    (obj: any) => {
      // ... (Logic giữ nguyên) ...
      obj.set("visible", !obj.visible);
      editorRef.current?.getCanvas()?.renderAll();
      updateLayers();
    },
    [updateLayers]
  );

  const handleDeleteLayer = useCallback(
    (obj: any) => {
      // ... (Logic giữ nguyên) ...
      editorRef.current?.getCanvas()?.remove(obj);
      updateLayers();
    },
    [updateLayers]
  );

  // (Canvas)
  const handleCanvasUpdate = useCallback(
    (materialKey: string, base64Image: string) => {
      setTextureData(base64Image);
    },
    []
  );

  // ❌ XÓA BỎ HANDLER NÀY
  // const handleDielineLoaded = useCallback(() => {
  //   setIs2DReady(true);
  // }, []);

  const handleImageUpload = (file: File) => {
    toast.success(`Đã tải ảnh: ${file.name}`);
  };

  const handlePropertiesUpdate = useCallback(() => {
    editorRef.current?.getCanvas()?.renderAll();
  }, []);

  // (Saving)
  const createCanvasSnapshot = useCallback((): {
    json: string;
    previewBlob: Blob;
  } | null => {
    // ... (Logic giữ nguyên) ...
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

  const handleSaveAndExit = useCallback(() => {
    // ... (Logic giữ nguyên) ...
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

    const tempDesignData = {
      baseProductId,
      editorJson: snapshot.json,
      previewDataUrl: snapshot.previewBlob,
      timestamp: Date.now(),
    };

    const reader = new FileReader();
    reader.onloadend = () => {
      (tempDesignData as any).previewDataUrl = reader.result as string;
      sessionStorage.setItem("tempDesignData", JSON.stringify(tempDesignData));
      toast.success("✅ Đã lưu thiết kế tạm thời!");
      navigate("/printer/publish-template");
    };
    reader.readAsDataURL(snapshot.previewBlob);
  }, [baseProduct, createCanvasSnapshot, navigate]);

  // === MEMOS ===
  const texturesForViewer = useMemo(() => {
    // ... (Logic giữ nguyên) ...
    if (!textureData) return {};
    const result: Record<string, string> = {};
    const materialKey = phoiAssets?.materialName || "DefaultMaterial";
    result[materialKey] = textureData;
    // Backup keys
    result["Dieline"] = textureData;
    result["Material_Lid"] = textureData;
    result["main_surface"] = textureData;
    result["DefaultMaterial"] = textureData;
    return result;
  }, [textureData, phoiAssets]);

  // === RETURN ===
  return {
    // Refs
    editorRef,
    // State
    baseProduct,
    phoiAssets,
    textureData,
    isLoading,
    is3DMainLoaded,
    // is2DReady, // ❌ XÓA BỎ
    selectedObject,
    layers,
    activeObjectId,
    productId,
    // Handlers
    handleImageUpload,
    handleSelectLayer,
    handleMoveLayer,
    handleToggleVisibility,
    handleDeleteLayer,
    handleCanvasUpdate,
    // handleDielineLoaded, // ❌ XÓA BỎ
    handlePropertiesUpdate,
    handleSaveAndExit,
    setIs3DMainLoaded, // <-- Giữ lại
    navigate,
    // Memos
    texturesForViewer,
    updateLayers,
  };
}
