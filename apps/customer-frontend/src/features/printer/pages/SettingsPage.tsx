// src/features/printer/pages/SettingsPage.tsx
// Bàn giao: Đã thêm Card Xác thực (VerificationCard)

import { NativeScrollArea as ScrollArea } from "@/shared/components/ui/NativeScrollArea";
import { SettingsHeader } from "@/features/printer/components/SettingsHeader";
import { useAuthStore } from "@/stores/useAuthStore";
import { PrinterProfileForm } from "@/features/printer/components/PrinterProfileForm";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Loader2, ShieldCheck, FileCheck, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import api from "@/shared/lib/axios";

/**
 * ✅ GIAI ĐOẠN 2: Form Upload Hồ sơ Xác thực
 */
const VerificationCard = ({ profile }: { profile: any }) => {
  const [gpkdFile, setGpkdFile] = useState<File | null>(null);
  const [cccdFile, setCccdFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { fetchMe } = useAuthStore(); // Để cập nhật lại store

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gpkdFile && !cccdFile) {
      toast.error("Vui lòng tải lên ít nhất 1 loại tài liệu (GPKD hoặc CCCD).");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Đang nộp hồ sơ, vui lòng chờ...");

    try {
      const formData = new FormData();
      if (gpkdFile) formData.append("gpkdFile", gpkdFile);
      if (cccdFile) formData.append("cccdFile", cccdFile);

      // Gọi API (đã tạo ở Backend bước 2)
      await api.put("/printers/submit-verification", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Cập nhật lại thông tin user (để profile có status mới)
      await fetchMe();

      toast.success("Nộp hồ sơ thành công! Chúng tôi sẽ duyệt sớm.", {
        id: toastId,
      });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Nộp hồ sơ thất bại", {
        id: toastId,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Trạng thái "Đã duyệt"
  if (profile.isVerified) {
    return (
      <Card className="bg-green-50 border-green-200 shadow-md mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700">
            <ShieldCheck />
            Tài khoản đã được xác thực
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-green-600">
            Tài khoản của bạn đã được duyệt. Bạn có toàn quyền truy cập các tính
            năng của nhà in.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Trạng thái "Chờ duyệt"
  if (profile.verificationStatus === "pending_review") {
    return (
      <Card className="bg-yellow-50 border-yellow-200 shadow-md mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-700">
            <FileCheck />
            Hồ sơ đang chờ duyệt
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-yellow-600">
            Chúng tôi đã nhận được hồ sơ của bạn và sẽ phản hồi trong 24-48 giờ.
            Cảm ơn bạn đã kiên nhẫn!
          </p>
        </CardContent>
      </Card>
    );
  }

  // Trạng thái "Chưa nộp" hoặc "Bị từ chối"
  return (
    <Card className="bg-red-50 border-red-200 shadow-md mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-700">
          <AlertTriangle />
          Yêu cầu xác thực tài khoản
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-red-600 mb-4">
          {profile.verificationStatus === "rejected"
            ? "Hồ sơ trước đó của bạn đã bị từ chối. Vui lòng nộp lại tài liệu rõ ràng hơn."
            : "Để đăng bán sản phẩm và nhận đơn hàng, vui lòng tải lên hồ sơ pháp lý của bạn."}
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="gpkd">
              Giấy phép kinh doanh (hoặc CCCD nếu là cá nhân)
            </Label>
            <Input
              id="gpkd"
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => setGpkdFile(e.target.files?.[0] || null)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cccd">CCCD/CMND của người đại diện</Label>
            <Input
              id="cccd"
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => setCccdFile(e.target.files?.[0] || null)}
            />
          </div>
          <Button
            type="submit"
            className="bg-gradient-to-r from-orange-400 to-red-500"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
            ) : null}
            {isSubmitting ? "Đang nộp..." : "Nộp hồ sơ xác thực"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export function SettingsPage() {
  // ✅ GIAI ĐOẠN 2: Lấy thông tin nhà in
  const profile = useAuthStore((s) => s.activePrinterProfile);

  return (
    <ScrollArea className="h-full flex-1 bg-gray-50">
      <div className="p-8 max-w-6xl mx-auto">
        <SettingsHeader />

        {/* ✅ GIAI ĐOẠN 2: Render Card Xác thực */}
        {profile && <VerificationCard profile={profile} />}

        {/* ✅ OBJECTIVE 1: Printer Profile Form */}
        <PrinterProfileForm />
      </div>
    </ScrollArea>
  );
}
