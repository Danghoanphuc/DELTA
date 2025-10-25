import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
export const CustomerSettingsPage = () => (
  <div className="min-h-screen bg-gray-50">
    <Sidebar />
    <MobileNav />
    <div className="lg:ml-20 pt-16 lg:pt-0 p-4 md:p-8">
      <h1 className="text-xl md:text-2xl font-bold mb-4">Cài đặt</h1>
      <p className="text-sm md:text-base text-gray-600">
        Quản lý thông tin cá nhân, bảo mật,...
      </p>
      {/* Content */}
    </div>
  </div>
);
