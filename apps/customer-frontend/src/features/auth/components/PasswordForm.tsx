// apps/customer-frontend/src/features/auth/components/PasswordForm.tsx
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Link } from "react-router-dom";
import { cn } from "@/shared/lib/utils";
import type { AuthFlowValues } from "../utils/auth-helpers";
import { getInputStyle, getBtnStyle } from "./EmailForm"; // ✅ Import hàm style
import { PasswordStrengthIndicator } from "./PasswordStrengthIndicator";

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

  // Màu sắc động cho thẻ bài
  const cardBg = isSignIn
    ? "bg-indigo-50/50 border-indigo-100"
    : "bg-orange-50/50 border-orange-100";
  const iconBg = isSignIn
    ? "bg-indigo-100 text-indigo-600"
    : "bg-orange-100 text-orange-600";
  const textColor = isSignIn ? "text-indigo-900" : "text-orange-900";
  const labelColor = isSignIn ? "text-indigo-400" : "text-orange-400";

  return (
    <div className="flex flex-col gap-4">
      {/* EMAIL CARD */}
      <div
        className={cn(
          "flex items-center justify-between p-2.5 border rounded-lg shadow-sm",
          cardBg
        )}
      >
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "w-8 h-8 rounded flex items-center justify-center font-black text-sm border border-white/50",
              iconBg
            )}
          >
            {email.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col leading-tight">
            <span
              className={cn(
                "text-[9px] font-mono uppercase tracking-wider",
                labelColor
              )}
            >
              Account ID
            </span>
            <span
              className={cn(
                "font-bold font-mono text-xs truncate max-w-[140px]",
                textColor
              )}
            >
              {email}
            </span>
          </div>
        </div>
        <button
          onClick={onEmailClick}
          className={cn(
            "px-2 py-1 text-[10px] font-bold rounded transition-colors uppercase border bg-white",
            isSignIn
              ? "text-indigo-600 border-indigo-200 hover:bg-indigo-50"
              : "text-orange-600 border-orange-200 hover:bg-orange-50"
          )}
          type="button"
        >
          Đổi
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {/* Password Input */}
        <div className="flex flex-col gap-1">
          <div className="group relative">
            <div
              className={cn(
                "absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors",
                isSignIn
                  ? "group-focus-within:text-indigo-600"
                  : "group-focus-within:text-orange-500"
              )}
            >
              <Lock className="w-4 h-4" />
            </div>
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Mật khẩu"
              {...register("password")}
              className={`${getInputStyle(isSignIn)} pr-10`}
              disabled={isLoading}
              autoFocus
            />
            {/* Line */}
            <div
              className={cn(
                "absolute bottom-0 left-0 h-[1.5px] w-0 transition-all duration-500 group-focus-within:w-full",
                isSignIn ? "bg-indigo-600" : "bg-orange-500"
              )}
            />

            <button
              type="button"
              onClick={onTogglePassword}
              className={cn(
                "absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-400 transition-colors",
                isSignIn ? "hover:text-indigo-600" : "hover:text-orange-500"
              )}
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
            <p className="text-red-500 text-[10px] font-bold font-mono mt-1">
              ⚠ {errors.password.message}
            </p>
          )}

          {/* ✅ NEW: Password strength indicator for sign up */}
          {mode === "signUp" && form.watch("password") && (
            <div className="mt-2">
              <PasswordStrengthIndicator password={form.watch("password")} />
            </div>
          )}
        </div>

        {/* Confirm Password */}
        {mode === "signUp" && (
          <div className="group relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors">
              <Lock className="w-4 h-4" />
            </div>
            <Input
              type="password"
              placeholder="Xác nhận mật khẩu"
              {...register("confirmPassword")}
              className={getInputStyle(isSignIn)}
              disabled={isLoading}
            />
            <div className="absolute bottom-0 left-0 h-[1.5px] w-0 bg-orange-500 transition-all duration-500 group-focus-within:w-full" />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 mt-1">
        <Button
          type="submit"
          className={getBtnStyle(isSignIn)}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />{" "}
              PROCESSING...
            </>
          ) : mode === "signIn" ? (
            "TRUY CẬP HỆ THỐNG"
          ) : (
            "KHỞI TẠO TÀI KHOẢN"
          )}
        </Button>

        {mode === "signIn" && (
          <Link
            to="/forgot-password"
            className="text-[10px] font-mono text-center text-slate-400 hover:text-indigo-600 hover:underline transition-colors"
          >
            QUÊN MÃ BẢO MẬT?
          </Link>
        )}
      </div>
    </div>
  );
}
