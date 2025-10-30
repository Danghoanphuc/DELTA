// features/shop/components/OrderDetailHeader.tsx
import { ArrowLeft } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

interface StatusConfig {
  label: string;
  icon: any;
  color: string;
  bgColor: string;
}

interface OrderDetailHeaderProps {
  orderNumber: string;
  statusConfig: StatusConfig;
  onBack: () => void;
}

export const OrderDetailHeader = ({
  orderNumber,
  statusConfig,
  onBack,
}: OrderDetailHeaderProps) => {
  const StatusIcon = statusConfig.icon;

  return (
    <div className="mb-6">
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ArrowLeft size={18} className="mr-2" />
        Quay lại
      </Button>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Chi tiết đơn hàng
          </h1>
          <p className="text-gray-600">Mã đơn: {orderNumber}</p>
        </div>

        <div
          className={`${statusConfig.bgColor} ${statusConfig.color} px-4 py-2 rounded-lg flex items-center gap-2 font-semibold`}
        >
          <StatusIcon size={20} />
          {statusConfig.label}
        </div>
      </div>
    </div>
  );
};
