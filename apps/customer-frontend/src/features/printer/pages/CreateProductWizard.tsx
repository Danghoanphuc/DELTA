// src/features/printer/pages/CreateProductWizard.tsx
// ✨ SMART PIPELINE: Using useSmartWizard with auto-save + new components

// ✨ CHANGED: useCreateProductWizard -> useSmartWizard
import { useSmartWizard } from "@/features/printer/hooks/useSmartWizard";
import { Form } from "@/shared/components/ui/form";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/shared/components/ui/card";
import { ArrowLeft, Loader2, Save, CheckCircle2 } from "lucide-react";
import { NativeScrollArea as ScrollArea } from "@/shared/components/ui/NativeScrollArea";

// Import các component con
import { ProductWizardStepper } from "@/features/printer/components/product-wizard/ProductWizardStepper";
import { ProductWizardPreview } from "@/features/printer/components/product-wizard/ProductWizardPreview";
// ✨ CHANGED: Step1_SelectAsset -> Step1_SelectAsset_New (infinite scroll)
import { Step1_SelectAsset_New } from "@/features/printer/components/product-wizard/steps/Step1_SelectAsset_New";
import { Step2_GeneralInfo } from "@/features/printer/components/product-wizard/steps/Step2_GeneralInfo";
// ✨ CHANGED: Step3_Images -> Step3_Images_New (async upload with URLs)
import { Step3_Images_New } from "@/features/printer/components/product-wizard/steps/Step3_Images_New";
import { Step4_Pricing } from "@/features/printer/components/product-wizard/steps/Step4_Pricing";
import { Step5_Publish } from "@/features/printer/components/product-wizard/steps/Step5_Publish";

interface CreateProductWizardProps {
  productId?: string;
  onFormClose: () => void;
  onSuccess: () => void;
}

export function CreateProductWizard({
  productId,
  onFormClose,
  onSuccess,
}: CreateProductWizardProps) {
  // ✨ SMART PIPELINE: Using useSmartWizard instead of useCreateProductWizard
  const {
    form,
    isLoading,
    isSubmitting,
    draftStatus, // ✨ NEW: Draft status indicator
    activeStep,
    setActiveStep,
    privateAssets,
    publicAssets,
    selectedAsset,
    pricingFields,
    addPricingTier,
    removePricingTier,
    validateAndGoToStep,
    onSubmit,
    onError,
  } = useSmartWizard(productId, onSuccess);

  const { handleSubmit, control } = form;
  // Keep watching images to avoid stale references during render cycles
  const watchedImages = form.watch("images");
  void watchedImages;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12 h-full">
        <Loader2 className="animate-spin" />
        <p className="ml-2">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(onSubmit, onError)}
        className="flex flex-col h-full"
      >
        {/* ✨ SMART PIPELINE: Header with draft status */}
        <Card className="rounded-none border-t-0 border-x-0 sticky top-0 z-30 bg-white">
          <CardHeader className="flex flex-row items-center gap-2 space-y-0 p-4 border-b">
            <Button variant="ghost" size="icon" onClick={onFormClose}>
              <ArrowLeft />
            </Button>
            <Button variant="outline" size="sm" onClick={onFormClose}>
              Quay lại trang Sản phẩm
            </Button>
            <CardTitle className="text-lg font-semibold ml-4">
              {productId ? "Chỉnh sửa sản phẩm" : "Đăng bán sản phẩm mới"}
            </CardTitle>
            {/* ✨ Draft Status Indicator */}
            <div className="ml-auto flex items-center gap-2">
              {draftStatus === "saving" && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Đang lưu...</span>
                </div>
              )}
              {draftStatus === "saved" && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Đã lưu nháp</span>
                </div>
              )}
              {draftStatus === "error" && (
                <div className="flex items-center gap-2 text-sm text-red-600">
                  <span>Lỗi lưu nháp</span>
                </div>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* Body Layout */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 overflow-hidden">
          {/* Cột Trái (1/3): 3D Preview */}
          <div className="lg:col-span-1 h-full">
            <ProductWizardPreview asset={selectedAsset} />
          </div>

          {/* Cột Phải (2/3): Form Steps + Stepper */}
          <div className="lg:col-span-2 flex gap-6 overflow-hidden">
            {/* Form Steps (Scrollable) */}
            <ScrollArea className="flex-1 h-full pr-4">
              <div className="space-y-6">
                {/* ✨ SMART PIPELINE: Using Step1_SelectAsset_New with infinite scroll */}
                <Step1_SelectAsset_New
                  control={control}
                  isExpanded={activeStep === 1}
                  onExpand={() => setActiveStep(1)}
                />

                <Step2_GeneralInfo
                  control={control}
                  isExpanded={activeStep === 2}
                  onExpand={() => setActiveStep(2)}
                  onValidate={() =>
                    validateAndGoToStep(3, ["name", "categoryDisplay"])
                  }
                />

                {/* ✨ SMART PIPELINE: Using Step3_Images_New with async upload */}
                <Step3_Images_New
                  control={control}
                  isExpanded={activeStep === 3}
                  onExpand={() => setActiveStep(3)}
                  onValidate={() => validateAndGoToStep(4, ["images"])}
                />

                {/* ✅ SỬA: Đổi thành Bước 4 */}
                <Step4_Pricing
                  control={control}
                  fields={pricingFields}
                  append={addPricingTier}
                  remove={removePricingTier}
                  isExpanded={activeStep === 4}
                  onExpand={() => setActiveStep(4)}
                  onValidate={() => validateAndGoToStep(5, ["pricing"])}
                />

                {/* ✅ SỬA: Đổi thành Bước 5 */}
                <Step5_Publish
                  control={control}
                  isExpanded={activeStep === 5}
                  onExpand={() => setActiveStep(5)}
                />
              </div>
            </ScrollArea>

            {/* Stepper */}
            <div className="hidden xl:block w-48">
              <ProductWizardStepper activeStep={activeStep} />
            </div>
          </div>
        </div>

        {/* Footer Actions (giữ nguyên) */}
        <div className="flex justify-end gap-4 p-4 border-t bg-white sticky bottom-0 z-30">
          <Button
            type="button"
            variant="outline"
            onClick={onFormClose}
            disabled={isSubmitting}
          >
            Hủy
          </Button>
          <Button
            size="lg"
            type="submit"
            className="bg-gradient-to-r from-orange-400 to-red-500"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 size={18} className="animate-spin mr-2" />
            ) : (
              <Save size={18} className="mr-2" />
            )}
            {productId ? "Lưu Cập Nhật" : "Đăng bán sản phẩm"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
