// features/editor/hooks/useDesignEditor.ts
// Hook quản lý toàn bộ state và logic nghiệp vụ của 3D Editor

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import * as THREE from "three";
import { useCartStore } from "@/stores/useCartStore";
import { Product } from "@/types/product";
import * as editorService from "../services/editorService";
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

  const [items, setItems] = useState<EditorItem[]>([]);
  const [activeToolbarTab, setActiveToolbarTab] = useState<string>("templates");
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [uploadedImages, setUploadedImages] = useState<UploadedImageVM[]>([]);
  const [gizmoMode, setGizmoMode] = useState<GizmoMode>("translate");
  const [isSnapping, setIsSnapping] = useState(false);

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
  useEffect(() => {
    const fetchStudioData = async () => {
      setIsLoading(true);
      const productId = searchParams.get("productId");

      if (!productId) {
        toast.error("Không tìm thấy ID sản phẩm trong URL.");
        navigate("/shop");
        return;
      }

      const fetchProduct = async () => {
        try {
          const fetchedProduct = await editorService.getProductById(productId);
          setProduct(fetchedProduct);
          if (fetchedProduct.pricing && fetchedProduct.pricing.length > 0) {
            // Cập nhật state ở đây
            setSelectedQuantity(fetchedProduct.pricing[0].minQuantity || 1);
          }
        } catch (err: any) {
          console.error("Lỗi tải Product:", err);
          toast.error(
            err.message || "Không thể tải sản phẩm (lỗi editorService)"
          );
          navigate("/shop");
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
      }
    };

    fetchStudioData();
  }, [searchParams, navigate]);

  // (useEffect Snapping)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Shift") setIsSnapping(true);
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
  }, []);

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

  // (Handler: addItem)
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
        setItems((prev) => [...prev, newDecal!]);
        handleSelectItem(newDecal.id, false);
      }
    },
    [firstSelectedItem, handleSelectItem]
  );

  // (Handler: deleteSelectedItems)
  const deleteSelectedItems = useCallback(() => {
    if (selectedItemIds.length === 0) return;
    setItems((prevItems) => {
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
  }, [selectedItemIds]);

  // (Handler: updateItemProperties)
  const updateItemProperties = useCallback(
    (itemId: string, updates: Partial<DecalItem> | Partial<GroupItem>) => {
      setItems(
        (prev) =>
          prev.map((item) =>
            item.id === itemId ? { ...item, ...updates } : item
          ) as EditorItem[]
      );
    },
    []
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

    setItems((prevItems) => {
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
  }, [selectedItemIds]);

  // (Handler: handleUngroupSelection)
  const handleUngroupSelection = useCallback(() => {
    const selectedGroup = firstSelectedItem;
    if (!selectedGroup || selectedGroup.type !== "group") return;
    const groupParentId = selectedGroup.parentId;
    setItems((prevItems) => {
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
  }, [firstSelectedItem]);

  // (Handler: reorderItems)
  const reorderItems = useCallback(
    (activeId: string, overId: string | null, containerId: string | null) => {
      setItems((prevItems) => {
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
    []
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
    selectedQuantity,
    setSelectedQuantity,
    minQuantity,
    currentPricePerUnit,
    handleSaveAndAddToCart,
  };
}
