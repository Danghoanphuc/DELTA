// src/features/printer/hooks/useProductManagement.ts
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { PrinterProduct } from "@/types/product";
import * as productService from "@/services/productService"; // <-- Import service

export function useProductManagement() {
  const [products, setProducts] = useState<PrinterProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  // Edit Modal State
  const [editingProduct, setEditingProduct] = useState<PrinterProduct | null>(
    null
  );
  const [showEditModal, setShowEditModal] = useState(false);

  // Delete Confirmation State
  const [deletingProduct, setDeletingProduct] = useState<PrinterProduct | null>(
    null
  );
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // ==================== FETCH PRODUCTS ====================
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await productService.getMyProducts(); // <-- Dùng service
      setProducts(data);
    } catch (err: any) {
      console.error("Fetch My Products Error:", err);
      toast.error("Không thể tải danh sách sản phẩm");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // ==================== DELETE PRODUCT ====================
  const handleDeleteProduct = async () => {
    if (!deletingProduct) return;
    try {
      await productService.deleteProduct(deletingProduct._id); // <-- Dùng service
      toast.success("✅ Đã xóa sản phẩm");
      setProducts((prev) => prev.filter((p) => p._id !== deletingProduct._id));
      setShowDeleteDialog(false);
      setDeletingProduct(null);
    } catch (err: any) {
      console.error("❌ Delete Product Error:", err);
      toast.error(err.response?.data?.message || "Không thể xóa sản phẩm");
    }
  };

  // ==================== HANDLERS ====================
  const openEditModal = (product: PrinterProduct) => {
    setEditingProduct(product);
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingProduct(null);
  };

  const openDeleteDialog = (product: PrinterProduct) => {
    setDeletingProduct(product);
    setShowDeleteDialog(true);
  };

  const closeDeleteDialog = () => {
    setShowDeleteDialog(false);
    setDeletingProduct(null);
  };

  const onProductAdded = () => {
    fetchProducts();
    setShowAddForm(false);
  };

  const onProductEdited = () => {
    fetchProducts();
    closeEditModal();
  };

  // Trả về state và các hàm xử lý
  return {
    products,
    loading,
    showAddForm,
    setShowAddForm,
    editingProduct,
    showEditModal,
    deletingProduct,
    showDeleteDialog,
    handleDeleteProduct,
    openEditModal,
    closeEditModal,
    openDeleteDialog,
    closeDeleteDialog,
    onProductAdded,
    onProductEdited,
  };
}
