// apps/admin-frontend/src/hooks/useAuth.ts
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signIn } from "@/services/adminAuthService";
import { useAdminAuthStore } from "@/store/useAdminAuthStore";

export function useAuth() {
  const navigate = useNavigate();
  const { token, status, setStatus } = useAdminAuthStore((state) => ({
    token: state.token,
    status: state.status,
    setStatus: state.setStatus,
  }));

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const isLoading = status === "loading";
  const isAuthenticated = !!token && status !== "loading";

  // Handle navigation after successful login
  useEffect(() => {
    if (status === "success" && token) {
      navigate("/", { replace: true });
    }
    if (status === "error") {
      setStatus("idle");
    }
  }, [status, token, navigate, setStatus]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!email || !password) {
      setError("Vui lòng nhập cả email và mật khẩu.");
      return;
    }

    try {
      await signIn(email, password);
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi không xác định");
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    error,
    isLoading,
    isAuthenticated,
    handleLogin,
  };
}
