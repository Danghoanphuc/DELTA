// src/features/printer/components/product-wizard/WizardHeader.tsx
import { Button } from "@/shared/components/ui/button";
import { ArrowLeft, X } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface WizardHeaderProps {
  currentStep: number;
  totalSteps: number;
  title: string;
  onBack: () => void;
  onClose: () => void;
}

export function WizardHeader({ currentStep, totalSteps, title, onBack, onClose }: WizardHeaderProps) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="flex-shrink-0 bg-white border-b border-gray-100 px-6 py-4">
      {/* Top Row: Navigation */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onBack} 
            className="h-8 w-8 hover:bg-gray-100 rounded-full text-gray-500"
            disabled={currentStep === 1}
          >
            <ArrowLeft size={18} />
          </Button>
          <div>
            <h2 className="text-lg font-bold text-gray-900 leading-tight">{title}</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Bước {currentStep} trên {totalSteps}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full">
          <X size={20} />
        </Button>
      </div>

      {/* Bottom Row: Progress Bar */}
      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500 ease-out rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}