// src/features/customer/components/settings/ProfileSettingsTab.tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { Loader2 } from "lucide-react";
import { useCustomerSettings } from "../../hooks/useCustomerSettings";
import UserAvatarFallback from "@/components/UserAvatarFallback";
import { toast } from "sonner";
import api from "@/shared/lib/axios";
import { useAuthStore } from "@/stores/useAuthStore";
import { useState } from "react";

export function ProfileSettingsTab() {
  const { user, profileForm, isProfileSubmitting, onSubmitProfile } =
    useCustomerSettings();
  const { setUser } = useAuthStore();
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      // 2MB Limit
      toast.error("Ảnh quá lớn. Vui lòng chọn ảnh dưới 2MB.");
      return;
    }

    const toastId = toast.loading("Đang tải lên ảnh đại diện...");
    setIsUploadingAvatar(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      // 1. Tải file lên Cloudinary (dùng API upload chung)
      const uploadRes = await api.post("/uploads/file", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const newAvatarUrl = uploadRes.data.data.url;

      // 2. Cập nhật URL vào hồ sơ user (dùng API sắp tạo)
      const profileRes = await api.put("/customer/profile", {
        avatarUrl: newAvatarUrl,
      });

      // 3. Cập nhật store
      setUser(profileRes.data.data.user);
      toast.success("Cập nhật ảnh đại diện thành công!", { id: toastId });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Tải lên thất bại", {
        id: toastId,
      });
    } finally {
      setIsUploadingAvatar(false);
      e.target.value = ""; // Reset input
    }
  };

  return (
    <Card>
      <Form {...profileForm}>
        <form onSubmit={profileForm.handleSubmit(onSubmitProfile)}>
          <CardHeader>
            <CardTitle>Hồ sơ cá nhân</CardTitle>
            <CardDescription>
              Cập nhật thông tin cá nhân của bạn.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar */}
            <FormItem>
              <FormLabel>Ảnh đại diện</FormLabel>
              <div className="flex items-center gap-4">
                <UserAvatarFallback
                  name={user?.displayName || "U"}
                  src={user?.avatarUrl}
                  size={64}
                  bgColor="bg-blue-100"
                  textColor="text-blue-600"
                />
                <Button
                  type="button"
                  variant="outline"
                  asChild
                  disabled={isUploadingAvatar}
                >
                  <label htmlFor="avatar-upload" className="cursor-pointer">
                    {isUploadingAvatar ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    Thay đổi
                  </label>
                </Button>
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/png, image/jpeg"
                  onChange={handleAvatarUpload}
                  disabled={isUploadingAvatar}
                />
              </div>
            </FormItem>

            {/* Email (Disabled) */}
            <FormItem>
              <FormLabel>Email</FormLabel>
              <Input value={user?.email || ""} disabled />
            </FormItem>

            {/* Display Name */}
            <FormField
              control={profileForm.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên hiển thị</FormLabel>
                  <FormControl>
                    <Input placeholder="Tên của bạn" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Phone */}
            <FormField
              control={profileForm.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Số điện thoại</FormLabel>
                  <FormControl>
                    <Input placeholder="090..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isProfileSubmitting}>
              {isProfileSubmitting && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Lưu thay đổi
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
