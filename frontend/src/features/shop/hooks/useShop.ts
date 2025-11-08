// features/shop/hooks/useShop.ts (ĐÃ CẬP NHẬT - Thêm Shuffle)
import { useState, useEffect, useMemo } from "react";
import { Product, PrinterProduct } from "@/types/product";
import api from "@/shared/lib/axios";
import { toast } from "sonner";

// Các danh mục (giữ nguyên)
const categories = [
  { value: "all", label: "Tất cả" },
  { value: "business-card", label: "Danh thiếp" },
  { value: "t-shirt", label: "Áo thun" },
  { value: "packaging", label: "Bao bì" },
  { value: "banner", label: "Banner" },
];

/**
 * Thêm hàm xáo trộn mảng (Fisher-Yates Shuffle)
 * @param array Mảng đầu vào
 * @returns Một mảng mới đã được xáo trộn
 */
function shuffleArray<T>(array: T[]): T[] {
  let currentIndex = array.length,
    randomIndex;
  const newArray = [...array]; // Tạo bản copy để tránh mutate state gốc

  // Khi vẫn còn phần tử để xáo trộn
  while (currentIndex != 0) {
    // Chọn một phần tử còn lại
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // Và hoán đổi nó với phần tử hiện tại
    [newArray[currentIndex], newArray[randomIndex]] = [
      newArray[randomIndex],
      newArray[currentIndex],
    ];
  }

  return newArray;
}

export const useShop = () => {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest"); // 'newest' là mặc định

  // Tải sản phẩm (giữ nguyên)
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await api.get("/products");
        const products: PrinterProduct[] = res.data?.data?.products || [];
        // Map PrinterProduct to Product by adding a default assets object
        const productsWithAssets: Product[] = products.map((p) => ({
          ...p,
          assets: { surfaces: [] }, // Initialize assets with a default empty object
        }));
        setAllProducts(productsWithAssets);
      } catch (err: any) {
        console.error("❌ Error fetching products:", err);
        toast.error("Không thể tải sản phẩm");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleSearchSubmit = (prompt: string) => {
    setSearchTerm(prompt.toLowerCase());
  };

  // LOGIC LỌC VÀ SẮP XẾP (ĐÃ NÂNG CẤP)
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
        // Sắp xếp giá tăng dần (NGHIÊM TÚC)
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
        // Sắp xếp giá giảm dần (NGHIÊM TÚC)
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
      case "newest":
      case "popular":
      default:
        // MẶC ĐỊNH (newest/popular): XÁO TRỘN (NGẪU NHIÊN)
        // Đây là giải pháp cho yêu cầu của anh
        products = shuffleArray(products);
        break;
    }

    return products;
  }, [allProducts, selectedCategory, searchTerm, sortBy]); // Thêm sortBy vào dependency

  return {
    products: filteredProducts,
    loading,
    handleSearchSubmit,
    categories,
    selectedCategory,
    onCategoryChange: setSelectedCategory,
    sortBy,
    setSortBy, // Trả ra setSortBy (lần trước tôi quên)
  };
};
