// src/pages/PrinterApp.tsx
import { useState } from "react";
// 👇 Sửa đường dẫn
import { PrinterSidebar } from "@/components/printer/PrinterSidebar";
import { PrinterDashboard } from "@/pages/printer/PrinterDashboard";
import { ProductManagement } from "@/pages/printer/ProductManagement";
import { OrderManagement } from "@/pages/printer/OrderManagement";
import { SettingsPage } from "@/pages/printer/SettingsPage";
import { SupportPage } from "@/pages/printer/SupportPage";
import { AccountPage } from "@/pages/printer/AccountPage";

export default function PrinterApp() {
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <PrinterDashboard />;
      case "products":
        return <ProductManagement />;
      case "orders":
        return <OrderManagement />;
      case "settings":
        return <SettingsPage />;
      case "support":
        return <SupportPage />;
      case "account":
        return <AccountPage />;
      default:
        return <PrinterDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <PrinterSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      {/* Nội dung chính sẽ được render ở đây.
        Sử dụng ml-20 (margin-left) để chừa chỗ cho Sidebar.
      */}
      <div className="ml-20 flex-1 flex flex-col">{renderContent()}</div>
    </div>
  );
}
