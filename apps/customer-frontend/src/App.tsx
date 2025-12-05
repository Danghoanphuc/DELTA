// apps/customer-frontend/src/App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useRef, Suspense, lazy, ComponentType } from "react";
import { useAuthStore } from "./stores/useAuthStore";
import { useCartStore } from "./stores/useCartStore";

// ✅ HOOK BẢO VỆ NỘI DUNG
import { useContentProtection } from "@/shared/hooks/useContentProtection";

// ✅ SEO COMPONENT
import { StructuredData } from "@/components/seo/StructuredData";

import { AppLayout } from "./components/AppLayout";
import ProtectedGuard from "./features/auth/containers/ProtectedGuard";
import { GlobalModalProvider } from "@/contexts/GlobalModalProvider";
import { ProductQuickViewModal } from "@/components/ProductQuickViewModal";
import { OrderQuickViewModal } from "@/features/shop/components/modals/OrderQuickViewModal";

// ✅ REAL-TIME COMPONENTS
import { SocketProvider } from "@/contexts/SocketProvider";
import { NotificationListener } from "@/components/NotificationListener";
import { DynamicIsland } from "@/shared/components/ui/DynamicIsland";
import { SocialChatSync } from "@/features/social/components/SocialChatSync";

// ✅ CORE UI
import PageLoader from "@/components/PageLoader";
import NotFoundPage from "./pages/NotFoundPage";

// --- Public Pages ---
import SmartLanding from "@/features/landing/SmartLanding";
import PolicyPage from "@/features/landing/PolicyPage";
import ContactPage from "@/features/landing/ContactPage";
import ProcessPage from "@/features/landing/ProcessPage";
import TrendsPage from "@/features/landing/TrendsPage";
import TemplateLibraryPage from "@/features/landing/TemplateLibraryPage";
import BusinessPage from "@/features/landing/BusinessPage";
import AboutPage from "@/features/landing/AboutPage";
import CareersPage from "@/features/landing/CareersPage";
import WarehousingPage from "@/features/solutions/WarehousingPage";
import KittingPage from "@/features/solutions/KittingPage";
import CorporateGiftingPage from "@/features/solutions/CorporateGiftingPage";
import QuickQuotePage from "@/features/quote/pages/QuickQuotePage";
import CompanySetupWizard from "@/features/organization/pages/CompanySetupWizard";

// --- Auth Pages ---
import SignInPage from "@/features/auth/pages/SignInPage";
import SignUpPage from "@/features/auth/pages/SignUpPage";
import VerifyEmailPage from "@/features/auth/pages/VerifyEmailPage";
import ResetPasswordPage from "@/features/auth/pages/ResetPasswordPage";
import ForgotPasswordPage from "@/features/auth/pages/ForgotPasswordPage";
import CheckEmailPage from "@/features/auth/pages/CheckEmailPage";
import { GoogleOneTapListener } from "@/features/auth/components/GoogleOneTapListener";

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
// ❌ REMOVED: Printer Portal (Legacy)
// const PrinterOnboardingPage = lazyWorkaround(
//   () => import("@/features/printer/pages/PrinterOnboardingPage")
// );
// const PrinterApp = lazy(() => import("@/features/printer/pages/PrinterApp"));
// const PrinterStudio = lazyWorkaround(
//   () => import("@/features/printer/printer-studio/PrinterStudio")
// );
const ShopPortalPage = lazyWorkaround(
  () => import("@/features/shop/pages/ModernShopPage")
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
// ❌ REMOVED: Printer Portal (Legacy)
// const PrinterOrderDetailPage = lazyWorkaround(
//   () => import("@/features/printer/pages/PrinterOrderDetailPage")
// );
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
const ChatAppPage = lazy(() => import("@/features/main/pages/AppPage"));
const ChatPage = lazy(() => import("@/features/chat/pages/ChatPage"));
const ChatHistoryPage = lazy(
  () => import("@/features/chat/pages/ChatHistoryPage")
);
const NotificationsPage = lazy(
  () => import("@/features/notifications/pages/NotificationsPage")
);
const MessagesPage = lazy(() => import("@/features/social/pages/MessagesPage"));
const FriendsPage = lazy(() => import("@/features/social/pages/FriendsPage"));
const RushPage = lazyWorkaround(() => import("@/features/rush/pages/RushPage"));

// ✅ Organization Portal (B2B)
const OrganizationApp = lazy(
  () => import("@/features/organization/pages/OrganizationApp")
);
const RecipientSelfServicePage = lazy(
  () => import("@/features/organization/pages/RecipientSelfServicePage")
);

// ✅ Redemption & Company Store (SwagUp-style)
const RedemptionPage = lazy(
  () => import("@/features/redemption/pages/RedemptionPage")
);
const CompanyStorePage = lazy(
  () => import("@/features/company-store/pages/CompanyStorePage")
);

function AppContent() {
  const isAuthenticated = useAuthStore((state) => !!state.accessToken);
  const authLoading = useAuthStore((state) => state.loading);
  const fetchMe = useAuthStore((state) => state.fetchMe);
  const mergeGuestCart = useCartStore((state) => state.mergeGuestCart);
  const fetchCart = useCartStore((state) => state.fetchCart);
  const user = useAuthStore((state) => state.user);

  const lastFetchTimeRef = useRef<number>(0);
  const hasFetchedRef = useRef<boolean>(false);
  const FETCH_COOLDOWN = 10000;

  // ✅ KÍCH HOẠT LÁ CHẮN BẢO VỆ
  useContentProtection();

  // Logic fetch user data
  useEffect(() => {
    if (isAuthenticated && !user && !hasFetchedRef.current) {
      const now = Date.now();
      if (now - lastFetchTimeRef.current > FETCH_COOLDOWN) {
        lastFetchTimeRef.current = now;
        hasFetchedRef.current = true;
        fetchMe(true).catch((err) => {
          console.error("[App] fetchMe error:", err);
          hasFetchedRef.current = false;
        });
      }
    }

    if (!isAuthenticated) {
      hasFetchedRef.current = false;
    }
  }, [isAuthenticated, user, fetchMe]);

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
    <>
      <GlobalModalProvider>
        <SocketProvider>
          {/* ✅ GLOBAL SEO: Organization & Website Schema */}
          <StructuredData />

          <DynamicIsland />
          <NotificationListener />
          <SocialChatSync />
          <GoogleOneTapListener />

          {/* 1. GLOBAL SPLASH SCREEN */}
          <PageLoader mode="splash" isLoading={authLoading} />

          {/* 2. SUSPENSE LOADER */}
          <Suspense fallback={<PageLoader mode="loading" isLoading={true} />}>
            <Routes>
              {/* 1. PUBLIC LANDING */}
              <Route path="/" element={<SmartLanding />} />
              <Route path="/policy" element={<PolicyPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/process" element={<ProcessPage />} />
              <Route path="/trends" element={<TrendsPage />} />
              <Route path="/templates" element={<TemplateLibraryPage />} />
              <Route path="/business" element={<BusinessPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/careers" element={<CareersPage />} />
              <Route
                path="/solutions/warehousing"
                element={<WarehousingPage />}
              />
              <Route path="/solutions/kitting" element={<KittingPage />} />
              <Route
                path="/solutions/corporate-gifting"
                element={<CorporateGiftingPage />}
              />
              <Route path="/quote" element={<QuickQuotePage />} />

              {/* Self-Service Portal (Public - No Auth) */}
              <Route
                path="/gift/:token"
                element={<RecipientSelfServicePage />}
              />

              {/* Redemption Link (Public - No Auth) */}
              <Route path="/redeem/:token" element={<RedemptionPage />} />

              {/* Company Store (Public - Optional Auth) */}
              <Route path="/store/:slug" element={<CompanyStorePage />} />

              {/* 2. MAIN APP LAYOUT */}
              <Route element={<AppLayout />}>
                {/* Auth */}
                <Route path="/signin" element={<SignInPage />} />
                <Route path="/signup" element={<SignUpPage />} />
                <Route path="/check-email" element={<CheckEmailPage />} />
                <Route path="/verify-email" element={<VerifyEmailPage />} />
                <Route
                  path="/forgot-password"
                  element={<ForgotPasswordPage />}
                />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/auth/callback" element={<AuthCallbackPage />} />

                {/* Shop */}
                <Route path="/shop" element={<ShopPortalPage />} />
                <Route path="/rush" element={<RushPage />} />
                <Route path="/app" element={<ChatAppPage />} />
                <Route path="/product/:slug" element={<ProductDetailPage />} />
                <Route path="/products/:id" element={<ProductDetailPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/inspiration" element={<InspirationPage />} />

                {/* Protected Customer */}
                <Route element={<ProtectedGuard />}>
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
                  <Route path="/orders" element={<CustomerOrdersPage />} />
                  <Route
                    path="/orders/:orderId"
                    element={<OrderDetailPage />}
                  />
                  <Route path="/designs" element={<CustomerDesignsPage />} />
                  <Route path="/design-editor" element={<DesignEditorPage />} />

                  {/* Social & Settings */}
                  <Route path="/settings" element={<CustomerSettingsPage />} />
                  <Route path="/messages" element={<MessagesPage />} />
                  <Route path="/friends" element={<FriendsPage />} />
                  <Route
                    path="/notifications"
                    element={<NotificationsPage />}
                  />

                  {/* Organization Setup */}
                  <Route
                    path="/organization/setup"
                    element={<CompanySetupWizard />}
                  />
                </Route>
              </Route>

              {/* 3. FULL SCREEN ROUTES */}
              <Route element={<ProtectedGuard />}>
                <Route path="/chat" element={<ChatPage />} />
                <Route path="/chat/history" element={<ChatHistoryPage />} />

                {/* ✅ Organization Portal (B2B) */}
                <Route
                  path="/organization/dashboard"
                  element={<OrganizationApp />}
                />
              </Route>

              {/* 4. 404 CÁ NHÂN HÓA */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>

          <ProductQuickViewModal />
          <OrderQuickViewModal />
        </SocketProvider>
      </GlobalModalProvider>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
