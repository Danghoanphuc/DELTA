import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { toast } from "@/shared/utils/toast";
import api from "@/shared/lib/axios";
import { AuthLayout } from "../components/AuthLayout";
import { z } from "zod";
import { AUTH_STYLES } from "../utils/auth-styles";

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
      if (err instanceof z.ZodError) setError(err.issues[0].message);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      await api.post("/auth/forgot-password", { email });
      setEmailSent(true);
      toast.success("Đã gửi lệnh reset.");
    } catch (err) {
      toast.error("Hệ thống bận, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full">
        <div className="mb-8 border-b border-stone-200 pb-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/signin")}
            className="pl-0 hover:bg-transparent hover:text-emerald-700 text-stone-400 transition-colors h-auto mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> QUAY LẠI ĐĂNG NHẬP
          </Button>
          <h2 className="font-serif text-3xl text-stone-900 italic">
            {emailSent ? "Kiểm tra hộp thư." : "Khôi phục tài khoản."}
          </h2>
          <p className="text-stone-500 font-light text-sm mt-1">
            {emailSent
              ? "Link khôi phục đã được gửi đến email của bạn."
              : "Nhập email để nhận link đặt lại mật khẩu."}
          </p>
        </div>

        {emailSent ? (
          <div className="space-y-6">
            <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-900 text-sm font-mono">
              ĐÃ GỬI ĐẾN: <span className="font-bold">{email}</span>
            </div>
            <Button
              onClick={() => setEmailSent(false)}
              className={AUTH_STYLES.button("secondary")}
            >
              GỬI LẠI LINK
            </Button>
          </div>
        ) : (
          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            <div>
              <label className={AUTH_STYLES.label}>Email đã đăng ký</label>
              <Input
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) validate();
                }}
                className={AUTH_STYLES.input(!!error)}
                disabled={loading}
                autoFocus
              />
              {error && (
                <p className="text-red-600 text-[10px] font-bold font-mono mt-1">
                  ⚠ {error}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className={AUTH_STYLES.button("primary")}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "GỬI LINK KHÔI PHỤC"
              )}
            </Button>
          </form>
        )}
      </div>
    </AuthLayout>
  );
}
