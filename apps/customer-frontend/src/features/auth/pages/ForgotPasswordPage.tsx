// apps/customer-frontend/src/features/auth/pages/ForgotPasswordPage.tsx
// ✅ NEW: Forgot password page with improved UX

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Loader2, CheckCircle2, ArrowLeft } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Card } from "@/shared/components/ui/card";
import { toast } from "@/shared/utils/toast";
import api from "@/shared/lib/axios";
import { AuthLayout } from "../components/AuthLayout";
import { z } from "zod";

const forgotPasswordSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
});

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState("");

  const validate = () => {
    try {
      forgotPasswordSchema.parse({ email });
      setError("");
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.issues[0].message);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      setLoading(true);
      await api.post("/auth/forgot-password", { email });
      setEmailSent(true);
      toast.success("Email đã được gửi! Vui lòng kiểm tra hộp thư.");
    } catch (err: any) {
      console.error(err);
      // Không hiển thị lỗi cụ thể để tránh leak thông tin
      toast.error("Có lỗi xảy ra. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <AuthLayout>
        <Card className="w-full max-w-md p-8 bg-white/95 backdrop-blur-md shadow-xl">
          <div className="flex flex-col items-center text-center space-y-4">
            <CheckCircle2 className="w-16 h-16 text-green-600" />
            <h1 className="text-2xl font-bold text-gray-900">
              Email đã được gửi!
            </h1>
            <p className="text-gray-700">
              Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến email{" "}
              <strong>{email}</strong>
            </p>
            <p className="text-sm text-gray-600">
              Vui lòng kiểm tra hộp thư (kể cả thư mục spam) và làm theo hướng
              dẫn. Link sẽ hết hạn sau 1 giờ.
            </p>
            <div className="flex flex-col gap-2 w-full mt-4">
              <Button onClick={() => navigate("/signin")} className="w-full">
                Quay lại đăng nhập
              </Button>
              <Button
                variant="ghost"
                onClick={() => setEmailSent(false)}
                className="w-full"
              >
                Gửi lại email
              </Button>
            </div>
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
            <Mail className="w-12 h-12 mx-auto text-blue-600 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Quên mật khẩu?
            </h1>
            <p className="text-gray-600 text-sm">
              Nhập email của bạn và chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu
            </p>
          </div>

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) validate();
                }}
                required
                className="pl-12 h-12 text-base"
                disabled={loading}
                autoFocus
              />
            </div>
            {error && <p className="text-destructive text-sm -mt-2">{error}</p>}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-base"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Đang gửi...
                </>
              ) : (
                "Gửi email đặt lại mật khẩu"
              )}
            </Button>
          </form>

          <div className="text-center">
            <Button
              variant="ghost"
              onClick={() => navigate("/signin")}
              className="text-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại đăng nhập
            </Button>
          </div>
        </div>
      </Card>
    </AuthLayout>
  );
}
