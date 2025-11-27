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

  // Auto-redirect nếu đã đăng nhập
  useEffect(() => {
    const currentPath = window.location.pathname;
    const authPaths = ["/signin", "/signup"];

    if (user && authPaths.includes(currentPath)) {
      const from = location.state?.from?.pathname;

      if (from && from !== currentPath && from !== "/") {
        toast.success("Đã đăng nhập, đang chuyển hướng...");
        navigate(from, { replace: true });
      } else {
        // ✅ FIX: Redirect trực tiếp về /app hoặc /printer/dashboard thay vì /
        // Tránh race condition với SmartLanding
        if (user.role === "printer") {
          navigate("/printer/dashboard", { replace: true });
        } else {
          navigate("/app", { replace: true });
        }
      }
    }
  }, [user, navigate, location.state]);

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
        await signIn(email, password);

        // Merge guest cart after successful login
        try {
          await mergeGuestCart();
        } catch (err) {
          console.error("[AuthLogic] Cart merge failed:", err);
          // Don't block login flow
        }

        // ✅ FIX: Redirect trực tiếp về /app hoặc /printer/dashboard
        // signIn đã await fetchMe() nên user đã được set trong store
        // Lấy user từ store state hiện tại
        const currentUser = useAuthStore.getState().user;
        const from = location.state?.from?.pathname;
        const currentPath = window.location.pathname;
        
        // Nếu có from path hợp lệ và không phải root, dùng nó
        if (from && from !== "/" && from !== currentPath) {
          navigate(from, { replace: true });
        } else if (currentUser) {
          // Redirect dựa trên role
          if (currentUser.role === "printer") {
            navigate("/printer/dashboard", { replace: true });
          } else {
            navigate("/app", { replace: true });
          }
        } else {
          // Fallback: redirect về /app (SmartLanding sẽ xử lý nếu cần)
          navigate("/app", { replace: true });
        }
      }
    } catch (err: any) {
      console.error("[AuthLogic] Error:", err);
      setIsFormLoading(false);
    } finally {
      if (step !== "verifySent") {
        setIsFormLoading(false);
      }
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

