// src/features/printer/hooks/useAddProductForm.ts
import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
  productTaxonomyDB,
  ProductTaxonomyNode,
} from "@/data/productTaxonomy.data";
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
  taxonomyId: z.string(),
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

export function useAddProductForm(onSuccess: () => void) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTaxonomy, setSelectedTaxonomy] =
    useState<ProductTaxonomyNode | null>(null);

  // (Giả lập, bạn nên dùng API để tải taxonomy)
  const rootCategories = Object.values(productTaxonomyDB);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      description: "",
      taxonomyId: "",
      metadata: {
        dimensions: { length: 0, width: 0, height: 0 },
        material: "",
      },
      pricing: [{ minQuantity: 100, pricePerUnit: 1000 }],
    },
  });

  const { setValue } = form;

  const handleTaxonomyChange = (taxonomyId: string) => {
    const node = productTaxonomyDB[taxonomyId];
    if (!node) {
      toast.error("Lỗi: Không tìm thấy phôi.");
      return;
    }
    setSelectedTaxonomy(node);
    setValue("taxonomyId", node.id);
    setValue("metadata.dimensions", node.metadataSchema.dimensions.default);
    setValue(
      "metadata.material",
      node.metadataSchema.materials[0]?.options[0]?.value || ""
    );
    if (!form.getValues("name")) {
      setValue("name", `In ${node.name} theo yêu cầu`);
    }
  };

  const onSubmit = async (data: ProductFormValues) => {
    if (!selectedTaxonomy) {
      toast.error("Vui lòng chọn một loại sản phẩm (phôi) trước.");
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
    selectedTaxonomy,
    rootCategories,
    handleTaxonomyChange,
    onSubmit,
    onError,
  };
}
