// src/features/printer/pages/AssetManagementPage.tsx (BẢN SỬA ĐÚNG)
// File này chỉ là "vỏ" để render "Trợ lý AI"

import { AssetWizard } from "@/features/printer/components/AssetWizard"; // 1. Import Trợ lý AI
import { toast } from "sonner";
import { useNavigate } from "react-router-dom"; // (Thêm navigate để có thể quay về)

export function AssetManagementPage() {
  const navigate = useNavigate();

  const handleSuccess = () => {
    toast.success("Tạo phôi thành công! Dữ liệu đã được cập nhật.");
    // Tùy chọn: Tự động quay về trang sản phẩm sau khi thành công
    // navigate("/printer/dashboard?tab=products");
  };

  const handleClose = () => {
    // (Hiện tại wizard là full page, nên có thể không cần)
    // Hoặc điều hướng về dashboard
    // navigate("/printer/dashboard");
  };

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      {/* 2. Render Trợ lý AI (nó chứa toàn bộ logic phân tích GLB) */}
      <AssetWizard onFormClose={handleClose} onSuccess={handleSuccess} />
    </div>
  );
}
