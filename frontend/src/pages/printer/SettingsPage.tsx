import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
// Sửa đường dẫn import thành relative path
import { useAuthStore } from "../../stores/useAuthStore";
import api from "../../lib/axios"; // Sử dụng instance Axios đã cấu hình và sửa thành relative path
import { toast } from "sonner";
import { useNavigate } from "react-router-dom"; // Import useNavigate

import { Building2, MapPin, Phone, Mail, Printer } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

// 1. Schema - Dựa trên backend (Đã loại bỏ longitude/latitude)
const settingsSchema = z.object({
  displayName: z.string().min(2, "Tên xưởng in phải có ít nhất 2 ký tự"),
  phone: z.string().optional().or(z.literal("")), // Cho phép chuỗi rỗng
  addressStreet: z.string().optional().or(z.literal("")),
  addressWard: z.string().optional().or(z.literal("")),
  addressDistrict: z.string().optional().or(z.literal("")),
  addressCity: z.string().optional().or(z.literal("")),
  specialties: z.string().optional().or(z.literal("")),
  priceTier: z.enum(["cheap", "standard", "premium"]).default("standard"),
  productionSpeed: z.enum(["fast", "standard"]).default("standard"),
});
type SettingsFormValues = z.infer<typeof settingsSchema>;

export function SettingsPage() {
  const { user, setUser, loading: authLoading } = useAuthStore(); // Lấy cả trạng thái loading
  const navigate = useNavigate(); // Hook để điều hướng

  // --- Thêm kiểm tra Loading và User ---
  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Đang tải dữ liệu...
      </div>
    );
  }

  // Nếu không loading mà vẫn không có user, hoặc user không phải printer
  if (!user || user.role !== "printer") {
    // Điều hướng về trang chủ hoặc trang đăng nhập nếu chưa đăng nhập
    navigate(user ? "/" : "/signin");
    // Có thể hiển thị thông báo lỗi ngắn gọn trước khi điều hướng
    toast.error(
      user ? "Bạn không có quyền truy cập trang này." : "Vui lòng đăng nhập."
    );
    return null; // Trả về null để tránh render phần còn lại
  }
  // --- Kết thúc kiểm tra ---

  // 2. Khởi tạo Form (sau khi đã chắc chắn có user)
  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      displayName: user.displayName || "",
      phone: user.phone || "",
      addressStreet: user.address?.street || "",
      addressWard: user.address?.ward || "",
      addressDistrict: user.address?.district || "",
      addressCity: user.address?.city || "",
      specialties: user.specialties?.join(", ") || "",
      priceTier: user.priceTier || "standard",
      productionSpeed: user.productionSpeed || "standard",
    },
  });

  // 3. Hàm Submit
  const onSubmit = async (values: SettingsFormValues) => {
    try {
      // Chuẩn bị payload gửi lên backend
      const payload = {
        displayName: values.displayName,
        phone: values.phone || undefined, // Gửi undefined nếu rỗng để backend không cập nhật
        specialties:
          values.specialties
            ?.split(",")
            .map((s) => s.trim())
            .filter(Boolean) || [], // Chuyển chuỗi thành mảng, loại bỏ phần tử rỗng
        priceTier: values.priceTier,
        productionSpeed: values.productionSpeed,
        address: {
          street: values.addressStreet || undefined,
          ward: values.addressWard || undefined,
          district: values.addressDistrict || undefined,
          city: values.addressCity || undefined,
          // Không gửi location ở đây vì controller không xử lý
        },
      };

      // Gọi API - Sửa endpoint thành "/printer/profile"
      const response = await api.put("/printer/profile", payload);

      // Cập nhật lại thông tin user trong store Zustand
      setUser(response.data.printer);
      toast.success("Cập nhật hồ sơ thành công!");

      // Cập nhật defaultValues của form sau khi lưu thành công
      form.reset({
        displayName: response.data.printer.displayName || "",
        phone: response.data.printer.phone || "",
        addressStreet: response.data.printer.address?.street || "",
        addressWard: response.data.printer.address?.ward || "",
        addressDistrict: response.data.printer.address?.district || "",
        addressCity: response.data.printer.address?.city || "",
        specialties: response.data.printer.specialties?.join(", ") || "",
        priceTier: response.data.printer.priceTier || "standard",
        productionSpeed: response.data.printer.productionSpeed || "standard",
      });
    } catch (err: any) {
      console.error("Lỗi cập nhật profile:", err);
      // Hiển thị lỗi cụ thể từ backend nếu có
      const errMsg =
        err.response?.data?.message || "Cập nhật thất bại. Vui lòng thử lại.";
      toast.error(errMsg);
    }
  };

  // Hàm reset form về giá trị hiện tại của user state
  const handleReset = () => {
    form.reset({
      displayName: user.displayName || "",
      phone: user.phone || "",
      addressStreet: user.address?.street || "",
      addressWard: user.address?.ward || "",
      addressDistrict: user.address?.district || "",
      addressCity: user.address?.city || "",
      specialties: user.specialties?.join(", ") || "",
      priceTier: user.priceTier || "standard",
      productionSpeed: user.productionSpeed || "standard",
    });
    toast.info("Đã hủy các thay đổi.");
  };

  return (
    // 4. Bọc Form và ScrollArea
    <Form {...form}>
      {/* Thêm thẻ form và onSubmit */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="h-full">
        <ScrollArea className="h-full flex-1 bg-gray-50">
          <div className="p-8 max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Cài đặt Xưởng In
              </h1>
              <p className="text-gray-600">
                Quản lý thông tin và cấu hình xưởng in của bạn
              </p>
            </div>

            {/* Business Information */}
            <Card className="border-none shadow-sm mb-6 bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                  <Building2 size={20} className="text-orange-600" />
                  Thông tin doanh nghiệp
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="displayName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tên xưởng in</FormLabel>
                        <FormControl>
                          <Input placeholder="VD: Xưởng in ABC" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div>
                    <Label htmlFor="taxCode">Mã số thuế (Sắp có)</Label>
                    <Input
                      id="taxCode"
                      placeholder="VD: 0123456789"
                      className="mt-1"
                      disabled
                      title="Tính năng sẽ cập nhật sau"
                    />
                  </div>
                </div>
                <FormField
                  control={form.control}
                  name="addressStreet"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <MapPin size={16} /> Địa chỉ (Số nhà, đường)
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="VD: 123 Đường ABC" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="addressWard"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phường/Xã</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="VD: Phường Phú Cường"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="addressDistrict"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quận/Huyện</FormLabel>
                        <FormControl>
                          <Input placeholder="VD: TP Thủ Dầu Một" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="addressCity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tỉnh/Thành phố</FormLabel>
                        <FormControl>
                          <Input placeholder="VD: Bình Dương" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Phone size={16} /> Số điện thoại liên hệ
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="VD: 0901234567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div>
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail size={16} /> Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={user.email || ""} // User chắc chắn tồn tại ở đây
                      disabled
                      className="mt-1 bg-gray-100 cursor-not-allowed"
                      title="Không thể thay đổi email đăng nhập"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">
                    Giới thiệu về xưởng in (Sắp có)
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Mô tả ngắn về xưởng in của bạn, các dịch vụ chính, kinh nghiệm..."
                    className="mt-1 h-24"
                    disabled
                    title="Tính năng sẽ cập nhật sau"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Printing Capabilities */}
            <Card className="border-none shadow-sm mb-6 bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                  <Printer size={20} className="text-orange-600" />
                  Khả năng in ấn (Quan trọng cho AI)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="specialties"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chuyên môn / Sản phẩm chính</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="áo thun, cốc sứ, banner, danh thiếp,..."
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Liệt kê các loại sản phẩm bạn nhận in, cách nhau bằng
                        dấu phẩy (,). Ví dụ: áo thun, cốc sứ, name card, sticker
                        decal
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="priceTier"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phân khúc giá</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn phân khúc giá" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="cheap">
                              Rẻ (Giá cạnh tranh)
                            </SelectItem>
                            <SelectItem value="standard">
                              Tiêu chuẩn (Phổ thông)
                            </SelectItem>
                            <SelectItem value="premium">
                              Cao cấp (Chất lượng cao)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Giúp AI gợi ý khi khách tìm "in giá rẻ".
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="productionSpeed"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tốc độ sản xuất</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn tốc độ" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="fast">
                              Nhanh (Có thể lấy liền/gấp)
                            </SelectItem>
                            <SelectItem value="standard">
                              Tiêu chuẩn (Theo quy trình)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Giúp AI gợi ý khi khách tìm "in nhanh/in gấp".
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* (Các Card "Giờ làm việc", "Thông báo" tĩnh giữ nguyên - nếu có) */}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={handleReset} // Sử dụng hàm handleReset đã tạo
                disabled={form.formState.isSubmitting} // Vô hiệu hóa khi đang gửi
              >
                Hủy thay đổi
              </Button>
              <Button
                type="submit"
                className="w-full sm:flex-1 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white"
                disabled={
                  form.formState.isSubmitting || !form.formState.isDirty
                } // Vô hiệu hóa khi đang gửi hoặc chưa có gì thay đổi
              >
                {form.formState.isSubmitting ? "Đang lưu..." : "Lưu Cài Đặt"}
              </Button>
            </div>
          </div>
        </ScrollArea>
      </form>
    </Form>
  );
}
