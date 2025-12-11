// src/features/organization/pages/AccountPage.tsx
// ✅ B2B Organization Account Settings

import { User, Mail, Phone, Shield, LogOut } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { useAuthStore } from "@/stores/useAuthStore";
import { useNavigate } from "react-router-dom";

export function AccountPage() {
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="flex-1 overflow-auto bg-[#FAFAF8]">
      <div className="p-8 max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-serif font-bold text-[#1C1917] mb-2">Tài khoản</h1>
          <p className="text-[#57534E]">Quản lý thông tin cá nhân của bạn</p>
        </div>

        {/* Profile Card */}
        <Card className="border-2 border-[#E5E3DC] shadow-[0_2px_8px_rgba(28,25,23,0.04)] bg-[#F7F6F2] mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-[#C63321]" />
              Thông tin cá nhân
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6 mb-6">
              <div className="w-20 h-20 rounded-full bg-[#C63321] flex items-center justify-center text-white font-bold text-2xl">
                {user?.displayName?.charAt(0) || "U"}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-[#1C1917]">
                  {user?.displayName}
                </h3>
                <p className="text-[#78716C]">@{user?.username}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-[#FAFAF8] rounded-lg">
                <Mail className="w-5 h-5 text-[#A8A29E]" />
                <div>
                  <p className="text-xs text-[#78716C]">Email</p>
                  <p className="font-medium">{user?.email}</p>
                </div>
              </div>

              {user?.phone && (
                <div className="flex items-center gap-3 p-3 bg-[#FAFAF8] rounded-lg">
                  <Phone className="w-5 h-5 text-[#A8A29E]" />
                  <div>
                    <p className="text-xs text-[#78716C]">Số điện thoại</p>
                    <p className="font-medium">{user.phone}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 p-3 bg-[#FAFAF8] rounded-lg">
                <Shield className="w-5 h-5 text-[#A8A29E]" />
                <div>
                  <p className="text-xs text-[#78716C]">Trạng thái</p>
                  <p className="font-medium">
                    {user?.isVerified ? (
                      <span className="text-green-600">Đã xác thực</span>
                    ) : (
                      <span className="text-yellow-600">Chưa xác thực</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-2 border-[#E5E3DC] shadow-[0_2px_8px_rgba(28,25,23,0.04)] bg-[#F7F6F2] border-red-100">
          <CardHeader>
            <CardTitle className="text-red-600">Đăng xuất</CardTitle>
            <CardDescription>
              Đăng xuất khỏi tài khoản trên thiết bị này
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              className="text-red-600 border-red-200 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Đăng xuất
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AccountPage;
