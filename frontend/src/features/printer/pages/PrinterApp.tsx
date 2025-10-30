// src/pages/PrinterApp.tsx (CẬP NHẬT)
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/useAuthStore";
import { PrinterSidebar } from "@/components/printer/PrinterSidebar";
import { PrinterDashboard } from "@/features/printer/pages/PrinterDashboard";
import { ProductManagement } from "@/features/printer/pages/ProductManagement";
import { OrderManagement } from "@/features/printer/pages/OrderManagement";
import { SettingsPage } from "@/features/printer/pages/SettingsPage";
import { SupportPage } from "@/features/printer/pages/SupportPage";
import { AccountPage } from "@/features/printer/pages/AccountPage";

export default function PrinterApp() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const printerProfile = useAuthStore((s) => s.printerProfile);

  // Buộc nhà in cập nhật hồ sơ nếu còn thiếu
  useEffect(() => {
    // 👇 *** SỬA LỖI LOGIC TẠI ĐÂY *** 👇
    // (Cho phép truy cập 'dashboard', 'products', 'settings', 'account')
    // Chỉ kiểm tra khi họ cố gắng truy cập các tab bị hạn chế
    const isAccessingRestrictedTab =
      activeTab === "orders" || activeTab === "support";

    if (printerProfile && isAccessingRestrictedTab) {
      // Kiểm tra các trường quan trọng
      const isProfileIncomplete =
        !printerProfile.shopAddress?.city ||
        !printerProfile.shopAddress?.street ||
        !printerProfile.contactPhone;

      if (isProfileIncomplete) {
        // (SỬA) Toast cảnh báo cụ thể hơn
        toast.info("Yêu cầu cập nhật hồ sơ!", {
          description:
            "Bạn cần điền thông tin xưởng in (địa chỉ, SĐT) để quản lý đơn hàng.",
          duration: 5000,
        });
        setActiveTab("settings"); // Chuyển họ về trang cài đặt
      }
    }
    // (MỚI) Thêm một toast chào mừng *không-chặn* khi họ ở dashboard
    // (Chúng ta dùng else if để nó chỉ chạy 1 lần khi vào app, không chạy khi chuyển tab)
    else if (
      printerProfile &&
      activeTab === "dashboard" &&
      (!printerProfile.shopAddress?.city || !printerProfile.contactPhone) // Kiểm tra nhanh
    ) {
      // (Toast này chỉ thông báo, không chặn)
      toast.info("Chào mừng nhà in!", {
        description:
          "Hãy vào 'Sản phẩm' để đăng bán, và 'Cài đặt' để cập nhật hồ sơ nhé.",
        duration: 5000,
      });
    }
    // --- (HẾT SỬA LỖI) ---
  }, [printerProfile, activeTab, setActiveTab]);

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
      <div className="ml-0 md:ml-20 flex-1 flex flex-col">
        {renderContent()}
      </div>
    </div>
  );
}
