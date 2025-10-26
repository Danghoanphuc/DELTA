// frontend/src/components/auth/VerifyEmailPage.tsx (NÂNG CẤP)

import { useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "@/lib/axios";

// Key để giao tiếp với trang đăng nhập
const EMAIL_PREFETCH_KEY = "auth-email-prefetch";

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [countdown, setCountdown] = useState(3);
  const [errorMessage, setErrorMessage] = useState(
    "Link không hợp lệ hoặc đã hết hạn."
  );

  // --- Logic 1: Gọi API (CẬP NHẬT) ---
  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      return;
    }

    api
      .post("/auth/verify-email", { token })
      .then((res) => {
        // ✅ LẤY EMAIL TỪ RESPONSE VÀ LƯU LẠI
        const email = res.data?.email;
        if (email) {
          localStorage.setItem(EMAIL_PREFETCH_KEY, email);
          console.log(`[Verify] Đã prefetch email: ${email}`);
        }
        setStatus("success");
      })
      .catch((err) => {
        if (err.response?.data?.message) {
          setErrorMessage(err.response.data.message);
        }
        setStatus("error");
      });
  }, [searchParams]);

  // --- Logic 2: Đếm ngược & Chuyển hướng (Giữ nguyên) ---
  useEffect(() => {
    if (status === "success") {
      if (countdown > 0) {
        const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        // ✅ Chuyển về trang đăng nhập
        navigate("/signin");
      }
    }
    if (status === "error") {
      const timer = setTimeout(() => navigate("/"), 5000); // Về trang chủ nếu lỗi
      return () => clearTimeout(timer);
    }
  }, [status, countdown, navigate]);

  // --- Giao diện (Render) (Giữ nguyên) ---
  // ... (code renderStatus() của bạn ở đây) ...
  const renderStatus = () => {
    switch (status) {
      case "loading":
        return (
          <>
            <div className="loader mb-4"></div>
            <p>Đang xác thực tài khoản của bạn...</p>
          </>
        );
      case "success":
        return (
          <>
            <p className="text-green-600 font-semibold mb-4 text-xl">
              Ok rồi đó, mail của bạn đã được xác nhận!
            </p>
            <p className="text-5xl font-bold text-gray-800">{countdown}</p>
            <p className="mt-2 text-gray-500">
              (Chuẩn bị chuyển đến trang đăng nhập...)
            </p>
          </>
        );
      case "error":
        return (
          <>
            <p className="text-red-600 font-semibold mb-4 text-xl">
              Xác thực thất bại
            </p>
            <p>{errorMessage}</p>
            <p className="mt-2 text-sm text-gray-500">
              Đang chuyển về trang chủ...
            </p>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen px-4 text-center">
      {renderStatus()}
      {/* CSS spinner (Giữ nguyên) */}
      <style>
        {`
          .loader {
            border: 4px solid #f3f3f3;
            border-top: 4px solid #6366f1; /* Màu indigo */
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default VerifyEmailPage;
