// src/features/printer/pages/PublishTemplatePage.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import api from "@/shared/lib/axios";

// UI Components
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/shared/components/ui/card";
import { Switch } from "@/shared/components/ui/switch";
import { Textarea } from "@/shared/components/ui/textarea";
import { ArrowLeft, Save, Loader2, Eye, CheckCircle2 } from "lucide-react";
import { NativeScrollArea as ScrollArea } from "@/shared/components/ui/NativeScrollArea";
import { Separator } from "@/shared/components/ui/separator";

// Types
type TemplateFormData = {
  name: string;
  description: string;
  isPublic: boolean;
  tags: string;
};

// ❌ Xóa: Utility dataURLtoBlob (vì previewDataUrl giờ là null)

export function PublishTemplatePage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State này giờ sẽ chứa { baseProductId, decals, timestamp, previewDataUrl: null }
  const [designData, setDesignData] = useState<any>(null);

  // State này sẽ là NULL vì chưa có snapshot 3D
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Form (Giữ nguyên)
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<TemplateFormData>({
    defaultValues: { name: "", description: "", isPublic: true, tags: "" },
  });

  const watchedName = watch("name");
  const watchedDescription = watch("description");

  // ==================== LOAD DATA FROM SESSION STORAGE ====================
  useEffect(() => {
    const tempData = sessionStorage.getItem("tempDesignData");
    if (!tempData) {
      toast.error("Không tìm thấy dữ liệu thiết kế tạm thời!");
      // Quay về trang studio của nhà in (giả định)
      navigate("/printer/dashboard/products");
      return;
    }

    try {
      const parsed = JSON.parse(tempData);

      // ✅ KIỂM TRA LOGIC MỚI
      if (!parsed.decals || !Array.isArray(parsed.decals)) {
        throw new Error("Dữ liệu thiết kế không hợp lệ (thiếu 'decals').");
      }

      console.log(
        "📥 [PublishTemplate] Loaded 'decals' from sessionStorage:",
        parsed
      );
      setDesignData(parsed);

      // ❌ Xóa logic xử lý previewDataUrl (vì nó là null)
      // Chúng ta sẽ hiển thị placeholder
      setPreviewUrl(null);
    } catch (err: any) {
      console.error("❌ [PublishTemplate] Parse error:", err);
      toast.error(err.message || "Dữ liệu thiết kế không hợp lệ!");
      navigate("/printer/dashboard/products");
    }
  }, [navigate]);

  // ==================== SUBMIT ====================
  const onSubmit = async (data: TemplateFormData) => {
    if (!designData) {
      toast.error("Lỗi: Không tìm thấy dữ liệu thiết kế");
      return;
    }

    setIsSubmitting(true);
    toast.info("Đang chuẩn bị dữ liệu...");

    try {
      // ❌ Xóa: Logic convert preview
      // ❌ Xóa: Logic tạo production SVG

      // ✅ Build FormData (Logic MỚI)
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("description", data.description);
      formData.append("isPublic", String(data.isPublic));
      formData.append("baseProductId", designData.baseProductId);

      // Gửi 'decals' dưới dạng JSON
      formData.append(
        "editorData",
        JSON.stringify({ decals: designData.decals })
      );
      formData.append("dataType", "3d-native-v1"); // Đánh dấu loại dữ liệu

      // TODO: Gửi file preview (khi có snapshot 3D)
      // if (previewBlob) {
      //   formData.append("previewFile", previewBlob, "preview.png");
      // }

      if (data.tags) {
        const tagsArray = data.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean);
        formData.append("tags", JSON.stringify(tagsArray));
      }

      toast.info("Đang upload dữ liệu mẫu...");

      // Call API
      await api.post("/designs/templates", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 30000,
      });

      // Clear session storage
      sessionStorage.removeItem("tempDesignData");
      localStorage.removeItem("tempProductAssets"); // Xóa luôn data phôi tạm

      toast.success("🎉 Đăng bán mẫu thành công!");
      navigate("/printer/dashboard/products");
    } catch (err: any) {
      console.error("❌ [PublishTemplate] Submit error:", err);
      toast.error(
        err.response?.data?.message || "Lỗi khi đăng bán mẫu thiết kế"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==================== LOADING STATE ====================
  if (!designData) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Đang tải dữ liệu thiết kế...</p>
        </div>
      </div>
    );
  }

  // ==================== RENDER ====================
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                type="button"
                onClick={() => {
                  if (
                    window.confirm(
                      "Bạn có chắc muốn quay lại? Dữ liệu chưa lưu sẽ bị mất."
                    )
                  ) {
                    navigate(-1); // Quay lại studio
                  }
                }}
              >
                <ArrowLeft size={20} />
              </Button>
              <div>
                <h1 className="text-xl font-bold">Đăng bán Mẫu thiết kế</h1>
                <p className="text-sm text-gray-500">
                  Điền thông tin để đăng bán mẫu của bạn
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="text-green-600" size={20} />
              <span className="text-sm text-gray-600">
                Thiết kế đã hoàn tất
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT: Preview */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye size={18} />
                  Xem trước thiết kế
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border">
                  {/* ✅ SỬA: Hiển thị placeholder vì previewUrl là null */}
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 p-4">
                      <p className="text-center text-sm">
                        ⚠️ Không có ảnh preview
                        <br />
                        (Cần triển khai snapshot 3D)
                      </p>
                    </div>
                  )}
                </div>
                <div className="mt-4 space-y-2 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Thời gian tạo:</span>{" "}
                    {new Date(designData.timestamp).toLocaleString("vi-VN")}
                  </div>
                  <div>
                    <span className="font-medium">Số lượng decals:</span>{" "}
                    {designData.decals.length}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT: Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit(onSubmit)}>
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin Mẫu thiết kế</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Tên Mẫu <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      {...register("name", {
                        required: "Tên mẫu là bắt buộc",
                        minLength: {
                          value: 3,
                          message: "Tên mẫu phải có ít nhất 3 ký tự",
                        },
                      })}
                      placeholder="VD: Mẫu card visit Giáng Sinh"
                      disabled={isSubmitting}
                    />
                    {errors.name && (
                      <p className="text-xs text-red-500">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <Separator />

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Mô tả</Label>
                    <Textarea
                      id="description"
                      {...register("description")}
                      placeholder="Mô tả ngắn về mẫu thiết kế..."
                      rows={4}
                      disabled={isSubmitting}
                    />
                  </div>

                  <Separator />

                  {/* Tags */}
                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags (phân tách bằng dấu phẩy)</Label>
                    <Input
                      id="tags"
                      {...register("tags")}
                      placeholder="VD: card visit, giáng sinh, đỏ, sang trọng"
                      disabled={isSubmitting}
                    />
                  </div>

                  <Separator />

                  {/* Public Switch */}
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                    <div className="space-y-1">
                      <Label htmlFor="isPublic" className="font-medium">
                        Đăng bán công khai
                      </Label>
                      <p className="text-xs text-gray-500">
                        Khách hàng có thể thấy và sử dụng mẫu này
                      </p>
                    </div>
                    <Switch
                      id="isPublic"
                      {...register("isPublic")}
                      defaultChecked
                      disabled={isSubmitting}
                    />
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        if (
                          window.confirm(
                            "Bạn có chắc muốn hủy? Dữ liệu chưa lưu sẽ bị mất."
                          )
                        ) {
                          navigate(-1);
                        }
                      }}
                      disabled={isSubmitting}
                      className="flex-1"
                    >
                      Quay lại chỉnh sửa
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Đang đăng bán...
                        </>
                      ) : (
                        <>
                          <Save size={18} className="mr-2" />
                          Đăng bán ngay
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
