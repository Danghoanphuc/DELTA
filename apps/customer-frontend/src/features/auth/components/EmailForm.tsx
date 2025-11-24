// apps/customer-frontend/src/features/auth/components/EmailForm.tsx
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Mail } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { SocialButton } from "@/shared/components/ui/SocialButton";
import { Link } from "react-router-dom";
import { useTurnstile } from "@/hooks/useTurnstile";
import { toast } from "sonner";
import { cn } from "@/shared/lib/utils";
import type { AuthFlowValues } from "../utils/auth-helpers";

// 🔥 STYLE DYNAMIC HELPER (Màu xanh cho Login, Cam cho Signup)
export const getInputStyle = (isSignIn: boolean) => cn(
  "h-11 bg-slate-50/50 border-0 border-b border-slate-200 rounded-t-lg rounded-b-none focus-visible:ring-0 px-3 text-base transition-all duration-300 placeholder:text-slate-400 font-medium text-slate-900 pl-10",
  isSignIn ? "focus-visible:border-indigo-600" : "focus-visible:border-orange-500"
);

export const getBtnStyle = (isSignIn: boolean) => cn(
  "h-11 w-full text-white font-bold tracking-wide text-sm shadow-md transition-all hover:scale-[1.01] active:scale-[0.98] rounded-lg mt-1",
  isSignIn 
    ? "bg-slate-900 hover:bg-indigo-600 shadow-indigo-500/10" 
    : "bg-orange-600 hover:bg-orange-500 shadow-orange-500/20"
);

interface EmailFormProps {
  form: UseFormReturn<AuthFlowValues>;
  isLoading: boolean;
  mode: "signIn" | "signUp";
  onSubmit: () => void;
}

export function EmailForm({ form, isLoading, mode, onSubmit }: EmailFormProps) {
  const { register, formState: { errors } } = form;
  const { TurnstileWidget, token: turnstileToken } = useTurnstile();
  const shouldShowCaptcha = mode === "signUp";
  const isSignIn = mode === "signIn"; // Check mode

  const handleSubmit = () => {
    if (shouldShowCaptcha && !turnstileToken) {
      toast.error("Vui lòng xác thực bạn không phải robot");
      return;
    }
    onSubmit();
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Social Login */}
      {/* ✅ QUAN TRỌNG: Truyền mode vào để nút Google biết cách hiển thị */}
      <SocialButton 
        provider="google" 
        mode={mode} 
        className="h-10 border-slate-200 bg-white/80 hover:bg-white text-sm font-medium text-slate-600 shadow-sm" 
      />

      {/* Divider */}
      <div className="flex items-center gap-3 opacity-60">
        <span className="h-px bg-slate-300 flex-1" />
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
          Email
        </span>
        <span className="h-px bg-slate-300 flex-1" />
      </div>

      {/* Email Input */}
      <div className="flex flex-col gap-1">
        <div className="group relative">
          <div className={cn(
            "absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors",
            isSignIn ? "group-focus-within:text-indigo-600" : "group-focus-within:text-orange-500"
          )}>
            <Mail className="w-4 h-4" />
          </div>
          <Input
            type="email"
            placeholder="name@example.com"
            {...register("email")}
            className={getInputStyle(isSignIn)} // ✅ Style động theo mode
            disabled={isLoading}
            autoFocus
          />
          {/* Line chạy bên dưới */}
          <div className={cn(
            "absolute bottom-0 left-0 h-[1.5px] w-0 transition-all duration-500 group-focus-within:w-full",
            isSignIn ? "bg-indigo-600" : "bg-orange-500"
          )} />
        </div>

        {errors.email && (
          <p className="text-red-500 text-[10px] font-bold font-mono mt-1">⚠ {errors.email.message}</p>
        )}
      </div>

      {shouldShowCaptcha && (
        <div className="scale-90 origin-left -my-2">
          <TurnstileWidget />
        </div>
      )}

      {/* Button Submit */}
      <Button
        type="button"
        className={getBtnStyle(isSignIn)} // ✅ Style động theo mode
        onClick={handleSubmit}
        disabled={isLoading || (shouldShowCaptcha && !turnstileToken)}
      >
        TIẾP TỤC <span className="ml-1">→</span>
      </Button>

      <div className="text-center mt-1">
        <Link 
          to={isSignIn ? "/signup" : "/signin"} 
          className={cn(
            "text-xs font-bold hover:underline underline-offset-2 transition-colors",
            isSignIn ? "text-indigo-600" : "text-orange-600"
          )}
        >
          {isSignIn ? "Chưa có tài khoản? Tạo mới ngay!" : "Đã có tài khoản? Đăng nhập ngay"}
        </Link>
      </div>
    </div>
  );
}