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
import CookieConsent from "@/shared/components/CookieConsent";

// --- Public Pages ---
import SmartLanding from "@/features/landing/SmartLanding";
import PolicyPage from "@/features/landing/PolicyPage";
import WarrantyPage from "@/features/landing/WarrantyPage";
import QualityStandardsPage from "@/features/landing/QualityStandardsPage";
import ShippingPolicyPage from "@/features/landing/ShippingPolicyPage";
import ContactPage from "@/features/landing/ContactPage";
import ProcessPage from "@/features/landing/ProcessPage";
import TrendsPage from "@/features/landing/TrendsPage";
import { TemplateLibraryPage } from "@/features/templates";
import AboutPage from "@/features/landing/AboutPage";
import CareersPage from "@/features/landing/CareersPage";
import DesignGuidelinesPage from "@/features/landing/DesignGuidelinesPage";
import FAQPage from "@/features/landing/FAQPage";
import EditorialPolicyPage from "@/features/landing/EditorialPolicyPage";
import {
  MagazineHomePage,
  MagazinePostDetailPage,
  TrietLySongPage,
  GocGiamTuyenPage,
  CauChuyenDiSanPage,
  KimPage,
  MocPage,
  ThuyPage,
  HoaPage,
  ThoPage,
} from "@/features/magazine";
import { ArtisanProfilePage, ArtisansListPage } from "@/features/artisan";
import CorporateGiftingPage from "@/features/solutions/CorporateGiftingPage";
import BespokePage from "@/features/solutions/BespokePage";
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
const ServicesPage = lazy(
  () => import("@/features/services/pages/ServicesPage")
);
const CustomerSettingsPage = lazyWorkaround(
  () => import("@/features/customer/pages/CustomerSettingsPage")
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

// ✅ Shipper Portal (Delivery Check-in)
const ShipperApp = lazy(
  () => import("@/features/delivery-checkin/pages/ShipperApp")
);
const ShipperRegisterPage = lazy(
  () => import("@/features/delivery-checkin/pages/ShipperRegisterPage")
);
const ShipperLandingPage = lazy(
  () => import("@/features/delivery-checkin/pages/ShipperLandingPage")
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

  // ✅ Only show loading when we're actually fetching user data (not during redirect)
  const shouldShowLoading = authLoading && !user;

  // Logic fetch user data
  useEffect(() => {
    console.log(
      "[App] useEffect triggered - isAuthenticated:",
      isAuthenticated,
      "user:",
      !!user,
      "hasFetched:",
      hasFetchedRef.current
    );

    if (isAuthenticated && !user && !hasFetchedRef.current) {
      const now = Date.now();
      if (now - lastFetchTimeRef.current > FETCH_COOLDOWN) {
        console.log("[App] ⚠️ Calling fetchMe()");
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

          {/* 1. GLOBAL SPLASH SCREEN - Only show when actually loading user data */}
          <PageLoader mode="splash" isLoading={shouldShowLoading} />

          {/* 2. SUSPENSE LOADER */}
          <Suspense fallback={<PageLoader mode="loading" isLoading={true} />}>
            <Routes>
              {/* 1. PUBLIC LANDING */}
              <Route path="/" element={<SmartLanding />} />
              <Route path="/policy" element={<PolicyPage />} />
              <Route path="/warranty" element={<WarrantyPage />} />
              <Route
                path="/quality-standards"
                element={<QualityStandardsPage />}
              />
              <Route path="/shipping-policy" element={<ShippingPolicyPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/process" element={<ProcessPage />} />
              <Route
                path="/design-guidelines"
                element={<DesignGuidelinesPage />}
              />
              <Route path="/faq" element={<FAQPage />} />
              <Route
                path="/editorial-policy"
                element={<EditorialPolicyPage />}
              />

              {/* Magazine Routes */}
              <Route path="/tap-chi" element={<MagazineHomePage />} />

              {/* Category Pages - MUST come before dynamic :slug route */}
              <Route
                path="/tap-chi/triet-ly-song"
                element={<TrietLySongPage />}
              />
              <Route
                path="/tap-chi/goc-giam-tuyen"
                element={<GocGiamTuyenPage />}
              />
              <Route
                path="/tap-chi/cau-chuyen-di-san"
                element={<CauChuyenDiSanPage />}
              />

              {/* Ngu Hanh Routes */}
              <Route path="/tap-chi/ngu-hanh/kim" element={<KimPage />} />
              <Route path="/tap-chi/ngu-hanh/moc" element={<MocPage />} />
              <Route path="/tap-chi/ngu-hanh/thuy" element={<ThuyPage />} />
              <Route path="/tap-chi/ngu-hanh/hoa" element={<HoaPage />} />
              <Route path="/tap-chi/ngu-hanh/tho" element={<ThoPage />} />

              {/* Legacy routes - backward compatibility */}
              <Route
                path="/tap-chi/bai-viet/:slug"
                element={<MagazinePostDetailPage />}
              />
              <Route path="/blog/:id" element={<MagazinePostDetailPage />} />

              {/* Magazine Post Detail - Shortened URL for better SEO 
                  MUST be LAST to avoid conflicting with category routes above */}
              <Route
                path="/tap-chi/:slug"
                element={<MagazinePostDetailPage />}
              />

              <Route path="/trends" element={<TrendsPage />} />
              <Route path="/templates" element={<TemplateLibraryPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/careers" element={<CareersPage />} />
              <Route
                path="/solutions/corporate-gifting"
                element={<CorporateGiftingPage />}
              />
              <Route path="/bespoke" element={<BespokePage />} />
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

              {/* Artisan/Supplier Profiles (Public) */}
              <Route path="/artisans" element={<ArtisansListPage />} />
              <Route path="/artisans/:code" element={<ArtisanProfilePage />} />

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
                <Route path="/orders" element={<ServicesPage />} />
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
                  <Route path="/my-orders" element={<CustomerOrdersPage />} />
                  <Route
                    path="/my-orders/:orderId"
                    element={<OrderDetailPage />}
                  />

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
                <Route path="/organization/*" element={<OrganizationApp />} />

                {/* ✅ Shipper Portal (Delivery Check-in) */}
                <Route path="/shipper/*" element={<ShipperApp />} />
              </Route>

              {/* ✅ Shipper Portal Public Routes */}
              <Route
                path="/shipper/register"
                element={<ShipperRegisterPage />}
              />
              <Route path="/shipper/welcome" element={<ShipperLandingPage />} />

              {/* 4. 404 CÁ NHÂN HÓA */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>

          <ProductQuickViewModal />
          <OrderQuickViewModal />
          <CookieConsent />
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
