// apps/customer-frontend/src/App.tsx (ĐÃ VÁ LỖI)

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { useEffect, Suspense, lazy, ComponentType } from "react";
import { useAuthStore } from "./stores/useAuthStore";
import { useCartStore } from "./stores/useCartStore";
import { toast } from "sonner";

import { AppLayout } from "./components/AppLayout";
import ProtectedRoute from "./features/auth/components/ProtectedRoute";

// ==================== PAGE IMPORTS ====================

// ✅ SỬA LỖI: Import PageLoader từ file mới
import PageLoader from "@/components/PageLoader";

// --- Public Pages (NGOÀI APP) ---
import SmartLanding from "@/features/landing/SmartLanding";
import PolicyPage from "@/features/landing/PolicyPage";
import ContactPage from "@/features/landing/ContactPage";
import ProcessPage from "@/features/landing/ProcessPage";

// --- Auth Pages (NGOÀI APP) ---
import SignInPage from "@/features/auth/pages/SignInPage";
import SignUpPage from "@/features/customer/pages/SignUpPage";
import VerifyEmailPage from "@/features/auth/components/VerifyEmailPage";
import ResetPasswordPage from "@/features/auth/components/ResetPasswordPage";
import CheckEmailPage from "@/features/auth/pages/CheckEmailPage";

function lazyWorkaround<T extends ComponentType<any>>(
  importer: () => Promise<{ [key: string]: T }>
): React.LazyExoticComponent<T> {
  return lazy(async () => {
    const module = await importer();
    // ✅ SỬA: Hỗ trợ cả default export và named export
    if (module.default) {
      return { default: module.default as T };
    }
    const componentName = Object.keys(module).find((key) => key !== "default");
    if (!componentName) {
      throw new Error("Cannot find named export for lazy component");
    }
    return { default: module[componentName] as T };
  });
}
const AuthCallbackPage = lazyWorkaround(
  () => import("@/features/auth/pages/AuthCallbackPage")
);
const CartPage = lazyWorkaround(
  () => import("@/features/customer/pages/CartPage")
);

// --- Printer App (Lazy) ---
const PrinterOnboardingPage = lazyWorkaround(
  () => import("@/features/printer/pages/PrinterOnboardingPage")
);
// ✅ SỬA: PrinterApp export default nên dùng lazy thông thường
const PrinterApp = lazy(
  () => import("@/features/printer/pages/PrinterApp")
);
// ✅ THÊM: PrinterStudio cho route /printer/studio/:productId
const PrinterStudio = lazyWorkaround(
  () => import("@/features/printer/printer-studio/PrinterStudio")
);

// --- Customer App (Lazy) ---
const ShopPortalPage = lazyWorkaround(
  () => import("@/features/shop/pages/ShopPortalPage")
);
// ✅ SỬA: ProductDetailPage export default nên dùng lazy thông thường
const ProductDetailPage = lazy(
  () => import("@/features/shop/pages/ProductDetailPage")
);
const CheckoutPage = lazyWorkaround(
  () => import("@/features/customer/pages/CheckoutPage")
);
const CheckoutConfirmationPage = lazyWorkaround(
  () => import("@/features/shop/pages/OrderConfirmationPage")
);
const CustomerOrdersPage = lazyWorkaround(
  () => import("@/features/customer/pages/CustomerOrdersPage")
);
const OrderDetailPage = lazyWorkaround(
  () => import("@/features/shop/pages/OrderDetailPage")
);
const CustomerDesignsPage = lazyWorkaround(
  () => import("@/features/customer/pages/CustomerDesignsPage")
);
const CustomerSettingsPage = lazyWorkaround(
  () => import("@/features/customer/pages/CustomerSettingsPage")
);
const DesignEditorPage = lazyWorkaround(
  () => import("@/features/editor/DesignEditorPage")
);
// ✅ SỬA LỖI: Import trang InspirationPage wrapper mới
const InspirationPage = lazy(
  () => import("@/features/customer/pages/InspirationPage")
);
// ✅ THÊM: Import ChatAppPage cho route /app (export default nên dùng lazy thông thường)
const ChatAppPage = lazy(
  () => import("@/features/chat/pages/ChatAppPage")
);

function App() {
  // (Nội dung hàm App... giữ nguyên)
  const isAuthenticated = useAuthStore((state) => !!state.accessToken);
  const authLoading = useAuthStore((state) => state.loading);
  const fetchMe = useAuthStore((state) => state.fetchMe);
  const mergeGuestCart = useCartStore((state) => state.mergeGuestCart);

  useEffect(() => {
    fetchMe(true);
  }, [fetchMe]);

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      (async () => {
        try {
          await mergeGuestCart();
        } catch (err: unknown) {
          if (err instanceof Error) {
            toast.error(
              `Lỗi đồng bộ giỏ hàng: ${err.message}. Vui lòng tải lại trang.`
            );
          }
        }
      })();
    }
  }, [isAuthenticated, authLoading, mergeGuestCart]);

  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* ==================== PUBLIC LAYOUT ==================== */}
          <Route element={<AppLayout />}>
            {/* --- Public Pages --- */}
            <Route path="/" element={<SmartLanding />} />
            <Route path="/policy" element={<PolicyPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/process" element={<ProcessPage />} />

            {/* --- Auth Pages --- */}
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/check-email" element={<CheckEmailPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />

            {/* --- Shop / Product Pages --- */}
            <Route path="/shop" element={<ShopPortalPage />} />
            <Route path="/app" element={<ChatAppPage />} />
            <Route path="/product/:slug" element={<ProductDetailPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            {/* ✅ SỬA LỖI TS2739: Dùng trang wrapper mới */}
            <Route path="/inspiration" element={<InspirationPage />} />

            {/* --- Protected Customer Routes --- */}
            <Route element={<ProtectedRoute />}>
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route
                path="/checkout/confirmation/:masterOrderId"
                element={<CheckoutConfirmationPage />}
              />
              <Route path="/orders" element={<CustomerOrdersPage />} />
              <Route path="/orders/:orderId" element={<OrderDetailPage />} />
              <Route path="/designs" element={<CustomerDesignsPage />} />
              <Route path="/settings" element={<CustomerSettingsPage />} />
              <Route path="/design-editor" element={<DesignEditorPage />} />
            </Route>
          </Route>

          {/* ==================== PRINTER APP (Layout riêng) ==================== */}
          <Route element={<ProtectedRoute />}>
            <Route
              path="/printer/onboarding"
              element={<PrinterOnboardingPage />}
            />
            <Route path="/printer/dashboard" element={<PrinterApp />} />
            <Route
              path="/printer/orders/:orderId"
              element={<OrderDetailPage />}
            />
            <Route path="/printer/studio/:productId" element={<PrinterStudio />} />
          </Route>

          {/* ==================== 404 ==================== */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
