// apps/admin-frontend/src/pages/ProductFormPage.tsx
// ✅ Product Form Page - Create/Edit Product

import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import {
  ProductForm,
  ProductFormData,
} from "../components/products/ProductForm";
import { catalogService } from "../services/catalog.service";
import { useToast } from "../hooks/use-toast";

export default function ProductFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [initialData, setInitialData] = useState<Partial<ProductFormData>>();

  // Fetch product data if editing
  useEffect(() => {
    if (isEdit && id) {
      fetchProduct(id);
    }
  }, [isEdit, id]);

  const fetchProduct = async (productId: string) => {
    setIsFetching(true);
    try {
      const product = await catalogService.getProduct(productId);
      setInitialData({
        name: product.name,
        description: product.description,
        category:
          typeof product.categoryId === "string"
            ? product.categoryId
            : product.categoryId._id,
        basePrice: product.basePrice,
        baseCost: product.baseCost,
        moq: 1, // Default MOQ
        status: product.status === "discontinued" ? "inactive" : product.status,
        printMethods: (product as any).printMethods || [],
        pricingTiers: product.pricingTiers || [],
        images: product.images?.map((img) => img.url) || [],
        tags: product.tags || [],
      });
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description:
          error.response?.data?.message || "Không thể tải thông tin sản phẩm",
        variant: "destructive",
      });
      navigate("/catalog/products");
    } finally {
      setIsFetching(false);
    }
  };

  const handleSubmit = async (data: ProductFormData) => {
    setIsLoading(true);
    try {
      // Transform data to match Product interface
      const productData: any = {
        name: data.name,
        description: data.description,
        categoryId: data.category,
        basePrice: data.basePrice,
        baseCost: data.baseCost,
        status: data.status,
        pricingTiers: data.pricingTiers,
        printMethods: data.printMethods,
        tags: data.tags,
        images: data.images.map((url, index) => ({
          url,
          isPrimary: index === 0,
          sortOrder: index,
        })),
      };

      console.log("[ProductFormPage] Submitting product data:", productData);

      if (isEdit && id) {
        await catalogService.updateProduct(id, productData);
        toast({
          title: "Thành công",
          description: "Đã cập nhật sản phẩm thành công!",
        });
      } else {
        await catalogService.createProduct(productData);
        toast({
          title: "Thành công",
          description: "Đã tạo sản phẩm mới thành công!",
        });
      }
      navigate("/catalog/products");
    } catch (error: any) {
      console.error("[ProductFormPage] Error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        `Không thể ${isEdit ? "cập nhật" : "tạo"} sản phẩm`;
      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/catalog/products");
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/catalog/products")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại danh sách
        </button>
        <h1 className="text-2xl font-bold">
          {isEdit ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
        </h1>
      </div>

      {/* Loading State */}
      {isFetching && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
        </div>
      )}

      {/* Form */}
      {!isFetching && (
        <ProductForm
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
