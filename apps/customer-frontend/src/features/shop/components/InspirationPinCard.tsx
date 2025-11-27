// features/shop/components/InspirationPinCard.tsx (FILE MỚI)
// Component này dành riêng cho các "Ghim" do AI tạo ra

import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Brush, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/shared/lib/utils";
import { toast } from "@/shared/utils/toast";

// Định nghĩa kiểu dữ liệu cho một Ghim do AI tạo
export interface InspirationPin {
  id: string;
  type: "inspiration";
  imageUrl: string; // data:image/png;base64,...
  prompt: string;
}

interface InspirationPinCardProps {
  pin: InspirationPin;
}

export function InspirationPinCard({ pin }: InspirationPinCardProps) {
  const handleUseTemplate = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // TODO: Triển khai logic
    // 1. Lưu base64 image lên cloud (nếu cần)
    // 2. Chuyển hướng đến DesignEditorPage
    // 3. Truyền 'imageUrl' và 'prompt' qua state của react-router
    // 4. Editor sẽ tải ảnh này làm decal
    toast.info("Tính năng đang phát triển", {
      description: `Sử dụng mẫu AI (ID: ${pin.id}) sẽ sớm được triển khai`,
    });
  };

  return (
    <div
      className="group relative overflow-hidden rounded-lg shadow-sm hover:shadow-xl transition-all duration-300"
      style={{ breakInside: "avoid" }} // Quan trọng cho Masonry
    >
      {/* --- HÌNH ẢNH (BASE) --- */}
      <img
        src={pin.imageUrl}
        alt={pin.prompt}
        className="w-full h-auto object-cover"
        loading="lazy"
      />

      {/* --- BADGE (Ghim trên ảnh) --- */}
      <div className="absolute top-2 left-2 z-10">
        <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs">
          <Sparkles size={12} className="mr-1" />
          AI tạo
        </Badge>
      </div>

      {/* --- LỚP PHỦ VÀ NỘI DUNG (OVERLAY KHI HOVER) --- */}
      <div
        className={cn(
          "absolute inset-0 flex flex-col justify-end",
          "bg-gradient-to-t from-black/80 via-black/40 to-transparent",
          "opacity-0 group-hover:opacity-100 transition-opacity duration-300",
          "pointer-events-none"
        )}
      >
        <div className="p-3 text-white pointer-events-auto">
          {/* Prompt đã tạo ra ảnh */}
          <p className="text-xs text-gray-200 mb-2 line-clamp-2">
            {pin.prompt}
          </p>

          {/* Nút CTA chính */}
          <Button
            size="sm"
            variant="secondary"
            className="w-full bg-white/90 text-black hover:bg-white"
            onClick={handleUseTemplate}
          >
            <Brush size={16} className="mr-1.5" />
            Sử dụng mẫu này
          </Button>
        </div>
      </div>
    </div>
  );
}
