// apps/customer-frontend/src/App.tsx
// ✅ FIXED: Added SocialChatSync (Icon Badge) & Toaster (Popup Display)

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, Suspense, lazy, ComponentType } from "react";
import { useAuthStore } from "./stores/useAuthStore";
import { useCartStore } from "./stores/useCartStore";

import { AppLayout } from "./components/AppLayout";
import ProtectedRoute from "./features/auth/components/ProtectedRoute";
import { GlobalModalProvider } from "@/contexts/GlobalModalProvider";
import { ProductQuickViewModal } from "@/components/ProductQuickViewModal";
import { OrderQuickViewModal } from "@/features/shop/components/modals/OrderQuickViewModal";

// ✅ REAL-TIME COMPONENTS
import { SocketProvider } from "@/contexts/SocketProvider";
import { NotificationListener } from "@/components/NotificationListener";
import { Toaster } from "sonner"; // Import Toaster

// 🔥 MỚI: Import Sync Component để đồng bộ tin nhắn nền
import { SocialChatSync } from "@/features/social/components/SocialChatSync";

// ==================== PAGE IMPORTS ====================

import PageLoader from "@/components/PageLoader";

// --- Public Pages ---
import SmartLanding from "@/features/landing/SmartLanding";
import PolicyPage from "@/features/landing/PolicyPage";
import ContactPage from "@/features/landing/ContactPage";
import ProcessPage from "@/features/landing/ProcessPage";

// --- Auth Pages ---
import SignInPage from "@/features/auth/pages/SignInPage";
import SignUpPage from "@/features/customer/pages/SignUpPage";
import VerifyEmailPage from "@/features/auth/components/VerifyEmailPage";
import ResetPasswordPage from "@/features/auth/components/ResetPasswordPage";
import CheckEmailPage from "@/features/auth/pages/CheckEmailPage";

// Helper for lazy loading
function lazyWorkaround<T extends ComponentType<any>>(
  importer: () => Promise<{ [key: string]: T }>
): React.LazyExoticComponent<T> {
  return lazy(async () => {
    const module = await importer();
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

// --- Lazy Loaded Pages ---
const AuthCallbackPage = lazyWorkaround(
  () => import("@/features/auth/pages/AuthCallbackPage")
);
const CartPage = lazyWorkaround(
  () => import("@/features/customer/pages/CartPage")
);
const PrinterOnboardingPage = lazyWorkaround(
  () => import("@/features/printer/pages/PrinterOnboardingPage")
);
const PrinterApp = lazy(() => import("@/features/printer/pages/PrinterApp"));
const PrinterStudio = lazyWorkaround(
  () => import("@/features/printer/printer-studio/PrinterStudio")
);
const ShopPortalPage = lazyWorkaround(
  () => import("@/features/shop/pages/ShopPortalPage")
);
const ProductDetailPage = lazy(
  () => import("@/features/shop/pages/ProductDetailPage")
);
const CheckoutPage = lazyWorkaround(
  () => import("@/features/customer/pages/CheckoutPage")
);
const CheckoutSuccessPage = lazyWorkaround(
  () => import("@/features/customer/pages/CheckoutSuccessPage")
);
const CheckoutCancelPage = lazyWorkaround(
  () => import("@/features/customer/pages/CheckoutCancelPage")
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
const PrinterOrderDetailPage = lazyWorkaround(
  () => import("@/features/printer/pages/PrinterOrderDetailPage")
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
const InspirationPage = lazy(
  () => import("@/features/customer/pages/InspirationPage")
);
const ChatAppPage = lazy(() => import("@/features/chat/pages/ChatAppPage"));
const ChatPage = lazy(() => import("@/features/chat/pages/ChatPage"));
const ChatHistoryPage = lazy(
  () => import("@/features/chat/pages/ChatHistoryPage")
);
const NotificationsPage = lazy(
  () => import("@/features/notifications/pages/NotificationsPage")
);
const MessagesPage = lazy(() => import("@/features/social/pages/MessagesPage"));
const FriendsPage = lazy(() => import("@/features/social/pages/FriendsPage"));

function App() {
  const isAuthenticated = useAuthStore((state) => !!state.accessToken);
  const authLoading = useAuthStore((state) => state.loading);
  const fetchMe = useAuthStore((state) => state.fetchMe);
  const mergeGuestCart = useCartStore((state) => state.mergeGuestCart);
  const fetchCart = useCartStore((state) => state.fetchCart);

  useEffect(() => {
    if (isAuthenticated) {
      fetchMe(true);
    }
  }, [fetchMe, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      (async () => {
        try {
          await mergeGuestCart();
          await fetchCart();
        } catch (err: unknown) {
          console.error("[App] Error merging cart:", err);
        }
      })();
    }
  }, [isAuthenticated, authLoading, mergeGuestCart, fetchCart]);

  return (
    <BrowserRouter>
      <GlobalModalProvider>
        <SocketProvider>
          {/* 🔥 QUAN TRỌNG 1: Toaster để hiển thị thông báo nổi (Sonner) */}
          <Toaster position="top-right" richColors closeButton />
          {/* --- GLOBAL LISTENERS --- */}
          <NotificationListener /> {/* Nghe thông báo chung */}
          {/* 🔥 QUAN TRỌNG 2: Sync Component để icon Chat nhảy số ngầm */}
          <SocialChatSync />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* 1. LANDING */}
              <Route path="/" element={<SmartLanding />} />
              <Route path="/policy" element={<PolicyPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/process" element={<ProcessPage />} />

              {/* 2. CHAT STANDALONE */}
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/chat/history" element={<ChatHistoryPage />} />

              {/* 3. MAIN APP */}
              <Route element={<AppLayout />}>
                {/* Auth */}
                <Route path="/signin" element={<SignInPage />} />
                <Route path="/signup" element={<SignUpPage />} />
                <Route path="/check-email" element={<CheckEmailPage />} />
                <Route path="/verify-email" element={<VerifyEmailPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/auth/callback" element={<AuthCallbackPage />} />

                {/* Shop & Customer */}
                <Route path="/shop" element={<ShopPortalPage />} />
                <Route path="/app" element={<ChatAppPage />} />
                <Route path="/product/:slug" element={<ProductDetailPage />} />
                <Route path="/products/:id" element={<ProductDetailPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/inspiration" element={<InspirationPage />} />

                <Route element={<ProtectedRoute />}>
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route
                    path="/checkout/success"
                    element={<CheckoutSuccessPage />}
                  />
                  <Route
                    path="/checkout/cancel"
                    element={<CheckoutCancelPage />}
                  />
                  <Route
                    path="/checkout/confirmation/:orderId?"
                    element={<CheckoutConfirmationPage />}
                  />
                  <Route
                    path="/checkout/confirmation"
                    element={<CheckoutConfirmationPage />}
                  />
                  <Route path="/orders" element={<CustomerOrdersPage />} />
                  <Route
                    path="/orders/:orderId"
                    element={<OrderDetailPage />}
                  />
                  <Route path="/designs" element={<CustomerDesignsPage />} />
                  <Route path="/settings" element={<CustomerSettingsPage />} />
                  <Route path="/design-editor" element={<DesignEditorPage />} />

                  {/* Social & Notification */}
                  <Route
                    path="/notifications"
                    element={<NotificationsPage />}
                  />
                  <Route path="/messages" element={<MessagesPage />} />
                  <Route path="/friends" element={<FriendsPage />} />
                </Route>
              </Route>

              {/* 4. PRINTER APP */}
              <Route element={<ProtectedRoute />}>
                <Route
                  path="/printer/onboarding"
                  element={<PrinterOnboardingPage />}
                />
                <Route path="/printer/dashboard" element={<PrinterApp />} />
                <Route
                  path="/printer/orders/:orderId"
                  element={<PrinterOrderDetailPage />}
                />
                <Route
                  path="/printer/studio/:productId"
                  element={<PrinterStudio />}
                />
              </Route>

              {/* 404 */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
          {/* Global Modals */}
          <ProductQuickViewModal />
          <OrderQuickViewModal />
        </SocketProvider>
      </GlobalModalProvider>
    </BrowserRouter>
  );
}

export default App;
