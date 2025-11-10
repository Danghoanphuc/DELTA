// frontend/src/App.tsx
// ✅ BÀN GIAO: Tối ưu Code Splitting (React.lazy)

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { useEffect, Suspense, lazy } from "react"; // ✅ Thêm Suspense, lazy
import { useAuthStore } from "./stores/useAuthStore";
import { useCartStore } from "./stores/useCartStore";
import { toast } from "sonner";
import { Loader2 } from "lucide-react"; // ✅ Thêm Loader

// ==================== PAGE IMPORTS ====================

// ✅ TẠO LOADER FALLBACK
const PageLoader = () => (
  <div className="flex h-screen items-center justify-center">
    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
  </div>
);

// --- Public Pages (Tải ngay) ---
import SmartLanding from "@/features/landing/SmartLanding";
import PolicyPage from "@/features/landing/PolicyPage";
import ContactPage from "@/features/landing/ContactPage";
import ProcessPage from "@/features/landing/ProcessPage";

// --- Auth Pages (Tải ngay - vì chúng nhẹ) ---
import SignInPage from "@/features/auth/pages/SignInPage";
import SignUpPage from "@/features/customer/pages/SignUpPage";
import VerifyEmailPage from "@/features/auth/components/VerifyEmailPage";
import ResetPasswordPage from "@/features/auth/components/ResetPasswordPage";
import CheckEmailPage from "@/features/auth/pages/CheckEmailPage";
import ProtectedRoute from "./features/auth/components/ProtectedRoute";

// --- ✅ LAZY LOAD CÁC TRANG NẶNG (Heavy Pages) ---
const ChatAppPage = lazy(() => import("@/features/chat/pages/ChatAppPage"));
const ShopPage = lazy(() =>
  import("@/features/shop/pages/ShopPage").then((module) => ({
    default: module.ShopPage,
  }))
);
const ProductDetailPage = lazy(() =>
  import("@/features/shop/pages/ProductDetailPage").then((module) => ({
    default: module.ProductDetailPage,
  }))
);
const InspirationPage = lazy(() =>
  import("@/features/customer/pages/InspirationPage").then((module) => ({
    default: module.InspirationPage,
  }))
);
const TrendsPage = lazy(() =>
  import("@/features/customer/pages/TrendsPage").then((module) => ({
    default: module.TrendsPage,
  }))
);
const TemplateLibraryPage = lazy(
  () => import("@/features/landing/TemplateLibraryPage")
);

// --- ✅ LAZY LOAD CÁC TRANG ĐƯỢC BẢO VỆ (Protected Pages) ---
const CheckoutPage = lazy(() =>
  import("@/features/customer/pages/CheckoutPage").then((module) => ({
    default: module.CheckoutPage,
  }))
);
const CustomerOrdersPage = lazy(() =>
  import("@/features/customer/pages/CustomerOrdersPage").then((module) => ({
    default: module.CustomerOrdersPage,
  }))
);
const OrderDetailPage = lazy(() =>
  import("@/features/shop/pages/OrderDetailPage").then((module) => ({
    default: module.OrderDetailPage,
  }))
);
const CustomerDesignsPage = lazy(() =>
  import("@/features/customer/pages/CustomerDesignsPage").then((module) => ({
    default: module.CustomerDesignsPage,
  }))
);
const CustomerSettingsPage = lazy(() =>
  import("@/features/customer/pages/CustomerSettingsPage").then((module) => ({
    default: module.CustomerSettingsPage,
  }))
);
const DesignEditorPage = lazy(() =>
  import("@/features/editor/DesignEditorPage").then((module) => ({
    default: module.DesignEditorPage,
  }))
);
const OrderConfirmationPage = lazy(() =>
  import("@/features/customer/pages/OrderConfirmationPage").then((module) => ({
    default: module.OrderConfirmationPage,
  }))
);

// --- ✅ LAZY LOAD TOÀN BỘ PRINTER APP (Rất nặng) ---
const PrinterApp = lazy(() => import("@/features/printer/pages/PrinterApp"));
const PrinterStudio = lazy(() =>
  import("@/features/printer/printer-studio/PrinterStudio").then((module) => ({
    default: module.PrinterStudio,
  }))
);
const PrinterOnboardingPage = lazy(() =>
  import("@/features/printer/pages/PrinterOnboardingPage").then((module) => ({
    default: module.PrinterOnboardingPage,
  }))
);

const API_ORIGIN = import.meta.env.VITE_API_URL || "http://localhost:5001";

function App() {
  const { setAccessToken, fetchMe } = useAuthStore();
  const mergeGuestCart = useCartStore((s) => s.mergeGuestCartToServer);

  // (useEffect xử lý OAuth giữ nguyên)
  useEffect(() => {
    const handleOAuthMessage = async (event: MessageEvent) => {
      // ... (logic OAuth giữ nguyên)
    };
    window.addEventListener("message", handleOAuthMessage);
    return () => window.removeEventListener("message", handleOAuthMessage);
  }, [setAccessToken, fetchMe, mergeGuestCart]);

  return (
    <BrowserRouter>
      <Toaster position="top-center" richColors />
      {/* ✅ BỌC TOÀN BỘ ROUTES TRONG SUSPENSE */}
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* ==================== PUBLIC ROUTES ==================== */}
          <Route path="/" element={<SmartLanding />} />
          <Route path="/policy" element={<PolicyPage />} />
          <Route path="/check-email" element={<CheckEmailPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/process" element={<ProcessPage />} />

          {/* (Các trang public đã được lazy load) */}
          <Route path="/app" element={<ChatAppPage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/inspiration" element={<InspirationPage />} />
          <Route path="/trends" element={<TrendsPage />} />
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
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
