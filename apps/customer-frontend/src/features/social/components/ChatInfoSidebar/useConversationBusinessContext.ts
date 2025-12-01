// useConversationBusinessContext.ts
import { useQuery } from "@tanstack/react-query";
import api from "@/shared/lib/axios";

export function useConversationBusinessContext(
  conversationId: string,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ["businessContext", conversationId],
    queryFn: async () => {
      const response = await api.get(
        `/social/conversations/${conversationId}/business-context`
      );
      return response.data.data;
    },
    enabled: !!conversationId && enabled,
    staleTime: 30000, // 30 seconds
  });
}
