// src/features/printer/hooks/useProductManagement.ts
// ✅ BẢN CHÍNH XÁC (Sử dụng Functional Update + Sửa lỗi trùng lặp)

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { PrinterProduct } from "@/types/product";
import * as productService from "@/services/productService";

export function useProductManagement() {
  const [products, setProducts] = useState<PrinterProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchParams, setSearchParams] = useSearchParams();
  const action = searchParams.get("action");
  const editingProductId = action === "edit" ? searchParams.get("id") : null;

  // State của Delete Dialog
  const [deletingProduct, setDeletingProduct] = useState<PrinterProduct | null>(
    null
  );
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Fetch Data (Chỉ fetch 1 lần)
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await productService.getMyProducts();
      setProducts(data);
    } catch (err: any) {
      toast.error("Không thể tải danh sách sản phẩm");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Logic Xóa
  const handleDeleteProduct = async () => {
    if (!deletingProduct) return;
    try {
      await productService.deleteProduct(deletingProduct._id);
      toast.success("✅ Đã xóa sản phẩm");
      // Tối ưu: Xóa khỏi state (thay vì fetch lại)
      setProducts((prev) => prev.filter((p) => p._id !== deletingProduct._id));
      setShowDeleteDialog(false);
      setDeletingProduct(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Không thể xóa sản phẩm");
    }
  };

  // ==================== HANDLERS (LOGIC ĐÚNG) ====================
  const navigateTo = (newAction?: "new" | "edit", id?: string) => {
    setSearchParams(
      (prevParams) => {
        const newParams = new URLSearchParams(prevParams);
        if (newAction) {
          newParams.set("action", newAction);
          if (id) {
            newParams.set("id", id);
          }
        } else {
          newParams.delete("action");
          newParams.delete("id");
        }
        return newParams;
      },
      { replace: true }
    );
  };

  const openAddForm = () => {
    navigateTo("new");
  };

  const openEditForm = (product: PrinterProduct) => {
    navigateTo("edit", product._id);
  };

  const closeForm = () => {
    navigateTo();
  };

  const openDeleteDialog = (product: PrinterProduct) => {
    setDeletingProduct(product);
    setShowDeleteDialog(true);
  };

  const closeDeleteDialog = () => {
    setShowDeleteDialog(false);
    setDeletingProduct(null);
  };

  /**
   * ✅ SỬA LỖI TRÙNG LẶP:
   * Chỉ gọi 'fetchProducts()' 1 LẦN DUY NHẤT.
   * Không 'setProducts' thủ công.
   */
  const onProductAdded = () => {
    fetchProducts(); // Tải lại danh sách MỚI NHẤT từ DB
    closeForm();
  };

  const onProductEdited = () => {
    fetchProducts(); // Tải lại danh sách MỚI NHẤT từ DB
    closeForm();
  };

  return {
    products,
    loading,
    action,
    editingProductId,
    deletingProduct,
    showDeleteDialog,
    handleDeleteProduct,
    openAddForm,
    openEditForm,
    closeForm,
    openDeleteDialog,
    closeDeleteDialog,
    onProductAdded,
    onProductEdited,
  };
}
