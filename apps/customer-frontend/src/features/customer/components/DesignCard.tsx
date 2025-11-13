// src/features/customer/components/DesignCard.tsx
import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { MyCustomDesign } from "../hooks/useMyDesigns";
import { toast } from "sonner";
import { Link } from "react-router-dom"; // <-- ĐÃ IMPORT

interface DesignCardProps {
  design: MyCustomDesign;
}

export const DesignCard = ({ design }: DesignCardProps) => {
  const createdAt = new Date(design.createdAt).toLocaleDateString("vi-VN");

  return (
    <Card className="overflow-hidden group hover:shadow-lg transition-shadow">
      <div className="aspect-square bg-gray-100 relative">
        {design.finalPreviewImageUrl ? (
          <img
            src={design.finalPreviewImageUrl}
            alt="Thiết kế"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            (Không có ảnh xem trước)
          </div>
        )}
        <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* SỬA NÚT SỬA TẠI ĐÂY */}
          <Button
            size="icon"
            variant="secondary"
            className="w-8 h-8 rounded-full"
            asChild // <-- THÊM asChild
          >
            {/* Chuyển hướng đến editor với ID thiết kế */}
            <Link to={`/design-editor?customizedDesignId=${design._id}`}>
              <Edit size={16} />
            </Link>
          </Button>

          <Button
            size="icon"
            variant="destructive"
            className="w-8 h-8 rounded-full"
            onClick={() => toast.info("Tính năng 'Xóa' đang được phát triển")}
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </div>
      <CardContent className="p-4">
        <p className="font-semibold text-sm truncate">
          Thiết kế ngày {createdAt}
        </p>
        <p className="text-xs text-gray-500">ID: {design._id.slice(-6)}</p>
      </CardContent>
    </Card>
  );
};
