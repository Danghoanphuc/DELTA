// apps/customer-frontend/src/features/rush/components/RushWizard.tsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, MapPin, Upload, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { SpecsForm } from "./steps/SpecsForm";
import { FileUpload } from "./steps/FileUpload";
import { CategorySelector } from "./steps/CategorySelector"; 
import { useRushState } from "../hooks/useRushState";
import { cn } from "@/shared/lib/utils";
import { printzCategories } from "@/data/categories.data";

export const RushWizard = ({ onSearch, isSearching, className }: { onSearch: (data: any) => void, isSearching: boolean, className?: string }) => {
  const [step, setStep] = useState(1);
  const { 
    category, setCategory, 
    specs, updateSpecs, 
    currentConfig, 
    file, setFile, fileUrl, setFileUrl, inputMode, setInputMode,
    deadline, setDeadline
  } = useRushState();

  const nextStep = () => setStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const handleFinish = () => {
    onSearch({ category, specs, deadline, file, fileUrl });
  };

  const currentCategoryInfo = printzCategories.find(c => c.value === category);

  const variants = {
    enter: (direction: number) => ({ x: direction > 0 ? 20 : -20, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({ x: direction < 0 ? 20 : -20, opacity: 0 })
  };

  return (
    // ✅ UPDATE: Xóa w-max-md và h-fixed, thay bằng h-full và nhận className từ ngoài
    <div className={cn("flex flex-col bg-white/95 backdrop-blur-xl overflow-hidden", className)}>
      
      {/* Header Wizard */}
      <div className="px-5 pt-5 pb-3 border-b border-gray-50 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
           <div className="flex gap-1.5">
              {[1, 2, 3].map(i => (
                <div key={i} className={cn("h-1 rounded-full transition-all duration-500", step >= i ? "w-8 bg-blue-600" : "w-2 bg-gray-200")} />
              ))}
           </div>
           <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50 px-2 py-1 rounded-md">Bước {step}/3</span>
        </div>
        
        <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight leading-none">
          {step === 1 && "Bạn cần in gì?"}
          {step === 2 && "Chi tiết đơn hàng"}
          {step === 3 && "File & Thời gian"}
        </h2>
      </div>

      {/* Body Wizard */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-5 py-3 relative custom-scrollbar">
        <AnimatePresence mode="wait" custom={step}>
          {/* STEP 1: CHỌN LOẠI - Sử dụng CategorySelector xịn */}
          {step === 1 && (
            <motion.div key="step1" variants={variants} initial="enter" animate="center" exit="exit">
              <CategorySelector selected={category} onChange={setCategory} />
            </motion.div>
          )}

          {/* STEP 2: SPECS */}
          {step === 2 && (
            <motion.div key="step2" variants={variants} initial="enter" animate="center" exit="exit">
               <div className="bg-blue-50/80 border border-blue-100 rounded-xl p-3 mb-4 flex items-center gap-3 shadow-sm">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm border border-blue-50 overflow-hidden p-1">
                    {currentCategoryInfo?.image ? (
                        <img src={currentCategoryInfo.image} className="w-full h-full object-contain" alt="" />
                    ) : <CheckCircle2 className="text-blue-600"/>}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wide">Đang cấu hình</p>
                    <p className="text-sm font-bold text-gray-900">{currentCategoryInfo?.label || "Sản phẩm"}</p>
                  </div>
               </div>
               <SpecsForm config={currentConfig} specs={specs} onChange={updateSpecs} />
            </motion.div>
          )}

          {/* STEP 3: UPLOAD */}
          {step === 3 && (
            <motion.div key="step3" variants={variants} initial="enter" animate="center" exit="exit" className="space-y-5">
               <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase">File thiết kế</label>
                  <FileUpload 
                    file={file} setFile={setFile} 
                    fileUrl={fileUrl} setFileUrl={setFileUrl} 
                    inputMode={inputMode} setInputMode={setInputMode} 
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase">Thời gian nhận hàng</label>
                  <div className="grid grid-cols-3 gap-2">
                    {["2h", "4h", "today"].map(t => (
                      <button 
                        key={t}
                        onClick={() => setDeadline(t)}
                        className={cn(
                          "py-2.5 rounded-lg border text-xs font-bold transition-all relative overflow-hidden",
                          deadline === t ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm" : "border-gray-200 bg-white text-gray-500"
                        )}
                      >
                        {t === 'today' ? 'Hôm nay' : `Gấp ${t}`}
                      </button>
                    ))}
                  </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Actions */}
      <div className="px-5 pt-4 pb-8 md:pb-6 border-t border-gray-100 bg-white/80 backdrop-blur-md flex-shrink-0">
        <div className="flex gap-3">
          {step > 1 && (
            <Button onClick={prevStep} variant="ghost" className="h-11 w-11 rounded-xl p-0 flex-shrink-0 border border-gray-200 hover:bg-gray-100">
              <ArrowLeft size={20} />
            </Button>
          )}
          {step < 3 ? (
            <Button onClick={nextStep} className="flex-1 h-11 rounded-xl bg-gray-900 hover:bg-black text-white font-bold shadow-lg text-sm">
              Tiếp tục <ArrowRight size={16} className="ml-2" />
            </Button>
          ) : (
            <Button onClick={handleFinish} disabled={isSearching} className="flex-1 h-11 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-lg shadow-blue-500/30 text-sm animate-pulse">
              {isSearching ? "Đang tìm..." : "Tìm Nhà In Ngay"} <MapPin size={16} className="ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};