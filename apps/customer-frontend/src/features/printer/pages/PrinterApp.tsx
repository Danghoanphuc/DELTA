// src/features/printer/pages/PrinterApp.tsx

import { useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import { PrinterSidebar } from "@/features/printer/components/PrinterSidebar";
import { PrinterDashboard } from "@/features/printer/pages/PrinterDashboard";
import { ProductManagement } from "@/features/printer/pages/ProductManagement";
import { OrderManagement } from "@/features/printer/pages/OrderManagement";
import { SettingsPage } from "@/features/printer/pages/SettingsPage";
import { SupportPage } from "@/features/printer/pages/SupportPage";
import { AccountPage } from "@/features/printer/pages/AccountPage";
import  AssetManagementPage  from "@/features/printer/pages/AssetManagementPage";

// ✅ GIAI ĐOẠN 2: Thêm UI cho "Chốt kiểm soát"
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { ShieldAlert, Loader2 } from "lucide-react";

/**
 * ✅ GIAI ĐOẠN 2: Component "Chốt kiểm soát" (UI Blocker)
 */
const VerificationPendingScreen = ({
  profile,
  onTabChange,
}: {
  profile: any; // Kiểu PrinterProfile
  onTabChange: (tab: string) => void;
}) => {
  const { verificationStatus } = profile;

  let title = "Hồ sơ của bạn đang chờ duyệt";
  let description =
    "Chúng tôi đã nhận được hồ sơ của bạn và sẽ phản hồi trong 24-48 giờ. Cảm ơn bạn đã kiên nhẫn!";
  let iconColor = "text-yellow-500";

  if (verificationStatus === "not_submitted") {
    title = "Yêu cầu xác thực tài khoản";
    description =
      "Để bắt đầu đăng bán sản phẩm và nhận đơn hàng, bạn cần hoàn tất xác thực tài khoản nhà in.";
    iconColor = "text-red-500";
  } else if (verificationStatus === "rejected") {
    title = "Hồ sơ bị từ chối";
    description =
      "Hồ sơ của bạn chưa đạt yêu cầu. Vui lòng kiểm tra email hoặc vào trang Cài đặt để xem lý do và nộp lại.";
    iconColor = "text-red-500";
  }

  return (
    <div className="flex-1 flex items-center justify-center bg-gray-50 p-8">
      <Card className="max-w-lg w-full text-center shadow-lg border-t-4 border-orange-500">
        <CardHeader>
          <ShieldAlert className={`w-16 h-16 mx-auto ${iconColor}`} />
          <CardTitle className="text-2xl font-bold mt-4">{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-gray-600">{description}</p>
          <Button
            size="lg"
            className="bg-gradient-to-r from-orange-400 to-red-500"
            onClick={() => onTabChange("settings")}
          >
            {verificationStatus === "not_submitted"
              ? "Bắt đầu Xác thực ngay"
              : "Đến trang Cài đặt"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default function PrinterApp() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "dashboard";

  // ✅ FIX QUAN TRỌNG: Lấy state riêng lẻ (primitive/memoized) để tránh crash
  // Lấy các giá trị riêng lẻ, không bọc trong object.
  const activePrinterProfile = useAuthStore((s) => s.activePrinterProfile);
  const isContextLoading = useAuthStore((s) => s.isContextLoading);

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
    // 1. Nếu đang tải hồ sơ, hiển thị loading
    if (isContextLoading || !activePrinterProfile) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-orange-500" />
        </div>
      );
    }

    // 2. Xác định các tab bị "Cấm"
    const restrictedTabs = ["dashboard", "products", "assets", "orders"];
    const isAccessingRestrictedTab = restrictedTabs.includes(activeTab);

    // 3. Nếu CHƯA XÁC THỰC và đang vào tab CẤM -> Hiển thị "Chốt kiểm soát"
    if (!activePrinterProfile.isVerified && isAccessingRestrictedTab) {
      return (
        <VerificationPendingScreen
          profile={activePrinterProfile}
          onTabChange={handleTabChange}
        />
      );
    }

    // 4. Nếu đã xác thực (hoặc vào tab được phép như "settings"), render bình thường
    switch (activeTab) {
      case "dashboard":
        return <PrinterDashboard />;
      case "products":
        return <ProductManagement />;
      case "assets":
        return <AssetManagementPage />;
      case "orders":
        return <OrderManagement />;
      case "settings":
        return <SettingsPage />; // Luôn được phép
      case "support":
        return <SupportPage />; // Luôn được phép
      case "account":
        return <AccountPage />; // Luôn được phép
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
