// frontend/src/components/auth/signup-form.tsx (HOÀN CHỈNH)

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { useForm, UseFormRegisterReturn, FieldError } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@/components/ui/label";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, User, LucideIcon } from "lucide-react";
import { useState } from "react";
import { SocialButton } from "@/components/ui/SocialButton";
import { ImageWithFallback } from "@/components/figma/ImageWithFallback";
import { toast } from "sonner";
import api from "@/lib/axios"; // 👈 Đảm bảo import API từ đúng đường dẫn

// --- (KHÔNG THAY ĐỔI) Zod Schema của bạn (đã nâng cấp) ---
const signUpSchema = z
  .object({
    firstname: z.string().min(1, "Tên bắt buộc phải có"),
    lastname: z.string().min(1, "Họ bắt buộc phải có"),
    username: z.string().min(3, "Tên đăng nhập phải có ít nhất 3 ký tự"),
    email: z.string().email("Email không hợp lệ"),
    password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
    confirmPassword: z.string().min(6, "Bạn phải xác nhận mật khẩu"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

type SignUpFormValues = z.infer<typeof signUpSchema>;

// --- (KHÔNG THAY ĐỔI) Component Input Gọn Gàng ---
type FormInputGroupProps = {
  id: string;
  label: string;
  register: UseFormRegisterReturn;
  error?: FieldError;
  icon: LucideIcon;
  type?: React.HTMLInputTypeAttribute;
  placeholder?: string;
  children?: React.ReactNode;
  inputClassName?: string;
};

const FormInputGroup = ({
  id,
  label,
  register,
  error,
  icon: Icon,
  type = "text",
  placeholder,
  children,
  inputClassName,
}: FormInputGroupProps) => (
  <div className="space-y-2 group">
    <Label
      htmlFor={id}
      className="block group-focus-within:text-indigo-600 transition-colors"
    >
      {label}
    </Label>
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground group-focus-within:text-indigo-500 transition-colors pointer-events-none" />
      <Input
        type={type}
        id={id}
        placeholder={placeholder}
        {...register}
        className={cn(
          "pl-10 bg-white/50 border-gray-200 hover:border-gray-300 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all duration-200 placeholder:text-gray-400",
          inputClassName
        )}
      />
      {children}
    </div>
    {error && <p className="text-destructive text-sm">{error.message}</p>}
  </div>
);

// --- (ĐÃ SỬA) COMPONENT FORM CHÍNH ---
export function SignUpForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Logic hook form (Không thay đổi)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
  });

  // Logic onSubmit (Không thay đổi)
  const onSubmit = async (data: SignUpFormValues) => {
    const { firstname, lastname, username, email, password } = data;
    const displayName = `${firstname} ${lastname}`.trim();

    try {
      const apiData = { username, password, email, displayName };
      await api.post("/auth/signup", apiData);
      toast.success("Đăng ký thành công! Vui lòng kiểm tra email.");
      navigate("/check-your-email", { state: { email: apiData.email } });
    } catch (err: any) {
      let errorMessage = "Đã xảy ra lỗi. Vui lòng thử lại.";
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      toast.error(errorMessage);
    }
  };

  // --- (ĐÃ SẮP XẾP LẠI) PHẦN JSX RETURN ---
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0 border border-white/20 bg-white/95 backdrop-blur-md shadow-xl hover:shadow-2xl transition-all duration-300 relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>

        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit(onSubmit)}>
            {/* Giảm khoảng cách (gap) tổng thể một chút từ gap-6 xuống gap-5
              để form "nhỏ nhắn" hơn một chút theo chiều dọc.
            */}
            <div className="flex flex-col gap-5">
              {/* header (Không thay đổi) */}
              <div className="flex flex-col items-center text-center gap-2">
                <h1 className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Tạo tài khoản PrintZ
                </h1>
                <p className="text-muted-foreground text-balance">
                  Chào mừng bạn! Hãy đăng ký để bắt đầu!
                </p>
              </div>

              {/* --- (ĐÃ DI CHUYỂN) Social Logins --- */}
              <div>
                <SocialButton provider="google" />
              </div>

              {/* --- (ĐÃ DI CHUYỂN) Divider --- */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-3 text-gray-500">
                    Hoặc đăng ký bằng email
                  </span>
                </div>
              </div>

              {/* họ & tên (Không thay đổi) */}
              <div className="grid grid-cols-2 gap-4">
                <FormInputGroup
                  id="lastname"
                  label="Họ"
                  placeholder="Nguyễn"
                  icon={User}
                  register={register("lastname")}
                  error={errors.lastname}
                />
                <FormInputGroup
                  id="firstname"
                  label="Tên"
                  placeholder="Văn A"
                  icon={User}
                  register={register("firstname")}
                  error={errors.firstname}
                />
              </div>

              {/* username (Không thay đổi) */}
              <FormInputGroup
                id="username"
                label="Tên đăng nhập"
                placeholder="PrintZ_user123"
                icon={User}
                register={register("username")}
                error={errors.username}
              />

              {/* email (Không thay đổi) */}
              <FormInputGroup
                id="email"
                label="Email"
                type="email"
                placeholder="mailcuaban@printz.vn"
                icon={Mail}
                register={register("email")}
                error={errors.email}
              />

              {/* --- (MỚI) Mật khẩu gộp chung 1 hàng --- */}
              <div className="grid grid-cols-2 gap-4">
                <FormInputGroup
                  id="password"
                  label="Mật khẩu"
                  type={showPassword ? "text" : "password"}
                  icon={Lock}
                  register={register("password")}
                  error={errors.password}
                  inputClassName="pr-10"
                >
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors p-1 rounded hover:bg-indigo-50"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4.5 h-4.5" />
                    ) : (
                      <Eye className="w-4.5 h-4.5" />
                    )}
                  </button>
                </FormInputGroup>

                <FormInputGroup
                  id="confirmPassword"
                  label="Xác nhận mật khẩu"
                  type={showConfirmPassword ? "text" : "password"}
                  icon={Lock}
                  register={register("confirmPassword")}
                  error={errors.confirmPassword}
                  inputClassName="pr-10"
                >
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors p-1 rounded hover:bg-indigo-50"
                    aria-label="Toggle password visibility"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4.5 h-4.5" />
                    ) : (
                      <Eye className="w-4.5 h-4.5" />
                    )}
                  </button>
                </FormInputGroup>
              </div>

              {/* nút đăng ký (Không thay đổi) */}
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Đang xử lý..." : "Tạo tài khoản"}
              </Button>

              {/* Link Đăng nhập (Không thay đổi) */}
              <div className="text-center text-sm text-gray-600">
                Đã có tài khoản?{" "}
                <Link
                  to="/signin"
                  className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors underline underline-offset-2"
                >
                  Đăng nhập
                </Link>
              </div>
            </div>
          </form>

          {/* Ảnh (Không thay đổi) */}
          <div className="bg-gradient-to-br from-blue-50/50 via-indigo-50/30 to-purple-50/50 relative hidden md:flex items-center justify-center overflow-hidden">
            {/* ... (orbs và image) ... */}
            <ImageWithFallback
              src="https://tse2.mm.bing.net/th/id/OIP.2g2nH5P_6Clsro5r626-7AHaJl?cb=12ucfimg=1&rs=1&pid=ImgDetMain&o=7&rm=3"
              alt="Signup illustration"
              className="relative z-10 object-cover max-w-[90%] max-h-[90%] rounded-lg shadow-2xl"
            />
          </div>
        </CardContent>

        {/* Footer (Không thay đổi) */}
        <div className="text-xs text-balance px-6 py-4 text-center text-muted-foreground mt-2">
          {/* ... (Text điều khoản) ... */}
        </div>
      </Card>
    </div>
  );
}
