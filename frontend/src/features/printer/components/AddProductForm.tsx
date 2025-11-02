// frontend/src/components/printer/AddProductForm.tsx (TÁI CẤU TRÚC HOÀN TOÀN)

import { useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/shared/components/ui/card";
import {
  ArrowLeft,
  Loader2,
  Package,
  GalleryVertical,
  Square,
  Tally5,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/shared/lib/axios";
import {
  productTaxonomyDB,
  ProductTaxonomyNode,
} from "@/data/productTaxonomy.data"; // ✅ Import "kho phôi"
import ProductViewer3D from "@/features/editor/components/ProductViewer3D"; // ✅ Import 3D Viewer

// ==================== SCHEMAS ====================
// Schema này giờ sẽ linh hoạt hơn
const pricingSchema = z.object({
  minQuantity: z.number().min(1, "Số lượng tối thiểu phải lớn hơn 0"),
  pricePerUnit: z.number().min(100, "Giá phải lớn hơn 100đ"),
});

const productFormSchema = z.object({
  // 1. Thông tin chung
  name: z.string().min(5, "Tên sản phẩm phải có ít nhất 5 ký tự"),
  description: z.string().optional(),

  // 2. Taxonomy (Sẽ được điền bởi state, không phải form)
  taxonomyId: z.string(),

  // 3. Metadata động
  metadata: z.object({
    dimensions: z.object({
      length: z.number(),
      width: z.number(),
      height: z.number(),
    }),
    material: z.string().min(1, "Vui lòng chọn chất liệu"),
    // ... (Các trường metadata khác sẽ được thêm vào đây)
  }),

  // 4. Bảng giá
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ State quản lý Taxonomy & Metadata
  const [selectedTaxonomy, setSelectedTaxonomy] =
    useState<ProductTaxonomyNode | null>(null);

  // (Giả lập, bạn nên dùng API để tải taxonomy)
  const rootCategories = Object.values(productTaxonomyDB); // Tạm thời lấy tất cả

  // ==================== FORM ====================
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    // Giá trị default sẽ được cập nhật khi chọn Taxonomy
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

  const { control, handleSubmit, formState, watch, setValue } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "pricing",
  });

  // ✅ Lắng nghe thay đổi kích thước để cập nhật 3D View
  const watchedDimensions = watch("metadata.dimensions");

  // ==================== HANDLERS ====================

  /**
   * ✅ HÀM CỐT LÕI: Được gọi khi nhà in chọn 1 Phôi (Taxonomy)
   */
  const handleTaxonomyChange = (taxonomyId: string) => {
    const node = productTaxonomyDB[taxonomyId];
    if (!node) {
      toast.error("Lỗi: Không tìm thấy phôi.");
      return;
    }

    setSelectedTaxonomy(node);

    // ✅ Tự động cập nhật Form với dữ liệu từ Metadata Schema
    setValue("taxonomyId", node.id);
    setValue("metadata.dimensions", node.metadataSchema.dimensions.default);
    setValue(
      "metadata.material",
      node.metadataSchema.materials[0]?.options[0]?.value || ""
    );
    //... (set default cho các trường khác)

    // Tự động điền tên (gợi ý)
    if (!form.getValues("name")) {
      setValue("name", `In ${node.name} theo yêu cầu`);
    }
  };

  // ==================== FORM SUBMISSION ====================
  const onSubmit = async (data: ProductFormValues) => {
    if (!selectedTaxonomy) {
      toast.error("Vui lòng chọn một loại sản phẩm (phôi) trước.");
      return;
    }

    setIsSubmitting(true);

    // ❌ KHÔNG CẦN UPLOAD ẢNH NỮA (vì ảnh đã có trong kho phôi)
    // Bạn có thể giữ lại logic upload ảnh, nhưng là để upload "ảnh chụp sản phẩm thật"
    // chứ không phải file thiết kế.

    try {
      const formData = new FormData();

      // 1. Thông tin cơ bản
      formData.append("name", data.name);
      formData.append("description", data.description || "");
      formData.append("category", selectedTaxonomy.parent || "other"); // Dùng parent làm category

      // 2. Thông tin Phôi (Assets) - Lấy từ state
      formData.append("assets[modelUrl]", selectedTaxonomy.assets.modelUrl);
      formData.append(
        "assets[surfaces]",
        JSON.stringify(selectedTaxonomy.assets.surfaces)
      );

      // 3. Metadata (Thông số) - Lấy từ form
      // Gửi metadata dưới dạng JSON string
      formData.append("metadata", JSON.stringify(data.metadata));

      // Gửi specifications (để tương thích hệ thống cũ)
      formData.append("specifications[material]", data.metadata.material);
      formData.append(
        "specifications[size]",
        `${data.metadata.dimensions.length}x${data.metadata.dimensions.width}x${data.metadata.dimensions.height}mm`
      );

      // 4. Bảng giá
      formData.append("pricing", JSON.stringify(data.pricing));

      // 5. Ảnh (Nếu bạn vẫn giữ logic upload ảnh thật)
      // imageFiles.forEach((file) => formData.append("images", file));

      // Gửi request (giả lập)
      console.log(
        "🚀 SUBMITTING NEW PRODUCT:",
        Object.fromEntries(formData.entries())
      );
      // const response = await api.post("/products", formData, { ... });

      toast.success("🎉 Thêm sản phẩm thành công!");
      onProductAdded();
      onFormClose();
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

  // ==================== RENDER ====================
  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-6">
        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center gap-4 space-y-0 border-b">
            <Button variant="ghost" size="icon" onClick={onFormClose}>
              <ArrowLeft />
            </Button>
            <CardTitle>Thêm sản phẩm mới (Kiến trúc Metadata)</CardTitle>
          </CardHeader>
        </Card>

        {/* Layout 2 cột: Form bên trái, 3D bên phải */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* CỘT BÊN TRÁI: FORM ĐIỀN THÔNG TIN */}
          <div className="lg:col-span-2 space-y-6">
            {/* === STEP 1: CHỌN PHÔI (TAXONOMY) === */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="text-blue-600" />
                  Bước 1: Chọn Phôi (Sản phẩm gốc)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select onValueChange={handleTaxonomyChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại sản phẩm (phôi) bạn muốn bán..." />
                  </SelectTrigger>
                  <SelectContent>
                    {rootCategories.map((node) => (
                      <SelectItem key={node.id} value={node.id}>
                        {node.name} (Hộp, Ly, v.v...)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Render phần còn lại CHỈ KHI đã chọn phôi */}
            {selectedTaxonomy && (
              <>
                {/* === STEP 2: THÔNG TIN CHUNG === */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GalleryVertical className="text-blue-600" />
                      Bước 2: Thông tin chung & Ảnh thật
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tên sản phẩm *</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mô tả sản phẩm</FormLabel>
                          <FormControl>
                            <Textarea {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {/* (Bạn có thể thêm logic upload ảnh chụp thật ở đây) */}
                  </CardContent>
                </Card>

                {/* === STEP 3: CẤU HÌNH METADATA (ĐỘNG) === */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Square className="text-blue-600" />
                      Bước 3: Cấu hình Kích thước & Chất liệu
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Kích thước */}
                    <div className="space-y-2">
                      <FormLabel>Kích thước (mm)</FormLabel>
                      <div className="grid grid-cols-3 gap-3">
                        <FormField
                          control={control}
                          name="metadata.dimensions.length"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Dài</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(e.target.valueAsNumber)
                                  }
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={control}
                          name="metadata.dimensions.width"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Rộng</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(e.target.valueAsNumber)
                                  }
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={control}
                          name="metadata.dimensions.height"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Cao</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(e.target.valueAsNumber)
                                  }
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Render động các tùy chọn */}
                    {selectedTaxonomy.metadataSchema.materials.map((group) => (
                      <FormField
                        key={group.label}
                        control={control}
                        name="metadata.material" // (Đơn giản hóa, bạn có thể mở rộng)
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{group.label}</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {group.options.map((opt) => (
                                  <SelectItem key={opt.value} value={opt.value}>
                                    {opt.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                    ))}
                    {/* (Render động các 'printingOptions' tương tự) */}
                  </CardContent>
                </Card>

                {/* === STEP 4: BẢNG GIÁ (GIỮ NGUYÊN) === */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Tally5 className="text-blue-600" />
                      Bước 4: Bảng giá theo số lượng *
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* ... (Code render bảng giá giữ nguyên) ... */}
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* CỘT BÊN PHẢI: 3D PREVIEW ĐỘNG */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Preview 3D Động</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedTaxonomy ? (
                  <div className="aspect-square bg-gray-100 rounded-lg">
                    <ProductViewer3D
                      modelUrl={selectedTaxonomy.assets.modelUrl}
                      textures={{}} // Không có texture khi thêm sản phẩm
                      dimensions={watchedDimensions} // ✅ Truyền kích thước động
                    />
                  </div>
                ) : (
                  <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center text-center text-gray-500 p-4">
                    Vui lòng chọn một phôi (Bước 1) để xem 3D preview.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* NÚT SUBMIT */}
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
            disabled={isSubmitting || !selectedTaxonomy}
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" />
            ) : (
              "Lưu sản phẩm"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
