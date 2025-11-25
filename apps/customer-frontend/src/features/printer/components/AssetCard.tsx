// src/features/printer/components/AssetCard.tsx
import { Check, Eye, Globe, Lock } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/lib/utils";

interface Asset {
  _id: string;
  name: string;
  category: string;
  images?: Array<{ url: string; publicId?: string }>;
  assets: {
    surfaces: any[];
  };
  isPublic?: boolean;
}

interface AssetCardProps {
  asset: Asset;
  isSelected: boolean;
  onClick: () => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  "business-card": "Danh thiếp",
  "flyer": "Tờ rơi",
  "banner": "Banner",
  "brochure": "Brochure",
  "t-shirt": "Áo thun",
  "mug": "Cốc/Ly",
  "sticker": "Sticker",
  "packaging": "Bao bì",
  "other": "Khác",
};

export function AssetCard({ asset, isSelected, onClick }: AssetCardProps) {
  const thumbnailUrl = asset.images?.[0]?.url || "/placeholder-3d-model.png";
  const surfaceCount = asset.assets?.surfaces?.length || 0;

  return (
    <button
      type="button" // ✅ QUAN TRỌNG 1: Khai báo rõ đây không phải nút submit
      onClick={(e) => {
        e.preventDefault();  // ✅ QUAN TRỌNG 2: Chặn hành vi mặc định
        e.stopPropagation(); // ✅ QUAN TRỌNG 3: Chặn sự kiện lan ra Form cha
        onClick();
      }}
      className={cn(
        "relative group rounded-xl overflow-hidden border-2 transition-all w-full text-left", // Thêm text-left cho đẹp
        "hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]",
        isSelected
          ? "border-blue-600 ring-4 ring-blue-100 dark:ring-blue-900"
          : "border-gray-200 dark:border-gray-700 hover:border-blue-300"
      )}
    >
      {/* ... (Phần nội dung bên trong giữ nguyên không đổi) ... */}
      <div className="aspect-square bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
        <img
          src={thumbnailUrl}
          alt={asset.name}
          className="w-full h-full object-cover transition-transform group-hover:scale-110"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/placeholder-3d-model.png";
          }}
        />
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Eye className="w-8 h-8 text-white" />
        </div>
        {isSelected && (
          <div className="absolute top-2 right-2 w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center shadow-lg animate-in zoom-in duration-200">
            <Check className="w-4 h-4 text-white" strokeWidth={3} />
          </div>
        )}
        <div className="absolute top-2 left-2">
          {asset.isPublic ? (
            <Badge className="bg-green-500 hover:bg-green-600 text-white text-xs gap-1">
              <Globe className="w-3 h-3" />
              Phôi chung
            </Badge>
          ) : (
            <Badge variant="secondary" className="text-xs gap-1">
              <Lock className="w-3 h-3" />
              Riêng tư
            </Badge>
          )}
        </div>
      </div>

      <div className="p-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
        <h4 className="font-semibold text-sm truncate text-left mb-2">
          {asset.name}
        </h4>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-xs">
            {CATEGORY_LABELS[asset.category] || asset.category}
          </Badge>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {surfaceCount} mặt in
          </span>
        </div>
      </div>
    </button>
  );
}