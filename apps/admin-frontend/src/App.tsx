// apps/admin-frontend/src/App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AdminProtectedRoute } from "@/router/AdminProtectedRoute";
import AdminLayout from "@/components/AdminLayout";

import LoginPage from "@/pages/LoginPage";
import UserListPage from "@/pages/UserListPage";

// Dashboard
import SwagOperationsDashboard from "@/pages/SwagOperationsDashboard";

// Product Catalog Pages
import ProductCatalogPage from "@/pages/ProductCatalogPage";
import ProductFormPage from "@/pages/ProductFormPage";
import CategoriesPage from "@/pages/CategoriesPage";
import SuppliersPage from "@/pages/SuppliersPage";
import SupplierDetailPage from "@/pages/SupplierDetailPage";

// Inventory Management Pages
import InventoryDashboardPage from "@/pages/InventoryDashboardPage";
import InventoryTransactionHistoryPage from "@/pages/InventoryTransactionHistoryPage";

// Document Management Pages
import InvoiceListPage from "@/pages/InvoiceListPage";
import InvoiceDetailPage from "@/pages/InvoiceDetailPage";

// Analytics Pages
import AnalyticsDashboardPage from "@/pages/AnalyticsDashboardPage";
import ProductAnalyticsPage from "@/pages/ProductAnalyticsPage";
import SupplierAnalyticsPage from "@/pages/SupplierAnalyticsPage";
import OrderTrendsPage from "@/pages/OrderTrendsPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* === 1. Route Công khai (Public) === */}
        <Route path="/login" element={<LoginPage />} />

        {/* === 2. Các Route được Bảo vệ (Protected) với Layout === */}
        <Route element={<AdminProtectedRoute />}>
          <Route element={<AdminLayout />}>
            {/* Dashboard chính - Quản lý chung */}
            <Route path="/" element={<SwagOperationsDashboard />} />

            {/* Admin Management */}
            <Route path="/users" element={<UserListPage />} />

            {/* === PRODUCT CATALOG === */}
            <Route path="/catalog/products" element={<ProductCatalogPage />} />
            <Route path="/catalog/products/new" element={<ProductFormPage />} />
            <Route
              path="/catalog/products/:id/edit"
              element={<ProductFormPage />}
            />
            <Route path="/catalog/categories" element={<CategoriesPage />} />
            <Route path="/catalog/suppliers" element={<SuppliersPage />} />
            <Route
              path="/catalog/suppliers/:id"
              element={<SupplierDetailPage />}
            />

            {/* === INVENTORY MANAGEMENT === */}
            <Route path="/inventory" element={<InventoryDashboardPage />} />
            <Route
              path="/inventory/transactions"
              element={<InventoryTransactionHistoryPage />}
            />

            {/* === DOCUMENT MANAGEMENT === */}
            <Route path="/documents/invoices" element={<InvoiceListPage />} />
            <Route
              path="/documents/invoices/:id"
              element={<InvoiceDetailPage />}
            />

            {/* === ANALYTICS === */}
            <Route path="/analytics" element={<AnalyticsDashboardPage />} />
            <Route
              path="/analytics/products"
              element={<ProductAnalyticsPage />}
            />
            <Route
              path="/analytics/suppliers"
              element={<SupplierAnalyticsPage />}
            />
            <Route path="/analytics/orders" element={<OrderTrendsPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
