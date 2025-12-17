// src/features/shop/hooks/useShop.ts (CẬP NHẬT)
// ✅ Updated to use CatalogProduct from admin-backend

import { useState, useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Product } from "@/types/product";
import {
  CatalogProduct,
  catalogProductToProduct,
} from "@/types/catalog-product";
import api from "@/shared/lib/axios";
import { toast } from "@/shared/utils/toast";
import { categoryIcons } from "../utils/categoryIcons";

// (Định nghĩa Taxonomy và categories)
export interface SubCategory {
  value: string;
  label: string;
}
export interface TaxonomyNode {
  value: string;
  label: string;
  icon: string;
  children: SubCategory[];
}
// ✅ SỬA: Bổ sung icon key cho taxonomy
const taxonomy: TaxonomyNode[] = [
  {
    value: "business-card",
    label: "Danh thiếp & Thẻ",
    icon: "business-card", // Key cho categoryIcons
    children: [
      { value: "standard-bc", label: "Danh thiếp chuẩn" },
      { value: "premium-bc", label: "Danh thiếp cao cấp" },
      { value: "plastic-card", label: "Thẻ nhựa PVC" },
      { value: "name-tag", label: "Thẻ tên nhân viên" },
    ],
  },
  {
    value: "packaging",
    label: "Bao bì & Hộp",
    icon: "packaging", // Key cho categoryIcons
    children: [
      { value: "paper-box", label: "Hộp giấy" },
      { value: "paper-bag", label: "Túi giấy" },
      { value: "zipper-bag", label: "Túi Zipper" },
      { value: "shipping-box", label: "Hộp carton" },
    ],
  },
  {
    value: "t-shirt",
    label: "Quần áo & Đồng phục",
    icon: "t-shirt", // Key cho categoryIcons
    children: [
      { value: "t-shirt", label: "Áo thun (T-shirt)" },
      { value: "polo-shirt", label: "Áo Polo" },
      { value: "hoodie", label: "Áo Hoodie" },
      { value: "cap", label: "Mũ/Nón" },
    ],
  },
  {
    value: "banner",
    label: "Marketing & Sự kiện",
    icon: "banner", // Key cho categoryIcons
    children: [
      { value: "flyer", label: "Tờ rơi (Flyer)" },
      { value: "brochure", label: "Brochure / Catalogue" },
      { value: "standee", label: "Standee" },
      { value: "banner", label: "Banner / Backdrop" },
      { value: "poster", label: "Poster" },
    ],
  },
];
// Dữ liệu sẽ lấy từ API
const categories = [
  { value: "all", label: "Tất cả" },
  { value: "banner", label: "Banner" },
];

/**
 * Tải sản phẩm THEO TRANG (cho infinite query)
 */
const fetchPaginatedProducts = async ({
  pageParam = 1,
  category,
  sort,
  search,
}: {
  pageParam?: number;
  category: string;
  sort: string;
  search: string;
}) => {
  try {
    console.log("🔍 [useShop] Fetching products:", {
      pageParam,
      category,
      sort,
      search,
    });

    const res = await api.get("/products", {
      params: {
        page: pageParam,
        limit: 20, // Tải 20 sản phẩm mỗi lần
        category: category !== "all" ? category : undefined,
        sort: sort,
        search: search || undefined,
      },
    });

    console.log("📦 [useShop] Raw response:", res.data);

    // ✅ Backend trả về: { success: true, data: { data: [], page: 1, totalPages: 5 } }
    // data.data là mảng CatalogProduct từ admin-backend
    const catalogProducts: CatalogProduct[] = res.data?.data?.data || [];
    const page = res.data?.data?.page || pageParam;
    const totalPages = res.data?.data?.totalPages || 1;

    console.log(
      `📊 [useShop] Parsed: ${catalogProducts.length} products (page ${page}/${totalPages})`
    );

    // ✅ Convert CatalogProduct to Product format for compatibility
    const productsWithAssets: Product[] = catalogProducts.map((p) =>
      catalogProductToProduct(p)
    );

    return {
      products: productsWithAssets,
      nextPage: page < totalPages ? page + 1 : undefined,
    };
  } catch (err: any) {
    console.error("❌ Error fetching paginated products:", err);
    toast.error("Không thể tải sản phẩm");
    throw new Error("Không thể tải sản phẩm");
  }
};

export const useShop = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("popular");

  const handleSearchSubmit = (prompt: string) => {
    setSearchTerm(prompt.toLowerCase());
  };

  // ✅ THAY THẾ: Bằng useInfiniteQuery
  const {
    data,
    isLoading: loading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["products", "all", selectedCategory, sortBy, searchTerm],
    queryFn: ({ pageParam }) =>
      fetchPaginatedProducts({
        pageParam,
        category: selectedCategory,
        sort: sortBy,
        search: searchTerm,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    // ✅ FIX: Thêm retry logic để tránh retry khi bị rate limit
    retry: (failureCount, error: any) => {
      // Không retry khi bị rate limit (429)
      if (error?.response?.status === 429) {
        return false;
      }
      return failureCount < 2; // Chỉ retry tối đa 2 lần cho các lỗi khác
    },
    // ✅ FIX: Tắt refetch khi focus để tránh spam requests
    refetchOnWindowFocus: false,
  });

  // ✅ SỬA: `products` giờ là list phẳng (flat list) từ các trang
  const products = useMemo(
    () => data?.pages.flatMap((page) => page.products) ?? [],
    [data]
  );

  return {
    products, // Danh sách sản phẩm đã tải
    loading,
    handleSearchSubmit,
    categories,
    taxonomy,
    selectedCategory,
    onCategoryChange: setSelectedCategory,
    sortBy,
    setSortBy,
    // ✅ TRẢ VỀ: Các hàm điều khiển cuộn vô tận
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  };
};
