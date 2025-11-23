// apps/customer-frontend/src/features/rush/components/RushMap.tsx
import { useState, useMemo } from "react";
import Map, { Marker, Popup, NavigationControl, GeolocateControl } from "react-map-gl";
// Lưu ý: CSS mapbox-gl đã được xử lý qua alias trong vite.config.ts hoặc import global
import { MapPin, Star, Navigation } from "lucide-react";
import { RushSolution } from "../hooks/useRush";
import { Button } from "@/shared/components/ui/button";

// Key Goong.io (Map tiles)
const GOONG_MAP_KEY = import.meta.env.VITE_GOONG_MAP_TILES_KEY || "YOUR_KEY_HERE"; 
const GOONG_STYLE_URL = `https://tiles.goong.io/assets/goong_map_web.json?api_key=${GOONG_MAP_KEY}`;

interface RushMapProps {
  userLocation: { lat: number; lng: number } | null;
  solutions: RushSolution[];
  onSelectPrinter?: (printerId: string) => void;
}

export const RushMap = ({ userLocation, solutions, onSelectPrinter }: RushMapProps) => {
  const [popupInfo, setPopupInfo] = useState<RushSolution | null>(null);

  // Viewport mặc định (TP.HCM)
  const initialViewState = {
    longitude: userLocation?.lng || 106.6297,
    latitude: userLocation?.lat || 10.8231,
    zoom: 13,
    bearing: 0,
    pitch: 0
  };

  const pins = useMemo(() => solutions.map((sol, index) => {
    // Logic tọa độ: Ưu tiên tọa độ thật từ BE, nếu không có thì random quanh vị trí user để demo
    // (Lưu ý: Bạn cần update Backend trả về field location.coordinates)
    const lng = (sol as any).location?.coordinates?.[0] || (userLocation?.lng || 106.6297) + (Math.random() * 0.04 - 0.02);
    const lat = (sol as any).location?.coordinates?.[1] || (userLocation?.lat || 10.8231) + (Math.random() * 0.04 - 0.02);

    return (
      <Marker
        key={`marker-${index}`}
        longitude={lng}
        latitude={lat}
        anchor="bottom"
        onClick={e => {
          e.originalEvent.stopPropagation();
          setPopupInfo({ ...sol, location: { coordinates: [lng, lat] } } as any);
          onSelectPrinter?.(sol.printerProfileId);
        }}
      >
        <div className="group relative cursor-pointer transition-all duration-300 hover:scale-110 hover:-translate-y-2 z-10">
           {/* Marker Body */}
           <div className="w-12 h-12 bg-white rounded-full border-2 border-blue-600 shadow-lg flex items-center justify-center overflow-hidden relative z-20">
              {sol.printerLogoUrl ? (
                  <img src={sol.printerLogoUrl} className="w-full h-full object-cover" alt={sol.printerBusinessName} />
              ) : (
                  <MapPin size={24} className="text-blue-600 fill-blue-50" />
              )}
           </div>
           
           {/* Price Tag (Bubble) */}
           <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-xl whitespace-nowrap z-30 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(sol.product.estimatedPrice)}
              {/* Mũi tên nhỏ trỏ xuống */}
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45"></div>
           </div>

           {/* Pulse Effect dưới chân */}
           <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-8 h-3 bg-black/20 blur-sm rounded-full z-0"></div>
        </div>
      </Marker>
    );
  }), [solutions, userLocation, onSelectPrinter]);

  return (
    <div className="w-full h-full relative bg-slate-100">
      <Map
        initialViewState={initialViewState}
        style={{ width: "100%", height: "100%" }}
        mapStyle={GOONG_STYLE_URL}
        mapboxAccessToken="goong-api-key-not-required"
        attributionControl={false}
        reuseMaps
      >
        {/* ✅ FIX: Dời vị trí nút xuống dưới header (marginTop) và cách lề phải (marginRight) */}
        <GeolocateControl 
          position="top-right" 
          style={{ marginRight: '16px', marginTop: '90px' }} 
        />
        <NavigationControl 
          position="top-right" 
          style={{ marginRight: '16px' }} 
          showCompass={false} 
        />

        {/* User Location Marker */}
        {userLocation && (
          <Marker longitude={userLocation.lng} latitude={userLocation.lat} anchor="center">
            <div className="relative flex h-6 w-6 items-center justify-center">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-50"></span>
              <div className="relative h-4 w-4 bg-blue-600 border-2 border-white rounded-full shadow-sm"></div>
            </div>
          </Marker>
        )}

        {pins}

        {/* Popup Info */}
        {popupInfo && (
          <Popup
            anchor="top"
            longitude={(popupInfo as any).location?.coordinates[0]}
            latitude={(popupInfo as any).location?.coordinates[1]}
            onClose={() => setPopupInfo(null)}
            className="z-50"
            closeButton={false}
            maxWidth="320px"
            offset={15}
          >
            <div className="p-0 overflow-hidden rounded-lg font-sans">
               {/* Header Popup */}
               <div className="flex items-center gap-3 p-3 bg-white border-b border-gray-50">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                     <img src={popupInfo.printerLogoUrl || "/placeholder.png"} className="w-full h-full object-cover" alt="logo"/>
                  </div>
                  <div className="flex-1 min-w-0">
                     <h3 className="font-bold text-sm text-gray-900 truncate">{popupInfo.printerBusinessName}</h3>
                     <div className="flex items-center gap-2 mt-0.5">
                        <span className="inline-flex items-center text-[10px] bg-yellow-50 text-yellow-700 px-1.5 py-0.5 rounded border border-yellow-100">
                           <Star size={8} fill="currentColor" className="mr-1" /> 4.8
                        </span>
                        <span className="text-[10px] text-gray-400">• {popupInfo.currentRushQueue} đơn chờ</span>
                     </div>
                  </div>
               </div>
               
               {/* Stats Bar */}
               <div className="grid grid-cols-2 gap-px bg-gray-100 border-b border-gray-100">
                  <div className="bg-gray-50 p-2 text-center">
                     <p className="text-[10px] text-gray-500 uppercase font-semibold">Khoảng cách</p>
                     <p className="text-sm font-bold text-gray-900 flex items-center justify-center gap-1">
                        <Navigation size={12} className="text-blue-500" /> {popupInfo.distanceKm} km
                     </p>
                  </div>
                  <div className="bg-gray-50 p-2 text-center">
                     <p className="text-[10px] text-gray-500 uppercase font-semibold">Tổng tiền</p>
                     <p className="text-sm font-bold text-blue-600">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(popupInfo.product.estimatedPrice)}
                     </p>
                  </div>
               </div>

               {/* Action */}
               <div className="p-2 bg-white">
                  <Button 
                    size="sm" 
                    className="w-full h-9 text-xs bg-slate-900 hover:bg-slate-800 font-bold shadow-sm transition-all active:scale-95"
                    onClick={() => onSelectPrinter?.(popupInfo.printerProfileId)}
                  >
                     Chọn Nhà In Này
                  </Button>
               </div>
            </div>
          </Popup>
        )}
      </Map>
      
      {/* Vignette Effect (Làm tối 4 góc nhẹ để tập trung) */}
      <div className="absolute inset-0 pointer-events-none z-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.1)]" />
      
      {/* Left Gradient Fade (Để làm nền cho UI Wizard bên trái) */}
      <div className="hidden md:block absolute inset-y-0 left-0 w-[500px] bg-gradient-to-r from-white/90 via-white/60 to-transparent pointer-events-none z-0" />
    </div>
  );
};