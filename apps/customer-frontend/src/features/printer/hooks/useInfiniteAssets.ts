// apps/customer-frontend/src/features/printer/hooks/useInfiniteAssets.ts
// ✨ SMART PIPELINE: Infinite scroll cho Assets

import { useInfiniteQuery } from "@tanstack/react-query";
import api from "@/shared/lib/axios";
import { Asset } from "@/types/asset";

interface UseInfiniteAssetsFilters {
  search?: string;
  category?: string;
}

interface AssetsPageResponse {
  privateAssets: Asset[];
  publicAssets: Asset[];
  hasMore: boolean;
  total: number;
  page: number;
}

/**
 * ✨ INFINITE ASSETS HOOK
 * - Infinite scroll pagination
 * - Load 20 items mỗi lần
 * - Filter by search & category
 */
export function useInfiniteAssets(filters: UseInfiniteAssetsFilters = {}) {
  return useInfiniteQuery<AssetsPageResponse>({
    queryKey: ["assets", "infinite", filters],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await api.get("/assets/my-assets", {
        params: {
          page: pageParam,
          limit: 20,
          search: filters.search,
          category: filters.category,
        },
      });

      const data = res.data.data;

      // Backend response format: { privateAssets: [], publicAssets: [] }
      // Transform to include pagination info
      const privateAssets = data.privateAssets || [];
      const publicAssets = data.publicAssets || [];
      const allAssets = [...privateAssets, ...publicAssets];

      return {
        privateAssets,
        publicAssets,
        hasMore: allAssets.length === 20, // If we got 20 items, there might be more
        total: allAssets.length,
        page: pageParam as number,
      };
    },
    getNextPageParam: (lastPage, allPages) => {
      // If last page has less than 20 items, no more pages
      if (!lastPage.hasMore) {
        return undefined;
      }
      return allPages.length + 1;
    },
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Helper: Flatten all pages into single array
 */
export function flattenAssetPages(
  data: { pages: AssetsPageResponse[] } | undefined
) {
  if (!data) return { privateAssets: [], publicAssets: [], allAssets: [] };

  const privateAssets = data.pages.flatMap((page) => page.privateAssets);
  const publicAssets = data.pages.flatMap((page) => page.publicAssets);
  const allAssets = [...privateAssets, ...publicAssets];

  return { privateAssets, publicAssets, allAssets };
}

