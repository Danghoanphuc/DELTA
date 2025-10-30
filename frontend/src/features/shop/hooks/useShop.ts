// features/shop/hooks/useShop.ts
import { useState, useEffect } from "react";
import { PrinterProduct } from "@/types/product";
import api from "@/shared/lib/axios";
import { toast } from "sonner";

export const useShop = () => {
  const [products, setProducts] = useState<PrinterProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");

  const categories = [
    { value: "all", label: "Tất cả" },
    { value: "business-card", label: "Danh thiếp" },
    { value: "flyer", label: "Tờ rơi" },
    { value: "banner", label: "Banner" },
    { value: "brochure", label: "Brochure" },
    { value: "sticker", label: "Sticker" },
    { value: "packaging", label: "Bao bì" },
    { value: "other", label: "Khác" },
  ];

  // Fetch ban đầu và khi lọc
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await api.get("/products", {
          params: {
            category: selectedCategory !== "all" ? selectedCategory : undefined,
            search: searchTerm || undefined,
            sort: sortBy,
          },
        });
        setProducts(res.data?.data?.products || []);
      } catch (err: any) {
        console.error("❌ Error fetching products:", err);
        toast.error("Không thể tải sản phẩm");
      } finally {
        setLoading(false);
      }
    };

    // Chỉ fetch khi không có search term (để debounce search xử lý)
    if (!searchTerm) {
      fetchProducts();
    }
  }, [selectedCategory, sortBy]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      api
        .get("/products", {
          params: {
            category: selectedCategory !== "all" ? selectedCategory : undefined,
            search: searchTerm || undefined,
            sort: sortBy,
          },
        })
        .then((res) => setProducts(res.data?.data?.products || []))
        .catch(() => toast.error("Không thể tìm kiếm"))
        .finally(() => setLoading(false));
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, selectedCategory, sortBy]);

  return {
    products,
    loading,
    categories,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    sortBy,
    setSortBy,
  };
};
