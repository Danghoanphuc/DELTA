// src/features/printer/printer/AccountPage.tsx

// KHẮC PHỤC: Thêm import Card và CardContent
import { Card, CardContent } from "@/shared/components/ui/card";
import { toast } from "sonner";
import { NativeScrollArea as ScrollArea } from "@/shared/components/ui/NativeScrollArea";
import { useAuthStore } from "@/stores/useAuthStore";
import { useNavigate } from "react-router-dom";
import { UserProfileCard } from "@/features/printer/components/UserProfileCard";
import { AccountActions } from "@/features/printer/components/AccountActions";

export function AccountPage() {
  const { signOut, user } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/signin");
      toast.success("Đăng xuất thành công!");
    } catch (error) {
      console.error(error);
      toast.error("Đăng xuất thất bại!");
    }
  };

  return (
    <ScrollArea className="h-screen flex-1 bg-gray-50">
      <div className="p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Tài khoản</h1>
          <p className="text-gray-600">
            Quản lý thông tin cá nhân và tài khoản của bạn
          </p>
        </div>

        {/* Profile Card (Component mới) */}
        <UserProfileCard user={user} />

        {/* ... (Các Card Thông tin, Bảo mật, Thông báo, Gói DV giữ nguyên) ... */}
        <Card className="border-none shadow-sm mb-6">
          {/* (Thêm CardContent đã bị thiếu) */}
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Thông tin cá nhân (Form)</h3>
            {/* ... (Nội dung form sẽ ở đây) ... */}
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm mb-6">
          {/* (Thêm CardContent đã bị thiếu) */}
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Bảo mật (Form)</h3>
            {/* ... (Nội dung form sẽ ở đây) ... */}
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm mb-6">
          {/* (Thêm CardContent đã bị thiếu) */}
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Gói dịch vụ</h3>
            {/* ... (Nội dung gói dịch vụ sẽ ở đây) ... */}
          </CardContent>
        </Card>

        {/* Action Buttons (Component mới) */}
        <AccountActions onLogout={handleLogout} />
      </div>
    </ScrollArea>
  );
}
