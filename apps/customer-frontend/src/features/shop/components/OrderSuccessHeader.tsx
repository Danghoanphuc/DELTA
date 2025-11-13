// features/shop/components/OrderSuccessHeader.tsx
import { CheckCircle, Copy } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

interface OrderSuccessHeaderProps {
  showAnimation: boolean;
  orderNumber: string;
  copiedOrderNumber: boolean;
  onCopy: () => void;
}

export const OrderSuccessHeader = ({
  showAnimation,
  orderNumber,
  copiedOrderNumber,
  onCopy,
}: OrderSuccessHeaderProps) => (
  <div
    className={`text-center mb-8 transition-all duration-700 ${
      showAnimation ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10"
    }`}
  >
    {/* Animated Checkmark */}
    <div className="relative inline-block mb-6">
      <div className="w-24 h-24 md:w-32 md:h-32 mx-auto">
        <div
          className={`absolute inset-0 bg-green-100 rounded-full transition-transform duration-500 ${
            showAnimation ? "scale-100" : "scale-0"
          }`}
        ></div>
        <div
          className={`absolute inset-2 bg-green-500 rounded-full flex items-center justify-center transition-all duration-700 delay-200 ${
            showAnimation ? "scale-100 opacity-100" : "scale-0 opacity-0"
          }`}
        >
          <CheckCircle size={48} className="text-white animate-bounce-slow" />
        </div>
      </div>
    </div>

    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
      🎉 Đặt hàng thành công!
    </h1>
    <p className="text-gray-600 text-lg mb-6">
      Cảm ơn bạn đã tin tưởng PrintZ. Chúng tôi sẽ chăm chút từng chi tiết.
    </p>

    {/* Order Number with Copy */}
    <div className="inline-flex items-center gap-3 bg-white px-6 py-3 rounded-full shadow-lg border-2 border-blue-100">
      <span className="text-sm text-gray-600">Mã đơn hàng:</span>
      <span className="text-xl font-bold text-blue-600">{orderNumber}</span>
      <Button
        size="icon"
        variant="ghost"
        onClick={onCopy}
        className="h-8 w-8 hover:bg-blue-50"
      >
        {copiedOrderNumber ? (
          <CheckCircle size={16} className="text-green-600" />
        ) : (
          <Copy size={16} className="text-gray-400" />
        )}
      </Button>
    </div>
  </div>
);
