import { Sidebar } from "@/components/Sidebar";

export const CustomerSettingsPage = () => (
  <div className="min-h-screen bg-gray-50">
    <Sidebar />
    <div className="ml-20 p-8">
      <h1 className="text-2xl font-bold">Cài đặt tài khoản</h1>
      <p>Quản lý thông tin cá nhân, mật khẩu, thông báo...</p>
      {/* Nội dung trang cài đặt sẽ ở đây */}
    </div>
  </div>
);
