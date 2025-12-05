// src/features/organization/pages/RecipientSelfServicePage.tsx
// ✅ Recipient Self-Service Portal - Người nhận tự điền thông tin

import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Gift,
  MapPin,
  Ruler,
  User,
  Check,
  Loader2,
  AlertCircle,
  Package,
  CheckCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { toast } from "@/shared/utils/toast";
import api from "@/shared/lib/axios";

interface SelfServiceData {
  orderName: string;
  packName: string;
  items: Array<{
    productName: string;
    productImage?: string;
    hasSize: boolean;
    personalized: boolean;
  }>;
  recipientInfo: {
    firstName: string;
    lastName: string;
    email: string;
  };
  shippingAddress: {
    street?: string;
    ward?: string;
    district?: string;
    city?: string;
  };
  sizeSelections?: Record<string, string>;
  personalization?: {
    name?: string;
    customText?: string;
  };
  completed: boolean;
}

const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

const CITIES = [
  "TP. Hồ Chí Minh",
  "Hà Nội",
  "Đà Nẵng",
  "Cần Thơ",
  "Hải Phòng",
  "Biên Hòa",
  "Nha Trang",
  "Huế",
  "Buôn Ma Thuột",
  "Khác",
];

export function RecipientSelfServicePage() {
  const { token } = useParams<{ token: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<SelfServiceData | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  // Form state
  const [address, setAddress] = useState({
    street: "",
    ward: "",
    district: "",
    city: "",
  });
  const [sizeSelections, setSizeSelections] = useState<Record<string, string>>(
    {}
  );
  const [personalization, setPersonalization] = useState({
    name: "",
    customText: "",
  });

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setError("Token không hợp lệ");
        setIsLoading(false);
        return;
      }

      try {
        const res = await api.get(`/swag-orders/self-service/${token}`);
        const selfServiceData = res.data?.data;
        setData(selfServiceData);

        // Pre-fill form
        if (selfServiceData.shippingAddress) {
          setAddress({
            street: selfServiceData.shippingAddress.street || "",
            ward: selfServiceData.shippingAddress.ward || "",
            district: selfServiceData.shippingAddress.district || "",
            city: selfServiceData.shippingAddress.city || "",
          });
        }
        if (selfServiceData.sizeSelections) {
          setSizeSelections(selfServiceData.sizeSelections);
        }
        if (selfServiceData.personalization) {
          setPersonalization({
            name: selfServiceData.personalization.name || "",
            customText: selfServiceData.personalization.customText || "",
          });
        }
        if (selfServiceData.completed) {
          setIsCompleted(true);
        }
      } catch (err: any) {
        setError(
          err.response?.data?.message ||
            "Không thể tải thông tin. Link có thể đã hết hạn."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [token]);

  // Submit form
  const handleSubmit = async () => {
    // Validate address
    if (!address.street || !address.district || !address.city) {
      toast.error("Vui lòng điền đầy đủ địa chỉ");
      return;
    }

    // Validate sizes for items that need it
    const itemsNeedingSize = data?.items.filter((item) => item.hasSize) || [];
    for (const item of itemsNeedingSize) {
      if (!sizeSelections[item.productName]) {
        toast.error(`Vui lòng chọn size cho ${item.productName}`);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await api.post(`/swag-orders/self-service/${token}`, {
        shippingAddress: address,
        sizeSelections,
        personalization,
      });

      setIsCompleted(true);
      toast.success("Đã lưu thông tin thành công!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Không thể truy cập
            </h2>
            <p className="text-gray-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Completed state
  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Hoàn tất!</h2>
            <p className="text-gray-600 mb-4">
              Cảm ơn bạn đã điền thông tin. Quà tặng sẽ được gửi đến địa chỉ của
              bạn sớm nhất.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 text-left">
              <p className="text-sm text-gray-500 mb-1">Địa chỉ giao hàng:</p>
              <p className="font-medium">
                {address.street}, {address.ward}, {address.district},{" "}
                {address.city}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const itemsNeedingSize = data?.items.filter((item) => item.hasSize) || [];
  const hasPersonalizedItems = data?.items.some((item) => item.personalized);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Gift className="w-16 h-16 mx-auto mb-4 text-orange-500" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Bạn có quà tặng! 🎁
          </h1>
          <p className="text-gray-600">
            Vui lòng điền thông tin để nhận quà từ{" "}
            <strong>{data?.orderName}</strong>
          </p>
        </div>

        {/* Gift Preview */}
        <Card className="mb-6 border-none shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-orange-500" />
              {data?.packName}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {data?.items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
                >
                  {item.productImage ? (
                    <img
                      src={item.productImage}
                      alt=""
                      className="w-10 h-10 rounded object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded bg-orange-100 flex items-center justify-center">
                      <Gift className="w-5 h-5 text-orange-500" />
                    </div>
                  )}
                  <span className="text-sm font-medium truncate">
                    {item.productName}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recipient Info */}
        <Card className="mb-6 border-none shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-blue-500" />
              Thông tin người nhận
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="font-medium text-gray-900">
                {data?.recipientInfo.firstName} {data?.recipientInfo.lastName}
              </p>
              <p className="text-sm text-gray-600">
                {data?.recipientInfo.email}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Shipping Address */}
        <Card className="mb-6 border-none shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-green-500" />
              Địa chỉ giao hàng
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Địa chỉ (số nhà, đường) *</Label>
              <Input
                value={address.street}
                onChange={(e) =>
                  setAddress({ ...address, street: e.target.value })
                }
                placeholder="VD: 123 Nguyễn Huệ"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Phường/Xã</Label>
                <Input
                  value={address.ward}
                  onChange={(e) =>
                    setAddress({ ...address, ward: e.target.value })
                  }
                  placeholder="VD: Phường Bến Nghé"
                />
              </div>
              <div>
                <Label>Quận/Huyện *</Label>
                <Input
                  value={address.district}
                  onChange={(e) =>
                    setAddress({ ...address, district: e.target.value })
                  }
                  placeholder="VD: Quận 1"
                />
              </div>
            </div>
            <div>
              <Label>Tỉnh/Thành phố *</Label>
              <Select
                value={address.city}
                onValueChange={(value) =>
                  setAddress({ ...address, city: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn tỉnh/thành phố" />
                </SelectTrigger>
                <SelectContent>
                  {CITIES.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Size Selection */}
        {itemsNeedingSize.length > 0 && (
          <Card className="mb-6 border-none shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ruler className="w-5 h-5 text-purple-500" />
                Chọn size
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {itemsNeedingSize.map((item, index) => (
                <div key={index}>
                  <Label>{item.productName} *</Label>
                  <Select
                    value={sizeSelections[item.productName] || ""}
                    onValueChange={(value) =>
                      setSizeSelections({
                        ...sizeSelections,
                        [item.productName]: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn size" />
                    </SelectTrigger>
                    <SelectContent>
                      {SIZES.map((size) => (
                        <SelectItem key={size} value={size}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
              <p className="text-sm text-gray-500">
                💡 Tip: Nếu không chắc size, hãy chọn size lớn hơn bình thường 1
                bậc.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Personalization */}
        {hasPersonalizedItems && (
          <Card className="mb-6 border-none shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-pink-500" />
                Cá nhân hóa
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Tên in trên sản phẩm</Label>
                <Input
                  value={personalization.name}
                  onChange={(e) =>
                    setPersonalization({
                      ...personalization,
                      name: e.target.value,
                    })
                  }
                  placeholder={`${data?.recipientInfo.firstName} ${data?.recipientInfo.lastName}`}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Để trống nếu muốn dùng tên mặc định
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full bg-orange-500 hover:bg-orange-600 h-12 text-lg"
        >
          {isSubmitting ? (
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
          ) : (
            <Check className="w-5 h-5 mr-2" />
          )}
          Xác nhận thông tin
        </Button>

        <p className="text-center text-sm text-gray-500 mt-4">
          Thông tin của bạn được bảo mật và chỉ dùng để giao hàng.
        </p>
      </div>
    </div>
  );
}

export default RecipientSelfServicePage;
