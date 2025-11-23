// apps/customer-frontend/src/features/rush/pages/RushPage.tsx
import { useState } from "react";
import { RushMap } from "../components/RushMap";
import { RushWizard } from "../components/RushWizard";
import { useRush, RushSolution } from "../hooks/useRush";
import { ArrowLeft, Zap, ChevronUp } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

export function RushPage() {
  const { searchPrinters, searchPrintersMutation, userLocation } = useRush();
  const [solutions, setSolutions] = useState<RushSolution[]>([]);
  
  // ✅ NEW: State điều khiển Bottom Sheet (mặc định là mở rộng để nhập liệu)
  const [isSheetCollapsed, setIsSheetCollapsed] = useState(false);

  const handleSearch = async (data: any) => {
    try {
        // Giả lập gọi API
        console.log("Searching with", data);
        
        // ✅ ACTION: Khi bấm tìm -> Thu nhỏ Sheet xuống để hiện Map
        setIsSheetCollapsed(true);

        // Mock data (giữ nguyên logic cũ)
        setTimeout(() => {
            setSolutions([
                { printerProfileId: "1", printerBusinessName: "In Nhanh Thủ Đức", distanceKm: 1.2, product: { estimatedPrice: 150000 } as any, rushConfig: { maxRushDistanceKm: 5 } as any, currentRushQueue: 2, printerLogoUrl: "" },
                { printerProfileId: "2", printerBusinessName: "Xưởng In 24h", distanceKm: 2.5, product: { estimatedPrice: 145000 } as any, rushConfig: { maxRushDistanceKm: 10 } as any, currentRushQueue: 0, printerLogoUrl: "" }
            ]);
        }, 1000); // Giả lập delay mạng

    } catch (e) {
        console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] w-screen h-screen overflow-hidden bg-white font-sans">
      
      {/* 1. LAYER MAP (FULLSCREEN) */}
      <div className="absolute inset-0 z-0">
         <RushMap 
            userLocation={userLocation} 
            solutions={solutions} 
            // Khi click vào Map (hoặc chọn nhà in), cũng có thể thu nhỏ Sheet
            onSelectPrinter={() => setIsSheetCollapsed(true)}
         />
      </div>

      {/* 2. LAYER UI OVERLAY */}
      <div className="absolute inset-0 z-10 flex flex-col pointer-events-none">
        
        {/* Top Bar */}
        <div className="p-4 md:p-6 flex justify-between items-start pointer-events-auto pt-[env(safe-area-inset-top,20px)] transition-opacity duration-300"
             // Ẩn Header khi Sheet thu nhỏ để view Map rộng nhất (tùy chọn)
             style={{ opacity: isSheetCollapsed ? 0 : 1 }}
        >
           <Button asChild variant="outline" className="bg-white/90 backdrop-blur-md border-0 shadow-md hover:bg-white rounded-full h-10 w-10 p-0 transition-transform hover:scale-105">
              <Link to="/"><ArrowLeft size={20} className="text-gray-700" /></Link>
           </Button>
           
           <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 md:px-4 md:py-2 rounded-full shadow-md border border-white/50 flex items-center gap-3 animate-in slide-in-from-top-5 duration-500">
              <div className="flex items-center gap-1.5">
                 <span className="relative flex h-2 w-2">
                   <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                   <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                 </span>
                 <span className="text-[10px] md:text-xs font-bold text-gray-700">Hệ thống sẵn sàng</span>
              </div>
              <div className="h-3 w-px bg-gray-300"></div>
              <div className="flex items-center gap-1 text-blue-600">
                 <Zap size={12} fill="currentColor"/> 
                 <span className="text-[10px] md:text-xs font-bold">Real-time</span>
              </div>
           </div>
        </div>

        {/* WIZARD CONTAINER */}
        
        {/* A. Desktop Container: Floating Left (Không ảnh hưởng bởi logic mobile) */}
        <div className="hidden md:flex flex-1 items-center justify-start px-8 pl-20 lg:pl-24 pb-10">
           <div className="pointer-events-auto w-[420px] shadow-2xl rounded-3xl overflow-hidden transition-all duration-300">
              <RushWizard 
                onSearch={handleSearch} 
                isSearching={searchPrintersMutation.isPending} 
                className="h-[600px]" 
              />
           </div>
        </div>

        {/* B. Mobile Container: Bottom Sheet (Có hiệu ứng trượt) */}
        <div className="md:hidden flex-1 flex flex-col justify-end overflow-hidden">
           <div 
             className={cn(
                "pointer-events-auto w-full bg-white rounded-t-[30px] shadow-[0_-10px_40px_rgba(0,0,0,0.2)] transition-transform duration-500 cubic-bezier(0.32, 0.72, 0, 1)",
                // ✅ MAGIC: Dịch chuyển xuống dưới khi collapsed, chỉ chừa lại phần đỉnh (khoảng 120px)
                isSheetCollapsed ? "translate-y-[calc(100%-140px)]" : "translate-y-0"
             )}
           >
              {/* Mobile Handle Bar - Bấm vào để mở lại Sheet */}
              <div 
                className="w-full flex flex-col items-center justify-center pt-3 pb-2 bg-white cursor-pointer active:bg-gray-50" 
                onClick={() => setIsSheetCollapsed(!isSheetCollapsed)}
              >
                 <div className="w-12 h-1.5 bg-gray-300 rounded-full mb-1"></div>
                 {isSheetCollapsed && (
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wide flex items-center animate-bounce mt-1">
                        <ChevronUp size={12} className="mr-1"/> Chạm để mở rộng
                    </span>
                 )}
              </div>
              
              {/* Nội dung Wizard */}
              <div className="max-h-[75vh] h-[75vh] flex flex-col">
                 <RushWizard 
                    onSearch={handleSearch} 
                    isSearching={searchPrintersMutation.isPending} 
                    className="h-full rounded-t-none shadow-none border-0" 
                 />
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}