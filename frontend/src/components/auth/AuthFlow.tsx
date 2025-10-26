// src/components/auth/AuthFlow.tsx

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { SocialButton } from "@/components/ui/SocialButton";
import { toast } from "sonner";
import api from "@/lib/axios";
import { useAuthStore } from "@/stores/useAuthStore";
import printzLogo from "@/assets/img/printz.png";

// --- (SỬA) Schema ---
// 1. Đặt các trường không dùng trong 'signIn' là optional
const authFlowSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  firstName: z.string().optional(), // <-- Sửa
  lastName: z.string().optional(), // <-- Sửa
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  confirmPassword: z.string().optional(), // <-- Sửa
});
// 2. XÓA LUẬT .refine() GÂY LỖI

type AuthFlowValues = z.infer<typeof authFlowSchema>;

type AuthMode = "signIn" | "signUp";
type AuthRole = "customer" | "printer";
type AuthStep = "email" | "name" | "password" | "verifySent";

interface AuthFlowProps {
  mode: AuthMode;
  role: AuthRole;
}

const EMAIL_PREFETCH_KEY = "auth-email-prefetch";

export function AuthFlow({ mode, role }: AuthFlowProps) {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuthStore();
  const [step, setStep] = useState<AuthStep>("email");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<AuthFlowValues>({
    resolver: zodResolver(authFlowSchema), // Vẫn dùng resolver
    mode: "onTouched",
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      password: "",
      confirmPassword: "",
    },
  });

  const email = watch("email");

  // (Logic pre-fill email giữ nguyên - Đang chạy tốt)
  useEffect(() => {
    const prefillEmail = localStorage.getItem(EMAIL_PREFETCH_KEY);
    if (prefillEmail && mode === "signIn") {
      setValue("email", prefillEmail);
      setStep("password");
      localStorage.removeItem(EMAIL_PREFETCH_KEY);
      toast.info("Vui lòng nhập mật khẩu để đăng nhập.");
    }
  }, [mode, setValue]);

  // (Các hàm xử lý bước giữ nguyên)
  const handleEmailSubmit = async () => {
    const isValid = await trigger("email");
    if (!isValid) return;
    if (mode === "signUp") setStep("name");
    else setStep("password");
  };

  const handleNameSubmit = async () => {
    // (SỬA) Bắt buộc 2 trường này khi trigger
    const isFirstValid = await trigger("firstName", {
      shouldFocus: true,
    });
    const isLastValid = await trigger("lastName", {
      shouldFocus: true,
    });

    // Cần 1 check thủ công nhỏ vì schema là optional
    const firstName = watch("firstName");
    const lastName = watch("lastName");
    if (!firstName || !lastName || !isFirstValid || !isLastValid) {
      toast.error("Vui lòng nhập đầy đủ Họ và Tên");
      return;
    }
    setStep("password");
  };

  // --- (SỬA) Logic Gửi Form (Thêm kiểm tra mật khẩu thủ công) ---
  const onSubmit = async (data: AuthFlowValues) => {
    setIsLoading(true);
    try {
      if (mode === "signUp") {
        // --- Flow Đăng Ký ---
        const { email, password, firstName, lastName, confirmPassword } = data;
        if (password !== confirmPassword) {
          toast.error("Mật khẩu xác nhận không khớp!");
          setIsLoading(false);
          return;
        }

        const displayName = `${firstName} ${lastName}`.trim();

        if (role === "printer") {
          // (Đăng ký nhà in vẫn dùng api.post trực tiếp - Đã đúng từ GĐ2)
          await api.post("/auth/signup-printer", {
            email,
            password,
            displayName,
          });
        } else {
          // (SỬA) Gọi hàm signUp từ store
          await signUp(email, password, displayName);
        }
        setStep("verifySent"); // Chuyển sang thông báo
      } else {
        // --- Flow Đăng Nhập ---
        const { email, password } = data;
        await signIn(email, password); // Gọi signIn từ store
        navigate("/"); // Thành công -> Về trang chủ
      }
    } catch (err: any) {
      // (Lỗi đã được toast trong store, không cần toast lại)
      console.error("Lỗi AuthFlow:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // (Hàm renderLinks giữ nguyên)
  const renderLinks = () => {
    if (step === "email") {
      if (mode === "signIn") {
        return (
          <>
            <Link to="/signup" className="text-indigo-600 font-medium text-sm">
              Chưa có tài khoản? Đăng ký
            </Link>
            <Link
              to="/printer/signup"
              className="text-orange-600 font-medium text-sm"
            >
              Bạn là nhà in? Đăng ký tại đây
            </Link>
          </>
        );
      }
      if (mode === "signUp") {
        return (
          <>
            <Link to="/signin" className="text-indigo-600 font-medium text-sm">
              Đã có tài khoản? Đăng nhập
            </Link>
            {role === "customer" && (
              <Link
                to="/printer/signup"
                className="text-orange-600 font-medium text-sm"
              >
                Bạn là nhà in?
              </Link>
            )}
            {role === "printer" && (
              <Link
                to="/signup"
                className="text-indigo-600 font-medium text-sm"
              >
                Bạn là khách hàng?
              </Link>
            )}
          </>
        );
      }
    }
    return null;
  };

  // (Hàm nút Back giữ nguyên)
  const getBackButtonAction = () => {
    if (step === "name") return () => setStep("email");
    if (step === "password")
      return () => setStep(mode === "signUp" ? "name" : "email");
    return undefined;
  };
  const backButtonAction = getBackButtonAction();

  return (
    <Card className="w-full max-w-sm p-6 md:p-8 bg-white/95 backdrop-blur-md shadow-xl border-none relative">
      <div className="flex flex-col gap-6">
        {/* (Header giữ nguyên) */}
        <div className="flex flex-col items-center text-center gap-4">
          {backButtonAction && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 left-4 text-gray-500"
              onClick={backButtonAction}
              aria-label="Quay lại"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          <img src={printzLogo} alt="PrintZ Logo" className="w-16 h-16" />
          <h1 className="text-2xl font-bold text-gray-900">
            {step === "email" &&
              (mode === "signIn"
                ? "Chào mừng quay lại!"
                : role === "printer"
                ? "Đăng ký Xưởng in"
                : "Tạo tài khoản")}
            {step === "name" && "Chúng tôi nên gọi bạn là gì?"}
            {step === "password" &&
              (mode === "signIn" ? "Nhập mật khẩu" : "Tạo mật khẩu")}
            {step === "verifySent" && "Kiểm tra email của bạn!"}
          </h1>
        </div>

        {/* (Nút Google giữ nguyên) */}
        {step === "email" && <SocialButton provider="google" role={role} />}

        {/* --- FORM ĐA BƯỚC --- */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          {/* ----- Bước 1: Email (Giữ nguyên) ----- */}
          <div
            className={cn("flex flex-col gap-5", step !== "email" && "hidden")}
          >
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="email"
                id="email"
                placeholder="Email"
                {...register("email")}
                className="pl-12 h-12 text-base"
              />
            </div>
            {errors.email && (
              <p className="text-destructive text-sm -mt-3">
                {errors.email.message}
              </p>
            )}
            <Button
              type="button"
              className="w-full h-12 text-base"
              onClick={handleEmailSubmit}
              disabled={isLoading}
            >
              Tiếp tục
            </Button>
          </div>

          {/* ----- Bước 2: Tên (SỬA) ----- */}
          {mode === "signUp" && (
            <div
              className={cn("flex flex-col gap-5", step !== "name" && "hidden")}
            >
              <Input
                type="text"
                id="firstName"
                placeholder="Tên"
                // (SỬA) Chỉ register, không set required ở đây
                {...register("firstName")}
                className="h-12 text-base"
              />
              {/* (Lỗi này sẽ được bắt bởi handleNameSubmit) */}

              <Input
                type="text"
                id="lastName"
                placeholder="Họ"
                // (SỬA) Chỉ register
                {...register("lastName")}
                className="h-12 text-base"
              />

              <Button
                type="button"
                className="w-full h-12 text-base"
                onClick={handleNameSubmit}
                disabled={isLoading}
              >
                Tiếp tục
              </Button>
            </div>
          )}

          {/* ----- Bước 3: Mật khẩu (Giữ nguyên) ----- */}
          <div
            className={cn(
              "flex flex-col gap-5",
              step !== "password" && "hidden"
            )}
          >
            <p className="text-center text-gray-600 text-sm -mb-2">
              <span
                className="font-medium p-1 cursor-pointer hover:bg-gray-100 rounded"
                onClick={() => setStep("email")}
              >
                {email}
              </span>
            </p>

            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="Mật khẩu"
                {...register("password", {
                  required: "Vui lòng nhập mật khẩu",
                  minLength: { value: 6, message: "Cần ít nhất 6 ký tự" },
                })}
                className="pl-12 pr-12 h-12 text-base"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500"
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
            {errors.password && (
              <p className="text-destructive text-sm -mt-3">
                {errors.password.message}
              </p>
            )}

            {/* (Chỉ Đăng ký) Thêm xác nhận MK */}
            {mode === "signUp" && (
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="password"
                  id="confirmPassword"
                  placeholder="Xác nhận mật khẩu"
                  {...register("confirmPassword")}
                />
              </div>
            )}
            {/* (XÓA) Bỏ hiển thị lỗi .refine() cũ
              {errors.confirmPassword && ( ... )}
            */}

            <Button
              type="submit"
              className="w-full h-12 text-base"
              disabled={isLoading}
            >
              {isLoading
                ? "Đang xử lý..."
                : mode === "signIn"
                ? "Đăng nhập"
                : "Tạo tài khoản"}
            </Button>
          </div>
        </form>

        {/* ----- Bước 4: Thông báo (Giữ nguyên) ----- */}
        {step === "verifySent" && (
          <div className="text-center text-gray-700">
            <p>
              Chúng tôi đã gửi một email xác thực đến{" "}
              <strong className="text-gray-900">{email}</strong>.
            </p>
            <p className="mt-2">
              Vui lòng kiểm tra hộp thư (cả mục Spam) và nhấn vào link để kích
              hoạt.
            </p>
          </div>
        )}

        {/* (Links và Điều khoản giữ nguyên) */}
        <div className="flex flex-col items-center gap-2 text-sm text-center">
          {renderLinks()}
        </div>

        {step === "email" && (
          <p className="text-xs text-center text-muted-foreground mt-4">
            Bằng cách tiếp tục, bạn đồng ý với{" "}
            <a href="#" className="text-indigo-600 underline">
              Điều khoản và Dịch vụ
            </a>{" "}
            của chúng tôi.
          </p>
        )}
      </div>
    </Card>
  );
}
