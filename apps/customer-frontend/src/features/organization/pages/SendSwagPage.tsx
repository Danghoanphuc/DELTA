// src/features/organization/pages/SendSwagPage.tsx
// ✅ SOLID Refactored - Compose components only

import {
  Send,
  ChevronRight,
  ChevronLeft,
  CreditCard,
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";

import { useSendSwag } from "../hooks/useSendSwag";
import {
  StepProgress,
  PackSelector,
  RecipientSelector,
  ShippingSettings,
  OrderReview,
} from "../components/send-swag";

export function SendSwagPage() {
  const {
    currentStep,
    isLoading,
    isSubmitting,
    packs,
    recipients,
    state,
    selectPack,
    toggleRecipient,
    toggleAllRecipients,
    updateSettings,
    calculatePricing,
    canGoNext,
    goNext,
    goBack,
    submitOrder,
  } = useSendSwag();

  const pricing = calculatePricing();

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="p-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Send className="w-6 h-6 text-orange-500" />
            Gửi quà
          </h1>
          <p className="text-gray-600">
            Chọn bộ quà và người nhận để bắt đầu gửi
          </p>
        </div>

        {/* Progress Steps */}
        <StepProgress currentStep={currentStep} />

        {/* Step Content */}
        <Card className="border-none shadow-sm mb-6">
          <CardContent className="p-6">
            {currentStep === 1 && (
              <PackSelector
                packs={packs}
                selectedPack={state.selectedPack}
                onSelect={selectPack}
                isLoading={isLoading}
              />
            )}

            {currentStep === 2 && (
              <RecipientSelector
                recipients={recipients}
                selectedIds={state.selectedRecipientIds}
                onToggle={toggleRecipient}
                onToggleAll={toggleAllRecipients}
                isLoading={isLoading}
              />
            )}

            {currentStep === 3 && (
              <ShippingSettings state={state} onUpdate={updateSettings} />
            )}

            {currentStep === 4 && (
              <OrderReview state={state} pricing={pricing} />
            )}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={goBack}
            disabled={currentStep === 1}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>

          {currentStep < 4 ? (
            <Button
              onClick={goNext}
              disabled={!canGoNext()}
              className="bg-orange-500 hover:bg-orange-600"
            >
              Tiếp tục
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={submitOrder}
              disabled={isSubmitting}
              className="bg-orange-500 hover:bg-orange-600"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <CreditCard className="w-4 h-4 mr-2" />
              )}
              Xác nhận & Thanh toán
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default SendSwagPage;
