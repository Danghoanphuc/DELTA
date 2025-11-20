// apps/customer-frontend/src/App.tsx (ĐÃ BỌC LISTENER)

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, Suspense, lazy, ComponentType } from "react";
import { useAuthStore } from "./stores/useAuthStore";
import { useCartStore } from "./stores/useCartStore";

import { AppLayout } from "./components/AppLayout";
import ProtectedRoute from "./features/auth/components/ProtectedRoute";
// ✅ FIX: Import GlobalModalProvider và các modals
import { GlobalModalProvider } from "@/contexts/GlobalModalProvider";
import { ProductQuickViewModal } from "@/components/ProductQuickViewModal";
import { OrderQuickViewModal } from "@/features/shop/components/modals/OrderQuickViewModal";

// ✅ REAL-TIME: Import Socket.io Provider và NotificationListener
import { SocketProvider } from "@/contexts/SocketProvider";
import { NotificationListener } from "@/components/NotificationListener";

// ✅ SOCIAL CHAT: Import Global Listener (Cơ quan thường trú)
import { SocialChatListener } from "@/features/social/components/SocialChatListener";

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
const PrinterApp = lazy(() => import("@/features/printer/pages/PrinterApp"));
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
// ✅ NEW: PrinterOrderDetailPage cho Printer
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
// ✅ SỬA LỖI: Import trang InspirationPage wrapper mới
const InspirationPage = lazy(
  () => import("@/features/customer/pages/InspirationPage")
);
// ✅ THÊM: Import ChatAppPage cho route /app (export default nên dùng lazy thông thường)
const ChatAppPage = lazy(() => import("@/features/chat/pages/ChatAppPage"));
// ✅ THÊM: Import ChatPage và ChatHistoryPage
const ChatPage = lazy(() => import("@/features/chat/pages/ChatPage"));
const ChatHistoryPage = lazy(
  () => import("@/features/chat/pages/ChatHistoryPage")
);
// ✅ NOTIFICATION: Import NotificationsPage
const NotificationsPage = lazy(
  () => import("@/features/notifications/pages/NotificationsPage")
);
// ✅ SOCIAL CHAT: Import MessagesPage
const MessagesPage = lazy(() => import("@/features/social/pages/MessagesPage"));
// ✅ SOCIAL: Import FriendsPage
const FriendsPage = lazy(() => import("@/features/social/pages/FriendsPage"));

function App() {
  // (Nội dung hàm App... giữ nguyên)
  const isAuthenticated = useAuthStore((state) => !!state.accessToken);
  const authLoading = useAuthStore((state) => state.loading);
  const fetchMe = useAuthStore((state) => state.fetchMe);
  const mergeGuestCart = useCartStore((state) => state.mergeGuestCart);
  const fetchCart = useCartStore((state) => state.fetchCart);

  useEffect(() => {
    // Chỉ gọi fetchMe khi có accessToken để tránh redirect không mong muốn
    if (isAuthenticated) {
      fetchMe(true);
    }
  }, [fetchMe, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      (async () => {
        try {
          await mergeGuestCart();
          // ✅ FIX: Fetch cart sau khi merge để đảm bảo cart được load
          await fetchCart();
        } catch (err: unknown) {
          // ✅ Silent error - cart will be fetched on next page load
          console.error("[App] Error merging cart:", err);
        }
      })();
    }
  }, [isAuthenticated, authLoading, mergeGuestCart, fetchCart]);

  return (
    <BrowserRouter>
      {/* ✅ FIX: Wrap toàn bộ app với GlobalModalProvider */}
      <GlobalModalProvider>
        {/* ✅ REAL-TIME: Wrap app với SocketProvider */}
        <SocketProvider>
          {/* ✅ GLOBAL LISTENERS: Luôn lắng nghe sự kiện */}
          <NotificationListener />
          <SocialChatListener /> {/* <--- ĐÃ THÊM VÀO ĐÂY */}
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* ==================== 1. LANDING LAYOUT ==================== */}
              <Route path="/" element={<SmartLanding />} />
              <Route path="/policy" element={<PolicyPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/process" element={<ProcessPage />} />

              {/* ==================== 2. CHAT LAYOUT (STANDALONE) ==================== */}
              {/* ✅ FIX QUAN TRỌNG: Đưa Chat ra ngoài AppLayout để chiếm trọn màn hình */}
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/chat/history" element={<ChatHistoryPage />} />

              {/* ==================== 3. APP LAYOUT (BÁN HÀNG) ==================== */}
              <Route element={<AppLayout />}>
                {/* --- Auth Pages --- */}
                <Route path="/signin" element={<SignInPage />} />
                <Route path="/signup" element={<SignUpPage />} />
                <Route path="/check-email" element={<CheckEmailPage />} />
                <Route path="/verify-email" element={<VerifyEmailPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/auth/callback" element={<AuthCallbackPage />} />
                {/* --- Shop Pages --- */}
                <Route path="/shop" element={<ShopPortalPage />} />
                <Route path="/app" element={<ChatAppPage />} />{" "}
                {/* Trang này vẫn cần Header/Footer nên giữ lại */}
                <Route path="/product/:slug" element={<ProductDetailPage />} />
                <Route path="/products/:id" element={<ProductDetailPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/inspiration" element={<InspirationPage />} />
                {/* --- Protected Customer Routes --- */}
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
                  {/* ✅ NOTIFICATION: Notifications page */}
                  <Route
                    path="/notifications"
                    element={<NotificationsPage />}
                  />
                  {/* ✅ SOCIAL CHAT: Messages page */}
                  <Route path="/messages" element={<MessagesPage />} />
                  {/* ✅ SOCIAL: Friends page */}
                  <Route path="/friends" element={<FriendsPage />} />
                </Route>
              </Route>

              {/* ==================== 4. PRINTER APP ==================== */}
              <Route element={<ProtectedRoute />}>
                {/* ... Giữ nguyên ... */}
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

              {/* ==================== 404 ==================== */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
          {/* ✅ FIX: Modals toàn cục - có thể dùng ở mọi nơi */}
          <ProductQuickViewModal />
          <OrderQuickViewModal />
        </SocketProvider>
      </GlobalModalProvider>
    </BrowserRouter>
  );
}

export default App;
