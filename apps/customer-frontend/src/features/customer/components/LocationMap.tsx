// apps/customer-frontend/src/features/customer/components/LocationMap.tsx
import { useEffect, useRef } from "react";
import Map, { Marker, NavigationControl } from "react-map-gl";
import { MapPin } from "lucide-react";
import { GOONG_CONFIG } from "@/lib/mapConfig";
import { cn } from "@/shared/lib/utils"; // ✅ Import cn utility

interface LocationMapProps {
  lat: number;
  lng: number;
  address?: string;
  className?: string; // ✅ Thêm prop className
}

export const LocationMap = ({
  lat,
  lng,
  address,
  className,
}: LocationMapProps) => {
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [lng, lat],
        zoom: 15,
        duration: 1000,
      });
    }
  }, [lat, lng]);

  return (
    // ✅ Bỏ height cứng, thêm className để cha điều khiển kích thước
    <div
      className={cn(
        "relative overflow-hidden border border-gray-200 shadow-sm w-full h-full",
        className
      )}
    >
      <Map
        ref={mapRef}
        initialViewState={{
          longitude: lng,
          latitude: lat,
          zoom: 15,
        }}
        // ✅ QUAN TRỌNG: Đặt height 100% để nó ăn theo thẻ div cha
        style={{ width: "100%", height: "100%" }}
        mapStyle={GOONG_CONFIG.STYLE_URL}
        mapboxAccessToken="goong-api-key-not-required"
        attributionControl={false}
        reuseMaps
        RTLTextPlugin={false}
      >
        <NavigationControl position="top-right" showCompass={false} />

        <Marker longitude={lng} latitude={lat} anchor="bottom">
          <div className="relative flex flex-col items-center">
            <div className="w-10 h-10 bg-blue-600 rounded-full border-4 border-white shadow-lg flex items-center justify-center animate-bounce">
              <MapPin className="w-6 h-6 text-white fill-white" />
            </div>
            <div className="w-6 h-2 bg-black/20 rounded-full blur-sm mt-1"></div>
          </div>
        </Marker>
      </Map>

      {/* Label hiển thị địa chỉ */}
      <div className="absolute top-2 left-2 bg-white/90 backdrop-blur px-3 py-1.5 rounded-md shadow-md flex items-center gap-2 text-sm max-w-[calc(100%-3rem)] z-10 border border-gray-100">
        <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0" />
        <span className="font-medium text-gray-700 truncate">
          {address || "Vị trí hiện tại"}
        </span>
      </div>
    </div>
  );
};
