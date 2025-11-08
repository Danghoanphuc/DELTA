// src/features/auth/components/AuthFlow.tsx (✅ FIXED & SIMPLIFIED)

import { useState, useEffect } from "react";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link, useLocation } from "react-router-dom"; // Giữ useLocation
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { SocialButton } from "@/shared/components/ui/SocialButton";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/useAuthStore";
import { useCartStore } from "@/stores/useCartStore";
import printzLogo from "@/assets/img/logo-printz.png";

// --- Schema (Giữ nguyên) ---
const authFlowSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  confirmPassword: z.string().optional(),
});

type AuthFlowValues = z.infer<typeof authFlowSchema>;

type AuthMode = "signIn" | "signUp";
// ❌ XÓA: AuthRole
type AuthStep = "email" | "name" | "password" | "verifySent";

interface AuthFlowProps {
  mode: AuthMode;
  // ❌ XÓA: role: AuthRole;
}

const EMAIL_PREFETCH_KEY = "auth-email-prefetch";

export function AuthFlow({ mode }: AuthFlowProps) {
  // ❌ XÓA: role
  const navigate = useNavigate();
  const location = useLocation(); // Giữ lại để điều hướng sau khi login
  const { signIn, signUp, user } = useAuthStore();
  const [step, setStep] = useState<AuthStep>("email");
  const [showPassword, setShowPassword] = useState(false);
  const [isFormLoading, setIsFormLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<AuthFlowValues>({
    resolver: zodResolver(authFlowSchema),
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

  // (Logic pre-fill email giữ nguyên)
  useEffect(() => {
    const prefillEmail = localStorage.getItem(EMAIL_PREFETCH_KEY);
    if (prefillEmail && mode === "signIn") {
      setValue("email", prefillEmail);
      setStep("password");
      localStorage.removeItem(EMAIL_PREFETCH_KEY);
      toast.info("Vui lòng nhập mật khẩu để đăng nhập.");
    }
  }, [mode, setValue]);

  // (Logic redirect tự động - giữ nguyên từ lần fix trước)
  useEffect(() => {
    const currentPath = window.location.pathname;
    const authPaths = ["/signin", "/signup"];

    if (user && authPaths.includes(currentPath)) {
      const from = location.state?.from?.pathname;

      if (from) {
        toast.success("Đăng nhập thành công, đang quay lại...");
        navigate(from, { replace: true });
        return;
      }

      // Fallback: Nếu không có 'from', về trang chủ (sẽ tự động sang /app)
      navigate("/", { replace: true });
    }
  }, [user, navigate, location.state]);

  // (Các hàm handleEmailSubmit, handleNameSubmit giữ nguyên)
  const handleEmailSubmit = async () => {
    const isValid = await trigger("email");
    if (!isValid) return;
    if (mode === "signUp") setStep("name");
    else setStep("password");
  };

  const handleNameSubmit = async () => {
    const isFirstValid = await trigger("firstName", { shouldFocus: true });
    const isLastValid = await trigger("lastName", { shouldFocus: true });
    const firstName = watch("firstName");
    const lastName = watch("lastName");
    if (!firstName || !lastName || !isFirstValid || !isLastValid) {
      toast.error("Vui lòng nhập đầy đủ Họ và Tên");
      return;
    }
    setStep("password");
  };

  // (Hàm onSubmit - giữ nguyên logic từ lần fix trước)
  const onSubmit = async (data: AuthFlowValues) => {
    setIsFormLoading(true);
    try {
      if (mode === "signUp") {
        const { email, password, firstName, lastName, confirmPassword } = data;

        if (password !== confirmPassword) {
          toast.error("Mật khẩu xác nhận không khớp!");
          setIsFormLoading(false);
          return;
        }

        const displayName = `${firstName} ${lastName}`.trim();

        // ❌ XÓA: Logic if (role === 'printer')
        await signUp(email, password, displayName);

        setStep("verifySent");
      } else {
        // --- Flow Đăng Nhập (Email/Pass) ---
        const { email, password } = data;
        await signIn(email, password);
        await useCartStore.getState().mergeGuestCartToServer();

        // Logic điều hướng đã được xử lý bởi useEffect ở trên
        // (Nếu useEffect chạy trước, form này sẽ không bao giờ submit)
        // (Đây là một backup an toàn)
        const from = location.state?.from?.pathname;
        setTimeout(() => {
          if (from) {
            navigate(from, { replace: true });
          } else {
            navigate("/", { replace: true });
          }
        }, 100);
      }
    } catch (err: any) {
      console.error("Lỗi AuthFlow:", err);
      setIsFormLoading(false);
    } finally {
      if (step !== "verifySent") {
        setIsFormLoading(false);
      }
    }
  };

  // ✅ SỬA: Đơn giản hóa renderLinks
  const renderLinks = () => {
    if (step === "email") {
      if (mode === "signIn") {
        return (
          <Link to="/signup" className="text-indigo-600 font-medium text-sm">
            Chưa có tài khoản? Đăng ký
          </Link>
        );
      }
      if (mode === "signUp") {
        return (
          <Link to="/signin" className="text-indigo-600 font-medium text-sm">
            Đã có tài khoản? Đăng nhập
          </Link>
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
        {/* Header */}
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
              (mode === "signIn" ? "Chào mừng quay lại!" : "Tạo tài khoản")}
            {step === "name" && "Chúng tôi nên gọi bạn là gì?"}
            {step === "password" &&
              (mode === "signIn" ? "Nhập mật khẩu" : "Tạo mật khẩu")}
            {step === "verifySent" && "Kiểm tra email của bạn!"}
          </h1>
        </div>

        {/* ✅ SỬA: Nút Google (không cần 'role') */}
        {step === "email" && <SocialButton provider="google" />}

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
              disabled={isFormLoading}
            >
              Tiếp tục
            </Button>
          </div>

          {/* ----- Bước 2: Tên (Giữ nguyên) ----- */}
          {mode === "signUp" && (
            <div
              className={cn("flex flex-col gap-5", step !== "name" && "hidden")}
            >
              <Input
                type="text"
                id="firstName"
                placeholder="Tên"
                {...register("firstName")}
                className="h-12 text-base"
              />
              <Input
                type="text"
                id="lastName"
                placeholder="Họ"
                {...register("lastName")}
                className="h-12 text-base"
              />
              <Button
                type="button"
                className="w-full h-12 text-base"
                onClick={handleNameSubmit}
                disabled={isFormLoading}
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

            <Button
              type="submit"
              className="w-full h-12 text-base"
              disabled={isFormLoading}
            >
              {isFormLoading
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
