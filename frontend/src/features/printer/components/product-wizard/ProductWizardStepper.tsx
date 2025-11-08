// src/features/printer/components/product-wizard/ProductWizardStepper.tsx
// ✅ SỬA: Thêm bước 3, đổi số bước 4, 5

import { Check } from "lucide-react";

interface StepperProps {
  activeStep: number;
}

// ✅ SỬA: Cập nhật danh sách bước
const steps = [
  { id: 1, name: "Chọn Phôi" },
  { id: 2, name: "Thông tin chung" },
  { id: 3, name: "Upload Ảnh" },
  { id: 4, name: "Cài đặt giá" },
  { id: 5, name: "Đăng bán" },
];

export function ProductWizardStepper({ activeStep }: StepperProps) {
  return (
    <nav className="sticky top-24">
      <ul className="space-y-4">
        {steps.map((step) => {
          const isCompleted = activeStep > step.id;
          const isCurrent = activeStep === step.id;

          return (
            <li key={step.id} className="flex items-center gap-3">
              <span
                className={`flex items-center justify-center w-8 h-8 rounded-full font-bold
                  ${isCompleted ? "bg-green-600 text-white" : ""}
                  ${isCurrent ? "bg-orange-500 text-white" : ""}
                  ${
                    !isCompleted && !isCurrent
                      ? "bg-gray-200 text-gray-600"
                      : ""
                  }
                `}
              >
                {isCompleted ? <Check size={18} /> : step.id}
              </span>
              <span
                className={`font-medium
                  ${isCurrent ? "text-orange-600" : "text-gray-700"}
                  ${!isCompleted && !isCurrent ? "text-gray-500" : ""}
                `}
              >
                {step.name}
              </span>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
