// src/components/auth/PrinterSignUpForm.tsx (TỆP MỚI)
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
import { toast } from "sonner";
import { authService } from "@/services/authService"; // Import service

// --- Zod Schema cho Nhà in ---
const signUpPrinterSchema = z
  .object({
    displayName: z.string().min(3, "Tên xưởng in phải có ít nhất 3 ký tự"),
    email: z.string().email("Email không hợp lệ"),
    password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
    confirmPassword: z.string().min(6, "Bạn phải xác nhận mật khẩu"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

type SignUpFormValues = z.infer<typeof signUpPrinterSchema>;

// --- Component Input (Giữ nguyên) ---
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
// (Sao chép component FormInputGroup từ signup-form.tsx vào đây)
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
    {/* ... (jsx của FormInputGroup) ... */}
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

// --- COMPONENT FORM CHÍNH ---
export function PrinterSignUpForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpPrinterSchema),
  });

  // --- Logic onSubmit (ĐÃ SỬA) ---
  const onSubmit = async (data: SignUpFormValues) => {
    const { displayName, email, password } = data;

    try {
      await authService.signUpPrinter(displayName, email, password);
      toast.success("Đăng ký xưởng in thành công! Vui lòng kiểm tra email.");
      navigate("/check-your-email", { state: { email } });
    } catch (err: any) {
      let errorMessage = "Đã xảy ra lỗi. Vui lòng thử lại.";
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      toast.error(errorMessage);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0 border border-white/20 bg-white/95 backdrop-blur-md shadow-xl">
        {/* ... (Thanh gradient) ... */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500"></div>

        <CardContent className="p-0">
          <form className="p-6 md:p-8" onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-5">
              {/* header */}
              <div className="flex flex-col items-center text-center gap-2">
                <h1 className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Đăng ký Xưởng in
                </h1>
                <p className="text-muted-foreground text-balance">
                  Trở thành đối tác của PrintZ ngay hôm nay!
                </p>
              </div>

              {/* Tên xưởng in (MỚI) */}
              <FormInputGroup
                id="displayName"
                label="Tên xưởng in / Doanh nghiệp"
                placeholder="VD: Xưởng in ABC"
                icon={User}
                register={register("displayName")}
                error={errors.displayName}
              />

              {/* email (Giữ nguyên) */}
              <FormInputGroup
                id="email"
                label="Email"
                type="email"
                placeholder="mailcuaban@printz.vn"
                icon={Mail}
                register={register("email")}
                error={errors.email}
              />

              {/* Mật khẩu (Giữ nguyên, nhưng gộp lại) */}
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 p-1"
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 p-1"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4.5 h-4.5" />
                    ) : (
                      <Eye className="w-4.5 h-4.5" />
                    )}
                  </button>
                </FormInputGroup>
              </div>

              {/* nút đăng ký */}
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Đang xử lý..." : "Tạo tài khoản Nhà in"}
              </Button>

              {/* Link Đăng nhập */}
              <div className="text-center text-sm text-gray-600">
                Đã có tài khoản Nhà in?{" "}
                <Link
                  to="/printer/signin" // <-- Link mới
                  className="text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Đăng nhập
                </Link>
              </div>
              <div className="text-center text-sm text-gray-600">
                Bạn là khách hàng?{" "}
                <Link
                  to="/signup" // <-- Link về trang KH
                  className="text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Đăng ký tại đây
                </Link>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
