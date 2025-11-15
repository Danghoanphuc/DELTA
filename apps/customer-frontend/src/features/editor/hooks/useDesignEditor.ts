// features/editor/hooks/useDesignEditor.ts
// Hook quản lý toàn bộ state và logic nghiệp vụ của 3D Editor

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import * as THREE from "three";
import { useCartStore } from "@/stores/useCartStore";
import { Product } from "@/types/product";
import * as editorService from "../services/editorService";
import {
  saveDraftDesign,
  getDraftDesign,
  getCustomizedDesignById,
} from "../services/editorService";
import { EditorItem, DecalItem, GroupItem } from "../types/decal.types";
import { InteractionResult } from "./use3DInteraction";
import {
  getMyMediaAssets,
  createMediaAsset,
  UploadedImageVM,
} from "@/services/mediaAssetService";
import { arrayMove } from "@dnd-kit/sortable";

const createId = (prefix: "decal" | "group") =>
  `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

export type GizmoMode = "translate" | "scale" | "rotate";

export function useDesignEditor() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addToCart } = useCartStore();

  // === STATE ===
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  // ✅ THÊM: State cho draft
  const [draftId, setDraftId] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  const [items, setItems] = useState<EditorItem[]>([]);
  const [activeToolbarTab, setActiveToolbarTab] = useState<string>("templates");
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [uploadedImages, setUploadedImages] = useState<UploadedImageVM[]>([]);
  const [gizmoMode, setGizmoMode] = useState<GizmoMode>("translate");
  const [isSnapping, setIsSnapping] = useState(false);
  const [toolMode, setToolMode] = useState<"select" | "pan">("select");
  
  // ✅ THÊM: History stack cho Undo/Redo (max 50 actions)
  const [history, setHistory] = useState<EditorItem[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const MAX_HISTORY = 50;

  // (State về giá)
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [selectedPriceIndex, setSelectedPriceIndex] = useState(0);

  // === MEMOS (Tính toán dẫn xuất) ===

  const flatDecalItems = useMemo((): DecalItem[] => {
    return items.filter((item) => item.type === "decal") as DecalItem[];
  }, [items]);

  const firstSelectedItem = useMemo((): EditorItem | null => {
    if (selectedItemIds.length !== 1) return null;
    return items.find((item) => item.id === selectedItemIds[0]) || null;
  }, [items, selectedItemIds]);

  // (useEffect tải dữ liệu)
  // ✅ SỬA: Lấy productId và customizedDesignId ra ngoài
  const productId = useMemo(() => searchParams.get("productId"), [searchParams]);
  const customizedDesignId = useMemo(
    () => searchParams.get("customizedDesignId"),
    [searchParams]
  );
  
  // ✅ THÊM: Ref để tránh gọi API nhiều lần khi component re-render
  const isFetchingRef = React.useRef(false);
  
  useEffect(() => {
    // ✅ Guard: Tránh gọi API nếu đang fetch
    if (isFetchingRef.current) return;

    // ✅ Nếu có customizedDesignId, load design trước
    if (customizedDesignId && !productId) {
      const loadDesign = async () => {
        isFetchingRef.current = true;
        setIsLoading(true);
        try {
          const design = await getCustomizedDesignById(customizedDesignId);
          if (design.baseProductId) {
            // Load product từ baseProductId
            const fetchedProduct = await editorService.getProductById(
              design.baseProductId
            );
            setProduct(fetchedProduct);
            // Load editorData
            if (design.editorData?.items) {
              setItems(design.editorData.items);
            }
          } else {
            toast.error("Thiết kế này không có sản phẩm gốc");
            navigate("/designs");
          }
        } catch (err: any) {
          console.error("Lỗi load design:", err);
          toast.error("Không thể tải thiết kế");
          navigate("/designs");
        } finally {
          setIsLoading(false);
          isFetchingRef.current = false;
        }
      };
      loadDesign();
      return;
    }

    // ✅ Guard: Tránh gọi API nếu không có productId
    if (!productId) {
      if (!customizedDesignId) {
        toast.error("Không tìm thấy ID sản phẩm trong URL.");
        navigate("/shop");
      }
      return;
    }
    
    const fetchStudioData = async () => {
      isFetchingRef.current = true;
      setIsLoading(true);

      if (!productId) {
        toast.error("Không tìm thấy ID sản phẩm trong URL.");
        navigate("/shop");
        isFetchingRef.current = false;
        return;
      }

      const fetchProduct = async () => {
        try {
          const fetchedProduct = await editorService.getProductById(productId);
          
          // ✅ VALIDATION: Kiểm tra product có đủ điều kiện để edit
          if (!fetchedProduct) {
            toast.error("Không tìm thấy sản phẩm");
            navigate("/shop");
            throw new Error("Product not found");
          }

          // 1. Kiểm tra có hỗ trợ design service
          if (!fetchedProduct.customization?.hasDesignService) {
            toast.error(
              "Sản phẩm này không hỗ trợ chỉnh sửa 3D. Đang chuyển về trang sản phẩm..."
            );
            navigate(`/products/${productId}`);
            throw new Error("Product does not support design service");
          }

          // 2. Kiểm tra có 3D model URL
          if (!fetchedProduct.assets?.modelUrl) {
            toast.error(
              "Sản phẩm này chưa có mô hình 3D. Đang chuyển về trang sản phẩm..."
            );
            navigate(`/products/${productId}`);
            throw new Error("Product missing 3D model");
          }

          // 3. Kiểm tra có surfaces để thiết kế
          if (!fetchedProduct.assets?.surfaces || fetchedProduct.assets.surfaces.length === 0) {
            toast.error(
              "Sản phẩm này chưa có bề mặt có thể thiết kế. Đang chuyển về trang sản phẩm..."
            );
            navigate(`/products/${productId}`);
            throw new Error("Product missing design surfaces");
          }

          // Tất cả validation đều OK → Set product
          setProduct(fetchedProduct);
          if (fetchedProduct.pricing && fetchedProduct.pricing.length > 0) {
            // Cập nhật state ở đây
            setSelectedQuantity(fetchedProduct.pricing[0].minQuantity || 1);
          }

          // ✅ THÊM: Load customized design hoặc draft design
          if (customizedDesignId) {
            // Load từ customizedDesignId (ưu tiên)
            try {
              const design = await getCustomizedDesignById(customizedDesignId);
              if (design.editorData?.items) {
                setItems(design.editorData.items);
                toast.success("Đã tải thiết kế đã lưu");
              }
            } catch (err) {
              console.error("Lỗi load customized design:", err);
              toast.error("Không thể tải thiết kế đã lưu");
            }
          } else {
            // Load draft design nếu không có customizedDesignId
            try {
              const draft = await getDraftDesign(productId);
              if (draft && draft.editorData?.items) {
                // Restore items từ draft
                setItems(draft.editorData.items);
                toast.info("Đã khôi phục bản nháp trước đó");
              }
            } catch (err) {
              // Không có draft hoặc lỗi → bỏ qua
              console.debug("Không có draft hoặc lỗi khi load draft:", err);
            }
          }
        } catch (err: any) {
          console.error("Lỗi tải Product:", err);
          // Chỉ hiển thị toast nếu chưa hiển thị (tránh duplicate)
          if (!err.message?.includes("Product")) {
            toast.error(
              err.message || "Không thể tải sản phẩm (lỗi editorService)"
            );
          }
          // Đã navigate trong validation, không cần navigate lại
          if (!err.message?.includes("navigate")) {
            navigate("/shop");
          }
          throw err;
        }
      };

      const fetchLibrary = async () => {
        try {
          const assets = await getMyMediaAssets();
          const viewModels: UploadedImageVM[] = assets
            .map((asset) => ({
              id: asset._id,
              url: asset.url,
              name: asset.name,
              isLoading: false,
            }))
            .reverse();
          setUploadedImages(viewModels);
        } catch (err) {
          console.error("Lỗi tải thư viện media:", err);
          toast.error("Không thể tải thư viện ảnh");
        }
      };

      try {
        await Promise.all([fetchProduct(), fetchLibrary()]);
      } catch (err) {
        console.error("Lỗi nghiêm trọng khi tải studio:", err);
      } finally {
        setIsLoading(false);
        isFetchingRef.current = false;
      }
    };

    fetchStudioData();
    // ✅ SỬA: Dùng cả productId và customizedDesignId làm dependency
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, customizedDesignId]);

  // === UNDO/REDO HELPERS ===
  
  // ✅ THÊM: Save current state vào history
  const saveToHistory = useCallback((newItems: EditorItem[]) => {
    setHistory((prevHistory) => {
      // Xóa các state sau historyIndex (khi user đã undo rồi làm action mới)
      const newHistory = prevHistory.slice(0, historyIndex + 1);
      // Thêm state mới
      const updatedHistory = [...newHistory, JSON.parse(JSON.stringify(newItems))];
      // Giới hạn max history
      if (updatedHistory.length > MAX_HISTORY) {
        return updatedHistory.slice(-MAX_HISTORY);
      }
      return updatedHistory;
    });
    setHistoryIndex((prev) => {
      const newIndex = prev + 1;
      return newIndex >= MAX_HISTORY ? MAX_HISTORY - 1 : newIndex;
    });
  }, [historyIndex, MAX_HISTORY]);

  // ✅ THÊM: Wrapper để setItems và tự động save vào history
  const setItemsWithHistory = useCallback(
    (updater: EditorItem[] | ((prev: EditorItem[]) => EditorItem[])) => {
      setItems((prevItems) => {
        const newItems =
          typeof updater === "function" ? updater(prevItems) : updater;
        // Save vào history (chỉ khi có thay đổi thực sự)
        if (JSON.stringify(newItems) !== JSON.stringify(prevItems)) {
          saveToHistory(newItems);
        }
        return newItems;
      });
    },
    [saveToHistory]
  );

  // ✅ THÊM: Undo function
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setItems(prevState);
      setHistoryIndex((prev) => prev - 1);
      toast.info("Đã hoàn tác");
    } else {
      toast.info("Không thể hoàn tác thêm");
    }
  }, [history, historyIndex]);

  // ✅ THÊM: Redo function
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setItems(nextState);
      setHistoryIndex((prev) => prev + 1);
      toast.info("Đã làm lại");
    } else {
      toast.info("Không thể làm lại thêm");
    }
  }, [history, historyIndex]);

  // ✅ THÊM: Check if can undo/redo
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  // ✅ THÊM: Initialize history khi items thay đổi từ load
  useEffect(() => {
    if (items.length > 0 && history.length === 0) {
      // Lần đầu load items → save vào history
      setHistory([JSON.parse(JSON.stringify(items))]);
      setHistoryIndex(0);
    }
  }, []); // Chỉ chạy 1 lần khi mount

  // ✅ THÊM: Keyboard shortcuts cho Undo/Redo (sau khi đã định nghĩa undo/redo)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Shift") setIsSnapping(true);
      
      // Keyboard shortcuts cho Undo/Redo
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault();
        redo();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Shift") setIsSnapping(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, [undo, redo]);

  // === HANDLERS (Core Logic) ===

  // (Handler: handleSelectItem)
  const handleSelectItem = useCallback(
    (itemId: string | null, isMultiSelect: boolean) => {
      if (!itemId) {
        setSelectedItemIds([]);
        return;
      }

      const item = items.find((i) => i.id === itemId);
      if (item?.isLocked) {
        toast.info("Lớp này đã bị khóa.");
        setSelectedItemIds([]); // Bỏ chọn khi click vào item bị khoá
        return;
      }

      setSelectedItemIds((prevIds) => {
        if (isMultiSelect) {
          if (prevIds.includes(itemId)) {
            return prevIds.filter((id) => id !== itemId);
          } else {
            return [...prevIds, itemId];
          }
        } else {
          // Nếu chỉ chọn 1, và item đó đã được chọn, thì không làm gì cả
          if (prevIds.length === 1 && prevIds[0] === itemId) {
            return prevIds;
          }
          return [itemId];
        }
      });
    },
    [items]
  );

  // (Handler: deselectAll)
  const deselectAll = useCallback(() => {
    setSelectedItemIds([]);
  }, []);

  // (Handler: addItem) - ✅ WRAP với saveToHistory
  const addItem = useCallback(
    (
      itemType: "decal",
      dropData: any,
      interactionResult: InteractionResult
    ) => {
      let newDecal: DecalItem | null = null;
      const id = createId("decal");
      const pos = interactionResult.worldPoint.toArray();
      const norm = interactionResult.worldNormal.toArray();
      const defaultRotation: [number, number, number] = [0, 0, 0];
      let parentId: string | null = null;
      if (firstSelectedItem && firstSelectedItem.type === "group") {
        parentId = firstSelectedItem.id;
      }

      if (dropData.type === "image") {
        newDecal = {
          id,
          type: "decal",
          parentId,
          decalType: "image",
          imageUrl: dropData.imageUrl,
          position: pos,
          normal: norm,
          size: [0.15, 0.15],
          rotation: defaultRotation,
          isVisible: true,
          isLocked: false,
        };
      } else if (dropData.type === "text") {
        newDecal = {
          id,
          type: "decal",
          parentId,
          decalType: "text",
          text: dropData.text || "New Text",
          color: dropData.color || "#000000",
          position: pos,
          normal: norm,
          size: [0.3, 0.1],
          rotation: defaultRotation,
          isVisible: true,
          isLocked: false,
        };
      } else if (dropData.type === "shape") {
        newDecal = {
          id,
          type: "decal",
          parentId,
          decalType: "shape",
          shapeType: dropData.shapeType || "rect",
          color: dropData.color || "#3498db",
          position: pos,
          normal: norm,
          size: [0.15, 0.15],
          rotation: defaultRotation,
          isVisible: true,
          isLocked: false,
        };
      }

      if (newDecal) {
        setItemsWithHistory((prev) => [...prev, newDecal!]);
        handleSelectItem(newDecal.id, false);
      }
    },
    [firstSelectedItem, handleSelectItem, setItemsWithHistory]
  );

  // (Handler: deleteSelectedItems)
  const deleteSelectedItems = useCallback(() => {
    if (selectedItemIds.length === 0) return;
    setItemsWithHistory((prevItems) => {
      const itemsToDelete = new Set<string>(selectedItemIds);
      const stack = [...selectedItemIds];
      while (stack.length > 0) {
        const currentId = stack.pop()!;
        const children = prevItems.filter((i) => i.parentId === currentId);
        children.forEach((child) => {
          itemsToDelete.add(child.id);
          if (child.type === "group") {
            stack.push(child.id);
          }
        });
      }
      return prevItems.filter((item) => !itemsToDelete.has(item.id));
    });
    setSelectedItemIds([]);
  }, [selectedItemIds, setItemsWithHistory]);

  // (Handler: updateItemProperties) - ✅ Note: Không save history cho mỗi property change (quá nhiều)
  // Chỉ save khi user thả chuột hoặc kết thúc drag
  const updateItemProperties = useCallback(
    (itemId: string, updates: Partial<DecalItem> | Partial<GroupItem>, saveHistory = false) => {
      if (saveHistory) {
        setItemsWithHistory(
          (prev) =>
            prev.map((item) =>
              item.id === itemId ? { ...item, ...updates } : item
            ) as EditorItem[]
        );
      } else {
        setItems(
          (prev) =>
            prev.map((item) =>
              item.id === itemId ? { ...item, ...updates } : item
            ) as EditorItem[]
        );
      }
    },
    [setItemsWithHistory]
  );

  // (Handler: handleGroupSelection)
  const handleGroupSelection = useCallback(() => {
    if (selectedItemIds.length < 2) return;
    const newGroupId = createId("group");
    const newGroup: GroupItem = {
      id: newGroupId,
      type: "group",
      parentId: null,
      name: "Nhóm mới",
      isVisible: true,
      isLocked: false,
    };

    setItemsWithHistory((prevItems) => {
      const firstParentId = prevItems.find(
        (i) => i.id === selectedItemIds[0]
      )?.parentId;
      const allHaveSameParent = selectedItemIds.every(
        (id) => prevItems.find((i) => i.id === id)?.parentId === firstParentId
      );
      newGroup.parentId = (allHaveSameParent ? firstParentId : null) || null;
      const updatedItems = prevItems.map((item) => {
        if (selectedItemIds.includes(item.id)) {
          return { ...item, parentId: newGroupId };
        }
        return item;
      });
      return [...updatedItems, newGroup];
    });
    setSelectedItemIds([newGroupId]);
    toast.success("Đã nhóm các lớp!");
  }, [selectedItemIds, setItemsWithHistory]);

  // (Handler: handleUngroupSelection)
  const handleUngroupSelection = useCallback(() => {
    const selectedGroup = firstSelectedItem;
    if (!selectedGroup || selectedGroup.type !== "group") return;
    const groupParentId = selectedGroup.parentId;
    setItemsWithHistory((prevItems) => {
      const itemsWithoutGroup = prevItems.filter(
        (item) => item.id !== selectedGroup.id
      );
      const updatedItems = itemsWithoutGroup.map((item) => {
        if (item.parentId === selectedGroup.id) {
          return { ...item, parentId: groupParentId };
        }
        return item;
      });
      return updatedItems;
    });
    setSelectedItemIds([]);
    toast.success("Đã rã nhóm!");
  }, [firstSelectedItem, setItemsWithHistory]);

  // (Handler: reorderItems)
  const reorderItems = useCallback(
    (activeId: string, overId: string | null, containerId: string | null) => {
      setItemsWithHistory((prevItems) => {
        const activeItem = prevItems.find((i) => i.id === activeId);
        const overItem = prevItems.find((i) => i.id === overId);
        if (!activeItem || !overItem) return prevItems;

        const activeIndex = prevItems.findIndex((i) => i.id === activeId);
        const overIndex = prevItems.findIndex((i) => i.id === overId);

        if (activeItem.parentId === overItem.parentId) {
          return arrayMove(prevItems, activeIndex, overIndex);
        }

        const newParentId = containerId === "root" ? null : containerId;
        if (activeItem.parentId !== newParentId) {
          const updatedItem = { ...activeItem, parentId: newParentId };
          const newItems = prevItems.filter((i) => i.id !== activeId);
          newItems.splice(overIndex, 0, updatedItem);
          return newItems;
        }

        return arrayMove(prevItems, activeIndex, overIndex);
      });
    },
    [setItemsWithHistory]
  );

  // (Handler: handleToolbarImageUpload)
  const handleToolbarImageUpload = useCallback(
    async (file: File) => {
      const existingFile = uploadedImages.find(
        (img) => img.name === file.name && !img.isLoading
      );
      if (existingFile) {
        toast.warning(`Ảnh "${file.name}" đã có trong thư viện.`);
        return;
      }
      const id = `upload_${Date.now()}`;
      const placeholder: UploadedImageVM = {
        id,
        url: "",
        name: file.name,
        isLoading: true,
      };
      setUploadedImages((prev) => [placeholder, ...prev]);
      toast.info(`Đang tải lên: ${file.name}`);
      try {
        const newAsset = await createMediaAsset(file);
        setUploadedImages((prev) =>
          prev.map((img) =>
            img.id === id
              ? {
                  id: newAsset._id,
                  url: newAsset.url,
                  name: newAsset.name,
                  isLoading: false,
                }
              : img
          )
        );
        toast.success(`Tải lên thành công: ${file.name}`);
      } catch (err: any) {
        console.error("Lỗi upload/create media asset:", err);
        toast.error(`Không thể tải lên: ${file.name}`);
        setUploadedImages((prev) => prev.filter((img) => img.id !== id));
      }
    },
    [uploadedImages]
  );

  // === (Logic Giá & Lưu vào giỏ hàng) ===

  const minQuantity = useMemo(
    () => product?.pricing[0]?.minQuantity || 1,
    [product]
  );

  const currentPricePerUnit = useMemo(
    () => product?.pricing[selectedPriceIndex]?.pricePerUnit ?? 0,
    [product, selectedPriceIndex]
  );

  // Logic giá: Tự động set số lượng tối thiểu
  useEffect(() => {
    // Chỉ set khi quantity < minQuantity (lần đầu load)
    if (minQuantity > 0 && selectedQuantity < minQuantity) {
      setSelectedQuantity(minQuantity);
    }
  }, [minQuantity, selectedQuantity]);

  // Logic giá: Tự động chọn bậc giá
  useEffect(() => {
    if (!product?.pricing) return;
    let bestTierIndex = 0;
    for (let i = 0; i < product.pricing.length; i++) {
      if (selectedQuantity >= product.pricing[i].minQuantity) {
        if (
          product.pricing[i].minQuantity >=
          product.pricing[bestTierIndex].minQuantity
        ) {
          bestTierIndex = i;
        }
      }
    }
    setSelectedPriceIndex(bestTierIndex);
  }, [selectedQuantity, product?.pricing]);
  // === HẾT LOGIC GIÁ ===

  // ✅ THÊM: Auto-save draft mỗi 30 giây
  useEffect(() => {
    if (!product || items.length === 0) return;

    const autoSaveInterval = setInterval(async () => {
      try {
        const draftIdResult = await saveDraftDesign(product._id, {
          items: items,
        });
        if (draftIdResult) {
          setDraftId(draftIdResult);
          setLastSavedAt(new Date());
          // Không hiển thị toast để không làm phiền user
          console.debug("✅ Auto-saved draft");
        }
      } catch (err) {
        console.error("Lỗi auto-save draft:", err);
        // Không hiển thị error để không làm phiền user
      }
    }, 30000); // 30 giây

    return () => clearInterval(autoSaveInterval);
  }, [product, items]);

  const handleSaveAndAddToCart = async () => {
    if (!product) {
      toast.error("Lỗi: Không có thông tin sản phẩm gốc.");
      return;
    }
    setIsSaving(true);
    try {
      // (Tính toán giá)
      const quantity = selectedQuantity;

      // GỠ BỎ LOGIC TÍNH GIÁ FRONTEND (Đã làm ở Task 1)
      // const basePrice = currentPricePerUnit;
      // const decalCost = flatDecalItems.length * 5000;
      // const finalPricePerUnit = basePrice + decalCost;

      const newDesignId = await editorService.saveCustomDesign(product._id, {
        items: items, // Gửi cấu trúc tree
      });

      // ✅ Xóa draft sau khi lưu chính thức
      if (draftId) {
        setDraftId(null);
        setLastSavedAt(null);
      }

      await addToCart({
        productId: product._id,
        quantity: quantity,
        selectedPriceIndex: selectedPriceIndex,
        customization: {
          notes: "Thiết kế tùy chỉnh 3D",
          customizedDesignId: newDesignId,
        },
      });
      toast.success("Đã lưu thiết kế và thêm vào giỏ hàng!");
      navigate("/checkout");
    } catch (err: any) {
      console.error("Lỗi khi lưu và thêm vào giỏ:", err);
      toast.error(err.message || "Lưu thiết kế thất bại");
    } finally {
      setIsSaving(false);
    }
  };

  // === RETURN ===
  return {
    product,
    isLoading,
    isSaving,
    isModelLoaded,
    setIsModelLoaded,

    items,
    flatDecalItems,
    selectedItemIds,
    firstSelectedItem,

    handleSelectItem,
    deselectAll,
    addItem,
    deleteSelectedItems,
    updateItemProperties,
    handleGroupSelection,
    handleUngroupSelection,
    reorderItems,

    activeToolbarTab,
    setActiveToolbarTab,
    uploadedImages,
    handleToolbarImageUpload,
    gizmoMode,
    setGizmoMode,
    isSnapping,
    toolMode,
    setToolMode,
    selectedQuantity,
    setSelectedQuantity,
    minQuantity,
    currentPricePerUnit,
    handleSaveAndAddToCart,
    
    // ✅ THÊM: Undo/Redo
    undo,
    redo,
    canUndo,
    canRedo,
  };
}
