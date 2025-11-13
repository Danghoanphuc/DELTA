// src/features/customer/hooks/useCustomerSettings.ts
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuthStore } from "@/stores/useAuthStore";
import { toast } from "sonner";
import api from "@/shared/lib/axios";

// --- Schemas ---
const profileSchema = z.object({
  displayName: z
    .string()
    .min(3, "Tên phải có ít nhất 3 ký tự")
    .max(50, "Tên không quá 50 ký tự"),
  phone: z
    .string()
    .regex(/^(0\d{9}|)$/, "Số điện thoại không hợp lệ (gồm 10 số)")
    .optional(),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại"),
    newPassword: z.string().min(6, "Mật khẩu mới phải có ít nhất 6 ký tự"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

// --- Types ---
export type ProfileFormValues = z.infer<typeof profileSchema>;
export type PasswordFormValues = z.infer<typeof passwordSchema>;

export const useCustomerSettings = () => {
  const { user, setUser } = useAuthStore();
  const [isProfileSubmitting, setIsProfileSubmitting] = useState(false);
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false);

  // === Form 1: Profile ===
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: "",
      phone: "",
    },
  });

  // Load data từ authStore vào form
  useEffect(() => {
    if (user) {
      profileForm.reset({
        displayName: user.displayName || "",
        phone: user.phone || "",
      });
    }
  }, [user, profileForm.reset]);

  const onSubmitProfile = async (data: ProfileFormValues) => {
    setIsProfileSubmitting(true);
    const toastId = toast.loading("Đang cập nhật hồ sơ...");
    try {
      // API này chúng ta sẽ tạo ở Backend (Bàn giao 2)
      const res = await api.put("/customer/profile", data);

      // Cập nhật lại user trong zustand store
      setUser(res.data.data.user);

      toast.success("Cập nhật hồ sơ thành công!", { id: toastId });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Cập nhật thất bại", {
        id: toastId,
      });
    } finally {
      setIsProfileSubmitting(false);
    }
  };

  // === Form 2: Password ===
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onChangePassword = async (data: PasswordFormValues) => {
    setIsPasswordSubmitting(true);
    const toastId = toast.loading("Đang thay đổi mật khẩu...");
    try {
      // API này chúng ta sẽ tạo ở Backend (Bàn giao 2)
      await api.put("/customer/security/change-password", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      toast.success("Thay đổi mật khẩu thành công!", { id: toastId });
      passwordForm.reset();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Thay đổi thất bại", {
        id: toastId,
      });
    } finally {
      setIsPasswordSubmitting(false);
    }
  };

  return {
    user,
    profileForm,
    passwordForm,
    isProfileSubmitting,
    isPasswordSubmitting,
    onSubmitProfile,
    onChangePassword,
  };
};
