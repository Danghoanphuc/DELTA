// features/shop/hooks/useShop.ts
// ✅ BÀN GIAO: Refactor sang React Query (Bước 2)

import { useState, useMemo } from "react"; // ✅ Bỏ useEffect
import { useQuery } from "@tanstack/react-query"; // ✅ Thêm useQuery
import { Product, PrinterProduct } from "@/types/product";
import api from "@/shared/lib/axios";
import { toast } from "sonner";

// Các danh mục (giữ nguyên)
const categories = [
  { value: "all", label: "Tất cả" },
  { value: "business-card", label: "Danh thiếp" },
  { value: "t-shirt", label: "Áo thun" },
  { value: "packaging", label: "Bao bì" },
  { value: "banner", label: "Banner" },
];

/**
 * Thêm hàm xáo trộn mảng (Fisher-Yates Shuffle)
 * (Giữ nguyên)
 */
function shuffleArray<T>(array: T[]): T[] {
  let currentIndex = array.length,
    randomIndex;
  const newArray = [...array];
  while (currentIndex != 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [newArray[currentIndex], newArray[randomIndex]] = [
      newArray[randomIndex],
      newArray[currentIndex],
    ];
  }
  return newArray;
}

// ✅ Tách hàm gọi API ra riêng
const fetchAllProducts = async (): Promise<Product[]> => {
  try {
    const res = await api.get("/products");
    const products: PrinterProduct[] = res.data?.data?.products || [];
    // Đảm bảo 'assets' luôn tồn tại (như logic cũ)
    const productsWithAssets: Product[] = products.map((p) => ({
      ...p,
      assets: (p as any).assets || { surfaces: [] },
    }));
    return productsWithAssets;
  } catch (err: any) {
    console.error("❌ Error fetching products:", err);
    toast.error("Không thể tải sản phẩm");
    // Ném lỗi để React Query xử lý (retry)
    throw new Error("Không thể tải sản phẩm");
  }
};

export const useShop = () => {
  // ❌ Bỏ useState cho allProducts và loading
  // const [allProducts, setAllProducts] = useState<Product[]>([]);
  // const [loading, setLoading] = useState(true);

  // (Filter/sort states giữ nguyên)
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("popular");

  // ✅ DÙNG useQuery thay thế cho useEffect
  const { data: allProducts = [], isLoading: loading } = useQuery({
    queryKey: ["products", "all"], // "Chìa khóa" cho cache này
    queryFn: fetchAllProducts,
    // staleTime: 5 phút (đã được set ở default trong main.tsx)
  });

  // ❌ Bỏ useEffect fetch data
  // useEffect(() => { ... }, []);

  const handleSearchSubmit = (prompt: string) => {
    setSearchTerm(prompt.toLowerCase());
  };

  // ✅ Logic filter/sort giữ nguyên
  // Nó sẽ tự động chạy lại khi 'allProducts' (là data từ useQuery) thay đổi
  const filteredProducts = useMemo(() => {
    let products = [...allProducts];

    // 1. Lọc (Filter) - Giữ nguyên
    if (selectedCategory !== "all") {
      products = products.filter((p) => p.category === selectedCategory);
    }
    if (searchTerm.trim()) {
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm) ||
          p.description?.toLowerCase().includes(searchTerm) ||
          p.specifications?.material?.toLowerCase().includes(searchTerm)
      );
    }

    // 2. Sắp xếp (Sort) hoặc Xáo trộn (Shuffle)
    switch (sortBy) {
      case "price-asc":
        products.sort((a, b) => {
          const priceA =
            a.pricing.reduce(
              (min, p) => Math.min(min, p.pricePerUnit),
              Infinity
            ) || 0;
          const priceB =
            b.pricing.reduce(
              (min, p) => Math.min(min, p.pricePerUnit),
              Infinity
            ) || 0;
          return priceA - priceB;
        });
        break;
      case "price-desc":
        products.sort((a, b) => {
          const priceA =
            a.pricing.reduce(
              (min, p) => Math.min(min, p.pricePerUnit),
              Infinity
            ) || 0;
          const priceB =
            b.pricing.reduce(
              (min, p) => Math.min(min, p.pricePerUnit),
              Infinity
            ) || 0;
          return priceB - priceA;
        });
        break;

      // ✅ SỬA: "newest" và "popular" sẽ dùng logic riêng
      case "newest":
        products.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;

      case "popular": // "Liên quan" / "Bán chạy"
        products.sort((a, b) => (b.totalSold || 0) - (a.totalSold || 0));
        break;

      default:
        // Fallback về "popular"
        products.sort((a, b) => (b.totalSold || 0) - (a.totalSold || 0));
        break;
    }

    return products;
  }, [allProducts, selectedCategory, searchTerm, sortBy]);

  return {
    products: filteredProducts,
    loading, // ✅ Trả về isLoading từ useQuery
    handleSearchSubmit,
    categories,
    selectedCategory,
    onCategoryChange: setSelectedCategory,
    sortBy,
    setSortBy,
  };
};
