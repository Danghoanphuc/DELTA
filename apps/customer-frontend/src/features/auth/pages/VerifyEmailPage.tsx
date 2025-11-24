// apps/customer-frontend/src/features/auth/pages/VerifyEmailPage.tsx
// ✅ Page component với UX tốt hơn và Error Boundary

import { useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import api from "@/shared/lib/axios";
import { saveEmailForPrefetch } from "../utils/auth-helpers";
import { AuthLayout } from "../components/AuthLayout";

const EMAIL_PREFETCH_KEY = "auth-email-prefetch";

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [countdown, setCountdown] = useState(3);
  const [errorMessage, setErrorMessage] = useState(
    "Link không hợp lệ hoặc đã hết hạn."
  );

  // Gọi API verify email
  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setErrorMessage("Thiếu token xác thực.");
      return;
    }

    api
      .post("/auth/verify-email", { token })
      .then((res) => {
        // Lưu email để pre-fill khi quay lại trang đăng nhập
        const email = res.data?.email;
        if (email) {
          saveEmailForPrefetch(email);
          console.log(`[Verify] Đã prefetch email: ${email}`);
        }
        
        // ✅ BƯỚC 5: Đồng bộ cross-tab - Lưu trạng thái để tab khác biết
        localStorage.setItem('emailVerifiedStatus', 'true');
        
        // Xóa key sau 1 giây để dọn dẹp
        setTimeout(() => {
          localStorage.removeItem('emailVerifiedStatus');
        }, 1000);
        
        setStatus("success");
      })
      .catch((err) => {
        if (err.response?.data?.message) {
          setErrorMessage(err.response.data.message);
        }
        setStatus("error");
      });
  }, [searchParams]);

  // Đếm ngược và chuyển hướng
  useEffect(() => {
    if (status === "success") {
      if (countdown > 0) {
        const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        navigate("/signin");
      }
    }
  }, [status, countdown, navigate]);

  return (
    <AuthLayout>
      <Card className="w-full max-w-md p-8 bg-white/95 backdrop-blur-md shadow-xl">
        <div className="flex flex-col items-center text-center space-y-4">
          {status === "loading" && (
            <>
              <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">
                Đang xác thực tài khoản...
              </h1>
              <p className="text-gray-600">
                Vui lòng đợi trong giây lát.
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle2 className="w-16 h-16 text-green-600" />
              <h1 className="text-2xl font-bold text-green-600">
                Xác thực thành công!
              </h1>
              <p className="text-gray-700">
                Email của bạn đã được xác nhận thành công.
              </p>
              <div className="flex flex-col items-center gap-2 mt-4">
                <p className="text-5xl font-bold text-gray-800">{countdown}</p>
                <p className="text-sm text-gray-500">
                  Đang chuyển đến trang đăng nhập...
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => navigate("/signin")}
                className="mt-4"
              >
                Đăng nhập ngay
              </Button>
            </>
          )}

          {status === "error" && (
            <>
              <XCircle className="w-16 h-16 text-red-600" />
              <h1 className="text-2xl font-bold text-red-600">
                Xác thực thất bại
              </h1>
              <p className="text-gray-700">{errorMessage}</p>
              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => navigate("/signin")}
                >
                  Về trang đăng nhập
                </Button>
                <Button
                  onClick={() => navigate("/")}
                >
                  Về trang chủ
                </Button>
              </div>
            </>
          )}
        </div>
      </Card>
    </AuthLayout>
  );
}

