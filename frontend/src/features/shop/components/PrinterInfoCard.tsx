// features/shop/components/PrinterInfoCard.tsx
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { User, Star, MapPin } from "lucide-react";
import { PrinterProfile } from "@/types/printerProfile";

interface PrinterInfoCardProps {
  printerInfo: PrinterProfile;
}

export const PrinterInfoCard = ({ printerInfo }: PrinterInfoCardProps) => (
  <Card className="bg-white border-none shadow-sm">
    <CardHeader>
      <CardTitle className="text-base flex items-center gap-2">
        <User size={18} /> Cung cấp bởi
      </CardTitle>
    </CardHeader>
    <CardContent>
      <h3 className="font-semibold text-lg mb-2">{printerInfo.businessName}</h3>
      <div className="flex items-center gap-1 text-sm text-yellow-500 mb-2">
        <Star size={16} fill="currentColor" />
        <span>
          {printerInfo.rating?.toFixed(1) ?? "Chưa có"} (
          {printerInfo.totalReviews ?? 0} đánh giá)
        </span>
      </div>
      <div className="flex items-start gap-2 text-sm text-gray-600">
        <MapPin size={16} className="mt-0.5 flex-shrink-0" />
        <span>
          {printerInfo.shopAddress?.street}, {printerInfo.shopAddress?.district}
          , {printerInfo.shopAddress?.city}
        </span>
      </div>
    </CardContent>
  </Card>
);
