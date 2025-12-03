// MediaGrid.tsx - Grid ảnh với preview modal
import { useState } from "react";
import { Loader2, ImageIcon } from "lucide-react";
import { ImagePreviewModal } from "../SocialChatWindow/ImagePreviewModal";
import { downloadFile } from "./file-utils";
import { toast } from "@/shared/utils/toast";

interface MediaGridProps {
  media: any[];
  isLoading: boolean;
}

export function MediaGrid({ media, isLoading }: MediaGridProps) {
  const [selectedImage, setSelectedImage] = useState<{
    url: string;
    name: string;
  } | null>(null);

  const handleDownload = async () => {
    if (!selectedImage) return;
    try {
      toast.info("Đang tải xuống...");
      await downloadFile(selectedImage.url, selectedImage.name);
      toast.success("Đã tải xuống");
    } catch (error) {
      toast.error("Lỗi khi tải xuống");
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="aspect-square rounded-lg bg-stone-100 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (media.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-stone-200 bg-stone-50 p-8 text-center">
        <ImageIcon className="mx-auto mb-2 text-stone-300" size={24} />
        <p className="text-xs text-stone-400">Chưa có ảnh nào</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-2">
        {media.map((item: any) => (
          <div
            key={item._id}
            className="group aspect-square cursor-pointer overflow-hidden rounded-lg bg-stone-200 relative"
            onClick={() =>
              setSelectedImage({
                url: item.url,
                name: item.name || "Image",
              })
            }
          >
            <img
              src={item.thumbnailUrl || item.url}
              alt={item.name || "Media"}
              className="h-full w-full object-cover transition-transform group-hover:scale-110"
              loading="lazy"
            />
            {/* Overlay khi hover */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <ImageIcon
                size={20}
                className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </div>
          </div>
        ))}
      </div>

      <ImagePreviewModal
        isOpen={!!selectedImage}
        imageUrl={selectedImage?.url || ""}
        imageName={selectedImage?.name}
        onClose={() => setSelectedImage(null)}
        onDownload={handleDownload}
      />
    </>
  );
}
