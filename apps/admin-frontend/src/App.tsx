// apps/admin-frontend/src/App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AdminProtectedRoute } from "@/router/AdminProtectedRoute";
import AdminLayout from "@/components/AdminLayout";

import LoginPage from "@/pages/LoginPage";
import UserListPage from "@/pages/UserListPage";
import PrinterVettingPage from "@/pages/PrinterVettingPage";

// Swag Operations Pages
import SwagOperationsDashboard from "@/pages/SwagOperationsDashboard";
import SwagOrdersPage from "@/pages/SwagOrdersPage";
import SwagOrderDetailPage from "@/pages/SwagOrderDetailPage";
import FulfillmentQueuePage from "@/pages/FulfillmentQueuePage";
import SwagAnalyticsPage from "@/pages/SwagAnalyticsPage";
import SwagInventoryPage from "@/pages/SwagInventoryPage";

// Product Catalog Pages
import ProductCatalogPage from "@/pages/ProductCatalogPage";
import CategoriesPage from "@/pages/CategoriesPage";
import SuppliersPage from "@/pages/SuppliersPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* === 1. Route Công khai (Public) === */}
        <Route path="/login" element={<LoginPage />} />

        {/* === 2. Các Route được Bảo vệ (Protected) với Layout === */}
        <Route element={<AdminProtectedRoute />}>
          <Route element={<AdminLayout />}>
            {/* Dashboard chính - Swag Operations */}
            <Route path="/" element={<SwagOperationsDashboard />} />

            {/* Admin Management */}
            <Route path="/users" element={<UserListPage />} />
            <Route path="/printer-vetting" element={<PrinterVettingPage />} />

            {/* === SWAG OPERATIONS === */}
            <Route path="/swag-ops/orders" element={<SwagOrdersPage />} />
            <Route
              path="/swag-ops/orders/:id"
              element={<SwagOrderDetailPage />}
            />
            <Route
              path="/swag-ops/fulfillment"
              element={<FulfillmentQueuePage />}
            />
            <Route path="/swag-ops/analytics" element={<SwagAnalyticsPage />} />
            <Route path="/swag-ops/inventory" element={<SwagInventoryPage />} />

            {/* === PRODUCT CATALOG === */}
            <Route path="/catalog/products" element={<ProductCatalogPage />} />
            <Route path="/catalog/categories" element={<CategoriesPage />} />
            <Route path="/catalog/suppliers" element={<SuppliersPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
