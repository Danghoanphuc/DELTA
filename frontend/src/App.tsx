// src/App.tsx (NÂNG CẤP)

import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Toaster } from "sonner";
import SignInPage from "./pages/SignInPage"; //
import SignUpPage from "./pages/SignUpPage"; //
import VerifyEmailPage from "./components/auth/VerifyEmailPage"; //
import ResetPasswordPage from "./components/auth/ResetPasswordPage"; //
import CheckEmailPage from "./pages/CheckEmailPage"; //
import ProtectedRoute from "./components/auth/ProtectedRoute"; //
import RootPage from "./pages/RootPage"; //
import { InspirationPage } from "./pages/customer/InspirationPage";
import { TrendsPage } from "./pages/customer/TrendsPage";

// 👇 *** THÊM IMPORT CHO CÁC TRANG CUSTOMER MỚI ***
import { CustomerOrdersPage } from "./pages/customer/CustomerOrdersPage";
import { CustomerDesignsPage } from "./pages/customer/CustomerDesignsPage";
import { CustomerSettingsPage } from "./pages/customer/CustomerSettingsPage";

import { useAuthStore } from "@/stores/useAuthStore"; //

function App() {
  const { setAccessToken } = useAuthStore();
  const navigate = useNavigate();

  // ... (useEffect xử lý OAuth message giữ nguyên) ...
  useEffect(() => {
    // ...
  }, [setAccessToken, navigate]);

  return (
    <>
      <Toaster richColors />
      <Routes>
        {/* Public Routes (Giữ nguyên) */}
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/check-your-email" element={<CheckEmailPage />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<RootPage />} />
          {/* 👇 *** THÊM CÁC ROUTE MỚI CHO CUSTOMER *** */}
          <Route path="/orders" element={<CustomerOrdersPage />} />
          <Route path="/designs" element={<CustomerDesignsPage />} />
          <Route path="/settings" element={<CustomerSettingsPage />} />
          <Route path="/inspiration" element={<InspirationPage />} />
          <Route path="/trends" element={<TrendsPage />} />
        </Route>

        {/* Fallback (Giữ nguyên) */}
        <Route path="*" element={<div>404 - Page Not Found</div>} />
      </Routes>
    </>
  );
}

// Wrapper (Giữ nguyên)
const AppWrapper = () => (
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

export default AppWrapper;
