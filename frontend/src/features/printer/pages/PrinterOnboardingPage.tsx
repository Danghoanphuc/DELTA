// src/features/printer/pages/PrinterOnboardingPage.tsx
// BÀN GIAO: Đã cập nhật logic try...catch trong handleSubmit

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Loader2, Rocket, Upload, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import api from "@/shared/lib/axios";
import { uploadFileToCloudinary } from "@/services/cloudinaryService";

export function PrinterOnboardingPage() {
  const navigate = useNavigate();
  // ✅ BƯỚC 1: LẤY THÊM 'fetchMe' TỪ STORE
  const {
    user,
    onPrinterProfileCreated,
    setActiveContext,
    isContextLoading,
    fetchMe, // <-- Lấy hàm này
  } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // (Các state form giữ nguyên)
  const [businessName, setBusinessName] = useState(user?.displayName || "");
  const [contactPhone, setContactPhone] = useState(user?.phone || "");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [address, setAddress] = useState({
    street: "",
    district: "",
    city: "",
    coordinates: [0, 0], // [long, lat]
  });

  // (useEffect điều hướng giữ nguyên)
  useEffect(() => {
    if (user?.printerProfileId) {
      toast.info("Bạn đã là nhà in. Đang chuyển hướng...");
      setActiveContext("printer", navigate);
    }
  }, [user, navigate, setActiveContext]);

  // (handleFileUpload giữ nguyên)
  const handleFileUpload = async (
    file: File,
    setter: (url: string) => void
  ) => {
    setIsUploading(true);
    const toastId = toast.loading(`Đang tải lên ${file.name}...`);
    try {
      const uploadedUrl = await uploadFileToCloudinary(file);
      setter(uploadedUrl);
      toast.success("Tải lên thành công!", { id: toastId });
    } catch (err) {
      toast.error("Tải lên thất bại.", { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  // === ✅ BƯỚC 2: CẬP NHẬT LOGIC handleSubmit ===
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !businessName ||
      !contactPhone ||
      !address.street ||
      !address.district ||
      !address.city
    ) {
      toast.error("Vui lòng điền đầy đủ các trường bắt buộc (*).");
      return;
    }

    setIsLoading(true);

    try {
      // (Phần 'try' giữ nguyên)
      const payload = {
        businessName,
        contactPhone,
        logoUrl,
        coverImage,
        shopAddress: {
          street: address.street,
          district: address.district,
          city: address.city,
          location: {
            type: "Point",
            coordinates: address.coordinates,
          },
        },
      };

      const res = await api.post("/printers/onboarding", payload);
      const newProfile = res.data?.data?.profile;

      if (!newProfile) {
        throw new Error("Không nhận được hồ sơ sau khi tạo.");
      }

      onPrinterProfileCreated(newProfile);
      toast.success(
        "Chào mừng nhà in mới! Đang chuyển đến Dashboard của bạn..."
      );
      navigate("/printer/dashboard");
    } catch (err: any) {
      // ✅✅✅ SỬA LỖI TẠI ĐÂY ✅✅✅
      console.error("❌ Lỗi Onboarding:", err);

      if (err.response?.status === 409) {
        // Đây là lỗi "Chữa lành" (Healing) 409
        const serverMessage =
          err.response?.data?.message || "Hồ sơ đã tồn tại. Đang đồng bộ...";

        toast.info(serverMessage, {
          description: "Đang tự động đồng bộ tài khoản của bạn...",
        });

        // 1. Cập nhật lại user state (silent)
        await fetchMe(true);

        // 2. Chuyển bối cảnh
        // (setActiveContext sẽ tự động điều hướng đến dashboard
        // vì fetchMe đã cập nhật user.printerProfileId)
        await setActiveContext("printer", navigate);

        // Không cần setIsLoading(false) vì đang điều hướng
      } else {
        // Các lỗi 400, 500 khác
        toast.error(err.response?.data?.message || "Tạo hồ sơ thất bại.");
        setIsLoading(false); // Chỉ set false cho các lỗi thực sự
      }
    }
  };

  // (Phần render JSX giữ nguyên)
  const isBusy = isLoading || isUploading || isContextLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-2xl">
        <CardHeader className="text-center">
          <Rocket className="w-12 h-12 mx-auto text-orange-500" />
          <CardTitle className="text-2xl font-bold mt-4">
            Trở thành Đối tác Nhà in
          </CardTitle>
          <p className="text-gray-600">
            Chỉ một bước nữa để bắt đầu bán hàng trên PrintZ.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* --- Thông tin cơ bản --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="businessName">
                  Tên xưởng in / Doanh nghiệp *
                </Label>
                <Input
                  id="businessName"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPhone">Số điện thoại liên hệ *</Label>
                <Input
                  id="contactPhone"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* --- Địa chỉ (TODO: Thay bằng Google Places) --- */}
            <div className="space-y-2">
              <Label htmlFor="street">Địa chỉ xưởng *</Label>
              <Input
                id="street"
                placeholder="Số nhà, tên đường (VD: 127 Mạc Đỉnh Chi)"
                value={address.street}
                onChange={(e) =>
                  setAddress((prev) => ({ ...prev, street: e.target.value }))
                }
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="district">Quận / Huyện *</Label>
                <Input
                  id="district"
                  placeholder="VD: Thủ Dầu Một"
                  value={address.district}
                  onChange={(e) =>
                    setAddress((prev) => ({
                      ...prev,
                      district: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Tỉnh / Thành phố *</Label>
                <Input
                  id="city"
                  placeholder="VD: Bình Dương"
                  value={address.city}
                  onChange={(e) =>
                    setAddress((prev) => ({ ...prev, city: e.target.value }))
                  }
                  required
                />
              </div>
            </div>
            {/* --- Kết thúc phần địa chỉ --- */}

            {/* --- Upload Ảnh (MỚI) --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Logo */}
              <div className="space-y-2">
                <Label htmlFor="logo">Logo (Tùy chọn)</Label>
                {logoUrl ? (
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-green-500" />
                    <span className="text-sm text-gray-600 truncate">
                      Đã tải lên logo.
                    </span>
                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      onClick={() => setLogoUrl(null)}
                    >
                      Xóa
                    </Button>
                  </div>
                ) : (
                  <Input
                    id="logo"
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      e.target.files?.[0] &&
                      handleFileUpload(e.target.files[0], setLogoUrl)
                    }
                    disabled={isBusy}
                  />
                )}
              </div>
              {/* Ảnh bìa */}
              <div className="space-y-2">
                <Label htmlFor="cover">Ảnh bìa xưởng (Tùy chọn)</Label>
                {coverImage ? (
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-green-500" />
                    <span className="text-sm text-gray-600 truncate">
                      Đã tải lên ảnh bìa.
                    </span>
                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      onClick={() => setCoverImage(null)}
                    >
                      Xóa
                    </Button>
                  </div>
                ) : (
                  <Input
                    id="cover"
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      e.target.files?.[0] &&
                      handleFileUpload(e.target.files[0], setCoverImage)
                    }
                    disabled={isBusy}
                  />
                )}
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-lg py-6"
              disabled={isBusy}
            >
              {isBusy ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                "Hoàn tất & Mở Xưởng in"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
