// src/features/organization/components/send-swag/StepProgress.tsx
// ✅ SOLID: Single Responsibility - Progress indicator only

import { Package, Users, Truck, CreditCard, Check } from "lucide-react";

const STEPS = [
  { id: 1, title: "Chọn bộ quà", icon: Package },
  { id: 2, title: "Chọn người nhận", icon: Users },
  { id: 3, title: "Cài đặt gửi", icon: Truck },
  { id: 4, title: "Xác nhận & Thanh toán", icon: CreditCard },
];

interface StepProgressProps {
  currentStep: number;
}

export function StepProgress({ currentStep }: StepProgressProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {STEPS.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div
              className={`flex items-center gap-2 ${
                currentStep >= step.id ? "text-orange-600" : "text-gray-400"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  currentStep > step.id
                    ? "bg-orange-500 text-white"
                    : currentStep === step.id
                    ? "bg-orange-100 text-orange-600 border-2 border-orange-500"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {currentStep > step.id ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <step.icon className="w-5 h-5" />
                )}
              </div>
              <span className="hidden md:block font-medium">{step.title}</span>
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={`w-12 md:w-24 h-1 mx-2 ${
                  currentStep > step.id ? "bg-orange-500" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
