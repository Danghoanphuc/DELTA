// src/features/shop/components/DesignMethodModal.tsx

import React, { useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/shared/components/ui/dialog";
import { Card } from "@/shared/components/ui/card";
import { Upload, LayoutTemplate, PenTool } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface DesignMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadDesign: (file: File) => void;
  onBrowseTemplates: () => void;
  onDesignFromScratch: () => void;
}

interface DesignOptionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  className?: string;
}

const DesignOptionCard = ({
  icon,
  title,
  description,
  onClick,
  className,
}: DesignOptionCardProps) => {
  return (
    <Card
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 hover:border-blue-500 border-2 p-6",
        "group relative overflow-hidden",
        className
      )}
      onClick={onClick}
    >
      {/* Hover gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="relative flex flex-col items-center text-center space-y-4">
        {/* Icon */}
        <div className="p-4 rounded-full bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
          {icon}
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
          {title}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 leading-relaxed">
          {description}
        </p>
      </div>
    </Card>
  );
};

export const DesignMethodModal = ({
  isOpen,
  onClose,
  onUploadDesign,
  onBrowseTemplates,
  onDesignFromScratch,
}: DesignMethodModalProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    // Trigger file picker
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onUploadDesign(file);
      onClose();
    }
  };

  return (
    <>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf,.ai,.psd"
        className="hidden"
        onChange={handleFileChange}
      />

      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">
              Chọn phương thức thiết kế
            </DialogTitle>
            <DialogDescription className="text-center text-base">
              Hãy chọn cách bạn muốn bắt đầu thiết kế sản phẩm của mình
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            {/* Option 1: Upload Design */}
            <DesignOptionCard
              icon={<Upload className="h-8 w-8" />}
              title="Tải lên thiết kế"
              description="Tải lên file thiết kế có sẵn của bạn (PNG, JPG, PDF, AI, PSD)"
              onClick={handleUploadClick}
            />

            {/* Option 2: Browse Templates */}
            <DesignOptionCard
              icon={<LayoutTemplate className="h-8 w-8" />}
              title="Chọn mẫu có sẵn"
              description="Khám phá thư viện mẫu thiết kế được tạo sẵn theo từng danh mục"
              onClick={() => {
                onBrowseTemplates();
                onClose();
              }}
            />

            {/* Option 3: Design from Scratch */}
            <DesignOptionCard
              icon={<PenTool className="h-8 w-8" />}
              title="Tự thiết kế"
              description="Bắt đầu từ đầu với canvas trắng và công cụ thiết kế 3D"
              onClick={() => {
                onDesignFromScratch();
                onClose();
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

