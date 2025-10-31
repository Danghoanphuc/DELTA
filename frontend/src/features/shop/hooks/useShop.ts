// features/shop/hooks/useShop.ts (✅ FIXED VERSION)
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

  // ✅ FIX: SINGLE EFFECT WITH ABORT CONTROLLER AND DEBOUNCE
  useEffect(() => {
    const controller = new AbortController();
    
    // ✅ Debounce cho search, immediate cho filter/sort
    const delay = searchTerm ? 500 : 0;
    
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.get("/products", {
          params: {
            category: selectedCategory !== "all" ? selectedCategory : undefined,
            search: searchTerm || undefined,
            sort: sortBy,
          },
          signal: controller.signal, // ✅ Support cancellation
        });
        
        setProducts(res.data?.data?.products || []);
      } catch (err: any) {
        // ✅ Ignore AbortError
        if (err.name === "AbortError" || err.name === "CanceledError") {
          return;
        }
        
        console.error("❌ Error fetching products:", err);
        toast.error("Không thể tải sản phẩm");
      } finally {
        setLoading(false);
      }
    }, delay);

    // ✅ Cleanup: Cancel both timer and request
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchTerm, selectedCategory, sortBy]); // ✅ Single dependency array

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
