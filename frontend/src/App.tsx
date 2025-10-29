// frontend/src/App.tsx (✅ Sửa lỗi Route Param LẦN NỮA)
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { useEffect } from "react";
import { useAuthStore } from "./stores/useAuthStore";
import { useCartStore } from "./stores/useCartStore";
import { closeOAuthPopup } from "./components/ui/SocialButton";
import { toast } from "sonner";

// ==================== PUBLIC PAGES ====================
import HomePage from "@/pages/ChatAppPage";
import { ShopPage } from "./pages/customer/ShopPage";
import { ProductDetailPage } from "./pages/customer/ProductDetailPage";
import { InspirationPage } from "./pages/customer/InspirationPage";
import { TrendsPage } from "./pages/customer/TrendsPage";

// ==================== AUTH PAGES ====================
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import VerifyEmailPage from "./components/auth/VerifyEmailPage";
import ResetPasswordPage from "./components/auth/ResetPasswordPage";
import PrinterSignUpPage from "./pages/PrinterSignUpPage";
import PrinterSignInPage from "./pages/PrinterSignInPage";

// ==================== PROTECTED PAGES ====================
import { CheckoutPage } from "./pages/customer/CheckoutPage";
import { CustomerOrdersPage } from "./pages/customer/CustomerOrdersPage";
import { OrderDetailPage } from "./pages/OrderDetailPage";
import { CustomerDesignsPage } from "./pages/customer/CustomerDesignsPage";
import { CustomerSettingsPage } from "./pages/customer/CustomerSettingsPage";
import { OrderConfirmationPage } from "./pages/customer/OrderConfirmationPage";

// ==================== PRINTER PAGES ====================
import PrinterApp from "./pages/PrinterApp";

// Lấy API_ORIGIN từ .env
const API_ORIGIN = import.meta.env.VITE_API_URL || "http://localhost:5001";

function App() {
  // Logic lắng nghe tín hiệu từ Google OAuth Popup
  const { setAccessToken } = useAuthStore();
  const mergeGuestCart = useCartStore((s) => s.mergeGuestCartToServer);

  useEffect(() => {
    const handleOAuthMessage = async (event: MessageEvent) => {
      if (event.origin !== API_ORIGIN) return;
      const { success, accessToken, user, error } = event.data;
      if (success && accessToken && user) {
        console.log("[OAuth] ✅ Đã nhận tín hiệu thành công từ popup");
        closeOAuthPopup();
        setAccessToken(accessToken);
        useAuthStore.getState().setUser(user);
        try {
          await mergeGuestCart();
        } catch (mergeErr) {
          console.error("[OAuth] 🛒 Lỗi merge cart:", mergeErr);
          toast.error("Không thể tự động gộp giỏ hàng cũ.");
        }
        toast.success(`Chào mừng, ${user.displayName}!`);
      } else if (error) {
        console.error(`[OAuth] ❌ Lỗi từ popup: ${error}`);
        toast.error(error || "Đăng nhập Google thất bại");
        closeOAuthPopup();
      }
    };
    window.addEventListener("message", handleOAuthMessage);
    return () => window.removeEventListener("message", handleOAuthMessage);
  }, [setAccessToken, mergeGuestCart]);

  return (
    <BrowserRouter>
      <Toaster position="top-center" richColors />
      <Routes>
        {/* ==================== PUBLIC ROUTES ==================== */}
        <Route path="/" element={<HomePage />} />
        <Route path="/shop" element={<ShopPage />} />
        {/* ✅ SỬA LẠI Ở ĐÂY */}
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/inspiration" element={<InspirationPage />} />
        <Route path="/trends" element={<TrendsPage />} />

        {/* ==================== AUTH ROUTES ==================== */}
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/printer/signup" element={<PrinterSignUpPage />} />
        <Route path="/printer/signin" element={<PrinterSignInPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* ==================== PROTECTED ROUTES ==================== */}
        <Route element={<ProtectedRoute />}>
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route
            path="/order-confirmation/:orderId"
            element={<OrderConfirmationPage />}
          />
          <Route path="/orders" element={<CustomerOrdersPage />} />
          <Route path="/orders/:orderId" element={<OrderDetailPage />} />
          <Route path="/designs" element={<CustomerDesignsPage />} />
          <Route path="/settings" element={<CustomerSettingsPage />} />
          <Route path="/printer/dashboard" element={<PrinterApp />} />
          <Route
            path="/printer/orders/:orderId"
            element={<OrderDetailPage />}
          />
        </Route>

        {/* ==================== 404 ==================== */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
