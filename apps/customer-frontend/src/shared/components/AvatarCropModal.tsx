// src/shared/components/AvatarCropModal.tsx
// ✅ Simple Avatar Preview Modal (no external dependencies)

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Loader2 } from "lucide-react";

export interface AvatarCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  onCropComplete?: (croppedImage: Blob) => void;
  onSave?: (file: File) => Promise<void>;
}

export function AvatarCropModal({
  isOpen,
  onClose,
  imageSrc,
  onCropComplete,
  onSave,
}: AvatarCropModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSave = async () => {
    setIsProcessing(true);
    try {
      // Convert image to blob
      const response = await fetch(imageSrc);
      const blob = await response.blob();

      if (onSave) {
        // Convert blob to File for onSave callback
        const file = new File([blob], "avatar.jpg", { type: blob.type });
        await onSave(file);
      } else if (onCropComplete) {
        onCropComplete(blob);
      }
      onClose();
    } catch (error) {
      console.error("Error processing image:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Xác nhận ảnh đại diện</DialogTitle>
        </DialogHeader>

        <div className="flex justify-center p-4">
          <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-orange-200">
            <img
              src={imageSrc}
              alt="Avatar preview"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <p className="text-center text-sm text-gray-500">
          Ảnh sẽ được sử dụng làm ảnh đại diện của bạn
        </p>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button onClick={handleSave} disabled={isProcessing}>
            {isProcessing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Sử dụng ảnh này
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AvatarCropModal;
