// src/features/printer/hooks/useAddProductForm.ts
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "@/shared/utils/toast";
import {
  printzCategories,
  type PrintZCategory,
  type SubCategory,
} from "@/data/categories.data";
// Giả sử bạn tạo service này
// import * as productService from "@/services/productService";

// ... (Toàn bộ Schemas nên được định nghĩa ở đây, không phải trong component) ...
const pricingSchema = z.object({
  minQuantity: z.number().min(1, "Số lượng tối thiểu phải lớn hơn 0"),
  pricePerUnit: z.number().min(100, "Giá phải lớn hơn 100đ"),
});

const productFormSchema = z.object({
  name: z.string().min(5, "Tên sản phẩm phải có ít nhất 5 ký tự"),
  description: z.string().optional(),
  categoryValue: z.string().min(1, "Vui lòng chọn danh mục"),
  subcategoryValue: z.string().optional(),
  metadata: z.object({
    dimensions: z.object({
      length: z.number(),
      width: z.number(),
      height: z.number(),
    }),
    material: z.string().min(1, "Vui lòng chọn chất liệu"),
  }),
  pricing: z.array(pricingSchema).min(1, "Phải có ít nhất 1 bậc giá"),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;

type CategoryMetadataPreset = {
  dimensions: { length: number; width: number; height: number };
  material: string;
};

const FALLBACK_METADATA: CategoryMetadataPreset = {
  dimensions: { length: 10, width: 10, height: 1 },
  material: "custom",
};

const categoryMetadataPresets: Record<string, CategoryMetadataPreset> = {
  tshirts: {
    dimensions: { length: 72, width: 52, height: 1 },
    material: "cotton_240gsm",
  },
  "tet-holiday-cards": {
    dimensions: { length: 20, width: 9, height: 0.1 },
    material: "artpaper_300gsm",
  },
  "business-cards": {
    dimensions: { length: 9, width: 5.5, height: 0.05 },
    material: "artpaper_350gsm",
  },
  "promotional-products": {
    dimensions: { length: 12, width: 12, height: 20 },
    material: "merch_mix",
  },
  packaging: {
    dimensions: { length: 25, width: 15, height: 10 },
    material: "ivory_350gsm",
  },
  "signage-banners": {
    dimensions: { length: 80, width: 200, height: 0.2 },
    material: "pp_backlit",
  },
  "labels-stickers": {
    dimensions: { length: 10, width: 10, height: 0.05 },
    material: "decal_art",
  },
  "postcards-marketing": {
    dimensions: { length: 21, width: 10, height: 0.05 },
    material: "fort_250gsm",
  },
  "calendar-gifts": {
    dimensions: { length: 30, width: 20, height: 2 },
    material: "couch_210gsm",
  },
};

export function useAddProductForm(onSuccess: () => void) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<PrintZCategory | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] =
    useState<SubCategory | null>(null);

  // (Giả lập, bạn nên dùng API để tải taxonomy)
  const rootCategories = printzCategories;

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      description: "",
      categoryValue: "",
      subcategoryValue: "",
      metadata: {
        dimensions: { length: 0, width: 0, height: 0 },
        material: "",
      },
      pricing: [{ minQuantity: 100, pricePerUnit: 1000 }],
    },
  });

  const { setValue } = form;

  const handleCategoryChange = (categoryValue: string) => {
    const category = printzCategories.find(
      (cat) => cat.value === categoryValue
    );
    if (!category) {
      toast.error("Lỗi: Không tìm thấy danh mục.");
      return;
    }
    setSelectedCategory(category);
    setSelectedSubcategory(null);
    setValue("categoryValue", category.value);
    setValue("subcategoryValue", "");

    const preset = categoryMetadataPresets[category.value] ?? FALLBACK_METADATA;
    setValue("metadata.dimensions", preset.dimensions);
    setValue("metadata.material", preset.material);

    if (!form.getValues("name")) {
      setValue("name", `In ${category.label} theo yêu cầu`);
    }
  };

  const handleSubcategoryChange = (subcategoryValue: string) => {
    if (!selectedCategory) {
      toast.error("Vui lòng chọn danh mục trước.");
      return;
    }

    const subcategory = selectedCategory.subcategories.find(
      (sub) => sub.value === subcategoryValue
    );

    if (!subcategory) {
      toast.error("Không tìm thấy phân loại.");
      return;
    }

    setSelectedSubcategory(subcategory);
    setValue("subcategoryValue", subcategory.value);

    const currentName = form.getValues("name");
    if (!currentName || currentName.startsWith("In ")) {
      setValue("name", `${subcategory.label} theo yêu cầu`);
    }
  };

  const onSubmit = async (data: ProductFormValues) => {
    if (!selectedCategory) {
      toast.error("Vui lòng chọn danh mục sản phẩm trước.");
      return;
    }
    setIsSubmitting(true);

    // ... (Toàn bộ logic FormData và gọi API nằm ở đây) ...
    // const formData = new FormData();
    // ... (append data) ...
    try {
      // await productService.createProduct(formData); // <-- Gọi service
      console.log("Submitting:", data);
      toast.success("🎉 Thêm sản phẩm thành công!");
      onSuccess();
    } catch (err: any) {
      console.error("❌ Error creating product:", err);
      toast.error(err.response?.data?.message || "Không thể thêm sản phẩm.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onError = (errors: any) => {
    console.error("❌ Form validation errors:", errors);
    toast.error("Dữ liệu nhập chưa hợp lệ. Vui lòng kiểm tra lại.");
  };

  return {
    form,
    isSubmitting,
    selectedCategory,
    selectedSubcategory,
    rootCategories,
    handleCategoryChange,
    handleSubcategoryChange,
    onSubmit,
    onError,
  };
}
