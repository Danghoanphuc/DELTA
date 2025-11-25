// src/features/zin-bot/ZinCustomizerModal.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { ZinNotionAvatar } from "./ZinNotionAvatar";
import { useZinStore, ZinAccessory } from "@/stores/useZinStore";
import { cn } from "@/shared/lib/utils";
import { Check, Crown, Glasses, Palette, Music, Flower2, Slash, Coffee } from "lucide-react"; // Dùng Coffee icon

const ACCESSORIES: { id: ZinAccessory; label: string; icon: any }[] = [
  { id: "none", label: "Mặc định", icon: Slash },
  { id: "coffee", label: "Cà phê sáng", icon: Coffee }, // ✅ Coffee
  { id: "glasses", label: "Cool ngầu", icon: Glasses },
  { id: "beret", label: "Họa sĩ", icon: Palette },
  { id: "headphone", label: "Nghe nhạc", icon: Music },
  { id: "crown", label: "Vua", icon: Crown },
  { id: "flower", label: "Đáng yêu", icon: Flower2 },
];

interface ZinCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ZinCustomizerModal({ isOpen, onClose }: ZinCustomizerModalProps) {
  const { accessory, setAccessory } = useZinStore();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] p-0 gap-0 overflow-hidden bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-2xl rounded-2xl">
        
        {/* HEADER */}
        <div className="flex flex-col items-center justify-center pt-10 pb-6 bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800/50 opacity-50" />
          <div className="w-36 h-36 mb-4 relative z-10 drop-shadow-xl">
             <ZinNotionAvatar className="w-full h-full" emotion="happy" />
          </div>
          <DialogTitle className="text-lg font-bold text-gray-900 dark:text-gray-100 relative z-10">
            Tủ đồ của Zin
          </DialogTitle>
          <p className="text-xs text-gray-500 dark:text-gray-400 relative z-10">
            Chọn phụ kiện phù hợp với tâm trạng
          </p>
        </div>

        {/* GRID OPTIONS */}
        <div className="p-6 bg-white dark:bg-gray-900">
          <div className="grid grid-cols-4 gap-3">
            {ACCESSORIES.map((item) => (
              <button
                key={item.id}
                onClick={() => setAccessory(item.id)}
                className={cn(
                  "group relative aspect-square flex flex-col items-center justify-center gap-2 rounded-2xl border-2 transition-all duration-200",
                  accessory === item.id 
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 scale-105 shadow-sm" 
                    : "border-transparent bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700"
                )}
              >
                <item.icon size={22} strokeWidth={2} className={cn("transition-transform", accessory === item.id && "scale-110")} />
                
                {accessory === item.id && (
                  <div className="absolute -top-2 -right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center shadow-sm ring-2 ring-white dark:ring-gray-900 animate-in zoom-in">
                    <Check size={12} className="text-white" strokeWidth={3} />
                  </div>
                )}
              </button>
            ))}
          </div>
          
          <div className="text-center mt-4 h-6">
             <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 animate-in fade-in slide-in-from-bottom-1">
                {ACCESSORIES.find(a => a.id === accessory)?.label}
             </span>
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 flex justify-center">
          <Button onClick={onClose} className="w-full max-w-[200px] bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-blue-500/25 transition-all">
            Xong rồi!
          </Button>
        </div>

      </DialogContent>
    </Dialog>
  );
}