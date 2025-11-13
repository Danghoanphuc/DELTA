// src/features/customer/components/DesignEmptyState.tsx
import { FolderOpen, Plus } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Link } from "react-router-dom";

export const DesignEmptyState = () => {
  return (
    <div className="text-center py-16 bg-white rounded-lg border border-gray-200 shadow-sm">
      <FolderOpen size={64} className="mx-auto text-gray-300 mb-4" />
      <h3 className="font-semibold text-gray-700 mb-2">
        Kho mẫu của bạn đang trống
      </h3>
      <p className="text-gray-500 mb-6">
        Hãy bắt đầu tạo thiết kế đầu tiên từ "Kho mẫu" hoặc "Cửa hàng".
      </p>
      <div className="flex justify-center gap-4">
        <Button asChild>
          <Link to="/templates">
            <Plus size={18} className="mr-2" />
            Khám phá kho mẫu
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/shop">Vào cửa hàng</Link>
        </Button>
      </div>
    </div>
  );
};
