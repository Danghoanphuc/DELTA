// apps/admin-frontend/src/pages/ProductFormPage.tsx
// ✅ Product Form Page - Create/Edit Product (Storytelling Version)

import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { StorytellingProductForm } from "../components/products/StorytellingProductForm";
import { StorytellingProductFormData } from "../types/storytelling-product";
import { catalogService } from "../services/catalog.service";
import { toast } from "sonner";

export default function ProductFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [initialData, setInitialData] =
    useState<Partial<StorytellingProductFormData>>();

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
      const productData = product as any;

      setInitialData({
        // Basic Info
        name: product.name,
        categoryId:
          typeof product.categoryId === "string"
            ? product.categoryId
            : product.categoryId._id,
        sku: product.sku || "",
        slug: product.slug || "",
        description: product.description || "",
        tags: product.tags || [],

        // Hero Section
        tagline: productData.tagline || "",
        heroMedia: productData.heroMedia,

        // Introduction
        craftingTime: productData.craftingTime,
        technique: productData.technique,
        productionLimit: productData.productionLimit,
        certification: productData.certification,

        // Storytelling
        story: productData.story,

        // Gallery
        images:
          product.images?.map((img: any) => ({
            url: img.url,
            isPrimary: img.isPrimary || false,
            alt: img.alt,
          })) || [],

        // Feng Shui
        fengShui: productData.fengShui,

        // Customization
        customization: productData.customization,

        // Artisan
        artisan: productData.artisan,

        // Client Logos
        clientLogos: productData.clientLogos || [],

        // Pricing
        basePrice: product.basePrice,
        salePrice: productData.salePrice,
        stock: product.stockQuantity || 0,
        lowStockThreshold: productData.lowStockThreshold || 10,
        isActive: product.status === "active",
        isPublished: product.isPublished || false,
        isFeatured: product.isFeatured || false,
      });
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Không thể tải thông tin sản phẩm"
      );
      navigate("/catalog/products");
    } finally {
      setIsFetching(false);
    }
  };

  const handleSubmit = async (data: StorytellingProductFormData) => {
    setIsLoading(true);
    try {
      // Transform data to match CatalogProduct model
      const productData: any = {
        name: data.name,
        categoryId: data.categoryId,
        sku: data.sku,
        slug: data.slug,
        description: data.description,
        tags: data.tags,

        // Storytelling fields
        tagline: data.tagline,
        heroMedia: data.heroMedia,
        craftingTime: data.craftingTime,
        technique: data.technique,
        productionLimit: data.productionLimit,
        certification: data.certification,
        story: data.story,
        fengShui: data.fengShui,
        customization: data.customization,
        artisan: data.artisan,
        clientLogos: data.clientLogos,

        // Pricing
        basePrice: data.basePrice,
        salePrice: data.salePrice,
        stockQuantity: data.stock,
        lowStockThreshold: data.lowStockThreshold,
        isPublished: data.isPublished,
        isFeatured: data.isFeatured,
        status: data.isPublished ? "active" : "draft",

        // Images
        images: data.images.map((img, idx) => ({
          url: img.url,
          alt: img.alt,
          isPrimary: img.isPrimary,
          sortOrder: idx,
        })),
      };

      console.log(
        "[ProductFormPage] Submitting storytelling product:",
        productData
      );

      if (isEdit && id) {
        await catalogService.updateProduct(id, productData);
        toast.success("Đã cập nhật sản phẩm thành công!");
      } else {
        await catalogService.createProduct(productData);
        toast.success("Đã tạo sản phẩm mới thành công!");
      }
      navigate("/catalog/products");
    } catch (error: any) {
      console.error("[ProductFormPage] Error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        `Không thể ${isEdit ? "cập nhật" : "tạo"} sản phẩm`;
      toast.error(errorMessage);
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
        <StorytellingProductForm
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
