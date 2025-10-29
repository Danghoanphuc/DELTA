// frontend/src/App.tsx (✅ FIXED VERSION)
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom"; // ✅ FIX: Thêm useNavigate
import { useEffect } from "react";
import { Toaster } from "sonner";
import { toast } from "sonner";
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
import { ProductManagement } from "./pages/printer/ProductManagement";
import { OrderConfirmationPage } from "@/pages/customer/OrderConfirmationPage";

function App() {
  const { setAccessToken, fetchMe } = useAuthStore();
  const navigate = useNavigate(); // ✅ FIX: Khởi tạo navigate

  useEffect(() => {
    const handleOAuthMessage = async (event: MessageEvent) => {
      // Lấy origin của backend API
      const API_ORIGIN = new URL(
        import.meta.env.VITE_API_URL || "http://localhost:5001"
      ).origin;

      console.log("📨 [App] Received message from:", event.origin);
      console.log("📦 [App] Message data:", event.data);

      // 1. Kiểm tra origin và type
      if (event.origin !== API_ORIGIN) {
        console.warn(
          `⚠️ [App] Message from untrusted origin: ${event.origin}, expected: ${API_ORIGIN}`
        );
        return;
      }

      if (event.data?.type !== "GOOGLE_AUTH_SUCCESS") {
        console.log("ℹ️ [App] Ignoring non-auth message");
        return;
      }

      // 2. Extract data
      const { accessToken, user } = event.data.payload;

      console.log("🔑 [App] Access Token received:", accessToken ? "✅" : "❌");
      console.log("👤 [App] User data received:", user ? "✅" : "❌");

      // 3. Validate and update store
      if (!accessToken || !user) {
        console.error("❌ [App] Missing accessToken or user data");
        toast.error("Đăng nhập thất bại. Vui lòng thử lại.");
        return;
      }

      try {
        // Lưu accessToken vào store
        console.log("💾 [App] Saving access token...");
        setAccessToken(accessToken);

        // Gọi fetchMe để sync user data
        console.log("🔄 [App] Fetching user profile...");
        await fetchMe();

        // Hiển thị toast thành công
        toast.success(`Chào mừng, ${user.displayName}!`, {
          description: "Đăng nhập thành công",
        });

        console.log("✅ [App] OAuth authentication completed successfully");

        // ✅ FIX: Navigate về trang chủ sau khi OAuth thành công
        setTimeout(() => {
          navigate("/", { replace: true });
        }, 100);
      } catch (error) {
        console.error("❌ [App] Error processing auth:", error);
        toast.error("Có lỗi xảy ra. Vui lòng thử lại.");
      }
    };

    console.log("🎧 [App] Registering message listener...");
    window.addEventListener("message", handleOAuthMessage);

    return () => {
      console.log("🔇 [App] Removing message listener...");
      window.removeEventListener("message", handleOAuthMessage);
    };
  }, [setAccessToken, fetchMe, navigate]); // ✅ FIX: Thêm navigate vào dependencies

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
          <Route path="/orders/:orderId" element={<OrderDetailPage />} />
          <Route
            path="/printer/orders/:orderId"
            element={<OrderDetailPage />}
          />
          <Route
            path="/order-confirmation/:orderId"
            element={<OrderConfirmationPage />}
          />
          <Route path="/printer/products" element={<ProductManagement />} />
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

const AppWrapper = () => (
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

export default AppWrapper;
