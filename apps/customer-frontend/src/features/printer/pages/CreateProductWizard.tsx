// src/features/printer/pages/CreateProductWizard.tsx

import { useSmartWizard } from "@/features/printer/hooks/useSmartWizard";
import { Form } from "@/shared/components/ui/form";
import { Button } from "@/shared/components/ui/button";
import { Loader2, Save, RotateCcw, Box, Maximize2, Eye } from "lucide-react";
import { NativeScrollArea as ScrollArea } from "@/shared/components/ui/NativeScrollArea";
import { WizardHeader } from "@/features/printer/components/product-wizard/WizardHeader";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/shared/lib/utils";

// Import Steps & Components
import { ProductWizardPreview } from "@/features/printer/components/product-wizard/ProductWizardPreview";
import { Step1_SelectAsset_New } from "@/features/printer/components/product-wizard/steps/Step1_SelectAsset_New";
import { Step2_GeneralInfo } from "@/features/printer/components/product-wizard/steps/Step2_GeneralInfo";
import { Step3_Images_New } from "@/features/printer/components/product-wizard/steps/Step3_Images_New";
import { Step4_Pricing } from "@/features/printer/components/product-wizard/steps/Step4_Pricing";
import { Step5_Publish } from "@/features/printer/components/product-wizard/steps/Step5_Publish";

interface CreateProductWizardProps {
  productId?: string;
  onFormClose: () => void;
  onSuccess: () => void;
}

const STEP_TITLES = [
  "",
  "Chọn Phôi Sản Phẩm",
  "Thông Tin Cơ Bản",
  "Hình Ảnh & Media",
  "Cấu Hình Giá Bán",
  "Xác Nhận & Đăng Bán"
];

export function CreateProductWizard({
  productId,
  onFormClose,
  onSuccess,
}: CreateProductWizardProps) {
  const {
    form,
    isLoading,
    isSubmitting,
    draftStatus,
    activeStep,
    setActiveStep,
    selectedAsset,
    pricingFields,
    addPricingTier,
    removePricingTier,
    validateAndGoToStep,
    onSubmit,
    onError,
    handleSelectAsset,
  } = useSmartWizard(productId, onSuccess);

  const { handleSubmit, control } = form;

  const renderStepContent = () => {
    switch (activeStep) {
      case 1: return <Step1_SelectAsset_New control={control} isExpanded={true} onExpand={() => {}} onSelectAsset={handleSelectAsset} />;
      case 2: return <Step2_GeneralInfo control={control} isExpanded={true} onExpand={() => {}} onValidate={() => validateAndGoToStep(3, ["name", "categoryDisplay"])} />;
      case 3: return <Step3_Images_New control={control} isExpanded={true} onExpand={() => {}} onValidate={() => validateAndGoToStep(4, ["images"])} />;
      case 4: return <Step4_Pricing control={control} fields={pricingFields} append={addPricingTier} remove={removePricingTier} isExpanded={true} onExpand={() => {}} onValidate={() => validateAndGoToStep(5, ["pricing"])} />;
      case 5: return <Step5_Publish control={control} isExpanded={true} onExpand={() => {}} />;
      default: return null;
    }
  };

  const handleNext = () => {
    if (activeStep === 5) handleSubmit(onSubmit, onError)();
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-500 font-medium">Đang khởi tạo Studio...</p>
      </div>
    );
  }

  return (
    <Form {...form}>
      {/* ✅ LAYOUT MỚI: Flex Column trên Mobile, Flex Row trên Desktop */}
      <div className="fixed inset-0 z-50 bg-[#F8F9FB] flex flex-col lg:flex-row overflow-hidden font-sans">
        
        {/* --- LEFT PANEL: 3D STAGE (Cân đối lại: 40-42% width) --- */}
        {/* Ẩn trên Mobile để tập trung nhập liệu, chỉ hiện trên Desktop */}
        <div className="hidden lg:flex flex-col p-6 lg:w-[42%] xl:w-[38%] h-full transition-all duration-300 ease-in-out">
          
          {/* 3D Viewer Container - Gọn gàng hơn */}
          <div className="relative w-full h-full bg-white rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden flex flex-col group">
             
             {/* Header nhỏ trong khung */}
             <div className="absolute top-0 left-0 right-0 h-16 px-6 flex items-center justify-between z-10 pointer-events-none">
                <div className="flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-gray-100 shadow-sm pointer-events-auto transition-transform hover:scale-105">
                   <Box size={14} className="text-blue-600" />
                   <span className="text-xs font-semibold text-gray-700 truncate max-w-[150px]">
                      {selectedAsset ? selectedAsset.name : "Chưa chọn phôi"}
                   </span>
                </div>
             </div>

             {/* Nền Grid trang trí */}
             <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px]"></div>
             
             {/* Component Preview */}
             <div className="flex-1 relative">
                <ProductWizardPreview asset={selectedAsset} />
             </div>

             {/* Footer gợi ý */}
             <div className="absolute bottom-4 w-full text-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-black/75 text-white text-[10px] rounded-full backdrop-blur-md">
                  <Eye size={10} /> Xem trước hiển thị khách hàng
                </span>
             </div>
          </div>
        </div>

        {/* --- RIGHT PANEL: CONTROL CENTER (Chiếm phần còn lại: ~58-60%) --- */}
        <div className="flex-1 w-full bg-white lg:border-l border-gray-200 flex flex-col relative z-20 h-full">
  
  {/* 1. Header (Thêm border bottom xịn hơn) */}
  <div className="relative z-20 bg-white border-b border-gray-200 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
    <WizardHeader 
      currentStep={activeStep}
      totalSteps={5}
      title={STEP_TITLES[activeStep]}
      onBack={() => setActiveStep(Math.max(1, activeStep - 1))}
      onClose={onFormClose}
    />
  </div>

  {/* 2. Content Area (Form) - THAY NỀN Ở ĐÂY */}
  <div className="flex-1 overflow-hidden relative bg-[#FAFAFA]">
    {/* ✅ THÊM: Lớp lưới in ấn (Grid) làm nền */}
    <div className="absolute inset-0 bg-tech-grid opacity-60 pointer-events-none"></div>

    <ScrollArea className="h-full relative z-10">
      <div className="p-6 md:p-8 lg:p-10 xl:p-12 pb-32 max-w-4xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </ScrollArea>
  </div>

          {/* 3. Footer Actions (Fixed bottom) */}
          {activeStep === 5 && (
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-white/95 backdrop-blur-md border-t border-gray-100 z-30">
              <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
                <div className="flex flex-col">
                   <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Trạng thái lưu</span>
                   <div className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      {draftStatus === "saved" ? (
                         <><span className="block w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span> Đã lưu nháp</>
                      ) : (
                         <><span className="block w-2 h-2 bg-gray-300 rounded-full animate-pulse"></span> Đang đồng bộ...</>
                      )}
                   </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="ghost" onClick={onFormClose} disabled={isSubmitting} className="hover:bg-gray-50 text-gray-600 font-medium">
                    Để sau
                  </Button>
                  <Button 
                    onClick={handleNext} 
                    disabled={isSubmitting}
                    className="bg-gray-900 hover:bg-black text-white shadow-xl shadow-gray-900/20 min-w-[200px] h-12 rounded-xl text-base font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {isSubmitting ? (
                      <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Đang xử lý...</>
                    ) : (
                      <>Đăng bán sản phẩm <Save className="w-5 h-5 ml-2" /></>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </Form>
  );
}