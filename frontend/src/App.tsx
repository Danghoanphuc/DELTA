// frontend/src/App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { Toaster } from "sonner";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
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
import { useAuthStore } from "@/stores/useAuthStore";

function App() {
  const { setAccessToken } = useAuthStore();

  useEffect(() => {
    const handleOAuthMessage = (event: MessageEvent) => {
      if (event.data?.type === "GOOGLE_AUTH_SUCCESS") {
        console.log("✅ OAuth message received in App");
      }
    };

    window.addEventListener("message", handleOAuthMessage);
    return () => window.removeEventListener("message", handleOAuthMessage);
  }, [setAccessToken]);

  return (
    <>
      {/* Toast với vị trí phù hợp mobile */}
      <Toaster richColors position="top-center" />
      <Routes>
        {/* Public Routes */}
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/check-your-email" element={<CheckEmailPage />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<RootPage />} />
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
