// src/features/organization/pages/SettingsPage.tsx
// ✅ B2B Organization Settings

import { useState } from "react";
import { Building2, Upload, Save, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { useAuthStore } from "@/stores/useAuthStore";
import { toast } from "@/shared/utils/toast";
import api from "@/shared/lib/axios";

export function SettingsPage() {
  const profile = useAuthStore((s) => s.activeOrganizationProfile);
  const fetchMe = useAuthStore((s) => s.fetchMe);

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    businessName: profile?.businessName || "",
    taxCode: profile?.taxCode || "",
    contactPhone: profile?.contactPhone || "",
    billingAddress: profile?.billingAddress || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await api.put("/organizations/profile/me", formData);
      await fetchMe(true);
      toast.success("Đã cập nhật thông tin!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="p-8 max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Cài đặt</h1>
          <p className="text-gray-600">
            Quản lý thông tin doanh nghiệp của bạn
          </p>
        </div>

        {/* Business Info */}
        <Card className="border-none shadow-sm mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-orange-500" />
              Thông tin doanh nghiệp
            </CardTitle>
            <CardDescription>
              Thông tin này sẽ được sử dụng cho hóa đơn và liên hệ
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="businessName">Tên doanh nghiệp *</Label>
                <Input
                  id="businessName"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  placeholder="Công ty TNHH ABC"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="taxCode">Mã số thuế</Label>
                <Input
                  id="taxCode"
                  name="taxCode"
                  value={formData.taxCode}
                  onChange={handleChange}
                  placeholder="0123456789"
                />
                <p className="text-xs text-gray-500">
                  Cần thiết để xuất hóa đơn VAT
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactPhone">Số điện thoại liên hệ</Label>
                <Input
                  id="contactPhone"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleChange}
                  placeholder="0901234567"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="billingAddress">Địa chỉ xuất hóa đơn</Label>
                <Input
                  id="billingAddress"
                  name="billingAddress"
                  value={formData.billingAddress}
                  onChange={handleChange}
                  placeholder="123 Nguyễn Văn A, Quận 1, TP.HCM"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="bg-orange-500 hover:bg-orange-600"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Lưu thay đổi
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Brand Assets */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-orange-500" />
              Tài sản thương hiệu
            </CardTitle>
            <CardDescription>
              Logo và brand guidelines của doanh nghiệp
            </CardDescription>
          </CardHeader>
          <CardContent>
            {profile?.logoUrl ? (
              <div className="flex items-center gap-4">
                <img
                  src={profile.logoUrl}
                  alt="Logo"
                  className="w-20 h-20 object-contain border rounded-lg p-2"
                />
                <div>
                  <p className="font-medium">Logo hiện tại</p>
                  <Button variant="outline" size="sm" className="mt-2">
                    Thay đổi logo
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                <Upload className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                <p className="text-gray-600 mb-2">Chưa có logo</p>
                <Button variant="outline">Upload logo</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default SettingsPage;
