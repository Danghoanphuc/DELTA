import { UseFormReturn } from "react-hook-form";
import { Mail } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import type { AuthFlowValues } from "../utils/auth-helpers";
import { AUTH_STYLES } from "../utils/auth-styles";
import { GoogleLoginButton } from "./GoogleLoginButton";

interface EmailFormProps {
  form: UseFormReturn<AuthFlowValues>;
  isLoading: boolean;
  mode: "signIn" | "signUp";
  onSubmit: () => void;
}

export function EmailForm({ form, isLoading, mode, onSubmit }: EmailFormProps) {
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <div className="flex flex-col gap-6">
      {/* Google Login */}
      <div className="space-y-3">
        <GoogleLoginButton />

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-stone-200"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-stone-400 font-mono">
              Hoặc dùng email
            </span>
          </div>
        </div>
      </div>

      {/* Email Input */}
      <div>
        <label className={AUTH_STYLES.label}>Email Doanh Nghiệp</label>
        <div className="relative group">
          <div className={AUTH_STYLES.iconWrapper}>
            <Mail className="w-4 h-4" />
          </div>
          <Input
            type="email"
            placeholder="name@company.com"
            {...register("email")}
            className={AUTH_STYLES.input(!!errors.email, true)}
            disabled={isLoading}
            autoFocus
          />
        </div>
        {errors.email && (
          <p className="text-red-600 text-[10px] font-bold font-mono mt-1 flex items-center gap-1">
            <span>✕</span> {errors.email.message}
          </p>
        )}
      </div>

      <Button
        type="button"
        className={AUTH_STYLES.button("secondary")}
        onClick={onSubmit}
        disabled={isLoading}
      >
        {mode === "signIn" ? "TIẾP TỤC" : "BẮT ĐẦU ĐĂNG KÝ"}{" "}
        <span className="ml-2">→</span>
      </Button>
    </div>
  );
}
