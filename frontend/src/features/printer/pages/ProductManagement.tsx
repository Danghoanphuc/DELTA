// src/features/printer/pages/ProductManagement.tsx
// ✅ BẢN VÁ FULL: Kích hoạt "Trợ lý AI" + Sửa lỗi a11y (DialogTitle)

import { useProductManagement } from "@/features/printer/hooks/useProductManagement";
// ✅ KÍCH HOẠT "TRỢ LÝ AI":
import { AssetWizardPage } from "@/features/admin/components/AssetWizardPage";
// ❌ XÓA BỎ Modal cũ
// import { EditProductModal } from "@/features/printer/components/EditProductModal";
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
import {
  Dialog,
  DialogContent,
  DialogHeader, // ✅ Thêm
  DialogTitle, // ✅ Thêm
  DialogDescription, // ✅ Thêm
} from "@/shared/components/ui/dialog";

export function ProductManagement() {
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

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="p-8 max-w-7xl mx-auto">
        <ProductListHeader
          isAdding={showAddForm || showEditModal}
          onAddNew={() => setShowAddForm(true)}
        />

        {/* --- KÍCH HOẠT FLOW MỚI --- */}
        {/* Render flow "Tạo" trong Dialog */}
        <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* ✅ SỬA LỖI a11y: Thêm Title và Description */}
            <DialogHeader>
              <DialogTitle>Trợ lý AI Tạo Phôi Mới</DialogTitle>
              <DialogDescription>
                Điền thông tin phôi, "Trợ lý AI" sẽ xác thực và tạo phôi mới.
              </DialogDescription>
            </DialogHeader>
            <AssetWizardPage
              onFormClose={() => setShowAddForm(false)}
              onSuccess={onProductAdded}
            />
          </DialogContent>
        </Dialog>

        {/* Render flow "Sửa" trong Dialog */}
        <Dialog open={showEditModal} onOpenChange={closeEditModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* ✅ SỬA LỖI a11y: Thêm Title và Description */}
            <DialogHeader>
              <DialogTitle>Trợ lý AI (Chế độ Sửa)</DialogTitle>
              <DialogDescription>
                Cập nhật thông tin phôi. AI sẽ kiểm tra tính tương thích của
                file GLB mới.
              </DialogDescription>
            </DialogHeader>
            <AssetWizardPage
              productId={editingProduct?._id}
              onFormClose={closeEditModal}
              onSuccess={onProductEdited}
            />
          </DialogContent>
        </Dialog>

        {/* ✅ Hiển thị bảng khi không ở flow nào */}
        {!showAddForm && !showEditModal && (
          <ProductTable
            products={products}
            loading={loading}
            onEdit={openEditModal}
            onDelete={openDeleteDialog}
          />
        )}
      </div>

      {/* ❌ Đã xóa Modal cũ */}

      {/* Delete Confirmation Dialog (Đã sửa lỗi typo) */}
      <AlertDialog open={showDeleteDialog} onOpenChange={closeDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa sản phẩm</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa sản phẩm{" "}
              <strong>{deletingProduct?.name}</strong>? Hành động này không thể
              hoàn tác.
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
