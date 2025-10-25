// src/pages/printer/SettingsPage.tsx (NÂNG CẤP)

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "@/stores/useAuthStore";
import api from "@/lib/api";
import { toast } from "sonner";

import { Building2, MapPin, Phone, Mail, Clock, Printer } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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

// 1. Schema - Dựa trên backend
const settingsSchema = z.object({
  displayName: z.string().min(2, "Tên xưởng in phải có ít nhất 2 ký tự"),
  phone: z.string().optional(),
  addressStreet: z.string().optional(),
  addressWard: z.string().optional(),
  addressDistrict: z.string().optional(),
  addressCity: z.string().optional(),
  specialties: z.string().optional(),
  priceTier: z.enum(["cheap", "standard", "premium"]).default("standard"),
  productionSpeed: z.enum(["fast", "standard"]).default("standard"),
});
type SettingsFormValues = z.infer<typeof settingsSchema>;

export function SettingsPage() {
  const { user, setUser } = useAuthStore();

  // 2. Khởi tạo Form
  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      displayName: user?.displayName || "",
      phone: user?.phone || "",
      addressStreet: user?.address?.street || "",
      addressWard: user?.address?.ward || "",
      addressDistrict: user?.address?.district || "",
      addressCity: user?.address?.city || "",
      specialties: user?.specialties?.join(", ") || "",
      priceTier: user?.priceTier || "standard",
      productionSpeed: user?.productionSpeed || "standard",
    },
  });

  // 3. Hàm Submit
  const onSubmit = async (values: SettingsFormValues) => {
    try {
      const payload = {
        displayName: values.displayName,
        phone: values.phone,
        specialties:
          values.specialties
            ?.split(",")
            .map((s) => s.trim())
            .filter(Boolean) || [],
        priceTier: values.priceTier,
        productionSpeed: values.productionSpeed,
        address: {
          street: values.addressStreet,
          ward: values.addressWard,
          district: values.addressDistrict,
          city: values.addressCity,
        },
      };

      const response = await api.put("/api/printer/profile", payload);
      setUser(response.data.printer);
      toast.success("Cập nhật hồ sơ thành công!");
    } catch (err) {
      console.error(err);
      toast.error("Cập nhật thất bại. Vui lòng thử lại.");
    }
  };

  return (
    // 4. Bọc Form và ScrollArea
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <ScrollArea className="h-screen flex-1 bg-gray-50">
          <div className="p-8 max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-gray-900 mb-2">Cài đặt</h1>
              <p className="text-gray-600">
                Quản lý thông tin và cấu hình xưởng in của bạn
              </p>
            </div>

            {/* Business Information */}
            <Card className="border-none shadow-sm mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 size={20} className="text-orange-600" />
                  Thông tin doanh nghiệp (Đã kết nối)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
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
                    <Label>Mã số thuế (Sắp có)</Label>
                    <Input
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
                        <MapPin size={16} /> Địa chỉ (Số đường)
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Số nhà, tên đường" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="addressCity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tỉnh/Thành phố</FormLabel>
                        <FormControl>
                          <Input placeholder="VD: TP. Hồ Chí Minh" {...field} />
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
                          <Input placeholder="VD: Quận 1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="addressWard"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phường/Xã</FormLabel>
                        <FormControl>
                          <Input placeholder="VD: Phường 1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Phone size={16} /> Số điện thoại
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="VD: 0901234567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div>
                    <Label className="flex items-center gap-2">
                      <Mail size={16} /> Email
                    </Label>
                    <Input
                      type="email"
                      value={user?.email || ""}
                      disabled
                      className="mt-1"
                      title="Không thể thay đổi email đăng nhập"
                    />
                  </div>
                </div>
                <div>
                  <Label>Giới thiệu về xưởng in (Sắp có)</Label>
                  <Textarea
                    placeholder="Mô tả ngắn về xưởng in của bạn..."
                    className="mt-1 h-24"
                    disabled
                    title="Tính năng sẽ cập nhật sau"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Printing Capabilities (Đã kết nối) */}
            <Card className="border-none shadow-sm mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Printer size={20} className="text-orange-600" />
                  Khả năng in ấn (Quan trọng)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="specialties"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chuyên môn</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="áo thun, cốc sứ, banner..."
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Cách nhau bằng dấu phẩy (,). AI dùng thông tin này để
                        tìm bạn.
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
                              Tiêu chuẩn (Standard)
                            </SelectItem>
                            <SelectItem value="premium">
                              Cao cấp (Premium)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          AI dùng khi khách tìm "in rẻ".
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
                              Nhanh (Lấy liền, lấy gấp)
                            </SelectItem>
                            <SelectItem value="standard">
                              Tiêu chuẩn (Standard)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          AI dùng khi khách tìm "in nhanh".
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* (Các Card "Giờ làm việc", "Thông báo" tĩnh giữ nguyên) */}

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => form.reset()}
              >
                Hủy thay đổi
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? "Đang lưu..." : "Lưu cài đặt"}
              </Button>
            </div>
          </div>
        </ScrollArea>
      </form>
    </Form>
  );
}
