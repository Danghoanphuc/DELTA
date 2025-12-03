// useConversationFiles.ts
import { useQuery } from "@tanstack/react-query";
import api from "@/shared/lib/axios";

export function useConversationFiles(conversationId: string) {
  return useQuery({
    queryKey: ["conversationFiles", conversationId],
    queryFn: async () => {
      try {
        const response = await api.get(
          `/chat/conversations/${conversationId}/files`
        );
        return response.data?.data || { files: [] };
      } catch (error) {
        console.warn("[ConversationFiles] Failed to fetch:", error);
        // Return empty data instead of throwing
        return { files: [] };
      }
    },
    enabled: !!conversationId,
    staleTime: 60000, // 1 minute
    retry: 1, // Only retry once
  });
}
