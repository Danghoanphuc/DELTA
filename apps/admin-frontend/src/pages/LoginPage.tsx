// apps/admin-frontend/src/pages/LoginPage.tsx
import { useState, useEffect, useRef } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { signIn } from "@/services/adminAuthService";
import { useAdminAuthStore } from "@/store/useAdminAuthStore";

const LoginPage = () => {
  const navigate = useNavigate();

  // 1. Lấy state từ Zustand
  const { token, status, setStatus } = useAdminAuthStore((state) => ({
    token: state.token,
    status: state.status,
    setStatus: state.setStatus,
  }));

  // 2. State cho Form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  // 3. Logic "autoFocus" (Giải pháp toàn diện UX)
  const emailInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    // Tự động focus vào ô email khi component mount
    emailInputRef.current?.focus();
  }, []);

  // 4. Xử lý Submit
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Vui lòng nhập cả email và mật khẩu.");
      return;
    }

    try {
      // Gọi service API đã tạo
      await signIn(email, password);
      // (Không cần điều hướng ở đây, useEffect bên dưới sẽ xử lý)
    } catch (err: any) {
      // Lỗi (ví dụ: 401 "Sai mật khẩu") sẽ được ném ra từ service
      setError(err.message || "Đã xảy ra lỗi không xác định");
    }
  };

  // 5. Logic điều hướng
  useEffect(() => {
    if (status === "success" && token) {
      // Đăng nhập thành công, điều hướng đến Dashboard
      navigate("/", { replace: true });
    }
    // Reset status nếu đang "error" mà người dùng bắt đầu gõ lại
    if (status === "error") {
      setStatus("idle");
    }
  }, [status, token, navigate, setStatus]);

  // 6. Nếu ĐÃ đăng nhập (ví dụ: F5 lại trang), đá về Dashboard
  if (token && status !== "loading") {
    return <Navigate to="/" replace />;
  }

  const isLoading = status === "loading";

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-center text-3xl font-bold text-gray-800">
          PrintZ Admin
        </h1>

        <form onSubmit={handleSubmit}>
          {/* Thông báo lỗi */}
          {error && (
            <div className="mb-4 rounded-md bg-red-100 p-3 text-center text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          {/* Email Input */}
          <div className="mb-4">
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              ref={emailInputRef} // <-- Gắn ref autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="superadmin@printz.vn"
            />
          </div>

          {/* Password Input */}
          <div className="mb-6">
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Mật khẩu
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-md bg-blue-600 px-4 py-2 font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? "Đang xử lý..." : "Đăng nhập"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
