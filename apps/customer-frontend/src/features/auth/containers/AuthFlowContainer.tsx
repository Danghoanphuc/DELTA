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
    case "email":
      return mode === "signIn" ? "Chào mừng" : "Bắt đầu hành trình";
    case "name":
      return "Thông tin cá nhân";
    case "password":
      return "Bảo mật tài khoản";
    case "verifySent":
      return "Xác thực email";
    default:
      return "";
  }
};

export function AuthFlowContainer({ mode }: AuthFlowContainerProps) {
  const {
    form,
    step,
    setStep,
    showPassword,
    setShowPassword,
    isFormLoading,
    email,
    handleEmailSubmit,
    handleNameSubmit,
    onSubmit,
    backButtonAction,
  } = useAuthLogic({ mode });

  const isSignIn = mode === "signIn";

  return (
    <div className="w-full">
      {/* HEADER SECTION */}
      <div className="mb-10 border-b border-stone-200 pb-6">
        <div className="flex items-center justify-between mb-4">
          <span
            className={cn(
              "font-mono text-[10px] font-bold tracking-[0.2em] uppercase px-2 py-1",
              isSignIn ? "bg-stone-900 text-white" : "bg-emerald-800 text-white"
            )}
          >
            {isSignIn ? "ĐĂNG NHẬP" : "ĐĂNG KÝ"}
          </span>
          {backButtonAction && (
            <Button
              variant="ghost"
              size="sm"
              onClick={backButtonAction}
              className="h-auto p-0 hover:bg-transparent hover:text-emerald-700 text-stone-400 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> Quay lại
            </Button>
          )}
        </div>

        <h2 className="font-serif text-4xl text-stone-900 italic mb-2">
          {getStepTitle(step, mode)}.
        </h2>
        <p className="text-stone-500 font-light text-sm">
          {step === "email" &&
            (isSignIn
              ? "Nhập định danh để truy cập Workspace."
              : "Thiết lập hồ sơ Brand mới.")}
          {step === "password" && "Xác thực bảo mật 2 lớp."}
          {step === "name" && "Thông tin người đại diện."}
        </p>
      </div>

      {/* FORM SECTION */}
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-8"
      >
        <div className={cn(step !== "email" && "hidden")}>
          <EmailForm
            form={form}
            isLoading={isFormLoading}
            mode={mode}
            onSubmit={handleEmailSubmit}
          />
        </div>

        {mode === "signUp" && (
          <div className={cn(step !== "name" && "hidden")}>
            <NameForm
              form={form}
              isLoading={isFormLoading}
              onSubmit={handleNameSubmit}
            />
          </div>
        )}

        <div className={cn(step !== "password" && "hidden")}>
          <PasswordForm
            form={form}
            isLoading={isFormLoading}
            mode={mode}
            email={email}
            showPassword={showPassword}
            onTogglePassword={() => setShowPassword(!showPassword)}
            onEmailClick={() => {
              form.setValue("email", "");
              setStep("email");
            }}
          />
        </div>
      </form>

      {step === "verifySent" && <VerifySentView email={email} />}
    </div>
  );
}
