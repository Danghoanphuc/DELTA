// apps/customer-frontend/src/features/customer/components/AddressForm/LocationPreview.tsx
import { Button } from "@/shared/components/ui/button";
import { X } from "lucide-react";
import { LocationMap } from "../LocationMap";

interface LocationPreviewProps {
  lat: number;
  lng: number;
  address: string;
  onClear: () => void;
}

export const LocationPreview = ({
  lat,
  lng,
  address,
  onClear,
}: LocationPreviewProps) => {
  return (
    <div className="relative rounded-xl overflow-hidden border border-green-200 shadow-sm group animate-in zoom-in-95 duration-300">
      <LocationMap lat={lat} lng={lng} address={address} />

      <Button
        type="button"
        variant="destructive"
        size="icon"
        onClick={onClear}
        className="absolute top-2 right-2 h-8 w-8 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10"
      >
        <X className="h-4 w-4" />
      </Button>

      <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm p-2 text-xs text-green-700 text-center border-t border-green-100 font-medium">
        📍 Vị trí ghim trên bản đồ giúp shipper tìm bạn nhanh hơn
      </div>
    </div>
  );
};
