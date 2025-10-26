// frontend/src/components/printer/AddProductForm.tsx (FIXED API ENDPOINT)

import React from "react";
import { useForm, useFieldArray, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Plus, Trash2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios"; // Assuming axios instance is correctly configured

// --- (Schemas remain the same) ---
const pricingSchema = z.object({
  minQuantity: z.coerce.number().min(1, "Số lượng phải > 0"),
  pricePerUnit: z.coerce.number().min(100, "Giá phải > 100"),
});

const productFormSchema = z.object({
  name: z.string().min(5, "Tên sản phẩm phải có ít nhất 5 ký tự"),
  category: z.string().min(1, "Vui lòng chọn danh mục"),
  description: z.string().optional(),
  specifications: z.object({
    material: z.string().optional(),
    size: z.string().optional(),
    color: z.string().optional(),
  }),
  pricing: z.array(pricingSchema).min(1, "Phải có ít nhất 1 bậc giá"),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

interface AddProductFormProps {
  onFormClose: () => void;
  onProductAdded: () => void;
}

export function AddProductForm({
  onFormClose,
  onProductAdded,
}: AddProductFormProps) {
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      category: "",
      description: "",
      specifications: {
        material: "",
        size: "",
        color: "",
      },
      pricing: [{ minQuantity: 100, pricePerUnit: 1000 }],
    },
  });

  const { control, handleSubmit, formState } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "pricing",
  });

  const onSubmit: SubmitHandler<ProductFormValues> = async (data) => {
    try {
      // *** FIX HERE: Remove "/api" prefix ***
      await api.post("/products", data); // Changed from "/api/products"
      toast.success("Thêm sản phẩm thành công!");
      onProductAdded();
      onFormClose();
    } catch (err: any) {
      console.error("Add Product Error:", err); // Log the error object
      toast.error(err.response?.data?.message || "Thêm sản phẩm thất bại");
    }
  };

  // ... (Rest of the component JSX remains the same) ...
  return (
    <Card className="border-none shadow-sm bg-white">
      <CardHeader className="flex flex-row items-center gap-4 space-y-0 border-b">
        <Button variant="ghost" size="icon" onClick={onFormClose}>
          <ArrowLeft />
        </Button>
        <CardTitle>Thêm sản phẩm mới</CardTitle>
      </CardHeader>

      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Tên sản phẩm */}
            <FormField
              control={control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Danh mục</FormLabel>
                  <FormControl>
                    <Input placeholder="VD: In tờ rơi A5..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Danh mục */}
            <FormField
              control={control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Danh mục</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn một danh mục sản phẩm" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {/* Các giá trị này PHẢI khớp với enum trong models/Product.js */}
                      <SelectItem value="business-card">
                        Danh thiếp (Business Card)
                      </SelectItem>
                      <SelectItem value="flyer">Tờ rơi (Flyer)</SelectItem>
                      <SelectItem value="banner">Banner</SelectItem>
                      <SelectItem value="brochure">Brochure</SelectItem>
                      <SelectItem value="t-shirt">Áo thun (T-shirt)</SelectItem>
                      <SelectItem value="mug">Cốc (Mug)</SelectItem>
                      <SelectItem value="sticker">Sticker</SelectItem>
                      <SelectItem value="packaging">
                        Bao bì (Packaging)
                      </SelectItem>
                      <SelectItem value="other">Khác</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Mô tả */}
            <FormField
              control={control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={4}
                      placeholder="Chi tiết sản phẩm..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Thông số kỹ thuật */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={control}
                name="specifications.material"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chất liệu</FormLabel>
                    <FormControl>
                      <Input placeholder="VD: Giấy Couche 150gsm" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="specifications.size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kích thước</FormLabel>
                    <FormControl>
                      <Input placeholder="VD: A5 (14.8x21cm)" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="specifications.color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>In ấn</FormLabel>
                    <FormControl>
                      <Input placeholder="VD: In 4 màu, 2 mặt" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Bảng giá */}
            <div>
              <FormLabel>Bảng giá theo số lượng</FormLabel>
              <div className="space-y-3 mt-2">
                {fields.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-end gap-3 p-3 bg-gray-50 rounded-lg border"
                  >
                    <FormField
                      control={control}
                      name={`pricing.${index}.minQuantity`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel className="text-xs">
                            Số lượng (từ)
                          </FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control}
                      name={`pricing.${index}.pricePerUnit`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel className="text-xs">
                            Đơn giá (VND)
                          </FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-red-600 hover:bg-red-50"
                      onClick={() => remove(index)}
                      disabled={fields.length <= 1}
                    >
                      <Trash2 size={18} />
                    </Button>
                  </div>
                ))}

                {formState.errors.pricing &&
                  !formState.errors.pricing.root &&
                  formState.errors.pricing.message && (
                    <p className="text-destructive text-sm mt-1">
                      {formState.errors.pricing.message}
                    </p>
                  )}
                {formState.errors.pricing?.root && (
                  <p className="text-destructive text-sm mt-1">
                    {formState.errors.pricing.root.message}
                  </p>
                )}
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => append({ minQuantity: 0, pricePerUnit: 0 })}
              >
                <Plus size={16} className="mr-2" /> Thêm bậc giá
              </Button>
            </div>

            {/* Nút Submit */}
            <div className="flex justify-end gap-4 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onFormClose}>
                Hủy
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600"
                disabled={formState.isSubmitting}
              >
                {formState.isSubmitting ? "Đang lưu..." : "Lưu sản phẩm"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

// export default AddProductForm; // No need for default export if named export is used consistently
