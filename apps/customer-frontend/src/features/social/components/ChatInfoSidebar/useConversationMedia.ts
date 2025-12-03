// useConversationMedia.ts
import { useQuery } from "@tanstack/react-query";
import api from "@/shared/lib/axios";

export function useConversationMedia(conversationId: string) {
  return useQuery({
    queryKey: ["conversationMedia", conversationId],
    queryFn: async () => {
      try {
        const response = await api.get(
          `/chat/conversations/${conversationId}/media`
        );
        return response.data?.data || { media: [] };
      } catch (error) {
        console.warn("[ConversationMedia] Failed to fetch:", error);
        // Return empty data instead of throwing
        return { media: [] };
      }
    },
    enabled: !!conversationId,
    staleTime: 60000, // 1 minute
    retry: 1, // Only retry once
  });
}
