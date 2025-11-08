// src/pages/PrinterApp.tsx (ĐÃ KHẮC PHỤC LỖI XUNG ĐỘT)
import { useEffect, useCallback } from "react"; // ✅ Thêm useCallback
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/useAuthStore";
import { PrinterSidebar } from "@/features/printer/components/PrinterSidebar";
import { PrinterDashboard } from "@/features/printer/pages/PrinterDashboard";
import { ProductManagement } from "@/features/printer/pages/ProductManagement";
import { OrderManagement } from "@/features/printer/pages/OrderManagement";
import { SettingsPage } from "@/features/printer/pages/SettingsPage";
import { SupportPage } from "@/features/printer/pages/SupportPage";
import { AccountPage } from "@/features/printer/pages/AccountPage";
import { AssetManagementPage } from "@/features/printer/pages/AssetManagementPage";

export default function PrinterApp() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "dashboard";

  const printerProfile = useAuthStore((s) => s.printerProfile);

  /**
   * ✅ SỬA LỖI XUNG ĐỘT:
   * Viết lại hàm handleTabChange để sử dụng 'functional update'.
   * Nó sẽ đọc 'prevParams' (state mới nhất) và CHỈ THAY ĐỔI 'tab',
   * giữ nguyên các params khác (như '&action=new').
   * Gói trong 'useCallback' để ngăn re-render không cần thiết.
   */
  const handleTabChange = useCallback(
    (tab: string) => {
      setSearchParams(
        (prevParams) => {
          const newParams = new URLSearchParams(prevParams);
          newParams.set("tab", tab);
          return newParams;
        },
        { replace: true }
      );
    },
    [setSearchParams] // Phụ thuộc ổn định
  );

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
        handleTabChange("settings"); // Hàm này giờ đã an toàn
      }
    } else if (
      printerProfile &&
      activeTab === "dashboard" &&
      (!printerProfile.shopAddress?.city || !printerProfile.contactPhone)
    ) {
      toast.info("Chào mừng nhà in!", {
        // ...
      });
    }
  }, [printerProfile, activeTab, handleTabChange]); // Thêm handleTabChange

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <PrinterDashboard />;
      case "products":
        return <ProductManagement />; // Component này sẽ tự xử lý &action=new
      case "assets":
        return <AssetManagementPage />;
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
      <PrinterSidebar activeTab={activeTab} onTabChange={handleTabChange} />
      <div className="ml-0 md:ml-20 flex-1 flex flex-col">
        {renderContent()}
      </div>
    </div>
  );
}
