// apps/admin-frontend/src/App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AdminProtectedRoute } from "@/router/AdminProtectedRoute";

import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import UserListPage from "@/pages/UserListPage";
import PrinterVettingPage from "@/pages/PrinterVettingPage"; // <-- THÊM IMPORT

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* === 1. Route Công khai (Public) === */}
        <Route path="/login" element={<LoginPage />} />

        {/* === 2. Các Route được Bảo vệ (Protected) === */}
        <Route element={<AdminProtectedRoute />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/users" element={<UserListPage />} />

          {/* === THÊM ROUTE MỚI === */}
          <Route path="/printer-vetting" element={<PrinterVettingPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
