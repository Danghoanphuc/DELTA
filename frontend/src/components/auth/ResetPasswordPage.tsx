// src/pages/ResetPasswordPage.tsx
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "@/lib/axios"; //
import { toast } from "sonner";

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);

  const token = searchParams.get("token");

  // Kiểm tra token ngay khi component mount
  useEffect(() => {
    if (!token) return;

    setLoading(true);
    api
      .post("/auth/verify-reset-token", { token }) // backend endpoint kiểm tra token
      .then(() => {
        setTokenValid(true);
      })
      .catch(() => {
        toast.error("Link reset password không hợp lệ hoặc đã hết hạn.");
        navigate("/signin");
      })
      .finally(() => setLoading(false));
  }, [token, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp!");
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

  if (loading) return <div>Đang kiểm tra token...</div>;
  if (!tokenValid) return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">Đặt lại mật khẩu</h1>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Mật khẩu mới"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="border rounded px-3 py-2"
          />
          <input
            type="password"
            placeholder="Xác nhận mật khẩu"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="border rounded px-3 py-2"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            {loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
