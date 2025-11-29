// apps/customer-frontend/src/features/customer/components/AddressForm/GPSLocationButton.tsx
import { Button } from "@/shared/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { Navigation, Loader2, CheckCircle2, Sparkles } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface GPSLocationButtonProps {
  isDetecting: boolean;
  isGPSFilled: boolean;
  onDetect: () => void;
}

export const GPSLocationButton = ({
  isDetecting,
  isGPSFilled,
  onDetect,
}: GPSLocationButtonProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant={isGPSFilled ? "default" : "outline"}
            size="sm"
            onClick={onDetect}
            disabled={isDetecting}
            className={cn(
              "rounded-full transition-all duration-300 gap-2 font-semibold shadow-md hover:shadow-lg",
              isGPSFilled
                ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-transparent shadow-green-500/30"
                : "border-2 border-blue-300 text-blue-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:border-blue-400"
            )}
          >
            {isDetecting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang định vị...
              </>
            ) : isGPSFilled ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Đã định vị
              </>
            ) : (
              <>
                <Navigation className="h-4 w-4" />
                Định vị GPS
                <Sparkles className="h-3.5 w-3.5 text-blue-500" />
              </>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent
          side="left"
          className="bg-gray-900 text-white font-medium"
        >
          {isGPSFilled
            ? "✓ Đã lưu tọa độ GPS và tự động điền địa chỉ"
            : "Tự động điền địa chỉ từ vị trí hiện tại của bạn"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
