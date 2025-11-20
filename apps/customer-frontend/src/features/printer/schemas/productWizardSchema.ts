// src/features/printer/schemas/productWizardSchema.ts
// ✨ SMART PIPELINE: Strict pricing validation
import * as z from "zod";

// --- Schemas ---
export const pricingSchema = z.object({
  minQuantity: z.number().min(1, "Số lượng tối thiểu phải lớn hơn 0"),
  pricePerUnit: z.number().min(100, "Giá phải lớn hơn 100đ"),
});

export const fileSchema = z
  .custom<File>((v) => v instanceof File, "File không hợp lệ")
  .refine((file) => file.size <= 5 * 1024 * 1024, `Ảnh tối đa 5MB.`);

// ✨ SMART PIPELINE: Image URL schema (for async upload)
export const imageUrlSchema = z.object({
  url: z.string().url("URL không hợp lệ"),
  publicId: z.string().optional(),
  isPrimary: z.boolean().optional(),
});

// ✨ SMART PIPELINE: Hybrid schema - Accept both File and URL
export const imageSchema = z.union([
  fileSchema,        // File object (for sync upload)
  imageUrlSchema,    // URL object (for async upload)
]);

// ✨ SMART PIPELINE: Strict pricing validation
// Validate: Giá phải giảm khi số lượng tăng
const pricingArraySchema = z
  .array(pricingSchema)
  .min(1, "Phải có ít nhất 1 bậc giá")
  .refine(
    (pricing) => {
      // Sort by minQuantity
      const sorted = [...pricing].sort((a, b) => a.minQuantity - b.minQuantity);

      // Check if pricePerUnit decreases as minQuantity increases
      for (let i = 1; i < sorted.length; i++) {
        if (sorted[i].pricePerUnit >= sorted[i - 1].pricePerUnit) {
          return false;
        }
      }

      return true;
    },
    {
      message:
        "Giá phải giảm dần khi số lượng tăng (ví dụ: 100 chiếc = 1000đ, 500 chiếc = 800đ)",
    }
  )
  .refine(
    (pricing) => {
      // Check for duplicate minQuantity
      const quantities = pricing.map((p) => p.minQuantity);
      const uniqueQuantities = new Set(quantities);
      return quantities.length === uniqueQuantities.size;
    },
    {
      message: "Không được có 2 bậc giá với cùng số lượng tối thiểu",
    }
  );

export const productWizardSchema = z.object({
  assetId: z.string().min(1, "Bạn phải chọn một phôi"),
  name: z.string().min(5, "Tên sản phẩm phải có ít nhất 5 ký tự"),
  description: z.string().optional(),
  tags: z.array(z.string()).max(10, "Tối đa 10 tags").optional(), // ✨ NEW: AI-powered tags
  category: z.string().min(1, "Vui lòng chọn danh mục hệ thống"),
  categoryDisplay: z.string().min(1, "Vui lòng chọn danh mục PrintZ"),
  subcategory: z.string().optional(),
  images: z
    .array(imageSchema) // ✨ CHANGED: Support both File and URL
    .min(1, "Cần ít nhất 1 ảnh sản phẩm.")
    .max(10, "Tối đa 10 ảnh."),
  pricing: pricingArraySchema, // ✅ Use strict validation
  isActive: z.boolean(),
});

export type ProductWizardFormValues = z.infer<typeof productWizardSchema>;
