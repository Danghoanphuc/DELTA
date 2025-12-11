// apps/customer-frontend/src/features/auth/hooks/useAuthLogic.ts
// ✅ Custom hook để tách logic nghiệp vụ khỏi UI

import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/shared/utils/toast";
import { useAuthStore } from "@/stores/useAuthStore";
import { useCartStore } from "@/stores/useCartStore";
import {
  type AuthMode,
  type AuthStep,
  type AuthFlowValues,
  authFlowSchema,
  getAndClearPrefetchEmail,
  saveTempAuthData,
  getTempAuthData,
  clearTempAuthData,
} from "../utils/auth-helpers";
import { redirectAfterAuth } from "../utils/redirect-helpers";

interface UseAuthLogicOptions {
  mode: AuthMode;
}

export function useAuthLogic({ mode }: UseAuthLogicOptions) {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signUp, user } = useAuthStore();
  const mergeGuestCart = useCartStore((s) => s.mergeGuestCart);

  const [step, setStep] = useState<AuthStep>("email");
  const [showPassword, setShowPassword] = useState(false);
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [hasJustSignedIn, setHasJustSignedIn] = useState(false);

  const form = useForm<AuthFlowValues>({
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

  const { watch, setValue, trigger } = form;
  const email = watch("email");

  // Pre-fill email từ verification hoặc temp data
  useEffect(() => {
    const prefetchEmail = getAndClearPrefetchEmail();
    if (prefetchEmail && mode === "signIn") {
      setValue("email", prefetchEmail);
      setStep("password");
      toast.info("Vui lòng nhập mật khẩu để đăng nhập.");
      return;
    }

    // Restore temp data khi F5
    const tempData = getTempAuthData();
    if (tempData && mode === "signUp") {
      Object.entries(tempData).forEach(([key, value]) => {
        if (value) setValue(key as keyof AuthFlowValues, value);
      });
      // Xác định step dựa trên dữ liệu đã có
      if (tempData.email && !tempData.firstName) {
        setStep("name");
      } else if (tempData.firstName && !tempData.password) {
        setStep("password");
      }
    }
  }, [mode, setValue]);

  // ✅ DISABLED: Auto-redirect moved to onSubmit only to prevent double redirect
  // This useEffect was causing race conditions after organization setup completion
  // All redirect logic is now handled in onSubmit after successful signIn
  // useEffect(() => {
  //   const currentPath = window.location.pathname;
  //   const authPaths = ["/signin", "/signup"];
  //   if (user && authPaths.includes(currentPath) && !isFormLoading && !hasJustSignedIn) {
  //     // ... redirect logic ...
  //   }
  // }, [user, navigate, location.state, isFormLoading, hasJustSignedIn]);

  // Lưu temp data khi user nhập
  useEffect(() => {
    if (mode === "signUp" && email) {
      const currentData = watch();
      saveTempAuthData({
        email: currentData.email,
        firstName: currentData.firstName,
        lastName: currentData.lastName,
      });
    }
  }, [email, watch, mode]);

  const handleEmailSubmit = async () => {
    try {
      const isValid = await trigger("email");
      if (!isValid) return;
      if (mode === "signUp") setStep("name");
      else setStep("password");
    } catch (error) {
      console.error("[AuthLogic] Email validation error:", error);
      // Fallback: vẫn cho phép tiếp tục nếu có email hợp lệ
      const emailValue = watch("email");
      if (emailValue && emailValue.includes("@")) {
        if (mode === "signUp") setStep("name");
        else setStep("password");
      } else {
        toast.error("Vui lòng nhập email hợp lệ");
      }
    }
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
        const { email, password, firstName, lastName } = data;

        // ✅ XÓA: Validation confirmPassword đã được xử lý bởi Zod schema
        // Zod sẽ tự động validate và báo lỗi nếu password !== confirmPassword

        const displayName = `${firstName} ${lastName}`.trim();
        await signUp(email, password, displayName);
        clearTempAuthData(); // Xóa temp data sau khi đăng ký thành công
        setStep("verifySent");
      } else {
        // Sign In flow
        const { email, password } = data;
        setHasJustSignedIn(true);
        await signIn(email, password);

        // ✅ FIX: Wait for context to be properly set after fetchMe completes
        // This ensures activeContext is correctly determined (shipper, organization, printer, etc.)
        // We wait up to 2 seconds for the context to stabilize
        let attempts = 0;
        const maxAttempts = 20; // 20 * 100ms = 2 seconds
        while (attempts < maxAttempts) {
          const { isContextLoading, activeContext } = useAuthStore.getState();
          if (import.meta.env.DEV) {
            console.log(
              `[AuthLogic] Waiting for context... attempt ${
                attempts + 1
              }/${maxAttempts}, isContextLoading=${isContextLoading}, activeContext=${activeContext}`
            );
          }
          if (!isContextLoading) {
            if (import.meta.env.DEV) {
              console.log(
                `[AuthLogic] Context ready! activeContext=${activeContext}`
              );
            }
            break;
          }
          await new Promise((resolve) => setTimeout(resolve, 100));
          attempts++;
        }

        // Check localStorage cho postAuthRedirect
        const postAuthRedirect = localStorage.getItem("postAuthRedirect");

        if (postAuthRedirect) {
          // Xóa khỏi localStorage và redirect
          localStorage.removeItem("postAuthRedirect");
          if (import.meta.env.DEV) {
            console.log(
              "[AuthLogic] Redirecting to postAuthRedirect:",
              postAuthRedirect
            );
          }
          navigate(postAuthRedirect, { replace: true });
        } else {
          // Dùng logic redirect mặc định
          const from = location.state?.from?.pathname;
          if (import.meta.env.DEV) {
            console.log(
              "[AuthLogic] Calling redirectAfterAuth with from:",
              from
            );
          }
          redirectAfterAuth(navigate, from);
        }

        // Merge guest cart in background
        mergeGuestCart().catch((err) => {
          console.error("[AuthLogic] Cart merge failed:", err);
        });
      }
    } catch (err: any) {
      console.error("[AuthLogic] Error:", err);
      setIsFormLoading(false);
      setHasJustSignedIn(false); // ✅ Reset on error
    } finally {
      if (step !== "verifySent") {
        setIsFormLoading(false);
      }
      // ✅ Reset flag after redirect completes (small delay to ensure navigation happens)
      setTimeout(() => setHasJustSignedIn(false), 1000);
    }
  };

  const getBackButtonAction = (): (() => void) | undefined => {
    if (step === "name") return () => setStep("email");
    if (step === "password")
      return () => setStep(mode === "signUp" ? "name" : "email");
    return undefined;
  };

  return {
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
    backButtonAction: getBackButtonAction(),
  };
}
