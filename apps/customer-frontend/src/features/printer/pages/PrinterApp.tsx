// src/features/printer/pages/PrinterApp.tsx

import { useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import { printerService } from "@/services/printerService";
import { PrinterSidebar } from "@/features/printer/components/PrinterSidebar";
import { PrinterDashboard } from "@/features/printer/pages/PrinterDashboard";
import { ProductManagement } from "@/features/printer/pages/ProductManagement";
import { OrderManagement } from "@/features/printer/pages/OrderManagement";
import { SettingsPage } from "@/features/printer/pages/SettingsPage";
import { SupportPage } from "@/features/printer/pages/SupportPage";
import { AccountPage } from "@/features/printer/pages/AccountPage";
import AssetManagementPage from "@/features/printer/pages/AssetManagementPage";
import { WalletPage } from "@/features/printer/pages/WalletPage";
import { RushOrderListener } from "@/features/printer/components/RushOrderListener";

import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { ShieldAlert, Loader2 } from "lucide-react";

// (Component VerificationPendingScreen giữ nguyên)
const VerificationPendingScreen = ({
  profile,
  onTabChange,
}: {
  profile: any;
  onTabChange: (tab: string) => void;
}) => {
  const { verificationStatus } = profile;
  let title = "Hồ sơ của bạn đang chờ duyệt";
  let description = "Chúng tôi đã nhận được hồ sơ của bạn và sẽ phản hồi trong 24-48 giờ.";
  let iconColor = "text-yellow-500";

  if (verificationStatus === "not_submitted") {
    title = "Yêu cầu xác thực tài khoản";
    description = "Để bắt đầu đăng bán sản phẩm, bạn cần hoàn tất xác thực nhà in.";
    iconColor = "text-red-500";
  } else if (verificationStatus === "rejected") {
    title = "Hồ sơ bị từ chối";
    description = "Hồ sơ chưa đạt yêu cầu. Vui lòng kiểm tra email hoặc vào Cài đặt để nộp lại.";
    iconColor = "text-red-500";
  }

  return (
    <div className="flex-1 flex items-center justify-center bg-gray-50 p-8 h-full">
      <Card className="max-w-lg w-full text-center shadow-lg border-t-4 border-orange-500 animate-in fade-in zoom-in duration-300">
        <CardHeader>
          <ShieldAlert className={`w-16 h-16 mx-auto ${iconColor}`} />
          <CardTitle className="text-2xl font-bold mt-4">{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-gray-600">{description}</p>
          <Button
            size="lg"
            className="bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white shadow-md"
            onClick={() => onTabChange("settings")}
          >
            {verificationStatus === "not_submitted" ? "Bắt đầu Xác thực" : "Đến trang Cài đặt"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default function PrinterApp() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "dashboard";

  const activePrinterProfile = useAuthStore((s) => s.activePrinterProfile);
  const isContextLoading = useAuthStore((s) => s.isContextLoading);
  const user = useAuthStore((s) => s.user);
  
  useEffect(() => {
    const fetchProfileIfNeeded = async () => {
      if (user?.printerProfileId && !activePrinterProfile && !isContextLoading) {
        try {
          useAuthStore.setState({ isContextLoading: true });
          const profile = await printerService.getMyProfile();
          useAuthStore.setState({
            activePrinterProfile: profile,
            isContextLoading: false,
          });
        } catch (error) {
          console.error("❌ Lỗi fetch profile:", error);
          useAuthStore.setState({ isContextLoading: false });
        }
      }
    };
    fetchProfileIfNeeded();
  }, [user?.printerProfileId, activePrinterProfile, isContextLoading]);

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
    [setSearchParams]
  );

  const renderContent = () => {
    if (isContextLoading || !activePrinterProfile) {
      return (
        <div className="flex-1 flex items-center justify-center h-screen">
          <Loader2 className="w-12 h-12 animate-spin text-orange-500" />
        </div>
      );
    }

    const restrictedTabs = ["dashboard", "products", "assets", "orders"];
    if (!activePrinterProfile.isVerified && restrictedTabs.includes(activeTab)) {
      return <VerificationPendingScreen profile={activePrinterProfile} onTabChange={handleTabChange} />;
    }

    switch (activeTab) {
      case "dashboard": return <PrinterDashboard />;
      case "products": return <ProductManagement />;
      case "assets": return <AssetManagementPage />;
      case "orders": return <OrderManagement />;
      case "wallet": return <WalletPage />;
      case "settings": return <SettingsPage />;
      case "support": return <SupportPage />;
      case "account": return <AccountPage />;
      default: return <PrinterDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      {/* ✅ RUSH ORDER: Listener cho đơn hàng gấp */}
      <RushOrderListener />
      
      {/* Sidebar (Fixed on Desktop, Bottom on Mobile) */}
      <PrinterSidebar activeTab={activeTab} onTabChange={handleTabChange} />
      
      {/* ✅ FIX LAYOUT: 
         - lg:ml-64: Đẩy nội dung sang phải 256px (bằng chiều rộng sidebar mới)
         - pb-20: Thêm padding bottom cho Mobile để không bị Bottom Bar che mất 
         - min-h-screen: Đảm bảo full chiều cao
      */}
      <main className="flex-1 flex flex-col min-w-0 transition-all duration-300 lg:ml-64 pb-20 lg:pb-0">
        {renderContent()}
      </main>
    </div>
  );
}