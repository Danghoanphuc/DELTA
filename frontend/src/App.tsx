// frontend/src/App.tsx (Đã sửa lỗi Google OAuth)
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { Toaster } from "sonner";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import PrinterSignInPage from "./pages/PrinterSignInPage";
import PrinterSignUpPage from "./pages/PrinterSignUpPage";
import VerifyEmailPage from "./components/auth/VerifyEmailPage";
import ResetPasswordPage from "./components/auth/ResetPasswordPage";
import CheckEmailPage from "./pages/CheckEmailPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import RootPage from "./pages/RootPage";
import { InspirationPage } from "./pages/customer/InspirationPage";
import { TrendsPage } from "./pages/customer/TrendsPage";
import { CustomerOrdersPage } from "./pages/customer/CustomerOrdersPage";
import { CustomerDesignsPage } from "./pages/customer/CustomerDesignsPage";
import { CustomerSettingsPage } from "./pages/customer/CustomerSettingsPage";
import { ShopPage } from "./pages/customer/ShopPage";
import { CheckoutPage } from "./pages/customer/CheckoutPage";
import { OrderDetailPage } from "./pages/OrderDetailPage";
import { ProductDetailPage } from "./pages/customer/ProductDetailPage";
import { useAuthStore } from "@/stores/useAuthStore";

function App() {
  // Lấy các hàm từ store
  const { setAccessToken, fetchMe } = useAuthStore();

  // useEffect để lắng nghe tin nhắn từ cửa sổ popup OAuth
  useEffect(() => {
    // Hàm xử lý tin nhắn
    const handleOAuthMessage = async (event: MessageEvent) => {
      // Lấy origin của backend API từ biến môi trường
      const API_ORIGIN = new URL(
        import.meta.env.VITE_API_URL || "http://localhost:5001"
      ).origin;

      // 1. Kiểm tra nguồn gốc tin nhắn và loại tin nhắn
      if (
        event.origin !== API_ORIGIN ||
        event.data?.type !== "GOOGLE_AUTH_SUCCESS"
      ) {
        // Bỏ qua tin nhắn không hợp lệ
        return;
      }

      // Log lại để debug (có thể xóa sau)
      console.log("✅ [OAuth] Received message:", event.data);

      // 2. Trích xuất accessToken và user data
      const { accessToken, user } = event.data;

      // 3. Kiểm tra dữ liệu và cập nhật store
      if (accessToken && user) {
        // Lưu accessToken vào store
        setAccessToken(accessToken);
        // Gọi fetchMe để lấy thông tin user đầy đủ nhất từ backend (bao gồm cả printerProfile nếu có)
        await fetchMe();
        // Thông báo đăng nhập thành công (tùy chọn)
        // toast.success("Đăng nhập bằng Google thành công!");
        // Không cần navigate ở đây, ProtectedRoute sẽ xử lý việc chuyển hướng
      } else {
        // Log lỗi nếu thiếu dữ liệu
        console.error("❌ [OAuth] Missing accessToken or user in message");
        // Có thể hiển thị thông báo lỗi cho người dùng nếu cần
        // toast.error("Đăng nhập Google thất bại, vui lòng thử lại.");
      }
    };

    // Đăng ký lắng nghe sự kiện 'message'
    window.addEventListener("message", handleOAuthMessage);

    // Dọn dẹp listener khi component unmount
    return () => window.removeEventListener("message", handleOAuthMessage);
  }, [setAccessToken, fetchMe]); // Dependencies của useEffect

  // Phần còn lại của component giữ nguyên
  return (
    <>
      <Toaster richColors position="top-center" />
      <Routes>
        {/* Public Routes */}
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/printer/signin" element={<PrinterSignInPage />} />
        <Route path="/printer/signup" element={<PrinterSignUpPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/check-your-email" element={<CheckEmailPage />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<RootPage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/products/:productId" element={<ProductDetailPage />} />
          {/* Order Detail Routes - Universal */}
          <Route path="/orders/:orderId" element={<OrderDetailPage />} />
          <Route
            path="/printer/orders/:orderId"
            element={<OrderDetailPage />}
          />
          <Route path="/orders" element={<CustomerOrdersPage />} />
          <Route path="/designs" element={<CustomerDesignsPage />} />
          <Route path="/settings" element={<CustomerSettingsPage />} />
          <Route path="/inspiration" element={<InspirationPage />} />
          <Route path="/trends" element={<TrendsPage />} />
        </Route>

        {/* Fallback */}
        <Route
          path="*"
          element={
            <div className="p-8 text-center">404 - Không tìm thấy trang</div>
          }
        />
      </Routes>
    </>
  );
}

// Wrapper component để sử dụng BrowserRouter
const AppWrapper = () => (
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

export default AppWrapper;
