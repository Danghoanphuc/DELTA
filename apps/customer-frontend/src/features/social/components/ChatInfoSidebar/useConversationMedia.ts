// useConversationMedia.ts
import { useQuery } from "@tanstack/react-query";
import api from "@/shared/lib/axios";

export function useConversationMedia(conversationId: string) {
  return useQuery({
    queryKey: ["conversationMedia", conversationId],
    queryFn: async () => {
      const response = await api.get(
        `/social/conversations/${conversationId}/media`
      );
      return response.data.data;
    },
    enabled: !!conversationId,
    staleTime: 60000, // 1 minute
  });
}
