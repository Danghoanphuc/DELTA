// src/features/customer/pages/CustomerSettingsPage.tsx (CẬP NHẬT)
// ❌ GỠ BỎ: import { Sidebar } from "@/components/Sidebar";
// ❌ GỠ BỎ: import { MobileNav } from "@/components/MobileNav";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
import { User, Lock, MapPin, Palette, Sparkles } from "lucide-react";
import { ProfileSettingsTab } from "../components/settings/ProfileSettingsTab";
import { SecuritySettingsTab } from "../components/settings/SecuritySettingsTab";
import { BrandKitTab } from "../components/settings/BrandKitTab";
import { AddressSettingsTab } from "../components/settings/AddressSettingsTab";

const tabs = [
  { value: "profile", label: "Hồ sơ", icon: User },
  { value: "brand-kit", label: "Brand Kit", icon: Palette },
  { value: "address", label: "Sổ địa chỉ", icon: MapPin },
  { value: "security", label: "Bảo mật", icon: Lock },
  { value: "ai", label: "Cá nhân hóa AI", icon: Sparkles },
];

export function CustomerSettingsPage() {
  return (
    // ❌ GỠ BỎ: <div ...>, <Sidebar />, <MobileNav />
    <>
      {/* ✅ Căn giữa và thêm padding */}
      <div className="pt-6 p-4 md:p-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Cài đặt tài khoản
          </h1>
          <p className="text-gray-600">
            Quản lý thông tin cá nhân, thương hiệu và bảo mật của bạn.
          </p>
        </div>

        {/* Tabs Layout (Đây là điều hướng Cấp 2 của trang này) */}
        <Tabs
          defaultValue="profile"
          className="flex flex-col md:flex-row gap-6"
        >
          {/* Tabs Trigger (Menu bên trái) */}
          <TabsList className="flex md:flex-col h-auto p-2 bg-white md:w-1/4 lg:w-1/5 rounded-lg shadow-sm self-start">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="w-full justify-start text-base md:text-sm p-3 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-none"
              >
                <tab.icon className="w-4 h-4 mr-2 flex-shrink-0" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Tabs Content (Nội dung bên phải) */}
          <div className="flex-1">
            <TabsContent value="profile">
              <ProfileSettingsTab />
            </TabsContent>
            <TabsContent value="brand-kit">
              <BrandKitTab />
            </TabsContent>
            <TabsContent value="address">
              <AddressSettingsTab />
            </TabsContent>
            <TabsContent value="security">
              <SecuritySettingsTab />
            </TabsContent>
            <TabsContent value="ai">
              <p>Cài đặt cá nhân hóa AI (coming soon)...</p>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </>
  );
}
