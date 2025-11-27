// src/features/printer/pages/PrinterOnboardingPage.tsx

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
import { toast } from "@/shared/utils/toast";
import api from "@/shared/lib/axios";
import { uploadFileToCloudinary } from "@/services/cloudinaryService";
import { printerService } from "@/services/printerService";

export function PrinterOnboardingPage() {
  const navigate = useNavigate();
  const {
    user,
    onPrinterProfileCreated,
    setActiveContext,
    isContextLoading,
    fetchMe,
  } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);

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

  // ✅ FIX: Kiểm tra và redirect nếu user đã có printerProfileId
  useEffect(() => {
    const checkProfileStatus = async () => {
      setIsCheckingProfile(true);
      
      try {
        // ✅ QUAN TRỌNG: Refresh user state trước để đảm bảo có dữ liệu mới nhất
        // (Đặc biệt quan trọng sau khi admin approve)
        await fetchMe(true);
        
        // Đợi một chút để state được cập nhật
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Lấy user mới nhất từ store (sau khi fetchMe)
        const { user: currentUser } = useAuthStore.getState();
        
        if (currentUser?.printerProfileId) {
          try {
            // Fetch profile để kiểm tra trạng thái
            const profile = await printerService.getMyProfile();
            
            // Nếu profile đã được approve, redirect đến dashboard
            if (profile.isVerified && profile.verificationStatus === "verified") {
              toast.success("Hồ sơ của bạn đã được duyệt. Đang chuyển đến Dashboard...");
              setActiveContext("printer", navigate);
              return;
            }
            
            // Nếu profile chưa được approve nhưng đã tồn tại, vẫn redirect
            // (user sẽ thấy màn hình chờ duyệt)
            toast.info("Hồ sơ của bạn đã tồn tại. Đang chuyển đến Dashboard...");
            setActiveContext("printer", navigate);
            return;
          } catch (error: any) {
            // Nếu không fetch được profile (có thể do chưa có quyền isPrinter hoặc lỗi network)
            // Vẫn redirect để hệ thống xử lý
            console.warn("⚠️ Không thể fetch profile, redirect anyway:", error);
            const timer = setTimeout(() => {
              setActiveContext("printer", navigate);
            }, 0);
            return () => clearTimeout(timer);
          }
        }
      } catch (error: any) {
        console.error("❌ Lỗi khi kiểm tra trạng thái profile:", error);
      } finally {
        setIsCheckingProfile(false);
      }
    };

    checkProfileStatus();
  }, [navigate, setActiveContext, fetchMe]);

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

    // ✅ FIX: Kiểm tra trạng thái trước khi submit
    if (user?.printerProfileId) {
      try {
        // Fetch profile hiện tại để kiểm tra trạng thái
        const existingProfile = await printerService.getMyProfile();
        
        if (existingProfile.isVerified && existingProfile.verificationStatus === "verified") {
          toast.success("Hồ sơ của bạn đã được duyệt. Đang chuyển đến Dashboard...");
          setActiveContext("printer", navigate);
          return;
        }
        
        // Nếu profile chưa được approve, vẫn cho phép user vào dashboard
        // (sẽ thấy màn hình chờ duyệt)
        toast.info("Hồ sơ của bạn đã tồn tại. Đang chuyển đến Dashboard...");
        setActiveContext("printer", navigate);
        return;
      } catch (error: any) {
        // Nếu không fetch được (có thể do lỗi network), vẫn thử submit
        console.warn("⚠️ Không thể kiểm tra profile trước khi submit:", error);
      }
    }

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
      // ✅ FIX: Đảm bảo coordinates có giá trị hợp lệ
      const coordinates = address.coordinates && address.coordinates.length === 2 
        ? address.coordinates 
        : [106.6297, 10.8231]; // Default: Tọa độ TP.HCM

      const payload = {
        businessName: businessName.trim(),
        contactPhone: contactPhone.trim(),
        logoUrl: logoUrl || null,
        coverImage: coverImage || null,
        shopAddress: {
          street: address.street.trim(),
          district: address.district.trim(),
          city: address.city.trim(),
          location: {
            type: "Point",
            coordinates: coordinates,
          },
        },
      };

      const res = await api.post("/printers/onboarding", payload);
      const newProfile = res.data?.data?.profile;

      if (!newProfile) {
        throw new Error("Không nhận được hồ sơ sau khi tạo.");
      }

      // FIX: CHỈ GỌI HÀM CẬP NHẬT TRẠNG THÁI. useEffect sẽ lo navigate.
      onPrinterProfileCreated(newProfile);

      toast.success(
        "Chào mừng nhà in mới! Đang chuyển đến Dashboard của bạn..."
      );

      // ✅ LOẠI BỎ explicit navigate("/printer/dashboard");
      // ✅ LOẠI BỎ logic Healing 409 không cần thiết ở đây.
    } catch (err: any) {
      console.error("❌ Lỗi Onboarding:", err);
      
      // ✅ FIX: Xử lý 409 Conflict - Profile đã tồn tại
      if (err.response?.status === 409) {
        toast.info("Hồ sơ đã tồn tại. Đang đồng bộ thông tin...");
        
        // ✅ QUAN TRỌNG: Refresh user state để lấy printerProfileId mới nhất từ backend
        await fetchMe(true);
        
        // ✅ Đợi một chút để đảm bảo state được cập nhật
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // ✅ Lấy user mới nhất từ store sau khi fetchMe
        const { user: updatedUser } = useAuthStore.getState();
        
        // Fetch profile để kiểm tra trạng thái
        try {
          const existingProfile = await printerService.getMyProfile();
          
          // ✅ FIX: Cập nhật user state với printerProfileId nếu chưa có
          if (updatedUser && !updatedUser.printerProfileId && existingProfile._id) {
            useAuthStore.setState({
              user: { ...updatedUser, printerProfileId: existingProfile._id }
            });
          }
          
          if (existingProfile.isVerified && existingProfile.verificationStatus === "verified") {
            toast.success("Hồ sơ của bạn đã được duyệt!");
          } else {
            toast.info("Hồ sơ của bạn đang chờ duyệt.");
          }
          
          // Redirect đến dashboard
          setActiveContext("printer", navigate);
        } catch (profileError: any) {
          // Nếu không fetch được profile, vẫn thử redirect
          console.warn("⚠️ Không thể fetch profile sau 409:", profileError);
          
          // ✅ FIX: Nếu có thể lấy profileId từ error message hoặc response, cập nhật user state
          // Thử fetch user lại một lần nữa để đảm bảo có printerProfileId
          try {
            await fetchMe(true);
            setActiveContext("printer", navigate);
          } catch (finalError) {
            console.error("❌ Lỗi cuối cùng khi xử lý 409:", finalError);
            toast.error("Không thể đồng bộ thông tin. Vui lòng tải lại trang.");
          }
        }
      } else {
        toast.error(err.response?.data?.message || "Tạo hồ sơ thất bại.");
      }
      setIsLoading(false);
    }
  };

  // (Phần render JSX giữ nguyên)
  const isBusy = isLoading || isUploading || isContextLoading || isCheckingProfile;

  // ✅ Hiển thị loading khi đang kiểm tra profile
  if (isCheckingProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl shadow-2xl">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-12 h-12 animate-spin text-orange-500 mb-4" />
            <p className="text-gray-600">Đang kiểm tra trạng thái hồ sơ...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

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
