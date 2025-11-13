// src/features/printer/schemas/productWizardSchema.ts
import * as z from "zod";

// --- Schemas ---
export const pricingSchema = z.object({
  minQuantity: z.number().min(1, "Số lượng tối thiểu phải lớn hơn 0"),
  pricePerUnit: z.number().min(100, "Giá phải lớn hơn 100đ"),
});

export const fileSchema = z
  .custom<File>((v) => v instanceof File, "File không hợp lệ")
  .refine((file) => file.size <= 5 * 1024 * 1024, `Ảnh tối đa 5MB.`);

export const productWizardSchema = z.object({
  assetId: z.string().min(1, "Bạn phải chọn một phôi"),
  name: z.string().min(5, "Tên sản phẩm phải có ít nhất 5 ký tự"),
  description: z.string().optional(),
  category: z.string().min(1, "Vui lòng chọn danh mục"),
  images: z
    .array(fileSchema)
    .min(1, "Cần ít nhất 1 ảnh sản phẩm.")
    .max(5, "Tối đa 5 ảnh."),
  pricing: z.array(pricingSchema).min(1, "Phải có ít nhất 1 bậc giá"),
  isActive: z.boolean(),
});

export type ProductWizardFormValues = z.infer<typeof productWizardSchema>;
