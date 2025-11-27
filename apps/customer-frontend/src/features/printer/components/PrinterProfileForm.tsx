// src/features/printer/components/PrinterProfileForm.tsx
// Main form component cho Printer Profile Settings

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/shared/utils/toast";
import { Loader2, Save } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

import { printerService } from "@/services/printer.service";
import {
  profileFormSchema,
  type ProfileFormValues,
  SPECIALTY_OPTIONS,
  VIETNAM_CITIES,
} from "../schemas/profileFormSchema";
import { ImageUploadField } from "./form-fields/ImageUploadField";
import { TagInputField } from "./form-fields/TagInputField";
import { RadioGroupField } from "./form-fields/RadioGroupField";

export function PrinterProfileForm() {
  const queryClient = useQueryClient();

  // 1. Fetch current profile
  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ["printer-profile", "me"],
    queryFn: printerService.getMyProfile,
  });

  // 2. Setup form
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: profile
      ? {
          businessName: profile.businessName,
          contactPhone: profile.contactPhone,
          contactEmail: profile.contactEmail || "",
          website: profile.website || "",
          description: profile.description || "",
          shopAddress: {
            street: profile.shopAddress.street,
            ward: profile.shopAddress.ward || "",
            district: profile.shopAddress.district,
            city: profile.shopAddress.city,
          },
          specialties: profile.specialties || [],
          priceTier: profile.priceTier,
          productionSpeed: profile.productionSpeed,
        }
      : undefined,
  });

  // 3. Update mutation
  const updateMutation = useMutation({
    mutationFn: printerService.updateMyProfile,
    onSuccess: () => {
      toast.success("Cập nhật thông tin thành công!");
      queryClient.invalidateQueries({ queryKey: ["printer-profile"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Cập nhật thất bại");
    },
  });

  // 4. Submit handler
  const onSubmit = async (values: ProfileFormValues) => {
    updateMutation.mutate(values);
  };

  if (isLoadingProfile) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!profile) {
    return (
      <Card>
        <CardContent className="py-12">
          <p className="text-center text-gray-500">
            Không tìm thấy thông tin xưởng in
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Thông tin cơ bản */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin cơ bản</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Logo & Cover Image */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ImageUploadField
                name="logoUrl"
                label="Logo xưởng in"
                currentUrl={profile.logoUrl}
              />
              <ImageUploadField
                name="coverImage"
                label="Ảnh bìa"
                currentUrl={profile.coverImage}
              />
            </div>

            {/* Business Name */}
            <FormField
              control={form.control}
              name="businessName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên xưởng in *</FormLabel>
                  <FormControl>
                    <Input placeholder="VD: Xưởng In Printz" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Contact Phone */}
            <FormField
              control={form.control}
              name="contactPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Số điện thoại *</FormLabel>
                  <FormControl>
                    <Input placeholder="0123456789" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Contact Email */}
            <FormField
              control={form.control}
              name="contactEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email liên hệ</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="contact@printz.vn"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Website */}
            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://printz.vn"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả xưởng in</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Giới thiệu về xưởng in của bạn..."
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Tối đa 500 ký tự
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Địa chỉ xưởng */}
        <Card>
          <CardHeader>
            <CardTitle>Địa chỉ xưởng</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="shopAddress.street"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Số nhà, tên đường *</FormLabel>
                  <FormControl>
                    <Input placeholder="VD: 123 Nguyễn Văn Linh" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="shopAddress.ward"
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="shopAddress.district"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quận/Huyện *</FormLabel>
                    <FormControl>
                      <Input placeholder="VD: Quận 1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="shopAddress.city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tỉnh/Thành phố *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn tỉnh/thành phố" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {VIETNAM_CITIES.map((city) => (
                          <SelectItem key={city} value={city}>
                            {city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Chuyên môn & Định vị */}
        <Card>
          <CardHeader>
            <CardTitle>Chuyên môn & Định vị</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <TagInputField
              name="specialties"
              label="Chuyên môn *"
              placeholder="Chọn hoặc nhập chuyên môn..."
              suggestions={SPECIALTY_OPTIONS}
            />

            <RadioGroupField
              name="priceTier"
              label="Phân khúc giá *"
              options={[
                {
                  value: "cheap",
                  label: "Giá rẻ",
                  description: "Phù hợp với khách hàng cá nhân, sinh viên",
                },
                {
                  value: "standard",
                  label: "Tiêu chuẩn",
                  description: "Cân bằng giữa giá và chất lượng",
                },
                {
                  value: "premium",
                  label: "Cao cấp",
                  description: "Chất lượng cao, phục vụ doanh nghiệp",
                },
              ]}
            />

            <RadioGroupField
              name="productionSpeed"
              label="Tốc độ sản xuất *"
              options={[
                {
                  value: "fast",
                  label: "Nhanh (< 24h)",
                  description: "Giao hàng trong vòng 24 giờ",
                },
                {
                  value: "standard",
                  label: "Tiêu chuẩn (2-3 ngày)",
                  description: "Thời gian sản xuất bình thường",
                },
              ]}
            />
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            size="lg"
            disabled={updateMutation.isPending}
            className="min-w-[200px]"
          >
            {updateMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Lưu thay đổi
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

