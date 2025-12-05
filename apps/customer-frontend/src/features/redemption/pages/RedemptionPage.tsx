// src/features/redemption/pages/RedemptionPage.tsx
// ✅ SOLID Refactored - Compose components only

import { useParams, useNavigate } from "react-router-dom";
import { useRedemption } from "../hooks/useRedemption";
import {
  RedemptionHeader,
  ItemsSelectionStep,
  RecipientInfoStep,
  SuccessScreen,
  ErrorScreen,
  LoadingScreen,
} from "../components";

export default function RedemptionPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const {
    loading,
    submitting,
    error,
    link,
    step,
    selections,
    formData,
    updateSelection,
    updateFormData,
    submit,
    goToStep,
  } = useRedemption(token);

  // Loading state
  if (loading) {
    return <LoadingScreen />;
  }

  // Error state (no link loaded)
  if (error && !link) {
    return <ErrorScreen error={error} onGoHome={() => navigate("/")} />;
  }

  // No link
  if (!link) return null;

  // Success state
  if (step === "success") {
    return <SuccessScreen link={link} />;
  }

  // Main redemption flow
  return (
    <div className="min-h-screen bg-gray-50">
      <RedemptionHeader link={link} />

      <div className="max-w-2xl mx-auto p-4 -mt-4">
        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Step: Items Selection */}
        {step === "items" && (
          <ItemsSelectionStep
            items={link.items}
            selections={selections}
            primaryColor={link.branding.primaryColor}
            onSelectionChange={updateSelection}
            onNext={() => goToStep("info")}
          />
        )}

        {/* Step: Recipient Info */}
        {step === "info" && (
          <RecipientInfoStep
            link={link}
            formData={formData}
            submitting={submitting}
            onFormChange={updateFormData}
            onBack={() => goToStep("items")}
            onSubmit={submit}
          />
        )}
      </div>
    </div>
  );
}
