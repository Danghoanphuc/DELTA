// frontend/src/App.tsx (CẬP NHẬT)
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { useEffect } from "react";
import { useAuthStore } from "./stores/useAuthStore";
import { useCartStore } from "./stores/useCartStore";
import { closeOAuthPopup } from "./shared/components/ui/SocialButton";
import { toast } from "sonner";

// ==================== PAGE IMPORTS ====================
// Public Pages
import SmartLanding from "@/features/landing/SmartLanding"; // ✅ Fixed
import ChatAppPage from "@/features/chat/pages/ChatAppPage";
import { ShopPage } from "@/features/shop/pages/ShopPage";
import { ProductDetailPage } from "@/features/shop/pages/ProductDetailPage";
import { InspirationPage } from "@/features/customer/pages/InspirationPage";
import { TrendsPage } from "@/features/customer/pages/TrendsPage";
import PolicyPage from "@/features/landing/PolicyPage";
// --- THÊM CÁC IMPORT NÀY ---
import ContactPage from "@/features/landing/ContactPage";
import ProcessPage from "@/features/landing/ProcessPage";
import TemplateLibraryPage from "@/features/landing/TemplateLibraryPage";
// ----------------------------

// Auth Pages
import SignInPage from "@/features/auth/pages/SignInPage";
import SignUpPage from "@/features/customer/pages/SignUpPage";
import VerifyEmailPage from "@/components/auth/VerifyEmailPage";
import ResetPasswordPage from "@/components/auth/ResetPasswordPage";
import PrinterSignUpPage from "@/features/auth/pages/PrinterSignUpPage";
import PrinterSignInPage from "@/features/auth/pages/PrinterSignInPage";
import CheckEmailPage from "@/features/auth/pages/CheckEmailPage";

// Protected Pages
import { CheckoutPage } from "@/features/customer/pages/CheckoutPage";
import { CustomerOrdersPage } from "@/features/customer/pages/CustomerOrdersPage";
import { OrderDetailPage } from "@/features/shop/pages/OrderDetailPage";
import { CustomerDesignsPage } from "@/features/customer/pages/CustomerDesignsPage";
import { CustomerSettingsPage } from "@/features/customer/pages/CustomerSettingsPage";
import { DesignEditorPage } from "@/features/editor/DesignEditorPage";
import { OrderConfirmationPage } from "@/features/customer/pages/OrderConfirmationPage";

// Printer Pages
import PrinterApp from "@/features/printer/pages/PrinterApp";
import { PrinterStudio } from "@/features/printer/pages/PrinterStudio";
const API_ORIGIN = import.meta.env.VITE_API_URL || "http://localhost:5001";

function App() {
  // ... (Phần logic listener giữ nguyên) ...
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
        <Route path="/" element={<SmartLanding />} />
        <Route path="/app" element={<ChatAppPage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/inspiration" element={<InspirationPage />} />
        <Route path="/trends" element={<TrendsPage />} />
        <Route path="/policy" element={<PolicyPage />} />
        <Route path="/check-email" element={<CheckEmailPage />} />

        {/* --- THÊM CÁC ROUTE MỚI CHO LANDING PAGE --- */}
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/process" element={<ProcessPage />} />
        <Route path="/templates" element={<TemplateLibraryPage />} />
        {/* ---------------------------------------------- */}

        {/* ==================== AUTH ROUTES ==================== */}
        {/* ... (Phần còn lại giữ nguyên) ... */}
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
          <Route path="/design-editor" element={<DesignEditorPage />} />
          <Route
            path="/printer/orders/:orderId"
            element={<OrderDetailPage />}
          />
          <Route
            path="/printer/studio/:productId"
            element={<PrinterStudio />} // Component Phần 4
          />
        </Route>

        {/* ==================== 404 ==================== */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
