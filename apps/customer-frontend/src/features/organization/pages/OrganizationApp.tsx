// src/features/organization/pages/OrganizationApp.tsx
// ✅ REFACTORED: Printer → Organization (B2B Enterprise Portal)

import { useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import OrganizationSidebar from "../components/OrganizationSidebar";
import OrganizationDashboard from "./OrganizationDashboard";
import OrderManagement from "./OrderManagement";
import SettingsPage from "./SettingsPage";
import SupportPage from "./SupportPage";
import AccountPage from "./AccountPage";
import InventoryPage from "./InventoryPage";
import TeamPage from "./TeamPage";
import RecipientsPage from "./RecipientsPage";
import SwagPacksPage from "./SwagPacksPage";
import SendSwagPage from "./SendSwagPage";
import SwagOrdersPage from "./SwagOrdersPage";
import AnalyticsPage from "./AnalyticsPage";
import ApprovalsPage from "./ApprovalsPage";
import RedemptionLinksPage from "./RedemptionLinksPage";
import CompanyStoreManagePage from "./CompanyStoreManagePage";

import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { ShieldAlert, Loader2 } from "lucide-react";
import api from "@/shared/lib/axios";

// Onboarding Pending Screen
const OnboardingPendingScreen = ({
  onTabChange,
}: {
  onTabChange: (tab: string) => void;
}) => {
  return (
    <div className="flex-1 flex items-center justify-center bg-gray-50 p-8 h-full">
      <Card className="max-w-lg w-full text-center shadow-lg border-t-4 border-orange-500 animate-in fade-in zoom-in duration-300">
        <CardHeader>
          <ShieldAlert className="w-16 h-16 mx-auto text-yellow-500" />
          <CardTitle className="text-2xl font-bold mt-4">
            Hoàn tất thiết lập tài khoản
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-gray-600">
            Vui lòng hoàn tất thông tin doanh nghiệp để bắt đầu sử dụng đầy đủ
            tính năng.
          </p>
          <Button
            size="lg"
            className="bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white shadow-md"
            onClick={() => onTabChange("settings")}
          >
            Hoàn tất thiết lập
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default function OrganizationApp() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "dashboard";

  const user = useAuthStore((s) => s.user);
  const activeOrganizationProfile = useAuthStore(
    (s) => s.activeOrganizationProfile
  );
  const isContextLoading = useAuthStore((s) => s.isContextLoading);

  useEffect(() => {
    const fetchProfileIfNeeded = async () => {
      // Chỉ fetch nếu có organizationProfileId và chưa có profile trong store
      if (user?.organizationProfileId && !activeOrganizationProfile) {
        try {
          useAuthStore.setState({ isContextLoading: true });
          const res = await api.get("/organizations/profile/me");
          const profile = res.data?.data?.profile;
          useAuthStore.setState({
            activeOrganizationProfile: profile,
            isContextLoading: false,
          });
        } catch (error) {
          console.error("❌ Lỗi fetch organization profile:", error);
          useAuthStore.setState({
            isContextLoading: false,
            // Set một profile mặc định để không bị loading mãi
            activeOrganizationProfile: {
              _id: user.organizationProfileId,
              businessName: user.displayName + "'s Company",
              onboardingCompleted: true,
            },
          });
        }
      }
    };
    fetchProfileIfNeeded();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.organizationProfileId]);

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
    // Chỉ hiện loading khi đang fetch
    if (isContextLoading) {
      return (
        <div className="flex-1 flex items-center justify-center h-screen">
          <Loader2 className="w-12 h-12 animate-spin text-orange-500" />
        </div>
      );
    }

    // Nếu không có profile, vẫn hiện dashboard (với data mặc định)
    // Check onboarding status nếu có profile
    if (
      activeOrganizationProfile &&
      !activeOrganizationProfile.onboardingCompleted
    ) {
      return <OnboardingPendingScreen onTabChange={handleTabChange} />;
    }

    switch (activeTab) {
      case "dashboard":
        return <OrganizationDashboard />;
      case "send-swag":
        return <SendSwagPage />;
      case "swag-packs":
        return <SwagPacksPage />;
      case "recipients":
        return <RecipientsPage />;
      case "swag-orders":
        return <SwagOrdersPage />;
      case "orders":
        return <OrderManagement />;
      case "inventory":
        return <InventoryPage />;
      case "team":
        return <TeamPage />;
      case "analytics":
        return <AnalyticsPage />;
      case "approvals":
        return <ApprovalsPage />;
      case "redemption-links":
        return <RedemptionLinksPage />;
      case "company-store":
        return <CompanyStoreManagePage />;
      case "settings":
        return <SettingsPage />;
      case "support":
        return <SupportPage />;
      case "account":
        return <AccountPage />;
      default:
        return <OrganizationDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      {/* Sidebar */}
      <OrganizationSidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 transition-all duration-300 lg:ml-64 pb-20 lg:pb-0">
        {renderContent()}
      </main>
    </div>
  );
}
