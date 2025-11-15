// src/features/customer/components/DesignCard.tsx
import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Edit, Trash2, ShoppingCart } from "lucide-react";
import { MyCustomDesign } from "../hooks/useMyDesigns";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";

interface DesignCardProps {
  design: MyCustomDesign;
}

export const DesignCard = ({ design }: DesignCardProps) => {
  const navigate = useNavigate();
  const createdAt = new Date(design.createdAt).toLocaleDateString("vi-VN");
  const updatedAt = design.updatedAt
    ? new Date(design.updatedAt).toLocaleDateString("vi-VN")
    : null;

  // ✅ Lấy preview image (ưu tiên preview.thumbnailUrl, fallback về finalPreviewImageUrl)
  const previewUrl =
    design.preview?.thumbnailUrl || design.finalPreviewImageUrl;

  // ✅ Navigate đến editor với productId hoặc customizedDesignId
  const handleEdit = () => {
    if (design.baseProductId) {
      navigate(
        `/design-editor?productId=${design.baseProductId}&customizedDesignId=${design._id}`
      );
    } else {
      navigate(`/design-editor?customizedDesignId=${design._id}`);
    }
  };

  return (
    <Card className="overflow-hidden group hover:shadow-lg transition-shadow">
      <div className="aspect-square bg-gray-100 relative">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Thiết kế"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            (Không có ảnh xem trước)
          </div>
        )}
        {/* ✅ THÊM: Status badge */}
        {design.status === "draft" && (
          <Badge
            variant="secondary"
            className="absolute top-2 left-2 bg-yellow-100 text-yellow-800"
          >
            Bản nháp
          </Badge>
        )}
        <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="icon"
            variant="secondary"
            className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm"
            onClick={handleEdit}
            title="Chỉnh sửa"
          >
            <Edit size={16} />
          </Button>

          <Button
            size="icon"
            variant="destructive"
            className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm"
            onClick={() => toast.info("Tính năng 'Xóa' đang được phát triển")}
            title="Xóa"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </div>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-1">
          <p className="font-semibold text-sm truncate flex-1">
            {design.status === "draft" ? "Bản nháp" : "Thiết kế"} ngày{" "}
            {createdAt}
          </p>
        </div>
        {updatedAt && updatedAt !== createdAt && (
          <p className="text-xs text-gray-400 mb-1">
            Cập nhật: {updatedAt}
          </p>
        )}
        {design.baseProductId && (
          <p className="text-xs text-gray-500">ID: {design._id.slice(-6)}</p>
        )}
      </CardContent>
    </Card>
  );
};
