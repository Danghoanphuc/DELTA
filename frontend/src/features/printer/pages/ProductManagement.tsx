// src/features/printer/pages/ProductManagement.tsx (ĐÃ LÀM SẠCH)
import { useProductManagement } from "@/features/printer/hooks/useProductManagement"; // <-- Import hook
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
  // Chỉ cần gọi hook là có mọi thứ
  const {
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
  } = useProductManagement();

  // ==================== RENDER ====================
  // Không còn bất kỳ logic fetch hay delete nào ở đây!
  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="p-8 max-w-7xl mx-auto">
        <ProductListHeader
          isAdding={showAddForm}
          onAddNew={() => setShowAddForm(true)}
        />

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
          onClose={closeEditModal}
          onSuccess={onProductEdited}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={closeDeleteDialog}>
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
            <AlertDialogCancel onClick={closeDeleteDialog}>
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
