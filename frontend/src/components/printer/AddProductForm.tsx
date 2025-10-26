// frontend/src/components/printer/AddProductForm.tsx (FINAL FIX v2)

import { useState } from "react";
// KHẮC PHỤC: Xóa import FieldValues không dùng
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
import { Plus, Trash2, ArrowLeft, ImagePlus, X } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";

// --- SỬA SCHEMAS ĐỂ ĐÚNG CHUẨN ZOD ---
const pricingSchema = z.object({
  // KHẮC PHỤC: Xóa { required_error: ... } không hợp lệ
  minQuantity: z.number().min(1, "Số lượng phải > 0"),
  // KHẮC PHỤC: Xóa { required_error: ... } không hợp lệ
  pricePerUnit: z.number().min(100, "Giá phải > 100"),
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
  images: z.any().optional(),
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
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      category: "",
      description: "",
      specifications: { material: "", size: "", color: "" },
      pricing: [{ minQuantity: 100, pricePerUnit: 1000 }],
    },
  });

  const { control, handleSubmit, formState } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "pricing",
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      const newFiles = [...imageFiles, ...files];
      setImageFiles(newFiles);
      const newPreviews = files.map((file) => URL.createObjectURL(file));
      setImagePreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit: SubmitHandler<ProductFormValues> = async (data) => {
    console.log("Attempting to submit product:", data);
    if (imageFiles.length === 0) {
      toast.error("Vui lòng tải lên ít nhất 1 ảnh sản phẩm.");
      return;
    }

    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (key === "specifications" || key === "pricing") {
        formData.append(key, JSON.stringify(value));
      } else if (value !== undefined && value !== null && key !== "images") {
        formData.append(key, value as string);
      }
    });
    imageFiles.forEach((file) => {
      formData.append("images", file);
    });

    try {
      console.log("Calling api.post('/products') with FormData...");
      await api.post("/products", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("API call finished successfully.");
      toast.success("Thêm sản phẩm thành công!");
      onProductAdded();
      onFormClose();
    } catch (err: any) {
      console.error("Add Product Error inside onSubmit:", err);
      toast.error(err.response?.data?.message || "Thêm sản phẩm thất bại");
    } finally {
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    }
  };

  const onError = (errors: any) => {
    console.error("Form validation failed:", errors);
    if (errors.pricing) {
      toast.error(
        "Lỗi bảng giá: Số lượng và Đơn giá phải là số hợp lệ và lớn hơn giá trị tối thiểu."
      );
    } else {
      toast.error(
        "Dữ liệu nhập chưa hợp lệ. Vui lòng kiểm tra lại các ô báo đỏ."
      );
    }
  };

  return (
    <Card className="border-none shadow-sm bg-white">
      <CardHeader className="flex flex-row items-center gap-4 space-y-0 border-b">
        <Button variant="ghost" size="icon" onClick={onFormClose}>
          {" "}
          <ArrowLeft />{" "}
        </Button>
        <CardTitle>Thêm sản phẩm mới</CardTitle>
      </CardHeader>

      <CardContent className="p-6">
        <Form {...form}>
          <form
            onSubmit={handleSubmit(onSubmit, onError)}
            className="space-y-6"
          >
            {/* Tên sản phẩm */}
            <FormField
              control={control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên sản phẩm *</FormLabel>
                  <FormControl>
                    {" "}
                    <Input placeholder="VD: In tờ rơi A5..." {...field} />{" "}
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
                  <FormLabel>Danh mục *</FormLabel>
                  {/* <Select> nằm ngoài FormControl */}
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    {/* FormControl chỉ bao bọc SelectTrigger */}
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn một danh mục sản phẩm" />
                      </SelectTrigger>
                    </FormControl>
                    {/* SelectContent nằm ngoài FormControl */}
                    <SelectContent>
                      <SelectItem value="business-card">Danh thiếp</SelectItem>
                      <SelectItem value="flyer">Tờ rơi</SelectItem>
                      <SelectItem value="banner">Banner</SelectItem>
                      <SelectItem value="brochure">Brochure</SelectItem>
                      <SelectItem value="t-shirt">Áo thun</SelectItem>
                      <SelectItem value="mug">Cốc</SelectItem>
                      <SelectItem value="sticker">Sticker</SelectItem>
                      <SelectItem value="packaging">Bao bì</SelectItem>
                      <SelectItem value="other">Khác</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* IMAGE UPLOAD SECTION */}
            <div>
              <FormLabel>Ảnh sản phẩm *</FormLabel>
              <div className="mt-2 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {imagePreviews.map((previewUrl, index) => (
                  <div
                    key={index}
                    className="relative aspect-square border rounded-lg overflow-hidden group"
                  >
                    <img
                      src={previewUrl}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Remove image"
                    >
                      {" "}
                      <X size={14} />{" "}
                    </button>
                  </div>
                ))}
                <label
                  htmlFor="image-upload"
                  className={`aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-blue-500 hover:text-blue-500 cursor-pointer transition-colors ${
                    imageFiles.length >= 5 ? "hidden" : ""
                  }`}
                >
                  <ImagePlus size={24} />{" "}
                  <span className="text-xs mt-1">Thêm ảnh</span>
                  <input
                    id="image-upload"
                    type="file"
                    multiple
                    accept="image/png, image/jpeg, image/webp"
                    className="sr-only"
                    onChange={handleImageChange}
                  />
                </label>
              </div>
              {formState.isSubmitted && imageFiles.length === 0 && (
                <p className="text-sm text-destructive mt-1">
                  Vui lòng tải lên ít nhất 1 ảnh.
                </p>
              )}
            </div>

            {/* Mô tả */}
            <FormField
              control={control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  {" "}
                  <FormLabel>Mô tả</FormLabel>{" "}
                  <FormControl>
                    {" "}
                    <Textarea
                      rows={4}
                      placeholder="Chi tiết sản phẩm..."
                      {...field}
                    />{" "}
                  </FormControl>{" "}
                  <FormMessage />{" "}
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
                    {" "}
                    <FormLabel>Chất liệu</FormLabel>{" "}
                    <FormControl>
                      {" "}
                      <Input
                        placeholder="VD: Giấy Couche 150gsm"
                        {...field}
                      />{" "}
                    </FormControl>{" "}
                    <FormMessage />{" "}
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="specifications.size"
                render={({ field }) => (
                  <FormItem>
                    {" "}
                    <FormLabel>Kích thước</FormLabel>{" "}
                    <FormControl>
                      {" "}
                      <Input placeholder="VD: A5 (14.8x21cm)" {...field} />{" "}
                    </FormControl>{" "}
                    <FormMessage />{" "}
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="specifications.color"
                render={({ field }) => (
                  <FormItem>
                    {" "}
                    <FormLabel>In ấn</FormLabel>{" "}
                    <FormControl>
                      {" "}
                      <Input
                        placeholder="VD: In 4 màu, 2 mặt"
                        {...field}
                      />{" "}
                    </FormControl>{" "}
                    <FormMessage />{" "}
                  </FormItem>
                )}
              />
            </div>

            {/* Bảng giá */}
            <div>
              <FormLabel>Bảng giá theo số lượng *</FormLabel>
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
                            {" "}
                            Số lượng (từ) *{" "}
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              value={field.value ?? ""}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value) || 0)
                              }
                            />
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
                            {" "}
                            Đơn giá (VND) *{" "}
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              value={field.value ?? ""}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value) || 0)
                              }
                            />
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
                      {" "}
                      <Trash2 size={18} />{" "}
                    </Button>
                  </div>
                ))}
                {formState.errors.pricing &&
                  !Array.isArray(formState.errors.pricing) && (
                    <p className="text-destructive text-sm mt-1">
                      {" "}
                      {formState.errors.pricing.message ||
                        formState.errors.pricing.root?.message}{" "}
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
                {" "}
                <Plus size={16} className="mr-2" /> Thêm bậc giá{" "}
              </Button>
            </div>

            {/* Nút Submit */}
            <div className="flex justify-end gap-4 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onFormClose}>
                {" "}
                Hủy{" "}
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600"
                disabled={formState.isSubmitting}
              >
                {" "}
                {formState.isSubmitting ? "Đang lưu..." : "Lưu sản phẩm"}{" "}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
