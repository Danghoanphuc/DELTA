// frontend/src/App.tsx (UPDATED - THÊM ORDER DETAIL ROUTES)
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { Toaster } from "sonner";
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
import { OrderDetailPage } from "./pages/OrderDetailPage"; // <-- MỚI
import { useAuthStore } from "@/stores/useAuthStore";

function App() {
  const { setAccessToken, fetchMe } = useAuthStore();

  useEffect(() => {
    const handleOAuthMessage = async (event: MessageEvent) => {
      const validOrigins = [
        import.meta.env.VITE_SERVER_URL,
        "http://localhost:5001",
      ];

      if (!validOrigins.some((origin) => event.origin === origin)) {
        console.warn("⚠️ Invalid message origin:", event.origin);
        return;
      }

      if (event.data?.type === "GOOGLE_AUTH_SUCCESS") {
        console.log("✅ OAuth message received");
        const { accessToken } = event.data;

        if (accessToken) {
          setAccessToken(accessToken);
          try {
            await fetchMe(true);
          } catch (error) {
            console.error("❌ Error fetching user after OAuth:", error);
          }
        }
      }
    };

    window.addEventListener("message", handleOAuthMessage);
    return () => window.removeEventListener("message", handleOAuthMessage);
  }, [setAccessToken, fetchMe]);

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

          {/* Order Detail Routes - Universal */}
          <Route path="/orders/:orderId" element={<OrderDetailPage />} />
          <Route
            path="/printer/orders/:orderId"
            element={<OrderDetailPage />}
          />

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
