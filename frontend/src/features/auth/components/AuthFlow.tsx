// frontend/src/features/auth/components/AuthFlow.tsx
// ✅ FIXED: Removed role prop, improved error handling and UX

import { useState, useEffect } from "react";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Loader2 } from "lucide-react";
import { SocialButton } from "@/shared/components/ui/SocialButton";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/useAuthStore";
import { useCartStore } from "@/stores/useCartStore";
import printzLogo from "@/assets/img/logo-printz.png";

// Validation schema
const authFlowSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  confirmPassword: z.string().optional(),
});

type AuthFlowValues = z.infer<typeof authFlowSchema>;
type AuthMode = "signIn" | "signUp";
type AuthStep = "email" | "name" | "password" | "verifySent";

interface AuthFlowProps {
  mode: AuthMode;
}

const EMAIL_PREFETCH_KEY = "auth-email-prefetch";

export function AuthFlow({ mode }: AuthFlowProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signUp, user } = useAuthStore();
  const mergeGuestCart = useCartStore((s) => s.mergeGuestCartToServer);

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

  // Pre-fill email from verification
  useEffect(() => {
    const prefillEmail = localStorage.getItem(EMAIL_PREFETCH_KEY);
    if (prefillEmail && mode === "signIn") {
      setValue("email", prefillEmail);
      setStep("password");
      localStorage.removeItem(EMAIL_PREFETCH_KEY);
      toast.info("Vui lòng nhập mật khẩu để đăng nhập.");
    }
  }, [mode, setValue]);

  // Auto-redirect if already logged in
  useEffect(() => {
    const currentPath = window.location.pathname;
    const authPaths = ["/signin", "/signup"];

    if (user && authPaths.includes(currentPath)) {
      const from = location.state?.from?.pathname;

      if (from && from !== currentPath) {
        toast.success("Đã đăng nhập, đang chuyển hướng...");
        navigate(from, { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    }
  }, [user, navigate, location.state]);

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
        await signUp(email, password, displayName);
        setStep("verifySent");
      } else {
        // Sign In flow
        const { email, password } = data;
        await signIn(email, password);

        // Merge guest cart after successful login
        try {
          await mergeGuestCart();
        } catch (err) {
          console.error("[AuthFlow] Cart merge failed:", err);
          // Don't block login flow
        }

        // Redirect is handled by useEffect above
        // But we add a backup timeout just in case
        setTimeout(() => {
          const from = location.state?.from?.pathname;
          navigate(from || "/", { replace: true });
        }, 200);
      }
    } catch (err: any) {
      console.error("[AuthFlow] Error:", err);
      setIsFormLoading(false);
    } finally {
      if (step !== "verifySent") {
        setIsFormLoading(false);
      }
    }
  };

  const renderLinks = () => {
    if (step === "email") {
      if (mode === "signIn") {
        return (
          <Link
            to="/signup"
            className="text-indigo-600 font-medium text-sm hover:underline"
          >
            Chưa có tài khoản? Đăng ký
          </Link>
        );
      }
      if (mode === "signUp") {
        return (
          <Link
            to="/signin"
            className="text-indigo-600 font-medium text-sm hover:underline"
          >
            Đã có tài khoản? Đăng nhập
          </Link>
        );
      }
    }
    return null;
  };

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

        {/* Google Button */}
        {step === "email" && <SocialButton provider="google" />}

        {/* Divider */}
        {step === "email" && (
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground">
                Hoặc tiếp tục với
              </span>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          {/* Step 1: Email */}
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
                disabled={isFormLoading}
                autoFocus
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

          {/* Step 2: Name (Sign Up only) */}
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
                disabled={isFormLoading}
                autoFocus
              />
              <Input
                type="text"
                id="lastName"
                placeholder="Họ"
                {...register("lastName")}
                className="h-12 text-base"
                disabled={isFormLoading}
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

          {/* Step 3: Password */}
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
                {...register("password")}
                className="pl-12 pr-12 h-12 text-base"
                disabled={isFormLoading}
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700"
                disabled={isFormLoading}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
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
                  className="pl-12 h-12 text-base"
                  disabled={isFormLoading}
                />
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 text-base"
              disabled={isFormLoading}
            >
              {isFormLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Đang xử lý...
                </>
              ) : mode === "signIn" ? (
                "Đăng nhập"
              ) : (
                "Tạo tài khoản"
              )}
            </Button>

            {mode === "signIn" && (
              <Link
                to="/reset-password"
                className="text-sm text-center text-indigo-600 hover:underline"
              >
                Quên mật khẩu?
              </Link>
            )}
          </div>
        </form>

        {/* Step 4: Verification Sent */}
        {step === "verifySent" && (
          <div className="text-center text-gray-700 space-y-4">
            <p>
              Chúng tôi đã gửi một email xác thực đến{" "}
              <strong className="text-gray-900">{email}</strong>.
            </p>
            <p className="text-sm">
              Vui lòng kiểm tra hộp thư (cả mục Spam) và nhấn vào link để kích
              hoạt.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => navigate("/check-email", { state: { email } })}
            >
              Tôi đã xác thực
            </Button>
          </div>
        )}

        {/* Links */}
        <div className="flex flex-col items-center gap-2 text-sm text-center">
          {renderLinks()}
        </div>

        {/* Terms */}
        {step === "email" && (
          <p className="text-xs text-center text-muted-foreground mt-4">
            Bằng cách tiếp tục, bạn đồng ý với{" "}
            <a href="/policy" className="text-indigo-600 underline">
              Điều khoản và Dịch vụ
            </a>{" "}
            của chúng tôi.
          </p>
        )}
      </div>
    </Card>
  );
}
