// src/features/chat/hooks/useInspirationFeed.ts
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/shared/lib/axios";
import { Product } from "@/types/product";
import { InspirationPin } from "@/features/shop/components/InspirationPinCard";

// Kiểu dữ liệu cho một item trong feed
export type FeedItem = (Product | InspirationPin) & { feedId: string };

// === DỮ LIỆU GIẢ (MOCK) CHO AI PINS ===
// (Sau này chúng ta sẽ thay thế bằng API gọi AI thật)
const mockAiPins: InspirationPin[] = [
  {
    id: "ai_pin_1",
    type: "inspiration",
    imageUrl:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    prompt: "thiết kế name card gradient 3D trừu tượng",
  },
  {
    id: "ai_pin_2",
    type: "inspiration",
    imageUrl:
      "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    prompt: "poster sự kiện âm nhạc phong cách floral vintage",
  },
  {
    id: "ai_pin_3",
    type: "inspiration",
    imageUrl:
      "https://images.unsplash.com/photo-1606166316829-b3d633c6e262?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    prompt: "thiết kế bao bì hộp giấy kraft tối giản",
  },
];
// === KẾT THÚC DỮ LIỆU GIẢ ===

/**
 * Hook để tải danh sách sản phẩm public
 */
const usePublicProducts = () => {
  return useQuery<Product[]>({
    queryKey: ["products", "all"], // Dùng chung cache với useShop
    queryFn: async () => {
      const res = await api.get("/products"); // API public, không cần auth
      return res.data?.data?.products || [];
    },
    staleTime: 1000 * 60 * 10, // Cache 10 phút
  });
};

/**
 * Hook chính: Trộn sản phẩm và ghim AI
 */
export const useInspirationFeed = () => {
  const { data: products = [], isLoading: isLoadingProducts } =
    usePublicProducts();

  // Sử dụng useMemo để trộn và xáo trộn danh sách
  const items = useMemo((): FeedItem[] => {
    // Gán feedId duy nhất cho từng loại
    const productItems: FeedItem[] = products.map((p) => ({
      ...p,
      feedId: `product_${p._id}`,
    }));

    const pinItems: FeedItem[] = mockAiPins.map((p) => ({
      ...p,
      feedId: `pin_${p.id}`,
    }));

    // Trộn 2 mảng lại và xáo trộn
    const combined = [...productItems, ...pinItems];
    return combined.sort(() => 0.5 - Math.random());
  }, [products]);

  return {
    items,
    isLoading: isLoadingProducts,
  };
};
