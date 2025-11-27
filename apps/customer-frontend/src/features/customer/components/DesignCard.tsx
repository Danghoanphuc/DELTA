// src/features/customer/components/DesignCard.tsx
import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Edit, Trash2, Clock, Image as ImageIcon } from "lucide-react"; // Thêm icon
import { MyCustomDesign } from "../hooks/useMyDesigns";
import { toast } from "@/shared/utils/toast";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/shared/lib/utils";

interface DesignCardProps {
  design: MyCustomDesign;
}

export const DesignCard = ({ design }: DesignCardProps) => {
  const navigate = useNavigate();
  const createdAt = new Date(design.createdAt).toLocaleDateString("vi-VN");
  const updatedAt = design.updatedAt ? new Date(design.updatedAt).toLocaleDateString("vi-VN") : null;

  const previewUrl = design.preview?.thumbnailUrl || design.finalPreviewImageUrl;

  const handleEdit = () => {
    if (design.baseProductId) {
      navigate(`/design-editor?productId=${design.baseProductId}&customizedDesignId=${design._id}`);
    } else {
      navigate(`/design-editor?customizedDesignId=${design._id}`);
    }
  };

  return (
    <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-gray-200 bg-white">
      {/* Image Container */}
      <div className="aspect-square bg-gray-50 relative overflow-hidden">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Thiết kế"
            className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-2">
            <ImageIcon size={32} className="opacity-50" />
            <span className="text-xs">Chưa có bản xem trước</span>
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-3 left-3 z-10">
           {design.status === "draft" ? (
             <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200 shadow-sm">
               Draft
             </Badge>
           ) : (
             <Badge variant="default" className="bg-green-600 hover:bg-green-700 shadow-sm">
               Saved
             </Badge>
           )}
        </div>

        {/* Action Overlay (Juicy Hover) */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 backdrop-blur-[2px]">
          <Button
            size="icon"
            className="rounded-full bg-white text-gray-900 hover:bg-blue-600 hover:text-white hover:scale-110 transition-all shadow-lg"
            onClick={handleEdit}
            title="Chỉnh sửa thiết kế"
          >
            <Edit size={18} />
          </Button>

          <Button
            size="icon"
            className="rounded-full bg-white text-red-600 hover:bg-red-600 hover:text-white hover:scale-110 transition-all shadow-lg"
            onClick={(e) => {
              e.stopPropagation();
              toast.info("Tính năng xóa đang phát triển");
            }}
            title="Xóa thiết kế"
          >
            <Trash2 size={18} />
          </Button>
        </div>
      </div>

      {/* Content */}
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900 truncate pr-2" title={design._id}>
             {design.baseProductId ? "Thiết kế tùy chỉnh" : "Bản nháp mới"}
          </h3>
        </div>
        
        <div className="flex items-center gap-4 text-xs text-gray-500">
           <div className="flex items-center gap-1">
              <Clock size={12} />
              <span>{updatedAt || createdAt}</span>
           </div>
           {design.baseProductId && (
             <span className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px] font-mono text-gray-600">
               #{design.baseProductId.slice(-4)}
             </span>
           )}
        </div>
      </CardContent>
    </Card>
  );
};