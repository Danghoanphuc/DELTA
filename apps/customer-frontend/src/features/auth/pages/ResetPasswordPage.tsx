// apps/customer-frontend/src/features/auth/pages/ResetPasswordPage.tsx
// ✅ Page component với UX tốt hơn, validation và Error handling

import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Card } from "@/shared/components/ui/card";
import { toast } from "@/shared/utils/toast";
import api from "@/shared/lib/axios";
import { AuthLayout } from "../components/AuthLayout";
import { z } from "zod";

const resetPasswordSchema = z.object({
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"],
});

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});

  const token = searchParams.get("token");

  // Kiểm tra token khi component mount
  useEffect(() => {
    if (!token) {
      setTokenValid(false);
      toast.error("Thiếu token reset password.");
      return;
    }

    setLoading(true);
    api
      .post("/auth/verify-reset-token", { token })
      .then(() => {
        setTokenValid(true);
      })
      .catch(() => {
        setTokenValid(false);
        toast.error("Link reset password không hợp lệ hoặc đã hết hạn.");
      })
      .finally(() => setLoading(false));
  }, [token]);

  // Validate form
  const validate = () => {
    try {
      resetPasswordSchema.parse({ password, confirmPassword });
      setErrors({});
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors: { password?: string; confirmPassword?: string } = {};
        err.issues.forEach((error) => {
          if (error.path[0] === "password") {
            fieldErrors.password = error.message;
          } else if (error.path[0] === "confirmPassword") {
            fieldErrors.confirmPassword = error.message;
          }
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    if (!token) return;

    try {
      setLoading(true);
      await api.post("/auth/reset-password", { token, password });
      toast.success("Đặt lại mật khẩu thành công! Hãy đăng nhập lại.");
      navigate("/signin");
    } catch (err: any) {
      console.error(err);
      toast.error(
        err.response?.data?.message || "Không thể đặt lại mật khẩu, thử lại!"
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading && tokenValid === null) {
    return (
      <AuthLayout>
        <Card className="w-full max-w-md p-8 bg-white/95 backdrop-blur-md shadow-xl">
          <div className="flex flex-col items-center text-center space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
            <h1 className="text-xl font-semibold text-gray-900">
              Đang kiểm tra token...
            </h1>
          </div>
        </Card>
      </AuthLayout>
    );
  }

  if (tokenValid === false) {
    return (
      <AuthLayout>
        <Card className="w-full max-w-md p-8 bg-white/95 backdrop-blur-md shadow-xl">
          <div className="flex flex-col items-center text-center space-y-4">
            <XCircle className="w-16 h-16 text-red-600" />
            <h1 className="text-2xl font-bold text-red-600">
              Link không hợp lệ
            </h1>
            <p className="text-gray-700">
              Link reset password không hợp lệ hoặc đã hết hạn.
            </p>
            <Button onClick={() => navigate("/signin")} className="mt-4">
              Về trang đăng nhập
            </Button>
          </div>
        </Card>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <Card className="w-full max-w-md p-8 bg-white/95 backdrop-blur-md shadow-xl">
        <div className="flex flex-col gap-6">
          <div className="text-center">
            <Lock className="w-12 h-12 mx-auto text-blue-600 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Đặt lại mật khẩu
            </h1>
            <p className="text-gray-600 text-sm">
              Nhập mật khẩu mới cho tài khoản của bạn
            </p>
          </div>

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            {/* Password Input */}
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Mật khẩu mới"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) validate();
                }}
                required
                className="pl-12 pr-12 h-12 text-base"
                disabled={loading}
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700"
                disabled={loading}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-destructive text-sm -mt-2">{errors.password}</p>
            )}

            {/* Confirm Password Input */}
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Xác nhận mật khẩu"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) validate();
                }}
                required
                className="pl-12 pr-12 h-12 text-base"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700"
                disabled={loading}
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-destructive text-sm -mt-2">
                {errors.confirmPassword}
              </p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-base"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Đang xử lý...
                </>
              ) : (
                "Đặt lại mật khẩu"
              )}
            </Button>
          </form>

          <div className="text-center">
            <Button
              variant="ghost"
              onClick={() => navigate("/signin")}
              className="text-sm"
            >
              Quay lại đăng nhập
            </Button>
          </div>
        </div>
      </Card>
    </AuthLayout>
  );
}

