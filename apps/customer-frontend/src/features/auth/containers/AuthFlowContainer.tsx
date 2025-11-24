// apps/customer-frontend/src/features/auth/containers/AuthFlowContainer.tsx
import React from "react";
import { Button } from "@/shared/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { useAuthLogic } from "../hooks/useAuthLogic";
import { EmailForm } from "../components/EmailForm";
import { NameForm } from "../components/NameForm";
import { PasswordForm } from "../components/PasswordForm";
import { VerifySentView } from "../components/VerifySentView";
import type { AuthMode, AuthStep } from "../utils/auth-helpers";

interface AuthFlowContainerProps {
  mode: AuthMode;
}

const getStepTitle = (step: AuthStep, mode: AuthMode): string => {
  switch (step) {
    case "email": return mode === "signIn" ? "Truy cập hệ thống" : "Kích hoạt tài khoản mới"; // ✅ Đổi text rõ hơn
    case "name": return "Xác nhận danh tính";
    case "password": return mode === "signIn" ? "Nhập mã bảo mật" : "Thiết lập mật khẩu";
    case "verifySent": return "Kiểm tra hộp thư";
    default: return "";
  }
};

export function AuthFlowContainer({ mode }: AuthFlowContainerProps) {
  const {
    form, step, showPassword, setShowPassword, isFormLoading, email,
    handleEmailSubmit, handleNameSubmit, onSubmit, backButtonAction,
  } = useAuthLogic({ mode });

  // 🔥 THEME CONFIG: Phân biệt màu sắc
  const isSignIn = mode === "signIn";
  const themeColor = isSignIn ? "bg-indigo-600" : "bg-orange-600";
  const borderColor = isSignIn ? "group-hover/container:border-indigo-500/30" : "group-hover/container:border-orange-500/30";

  return (
    <div className="w-full relative group/container max-w-sm mx-auto mt-4">
      {/* Background kính mờ */}
      <div className={cn(
        "absolute inset-0 bg-white/40 backdrop-blur-xl rounded-xl border border-white/60 shadow-xl transition-all duration-500",
        borderColor // Đổi màu viền khi hover
      )} />

      {/* 🔥 TOP BAR: Thanh màu đánh dấu chế độ */}
      <div className={cn("absolute top-0 left-4 right-4 h-1 rounded-b-md z-10", themeColor)} />

      <div className="relative p-6 flex flex-col gap-5 pt-8"> {/* Tăng pt để tránh đè top bar */}
        
        {/* Header Area */}
        <div className="flex flex-col gap-1 relative">
          {backButtonAction && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute -top-1 -left-2 text-slate-400 hover:text-slate-900 hover:bg-white/40 h-8 w-8 rounded-full"
              onClick={backButtonAction}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}

          <div className={cn("space-y-0.5", backButtonAction ? "mt-8" : "mt-2")}>
            <div className="flex items-center gap-2 mb-1">
               {/* Badge nhỏ báo hiệu Mode */}
               <span className={cn(
                 "text-[9px] font-black px-1.5 py-0.5 rounded text-white tracking-wider uppercase",
                 isSignIn ? "bg-indigo-600" : "bg-orange-600"
               )}>
                 {isSignIn ? "ĐĂNG NHẬP" : "ĐĂNG KÝ"}
               </span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight uppercase">
              {getStepTitle(step, mode)}
            </h1>
            <p className="text-xs font-mono text-slate-500 font-medium tracking-tight">
              {step === "email" && (isSignIn ? "/// XÁC THỰC NGƯỜI DÙNG ///" : "/// KHỞI TẠO TÀI KHOẢN ///")}
              {step === "password" && "/// BẢO MẬT ///"}
              {step === "name" && "/// HỒ SƠ ///"}
            </p>
          </div>
        </div>

        {/* Form Area */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col">
          <div className={cn(step !== "email" && "hidden")}>
            <EmailForm form={form} isLoading={isFormLoading} mode={mode} onSubmit={handleEmailSubmit} />
          </div>

          {mode === "signUp" && (
            <div className={cn(step !== "name" && "hidden")}>
              <NameForm form={form} isLoading={isFormLoading} onSubmit={handleNameSubmit} />
            </div>
          )}

          <div className={cn(step !== "password" && "hidden")}>
            <PasswordForm
              form={form} isLoading={isFormLoading} mode={mode} email={email}
              showPassword={showPassword} onTogglePassword={() => setShowPassword(!showPassword)}
              onEmailClick={() => form.setValue("email", "")}
            />
          </div>
        </form>

        {step === "verifySent" && <VerifySentView email={email} />}
      </div>
    </div>
  );
}