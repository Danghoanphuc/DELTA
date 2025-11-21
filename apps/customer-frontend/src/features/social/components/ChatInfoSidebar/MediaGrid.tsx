// apps/customer-frontend/src/features/social/components/ChatInfoSidebar/MediaGrid.tsx
// ✅ Component hiển thị media grid với Lightbox support

import { useQuery } from "@tanstack/react-query";
import { Image as ImageIcon, Loader2 } from "lucide-react";
import { getConversationMedia } from "../../../chat/services/chat.api.service";

interface MediaGridProps {
  conversationId: string;
  onImageClick: (imageUrl: string) => void;
}

export function MediaGrid({ conversationId, onImageClick }: MediaGridProps) {
  const { data: media, isLoading } = useQuery({
    queryKey: ["conversationMedia", conversationId],
    queryFn: () => getConversationMedia(conversationId),
    staleTime: 30000,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="animate-spin text-gray-400" size={20} />
      </div>
    );
  }

  if (!media || media.length === 0) {
    return (
      <div className="text-center py-4 text-xs text-gray-400">Chưa có ảnh hoặc video</div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2 pt-2">
      {media.slice(0, 9).map((item: any) => {
        const imageUrl = item.content?.fileUrl || item.content?.imageUrl;
        return (
          <div
            key={item._id}
            className="aspect-square bg-gray-100 rounded-md overflow-hidden hover:opacity-80 cursor-pointer border border-gray-100 group relative"
            onClick={() => imageUrl && onImageClick(imageUrl)}
          >
            {item.type === "image" && imageUrl ? (
              <img
                src={imageUrl}
                className="w-full h-full object-cover"
                alt="Media"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                <ImageIcon size={20} className="text-gray-400" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

