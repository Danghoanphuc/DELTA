// src/features/printer/hooks/useProductManagement.ts
// ✅ BÀN GIAO: Refactor sang React Query (useQuery + useMutation)

import { useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "@/shared/utils/toast";
import { PrinterProduct } from "@/types/product";
import * as productService from "@/services/productService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"; // ✅ Import

// ✅ Định nghĩa Query Key cho danh sách sản phẩm CỦA NHÀ IN
const PRINTER_PRODUCTS_QUERY_KEY = ["printer-products", "my-products"];

export function useProductManagement() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient(); // ✅ Lấy client

  const action = searchParams.get("action");
  const editingProductId = action === "edit" ? searchParams.get("id") : null;

  // State của Delete Dialog (giữ nguyên)
  const [deletingProduct, setDeletingProduct] = useState<PrinterProduct | null>(
    null
  );
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // State của Edit Modal (mới)
  const [editingProduct, setEditingProduct] = useState<PrinterProduct | null>(
    null
  );
  const [showEditModal, setShowEditModal] = useState(false);

  // ==================== FETCH DATA (Dùng useQuery) ====================


  // ✅ Thay thế tất cả bằng useQuery
  const { data: products = [], isLoading: loading, error } = useQuery({
    queryKey: PRINTER_PRODUCTS_QUERY_KEY,
    queryFn: productService.getMyProducts, // ✅ Gọi service đã sửa (Bước vá lỗi)
    retry: false, // ✅ Tắt retry để tránh infinite loop khi lỗi 500
    refetchOnWindowFocus: false, // ✅ Tắt refetch khi focus để tránh spam requests
  });

  // ==================== DELETE LOGIC (Dùng useMutation) ====================
  const deleteMutation = useMutation({
    mutationFn: productService.deleteProduct, // Hàm API (chỉ cần ID)
    onSuccess: (_, deletedProductId) => {
      toast.success("✅ Đã xóa sản phẩm");
      // Tắt dialog
      closeDeleteDialog();

      // ✅✅✅ TỰ ĐỘNG XÓA CACHE (INVALIDATION) ✅✅✅
      // 1. Xóa cache list của nhà in (để hook này tự fetch lại)
      queryClient.invalidateQueries({ queryKey: PRINTER_PRODUCTS_QUERY_KEY });
      // 2. Xóa cache list public (của useShop)
      queryClient.invalidateQueries({ queryKey: ["products", "all"] });
      // 3. Xóa cache chi tiết (của useProductDetail)
      queryClient.removeQueries({ queryKey: ["product", deletedProductId] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Không thể xóa sản phẩm");
    },
  });

  const handleDeleteProduct = async () => {
    if (!deletingProduct) return;
    deleteMutation.mutate(deletingProduct._id);
  };

  // ==================== HANDLERS (Giữ nguyên) ====================
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
    setEditingProduct(product);
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingProduct(null);
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
   * ✅ Đã sửa: Hàm này giờ chỉ cần đóng form.
   * Cache invalidation từ useSubmitProduct sẽ tự động trigger useQuery
   * của hook này để fetch lại data.
   */
  const onProductAdded = () => {
    closeForm();
  };

  const onProductEdited = () => {
    closeForm();
  };

  return {
    products, // Từ useQuery
    loading, // Từ useQuery
    action,
    editingProductId,
    editingProduct, // Sản phẩm đang được chỉnh sửa
    showEditModal, // Trạng thái modal edit
    deletingProduct,
    showDeleteDialog,
    handleDeleteProduct,
    openAddForm,
    openEditForm,
    closeEditModal, // Đóng modal edit
    closeForm,
    openDeleteDialog,
    closeDeleteDialog,
    onProductAdded,
    onProductEdited,
    // (Bổ sung isDeleting nếu cần hiển thị loading trên nút Xóa)
    isDeleting: deleteMutation.isPending,
  };
}
