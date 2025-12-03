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
      try {
        const response = await api.get(
          `/chat/conversations/${conversationId}/business-context`
        );
        return response.data?.data || { activeOrders: [], designFiles: [] };
      } catch (error) {
        console.warn("[BusinessContext] Failed to fetch:", error);
        // Return empty data instead of throwing
        return { activeOrders: [], designFiles: [] };
      }
    },
    enabled: !!conversationId && enabled,
    staleTime: 30000, // 30 seconds
    retry: 1, // Only retry once
  });
}
