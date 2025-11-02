// frontend/src/pages/printer/ProductManagement.tsx (ĐÃ SỬA LỖI CÚ PHÁP)

import { useState, useEffect } from "react";
import api from "@/shared/lib/axios";
import { toast } from "sonner";
import { PrinterProduct } from "@/types/product";
import { AddProductFlow } from "@/features/printer/add-product-flow/AddProductFlow";
import { EditProductModal } from "@/features/printer/components/EditProductModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";
import { ProductListHeader } from "@/features/printer/components/ProductListHeader";
import { ProductTable } from "@/features/printer/components/ProductTable";

export function ProductManagement() {
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
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get("/products/my-products");
      // FIX: The API wraps the response in a 'data' object.
      // Also, provide a fallback to an empty array to prevent crashes.
      setProducts(res.data?.data?.products || []);
    } catch (err: any) {
      // KHẮC PHỤC: Sửa lỗi cú pháp "->" thành "{"
      console.error("Fetch My Products Error:", err);
      toast.error("Không thể tải danh sách sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ==================== DELETE PRODUCT ====================
  const handleDeleteProduct = async () => {
    if (!deletingProduct) return;
    try {
      await api.delete(`/products/${deletingProduct._id}`);
      toast.success("✅ Đã xóa sản phẩm");
      setProducts((prev) => prev.filter((p) => p._id !== deletingProduct._id));
      setShowDeleteDialog(false);
      setDeletingProduct(null);
    } catch (err: any) {
      // KHẮC PHỤC: Sửa lỗi cú pháp "->" thành "{"
      console.error("❌ Delete Product Error:", err);
      toast.error(err.response?.data?.message || "Không thể xóa sản phẩm");
    }
  };

  // ==================== HANDLERS ====================
  const openEditModal = (product: PrinterProduct) => {
    setEditingProduct(product);
    setShowEditModal(true);
  };

  const openDeleteDialog = (product: PrinterProduct) => {
    setDeletingProduct(product);
    setShowDeleteDialog(true);
  };

  const onProductAdded = () => {
    fetchProducts();
    setShowAddForm(false);
  };

  const onProductEdited = () => {
    fetchProducts();
    setShowEditModal(false);
    setEditingProduct(null);
  };

  // ==================== RENDER ====================
  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header (Component mới) */}
        <ProductListHeader
          isAdding={showAddForm}
          onAddNew={() => setShowAddForm(true)}
        />

        {/* Conditional Render */}
        {showAddForm ? (
          <AddProductFlow
            onFormClose={() => setShowAddForm(false)}
            onProductAdded={onProductAdded}
          />
        ) : (
          <ProductTable
            products={products}
            loading={loading}
            onEdit={openEditModal}
            onDelete={openDeleteDialog}
          />
        )}
      </div>

      {/* Edit Modal */}
      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingProduct(null);
          }}
          onSuccess={onProductEdited}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa sản phẩm</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa sản phẩm{" "}
              <strong>{deletingProduct?.name}</strong>?
              <br />
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setShowDeleteDialog(false);
                setDeletingProduct(null);
              }}
            >
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProduct}
              className="bg-red-600 hover:bg-red-700"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
