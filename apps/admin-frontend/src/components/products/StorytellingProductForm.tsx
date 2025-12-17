// apps/admin-frontend/src/components/products/StorytellingProductForm.tsx
// Clean, wizard-style product form for storytelling structure

import { useState } from "react";
import { Save, X, ChevronRight, ChevronLeft } from "lucide-react";
import {
  StorytellingProductFormData,
  INITIAL_FORM_DATA,
} from "../../types/storytelling-product";

// Section components (will create next)
import { BasicInfoSection } from "./form-sections/BasicInfoSection";
import { HeroSection } from "./form-sections/HeroSection";
import { IntroductionSection } from "./form-sections/IntroductionSection";
import { StorytellingSection } from "./form-sections/StorytellingSection";
import { GallerySection } from "./form-sections/GallerySection";
import { FengShuiSection } from "./form-sections/FengShuiSection";
import { CustomizationSection } from "./form-sections/CustomizationSection";
import { ArtisanSection } from "./form-sections/ArtisanSection";
import { PricingSection } from "./form-sections/PricingSection";

interface StorytellingProductFormProps {
  initialData?: Partial<StorytellingProductFormData>;
  onSubmit: (data: StorytellingProductFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const SECTIONS = [
  { id: "basic", label: "Thông tin cơ bản", component: BasicInfoSection },
  { id: "hero", label: "Hero & Tagline", component: HeroSection },
  { id: "intro", label: "Giới thiệu", component: IntroductionSection },
  { id: "story", label: "Câu chuyện", component: StorytellingSection },
  { id: "gallery", label: "Thư viện ảnh", component: GallerySection },
  { id: "fengshui", label: "Phong thủy", component: FengShuiSection },
  { id: "custom", label: "Cá nhân hóa", component: CustomizationSection },
  { id: "artisan", label: "Nghệ nhân", component: ArtisanSection },
  { id: "pricing", label: "Giá & Kho", component: PricingSection },
];

export function StorytellingProductForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}: StorytellingProductFormProps) {
  const [formData, setFormData] = useState<StorytellingProductFormData>({
    ...INITIAL_FORM_DATA,
    ...initialData,
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const CurrentSectionComponent = SECTIONS[currentStep].component;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === SECTIONS.length - 1;

  const updateFormData = (updates: Partial<StorytellingProductFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const validateCurrentSection = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Basic validation for first step
    if (currentStep === 0) {
      if (!formData.name.trim()) newErrors.name = "Tên sản phẩm là bắt buộc";
      if (!formData.categoryId) newErrors.categoryId = "Danh mục là bắt buộc";
      if (!formData.sku.trim()) newErrors.sku = "SKU là bắt buộc";
    }

    // Pricing validation for last step
    if (currentStep === SECTIONS.length - 1) {
      if (formData.basePrice <= 0) newErrors.basePrice = "Giá phải lớn hơn 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentSection() && !isLastStep) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateCurrentSection()) {
      await onSubmit(formData);
    }
  };

  const completionPercentage = Math.round(
    ((currentStep + 1) / SECTIONS.length) * 100
  );

  return (
    <div className="max-w-5xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Bước {currentStep + 1} / {SECTIONS.length}
          </span>
          <span className="text-sm font-medium text-orange-600">
            {completionPercentage}% hoàn thành
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-orange-600 transition-all duration-300"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Section Title */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {SECTIONS[currentStep].label}
        </h2>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <CurrentSectionComponent
            formData={formData}
            updateFormData={updateFormData}
            errors={errors}
          />
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 border-t">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              <X className="w-4 h-4 inline mr-2" />
              Hủy
            </button>

            {!isFirstStep && (
              <button
                type="button"
                onClick={handlePrevious}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4 inline mr-2" />
                Quay lại
              </button>
            )}
          </div>

          <div className="flex gap-3">
            {!isLastStep ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700 disabled:opacity-50"
              >
                Tiếp theo
                <ChevronRight className="w-4 h-4 inline ml-2" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <span className="inline-block animate-spin mr-2">⏳</span>
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 inline mr-2" />
                    Lưu sản phẩm
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
