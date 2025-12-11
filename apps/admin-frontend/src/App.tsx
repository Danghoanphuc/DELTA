// apps/admin-frontend/src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AdminProtectedRoute } from "@/router/AdminProtectedRoute";
import AdminLayout from "@/components/AdminLayout";

import LoginPage from "@/pages/LoginPage";
import UserListPage from "@/pages/UserListPage";
import PrinterVettingPage from "@/pages/PrinterVettingPage";

// Swag Operations Pages
import SwagOperationsDashboard from "@/pages/SwagOperationsDashboard";
import SwagOrderDetailPage from "@/pages/SwagOrderDetailPage";
import FulfillmentQueuePage from "@/pages/FulfillmentQueuePage";
import SwagAnalyticsPage from "@/pages/SwagAnalyticsPage";
import SwagInventoryPage from "@/pages/SwagInventoryPage";

// Delivery Management (Orders + Check-ins)
import DeliveryManagementPage from "@/pages/DeliveryManagementPage";

// Product Catalog Pages
import ProductCatalogPage from "@/pages/ProductCatalogPage";
import ProductFormPage from "@/pages/ProductFormPage";
import CategoriesPage from "@/pages/CategoriesPage";
import SuppliersPage from "@/pages/SuppliersPage";
import SupplierDetailPage from "@/pages/SupplierDetailPage";
import SupplierPerformancePage from "@/pages/SupplierPerformancePage";

// Inventory Management Pages (Phase 4)
import InventoryDashboardPage from "@/pages/InventoryDashboardPage";
import InventoryTransactionHistoryPage from "@/pages/InventoryTransactionHistoryPage";

// Production Order Pages (Phase 5)
import ProductionQueuePage from "@/pages/ProductionQueuePage";
import ProductionOrderDetailPage from "@/pages/ProductionOrderDetailPage";

// Kitting Pages (Phase 6)
import { KittingQueuePage } from "@/pages/KittingQueuePage";
import { KittingDetailPage } from "@/pages/KittingDetailPage";

// Document Management Pages (Phase 7)
import InvoiceListPage from "@/pages/InvoiceListPage";
import InvoiceDetailPage from "@/pages/InvoiceDetailPage";

// Analytics Pages (Phase 11)
import AnalyticsDashboardPage from "@/pages/AnalyticsDashboardPage";
import ProductAnalyticsPage from "@/pages/ProductAnalyticsPage";
import SupplierAnalyticsPage from "@/pages/SupplierAnalyticsPage";
import OrderTrendsPage from "@/pages/OrderTrendsPage";

// Cost Tracking Pages (Phase 12)
import { MarginReportPage } from "@/pages/MarginReportPage";
import { VarianceAnalysisPage } from "@/pages/VarianceAnalysisPage";

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

            {/* === DELIVERY MANAGEMENT (Orders + Check-ins) === */}
            <Route path="/delivery" element={<DeliveryManagementPage />} />

            {/* Redirect old routes */}
            <Route
              path="/swag-ops/orders"
              element={<Navigate to="/delivery" replace />}
            />
            <Route
              path="/swag-ops/orders/:id"
              element={<SwagOrderDetailPage />}
            />

            {/* === SWAG OPERATIONS === */}
            <Route
              path="/swag-ops/fulfillment"
              element={<FulfillmentQueuePage />}
            />
            <Route path="/swag-ops/analytics" element={<SwagAnalyticsPage />} />
            <Route path="/swag-ops/inventory" element={<SwagInventoryPage />} />

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
            <Route
              path="/catalog/suppliers-performance"
              element={<SupplierPerformancePage />}
            />

            {/* === INVENTORY MANAGEMENT (Phase 4) === */}
            <Route path="/inventory" element={<InventoryDashboardPage />} />
            <Route
              path="/inventory/transactions"
              element={<InventoryTransactionHistoryPage />}
            />

            {/* === PRODUCTION ORDERS (Phase 5) === */}
            <Route path="/production" element={<ProductionQueuePage />} />
            <Route
              path="/production/:id"
              element={<ProductionOrderDetailPage />}
            />

            {/* === KITTING & FULFILLMENT (Phase 6) === */}
            <Route path="/kitting" element={<KittingQueuePage />} />
            <Route path="/kitting/:orderId" element={<KittingDetailPage />} />

            {/* === DOCUMENT MANAGEMENT (Phase 7) === */}
            <Route path="/documents/invoices" element={<InvoiceListPage />} />
            <Route
              path="/documents/invoices/:id"
              element={<InvoiceDetailPage />}
            />

            {/* === ANALYTICS (Phase 11) === */}
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

            {/* === COST TRACKING (Phase 12) === */}
            <Route path="/costs/margin-report" element={<MarginReportPage />} />
            <Route path="/costs/variance" element={<VarianceAnalysisPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
