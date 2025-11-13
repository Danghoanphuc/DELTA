// src/features/printer/pages/ProductManagement.tsx
// ✅ ĐÃ KHẮC PHỤC: Đồng bộ với hook, render dựa trên 'action' từ URL

import { useProductManagement } from "@/features/printer/hooks/useProductManagement";
import { CreateProductWizard } from "@/features/printer/pages/CreateProductWizard";
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
import { ProductEmptyState } from "@/features/printer/components/ProductEmptyState"; // Import Empty State

export function ProductManagement() {
  const {
    products,
    loading,

    // ✅ 1. Lấy state ĐÚNG từ hook (đọc từ URL)
    action,
    editingProductId,

    deletingProduct,
    showDeleteDialog,
    handleDeleteProduct,

    // ✅ 2. Lấy các hàm điều hướng ĐÚNG
    openAddForm,
    openEditForm,
    closeForm,
    openDeleteDialog,
    closeDeleteDialog,
    onProductAdded,
    onProductEdited,
  } = useProductManagement();

  // ❌ 3. LOẠI BỎ logic 'showAddForm', 'showEditModal' cũ

  // ✅ 4. THAY ĐỔI LOGIC RENDER

  // Render flow "Tạo" (Toàn trang)
  if (action === "new") {
    return (
      <CreateProductWizard
        onFormClose={closeForm} // ✅ Dùng hàm điều hướng
        onSuccess={onProductAdded}
      />
    );
  }

  // Render flow "Sửa" (Toàn trang)
  if (action === "edit" && editingProductId) {
    return (
      <CreateProductWizard
        productId={editingProductId}
        onFormClose={closeForm} // ✅ Dùng hàm điều hướng
        onSuccess={onProductEdited}
      />
    );
  }

  // Render Màn hình chính (Bảng) - khi action là null
  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="p-8 max-w-7xl mx-auto">
        <ProductListHeader
          isAdding={!!action} // Nút "Thêm mới" sẽ bị ẩn khi 'action' tồn tại
          onAddNew={openAddForm} // ✅ 5. GỌI HÀM ĐÚNG: openAddForm
        />

        {/* ✅ SỬA: Thêm logic loading và empty state */}
        {loading ? (
          <div className="text-center p-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
            <p className="mt-4 text-gray-500">Đang tải sản phẩm...</p>
          </div>
        ) : products.length === 0 ? (
          <ProductEmptyState />
        ) : (
          <ProductTable
            products={products}
            loading={loading} // (Prop này giờ không cần thiết lắm nhưng cứ để)
            onEdit={openEditForm} // ✅ 6. GỌI HÀM ĐÚNG: openEditForm
            onDelete={openDeleteDialog}
          />
        )}
      </div>

      {/* Delete Confirmation Dialog (Giữ nguyên) */}
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
