// src/features/shop/components/details/PrinterProfileSection.tsx
// (Phải export default để dùng React.lazy)
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { PrinterProfile } from "@/types/printerProfile";
import { Button } from "@/shared/components/ui/button";
import { usePrinterProfileDetails } from "../../hooks/usePrinterProfileDetails";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { ImageWithFallback } from "@/features/figma/ImageWithFallback";
import { MapPin, Star } from "lucide-react"; // Thêm icon

const PrinterProfileSection = ({
  printerInfo,
}: {
  printerInfo: PrinterProfile;
}) => {
  // Dữ liệu "nhẹ" (từ prop - tải tức thì)
  const { _id, businessName, description, shopAddress, specialties } =
    printerInfo;

  // Dữ liệu "nặng" (từ hook - tải động)
  const { gallery, isLoading } = usePrinterProfileDetails(_id);

  return (
    <Card className="mt-6 shadow-sm border-none">
      <CardHeader>
        <CardTitle>Hồ sơ Năng lực Nhà in</CardTitle>
      </CardHeader>
      <CardContent>
        {/* === Thông tin "NHẸ" (Hiển thị ngay) === */}
        <h3 className="text-2xl font-bold text-blue-600">{businessName}</h3>
        <p className="text-gray-600 mt-2 text-base leading-relaxed max-w-3xl">
          {description || "Nhà in chưa cập nhật mô tả."}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-sm border-t pt-4">
          <div className="flex gap-2">
            <MapPin size={16} className="text-gray-500 mt-1 flex-shrink-0" />
            <div>
              <strong>Địa chỉ:</strong>
              <p>
                {shopAddress?.street}, {shopAddress?.district},{" "}
                {shopAddress?.city}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Star size={16} className="text-gray-500 mt-1 flex-shrink-0" />
            <div>
              <strong>Chuyên môn:</strong>
              <p>{specialties?.join(", ") || "N/A"}</p>
            </div>
          </div>
        </div>

        {/* === Thông tin "NẶNG" (Tải sau) === */}
        <div className="mt-6">
          <h4 className="text-lg font-semibold mb-3">
            Hình ảnh xưởng sản xuất
          </h4>
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-48 w-full rounded-lg" />
            </div>
          )}

          {/* Khi có gallery */}
          {gallery && gallery.factoryImages.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {gallery.factoryImages.map((img, idx) => (
                <div key={idx} className="rounded-lg overflow-hidden border">
                  <ImageWithFallback
                    src={img.url}
                    alt={img.caption || "Ảnh xưởng"}
                    className="w-full h-48 object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Khi không có gallery */}
          {!isLoading && (!gallery || gallery.factoryImages.length === 0) && (
            <p className="text-sm text-gray-500">
              Nhà in chưa cập nhật hình ảnh xưởng.
            </p>
          )}

          {/* (Video Tương tự) */}
        </div>

        <Button variant="outline" className="mt-6">
          Xem chi tiết nhà in (Tới trang Storefront)
        </Button>
      </CardContent>
    </Card>
  );
};

export default PrinterProfileSection;
