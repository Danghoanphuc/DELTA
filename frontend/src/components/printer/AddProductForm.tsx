// frontend/src/components/printer/AddProductForm.tsx (FIXED & IMPROVED)

import { useState, useCallback } from "react";
import { useForm, useFieldArray } from "react-hook-form";
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
import { Plus, Trash2, ArrowLeft, ImagePlus, X, Upload } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";

// ==================== SCHEMAS ====================
const pricingSchema = z.object({
  minQuantity: z.number().min(1, "Số lượng tối thiểu phải lớn hơn 0"),
  pricePerUnit: z.number().min(100, "Giá phải lớn hơn 100đ"),
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
  // ==================== STATE ====================
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ==================== FORM ====================
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

  // ==================== IMAGE HANDLING ====================
  const handleImageChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      console.log("📸 Image change event triggered");

      if (!event.target.files) {
        console.log("⚠️ No files selected");
        return;
      }

      const files = Array.from(event.target.files);
      console.log(`📁 Selected ${files.length} files`);

      // Validate file types
      const validTypes = ["image/png", "image/jpeg", "image/webp"];
      const invalidFiles = files.filter((f) => !validTypes.includes(f.type));

      if (invalidFiles.length > 0) {
        toast.error("Chỉ chấp nhận file PNG, JPG, WEBP");
        return;
      }

      // Validate file sizes (max 5MB each)
      const oversizedFiles = files.filter((f) => f.size > 5 * 1024 * 1024);
      if (oversizedFiles.length > 0) {
        toast.error("Kích thước ảnh không được vượt quá 5MB");
        return;
      }

      // Check total images
      if (imageFiles.length + files.length > 5) {
        toast.error("Chỉ được tải tối đa 5 ảnh");
        return;
      }

      try {
        const newFiles = [...imageFiles, ...files];
        setImageFiles(newFiles);

        const newPreviews = files.map((file) => {
          const url = URL.createObjectURL(file);
          console.log(`🖼️ Created preview URL: ${url}`);
          return url;
        });

        setImagePreviews((prev) => [...prev, ...newPreviews]);
        toast.success(`✅ Đã thêm ${files.length} ảnh`);
      } catch (err) {
        console.error("❌ Error handling images:", err);
        toast.error("Lỗi khi xử lý ảnh");
      }
    },
    [imageFiles]
  );

  const removeImage = useCallback(
    (index: number) => {
      console.log(`🗑️ Removing image at index ${index}`);

      try {
        URL.revokeObjectURL(imagePreviews[index]);
        setImageFiles((prev) => prev.filter((_, i) => i !== index));
        setImagePreviews((prev) => prev.filter((_, i) => i !== index));
        toast.success("Đã xóa ảnh");
      } catch (err) {
        console.error("❌ Error removing image:", err);
        toast.error("Lỗi khi xóa ảnh");
      }
    },
    [imagePreviews]
  );

  // ==================== FORM SUBMISSION ====================
  const onSubmit = async (data: ProductFormValues) => {
    console.log("📤 Form submission started");
    console.log("📋 Form data:", data);
    console.log("🖼️ Image files:", imageFiles);

    // Validate images
    if (imageFiles.length === 0) {
      toast.error("Vui lòng tải lên ít nhất 1 ảnh sản phẩm");
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(10);

    try {
      // Create FormData
      const formData = new FormData();

      // Append text fields
      formData.append("name", data.name);
      formData.append("category", data.category);
      if (data.description) formData.append("description", data.description);

      // Append specifications field by field
      if (data.specifications) {
        Object.entries(data.specifications).forEach(([key, value]) => {
          if (value) {
            formData.append(`specifications[${key}]`, value);
          }
        });
      }

      // Append pricing array field by field
      if (data.pricing) {
        data.pricing.forEach((tier, index) => {
          formData.append(`pricing[${index}][minQuantity]`, tier.minQuantity.toString());
          formData.append(`pricing[${index}][pricePerUnit]`, tier.pricePerUnit.toString());
        });
      }

      setUploadProgress(30);

      // Append images
      imageFiles.forEach((file, index) => {
        formData.append("images", file);
        console.log(`📎 Appended image ${index + 1}: ${file.name}`);
      });

      setUploadProgress(50);

      console.log("🚀 Sending request to /products");

      // Send request
      const response = await api.post("/products", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(50 + progress / 2);
            console.log(`⏳ Upload progress: ${progress}%`);
          }
        },
      });

      console.log("✅ Product created successfully:", response.data);

      setUploadProgress(100);
      toast.success("🎉 Thêm sản phẩm thành công!");

      // Cleanup
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));

      // Callback
      onProductAdded();
      onFormClose();
    } catch (err: any) {
      console.error("❌ Error creating product:", err);
      console.error("Error response:", err.response?.data);

      const errorMessage =
        err.response?.data?.message || "Không thể thêm sản phẩm. Thử lại!";

      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  const onError = (errors: any) => {
    console.error("❌ Form validation errors:", errors);

    if (errors.pricing) {
      toast.error("Lỗi bảng giá: Vui lòng kiểm tra số lượng và đơn giá");
    } else if (errors.name) {
      toast.error("Tên sản phẩm không hợp lệ");
    } else if (errors.category) {
      toast.error("Vui lòng chọn danh mục");
    } else {
      toast.error("Dữ liệu nhập chưa hợp lệ. Kiểm tra lại form!");
    }
  };

  // ==================== RENDER ====================
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
          <form
            onSubmit={handleSubmit(onSubmit, onError)}
            className="space-y-6"
          >
            {/* ==================== THÔNG TIN CƠ BẢN ==================== */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">
                  1
                </span>
                Thông tin cơ bản
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-10">
                {/* Tên sản phẩm */}
                <FormField
                  control={control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Tên sản phẩm *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="VD: In tờ rơi A5 giấy Couche 150gsm"
                          {...field}
                        />
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
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn danh mục" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="business-card">
                            Danh thiếp
                          </SelectItem>
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

                {/* Mô tả */}
                <FormField
                  control={control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Mô tả sản phẩm</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={4}
                          placeholder="Mô tả chi tiết về sản phẩm, quy trình in, ưu điểm..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* ==================== ẢNH SẢN PHẨM ==================== */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-bold">
                  2
                </span>
                Hình ảnh sản phẩm *
              </h3>

              <div className="pl-10">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
                  {imagePreviews.length === 0 ? (
                    <label
                      htmlFor="image-upload"
                      className="flex flex-col items-center justify-center cursor-pointer"
                    >
                      <Upload className="w-12 h-12 text-gray-400 mb-2" />
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        Nhấn để tải ảnh lên
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, WEBP tối đa 5MB (tối đa 5 ảnh)
                      </p>
                      <input
                        id="image-upload"
                        type="file"
                        multiple
                        accept="image/png, image/jpeg, image/webp"
                        className="sr-only"
                        onChange={handleImageChange}
                      />
                    </label>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {imagePreviews.map((previewUrl, index) => (
                        <div
                          key={index}
                          className="relative aspect-square border rounded-lg overflow-hidden group bg-white shadow-sm"
                        >
                          <img
                            src={previewUrl}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                            aria-label="Remove image"
                          >
                            <X size={14} />
                          </button>
                          {index === 0 && (
                            <div className="absolute bottom-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                              Ảnh chính
                            </div>
                          )}
                        </div>
                      ))}

                      {/* Add more button */}
                      {imageFiles.length < 5 && (
                        <label
                          htmlFor="image-upload"
                          className="aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50 cursor-pointer transition-colors"
                        >
                          <ImagePlus size={24} />
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
                      )}
                    </div>
                  )}

                  {formState.isSubmitted && imageFiles.length === 0 && (
                    <p className="text-sm text-destructive mt-2">
                      Vui lòng tải lên ít nhất 1 ảnh sản phẩm
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* ==================== THÔNG SỐ KỸ THUẬT ==================== */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm font-bold">
                  3
                </span>
                Thông số kỹ thuật
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-10">
                <FormField
                  control={control}
                  name="specifications.material"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chất liệu</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="VD: Giấy Couche 150gsm"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
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
                      <FormMessage />
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
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* ==================== BẢNG GIÁ ==================== */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-sm font-bold">
                  4
                </span>
                Bảng giá theo số lượng *
              </h3>

              <div className="space-y-3 pl-10">
                {fields.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-end gap-3 p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-200"
                  >
                    <FormField
                      control={control}
                      name={`pricing.${index}.minQuantity`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel className="text-xs">
                            Số lượng (từ) *
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
                            Đơn giá (VND) *
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
                      <Trash2 size={18} />
                    </Button>
                  </div>
                ))}

                {formState.errors.pricing &&
                  !Array.isArray(formState.errors.pricing) && (
                    <p className="text-destructive text-sm mt-1">
                      {formState.errors.pricing.message ||
                        formState.errors.pricing.root?.message}
                    </p>
                  )}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => append({ minQuantity: 0, pricePerUnit: 0 })}
                >
                  <Plus size={16} className="mr-2" />
                  Thêm bậc giá
                </Button>
              </div>
            </div>

            {/* ==================== SUBMIT BUTTONS ==================== */}
            <div className="flex justify-end gap-4 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onFormClose}
                disabled={isSubmitting}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 min-w-[150px]"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {uploadProgress > 0
                      ? `Đang tải lên (${uploadProgress}%)`
                      : "Đang xử lý..."}
                  </span>
                ) : (
                  "Lưu sản phẩm"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}