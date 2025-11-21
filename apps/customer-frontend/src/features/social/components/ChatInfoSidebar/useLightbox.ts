// apps/customer-frontend/src/features/social/components/ChatInfoSidebar/useLightbox.ts
// ✅ Custom hook cho lightbox logic

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getConversationMedia } from "../../../chat/services/chat.api.service";

export function useLightbox(conversationId: string) {
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const { data: mediaList } = useQuery({
    queryKey: ["conversationMedia", conversationId],
    queryFn: () => getConversationMedia(conversationId),
    enabled: !!lightboxImage,
  });

  const openLightbox = (imageUrl: string) => {
    if (!mediaList) return;
    const index = mediaList.findIndex(
      (item: any) => (item.content?.fileUrl || item.content?.imageUrl) === imageUrl
    );
    setLightboxIndex(index >= 0 ? index : 0);
    setLightboxImage(imageUrl);
  };

  const closeLightbox = () => {
    setLightboxImage(null);
  };

  const goToPrev = () => {
    if (!mediaList || mediaList.length === 0) return;
    const newIndex = lightboxIndex > 0 ? lightboxIndex - 1 : mediaList.length - 1;
    setLightboxIndex(newIndex);
    const item = mediaList[newIndex];
    setLightboxImage(item.content?.fileUrl || item.content?.imageUrl);
  };

  const goToNext = () => {
    if (!mediaList || mediaList.length === 0) return;
    const newIndex = lightboxIndex < mediaList.length - 1 ? lightboxIndex + 1 : 0;
    setLightboxIndex(newIndex);
    const item = mediaList[newIndex];
    setLightboxImage(item.content?.fileUrl || item.content?.imageUrl);
  };

  return {
    lightboxImage,
    lightboxIndex,
    mediaList,
    openLightbox,
    closeLightbox,
    goToPrev,
    goToNext,
    hasPrev: lightboxIndex > 0,
    hasNext: lightboxIndex < (mediaList?.length || 0) - 1,
  };
}

