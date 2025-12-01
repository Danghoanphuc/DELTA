// src/features/customer/components/settings/ProfileSettingsTab.tsx (CẬP NHẬT)
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
import { useCustomerSettings } from "@/features/customer/hooks/useCustomerSettings";
import { UserAvatar } from "@/components/UserAvatar";
import { AvatarCropModal } from "@/features/printer/components/AvatarCropModal";
import { toast } from "@/shared/utils/toast";
import api from "@/shared/lib/axios";
import { useAuthStore } from "@/stores/useAuthStore";
import { useState } from "react";

export function ProfileSettingsTab() {
  const { user, profileForm, isProfileSubmitting, onSubmitProfile } =
    useCustomerSettings();
  const { setUser } = useAuthStore();
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // ✅ States cho crop modal
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ảnh quá lớn. Vui lòng chọn ảnh dưới 5MB.");
      return;
    }

    // ✅ Mở crop modal thay vì upload trực tiếp
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      setCropModalOpen(true);
    };
    reader.readAsDataURL(file);

    // Reset input để có thể chọn lại cùng file
    e.target.value = "";
  };

  // ✅ Handler upload sau khi crop
  const handleSaveCroppedAvatar = async (file: File) => {
    const toastId = toast.loading("Đang tải lên ảnh đại diện...");
    setIsUploadingAvatar(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const uploadRes = await api.post("/uploads/file", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const newAvatarUrl = uploadRes.data.data.url;
      const profileRes = await api.put("/customer/profile", {
        avatarUrl: newAvatarUrl,
      });
      setUser(profileRes.data.data.user);
      toast.success("Cập nhật ảnh đại diện thành công!", { id: toastId });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Tải lên thất bại", {
        id: toastId,
      });
    } finally {
      setIsUploadingAvatar(false);
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
                {/* ✅ SỬA LỖI TẠI ĐÂY */}
                <UserAvatar
                  name={user?.displayName || "U"}
                  src={user?.avatarUrl}
                  size={64}
                  fallbackClassName="bg-blue-100 text-blue-600"
                  className="text-blue-600"
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
                  onChange={handleAvatarSelect}
                  disabled={isUploadingAvatar}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Bạn có thể cắt và chỉnh sửa ảnh sau khi chọn
              </p>
            </FormItem>

            {/* (Email, Display Name, Phone giữ nguyên) */}
            <FormItem>
              <FormLabel>Email</FormLabel>
              <Input value={user?.email || ""} disabled />
            </FormItem>
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

      {/* ✅ Modal Crop Ảnh */}
      {selectedImage && (
        <AvatarCropModal
          isOpen={cropModalOpen}
          onClose={() => {
            setCropModalOpen(false);
            setSelectedImage(null);
          }}
          imageSrc={selectedImage}
          onSave={handleSaveCroppedAvatar}
        />
      )}
    </Card>
  );
}
