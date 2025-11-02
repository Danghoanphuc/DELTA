// src/pages/PrinterApp.tsx (CẬP NHẬT)
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/useAuthStore";
import { PrinterSidebar } from "@/features/printer/components/PrinterSidebar";
import { PrinterDashboard } from "@/features/printer/pages/PrinterDashboard";
import { ProductManagement } from "@/features/printer/pages/ProductManagement";
import { OrderManagement } from "@/features/printer/pages/OrderManagement";
import { SettingsPage } from "@/features/printer/pages/SettingsPage";
import { SupportPage } from "@/features/printer/pages/SupportPage";
import { AccountPage } from "@/features/printer/pages/AccountPage";
// 1. IMPORT TRANG MỚI
import { AssetManagementPage } from "@/features/printer/pages/AssetManagementPage";

export default function PrinterApp() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const printerProfile = useAuthStore((s) => s.printerProfile);

  // ... (Logic useEffect của bạn giữ nguyên) ...
  useEffect(() => {
    const isAccessingRestrictedTab =
      activeTab === "orders" || activeTab === "support";

    if (printerProfile && isAccessingRestrictedTab) {
      const isProfileIncomplete =
        !printerProfile.shopAddress?.city ||
        !printerProfile.shopAddress?.street ||
        !printerProfile.contactPhone;

      if (isProfileIncomplete) {
        toast.info("Yêu cầu cập nhật hồ sơ!", {
          description:
            "Bạn cần điền thông tin xưởng in (địa chỉ, SĐT) để quản lý đơn hàng.",
          duration: 5000,
        });
        setActiveTab("settings");
      }
    } else if (
      printerProfile &&
      activeTab === "dashboard" &&
      (!printerProfile.shopAddress?.city || !printerProfile.contactPhone)
    ) {
      toast.info("Chào mừng nhà in!", {
        description:
          "Hãy vào 'Sản phẩm' để đăng bán, và 'Cài đặt' để cập nhật hồ sơ nhé.",
        duration: 5000,
      });
    }
  }, [printerProfile, activeTab, setActiveTab]);

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <PrinterDashboard />;
      case "products":
        return <ProductManagement />;

      // -- 2. THÊM CASE CHO TAB MỚI --
      case "assets":
        return <AssetManagementPage />;
      // -----------------------------

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
      <div className="ml-0 md:ml-20 flex-1 flex flex-col">
        {renderContent()}
      </div>
    </div>
  );
}
