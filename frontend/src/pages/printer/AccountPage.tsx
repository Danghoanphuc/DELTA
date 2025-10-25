// src/pages/printer/AccountPage.tsx (NÂNG CẤP)

import { User, Lock, Bell, CreditCard, LogOut } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner"; // 👈 Thêm
import { ScrollArea } from "@/components/ui/scroll-area"; // 👈 Thêm

// 👇 *** THÊM IMPORT ***
import { useAuthStore } from "@/stores/useAuthStore";
import { useNavigate } from "react-router-dom";

export function AccountPage() {
  // 👇 *** THÊM LOGIC ĐĂNG XUẤT ***
  const { signOut, user } = useAuthStore(); // 👈 Lấy hàm signOut và user
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(); // 👈 Gọi hàm từ store
      navigate("/signin"); // 👈 Điều hướng về trang đăng nhập
      toast.success("Đăng xuất thành công!");
    } catch (error) {
      console.error(error);
      toast.error("Đăng xuất thất bại!");
    }
  };

  return (
    // 👈 Bọc trong ScrollArea
    <ScrollArea className="h-screen flex-1 bg-gray-50">
      {/* 👇 *** THÊM mx-auto ĐỂ CĂN GIỮA *** */}
      <div className="p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-gray-900 mb-2">Tài khoản</h1>
          <p className="text-gray-600">
            Quản lý thông tin cá nhân và tài khoản của bạn
          </p>
        </div>

        {/* Profile Card (Kết nối với user store) */}
        <Card className="border-none shadow-sm mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              <Avatar className="w-24 h-24">
                {/* 👈 Kết nối avatarUrl từ store */}
                <AvatarImage src={user?.avatarUrl} alt={user?.displayName} />
                <AvatarFallback>
                  <User size={40} />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                {/* 👈 Kết nối displayName và email từ store */}
                <h2 className="text-gray-900 mb-1">{user?.displayName}</h2>
                <p className="text-sm text-gray-600 mb-3">{user?.email}</p>
                <div className="flex gap-3">
                  <Button variant="outline" size="sm" disabled>
                    Thay đổi ảnh
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    disabled
                  >
                    Xóa ảnh
                  </Button>
                </div>
              </div>
              <div className="text-right">
                <div className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs inline-block mb-2">
                  Tài khoản Premium
                </div>
                <p className="text-xs text-gray-500">Hết hạn: 31/12/2024</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ... (Các Card Thông tin, Bảo mật, Thông báo, Gói DV giữ nguyên, 
             chúng ta sẽ làm form cho chúng sau) ... */}
        <Card className="border-none shadow-sm mb-6">
          {/* (Thông tin cá nhân) */}
        </Card>
        <Card className="border-none shadow-sm mb-6">{/* (Bảo mật) */}</Card>
        <Card className="border-none shadow-sm mb-6">{/* (Thông báo) */}</Card>
        <Card className="border-none shadow-sm mb-6">
          {/* (Gói dịch vụ) */}
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" disabled>
              Hủy thay đổi
            </Button>
            <Button
              className="flex-1 bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600"
              disabled
            >
              Lưu thay đổi
            </Button>
          </div>
          {/* 👇 *** KẾT NỐI NÚT ĐĂNG XUẤT *** */}
          <Button
            variant="outline"
            className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut size={18} className="mr-2" />
            Đăng xuất
          </Button>
        </div>
      </div>
    </ScrollArea>
  );
}
