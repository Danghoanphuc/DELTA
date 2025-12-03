import { UseFormReturn } from "react-hook-form";
import { Lock, Eye, EyeOff, Loader2, Fingerprint, Shield } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Link } from "react-router-dom";
import type { AuthFlowValues } from "../utils/auth-helpers";
import { AUTH_STYLES } from "../utils/auth-styles";
import { PasswordStrengthIndicator } from "./PasswordStrengthIndicator";
import { useTurnstile } from "@/hooks/useTurnstile";

interface PasswordFormProps {
  form: UseFormReturn<AuthFlowValues>;
  isLoading: boolean;
  mode: "signIn" | "signUp";
  email: string;
  showPassword: boolean;
  onTogglePassword: () => void;
  onEmailClick: () => void;
}

export function PasswordForm({
  form,
  isLoading,
  mode,
  email,
  showPassword,
  onTogglePassword,
  onEmailClick,
}: PasswordFormProps) {
  const {
    register,
    formState: { errors },
  } = form;
  const isSignIn = mode === "signIn";
  const passwordValue = form.watch("password");

  // Cloudflare Turnstile
  const { TurnstileWidget, token: turnstileToken } = useTurnstile();

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Thẻ Email */}
      <div className="flex items-center justify-between p-4 border border-stone-200 bg-stone-100/50 border-l-4 border-l-stone-900">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-stone-200 flex items-center justify-center text-stone-500">
            <Fingerprint className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-mono uppercase tracking-widest text-stone-400">
              Email đăng nhập
            </span>
            <span className="font-mono text-xs font-bold text-stone-900 truncate max-w-[180px]">
              {email}
            </span>
          </div>
        </div>
        <button
          onClick={onEmailClick}
          className="text-[10px] font-bold font-mono uppercase tracking-wider border border-stone-300 px-2 py-1 hover:bg-white hover:text-red-600 hover:border-red-600 transition-all"
          type="button"
        >
          Đổi
        </button>
      </div>

      <div className="space-y-5">
        {/* 2. Mật khẩu */}
        <div>
          <div className="flex justify-between items-end mb-1.5">
            <label className={AUTH_STYLES.label}>Mật khẩu</label>
            {isSignIn && (
              <Link
                to="/forgot-password"
                className="text-[10px] font-mono text-stone-400 hover:text-stone-900 underline transition-colors"
              >
                QUÊN MẬT KHẨU?
              </Link>
            )}
          </div>

          <div className="relative group">
            {/* Icon Wrapper cố định */}
            <div className={AUTH_STYLES.iconWrapper}>
              <Lock className="w-4 h-4" />
            </div>

            <Input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              {...register("password")}
              // QUAN TRỌNG: hasIcon=true để có padding-left
              className={AUTH_STYLES.input(!!errors.password, true)}
              disabled={isLoading}
              autoFocus
            />

            {/* Toggle Button */}
            <button
              type="button"
              onClick={onTogglePassword}
              className="absolute right-0 top-0 bottom-0 px-3 text-stone-400 hover:text-stone-900 transition-colors z-10"
              disabled={isLoading}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>

          {errors.password && (
            <p className="text-red-600 text-[10px] font-bold font-mono mt-1 flex items-center gap-1">
              <span>✕</span> {errors.password.message}
            </p>
          )}

          {/* Strength Indicator */}
          {mode === "signUp" && passwordValue && (
            <div className="mt-3 animate-in fade-in slide-in-from-top-1 duration-300">
              <PasswordStrengthIndicator password={passwordValue} />
            </div>
          )}
        </div>

        {/* 3. Xác nhận mật khẩu */}
        {mode === "signUp" && (
          <div>
            <label className={AUTH_STYLES.label}>Xác nhận mật khẩu</label>
            <div className="relative group">
              <div className={AUTH_STYLES.iconWrapper}>
                <Lock className="w-4 h-4 opacity-50" />
              </div>
              <Input
                type="password"
                placeholder="••••••••"
                {...register("confirmPassword")}
                className={AUTH_STYLES.input(!!errors.confirmPassword, true)}
                disabled={isLoading}
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-red-600 text-[10px] font-bold font-mono mt-1 flex items-center gap-1">
                <span>✕</span> {errors.confirmPassword.message}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Cloudflare Turnstile - Chống bot */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-stone-500 text-xs font-mono">
          <Shield className="w-3 h-3" />
          <span>Xác minh bảo mật</span>
        </div>
        <TurnstileWidget />
      </div>

      <Button
        type="submit"
        className={AUTH_STYLES.button(isSignIn ? "primary" : "secondary")}
        disabled={isLoading || !turnstileToken}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />
            ĐANG XÁC THỰC...
          </>
        ) : mode === "signIn" ? (
          "ĐĂNG NHẬP"
        ) : (
          "TẠO TÀI KHOẢN"
        )}
      </Button>

      {!turnstileToken && !isLoading && (
        <p className="text-center text-xs text-stone-400 font-mono -mt-2">
          Vui lòng hoàn thành xác minh bảo mật
        </p>
      )}
    </div>
  );
}
