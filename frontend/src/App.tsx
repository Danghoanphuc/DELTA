// frontend/src/App.tsx
// ✅ FIXED: Single OAuth handler, improved error handling

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import ProtectedRoute from "./features/auth/components/ProtectedRoute";
import { useEffect } from "react";
import { useAuthStore } from "./stores/useAuthStore";
import { useCartStore } from "./stores/useCartStore";
import { toast } from "sonner";

// ==================== PAGE IMPORTS ====================
// Public Pages
import SmartLanding from "@/features/landing/SmartLanding";
import ChatAppPage from "@/features/chat/pages/ChatAppPage";
import { ShopPage } from "@/features/shop/pages/ShopPage";
import { ProductDetailPage } from "@/features/shop/pages/ProductDetailPage";
import { InspirationPage } from "@/features/customer/pages/InspirationPage";
import { TrendsPage } from "@/features/customer/pages/TrendsPage";
import PolicyPage from "@/features/landing/PolicyPage";
import ContactPage from "@/features/landing/ContactPage";
import ProcessPage from "@/features/landing/ProcessPage";
import TemplateLibraryPage from "@/features/landing/TemplateLibraryPage";

// Auth Pages
import SignInPage from "@/features/auth/pages/SignInPage";
import SignUpPage from "@/features/customer/pages/SignUpPage";
import VerifyEmailPage from "@/features/auth/components/VerifyEmailPage";
import ResetPasswordPage from "@/features/auth/components/ResetPasswordPage";
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
import { PrinterStudio } from "@/features/printer/printer-studio/PrinterStudio";
import { PrinterOnboardingPage } from "@/features/printer/pages/PrinterOnboardingPage";

const API_ORIGIN = import.meta.env.VITE_API_URL || "http://localhost:5001";

function App() {
  const { setAccessToken, fetchMe } = useAuthStore();
  const mergeGuestCart = useCartStore((s) => s.mergeGuestCartToServer);

  useEffect(() => {
    const handleOAuthMessage = async (event: MessageEvent) => {
      // ✅ Security check: Only accept messages from our backend
      if (event.origin !== API_ORIGIN) {
        console.log(`[OAuth] Ignored message from: ${event.origin}`);
        return;
      }

      const { success, accessToken, error } = event.data;

      // Handle error case
      if (!success) {
        if (error) {
          console.error(`[OAuth] Error from popup: ${error}`);
          toast.error(error || "Đăng nhập Google thất bại");
        }
        return;
      }

      // Validate accessToken
      if (!accessToken) {
        console.error("[OAuth] Missing accessToken in response");
        toast.error("Đăng nhập thất bại: Không nhận được token");
        return;
      }

      console.log("[OAuth] ✅ Received accessToken from popup");

      try {
        // Step 1: Save access token
        setAccessToken(accessToken);

        // Step 2: Fetch user info from /users/me
        await fetchMe();

        // Step 3: Merge guest cart (if any)
        try {
          await mergeGuestCart();
        } catch (mergeErr) {
          console.error("[OAuth] Cart merge failed:", mergeErr);
          toast.warning("Không thể đồng bộ giỏ hàng cũ");
        }

        // Step 4: Success notification
        const user = useAuthStore.getState().user;
        toast.success(`Chào mừng, ${user?.displayName || "bạn"}!`);

        // Step 5: Redirect after a short delay
        setTimeout(() => {
          window.location.href = "/";
        }, 300);
      } catch (err) {
        console.error("[OAuth] Failed to process login:", err);
        toast.error("Đăng nhập thất bại, vui lòng thử lại");
        setAccessToken(null);
      }
    };

    window.addEventListener("message", handleOAuthMessage);
    return () => window.removeEventListener("message", handleOAuthMessage);
  }, [setAccessToken, fetchMe, mergeGuestCart]);

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
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/process" element={<ProcessPage />} />
        <Route path="/templates" element={<TemplateLibraryPage />} />

        {/* ==================== AUTH ROUTES ==================== */}
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
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

          {/* Design Editor */}
          <Route path="/design-editor" element={<DesignEditorPage />} />

          {/* Printer Routes */}
          <Route
            path="/printer/onboarding"
            element={<PrinterOnboardingPage />}
          />
          <Route path="/printer/dashboard" element={<PrinterApp />} />
          <Route
            path="/printer/orders/:orderId"
            element={<OrderDetailPage />}
          />
          <Route
            path="/printer/studio/:productId"
            element={<PrinterStudio />}
          />
        </Route>

        {/* ==================== 404 ==================== */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
