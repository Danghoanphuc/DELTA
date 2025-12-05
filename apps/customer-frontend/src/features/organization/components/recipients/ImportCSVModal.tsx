// src/features/organization/components/recipients/ImportCSVModal.tsx
// ✅ SOLID: Single Responsibility - CSV import only

import { useState } from "react";
import { FileSpreadsheet, Download, Loader2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";

interface ImportCSVModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (file: File) => Promise<void>;
  onDownloadTemplate: () => void;
}

export function ImportCSVModal({
  open,
  onOpenChange,
  onImport,
  onDownloadTemplate,
}: ImportCSVModalProps) {
  const [isImporting, setIsImporting] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      await onImport(file);
      onOpenChange(false);
    } catch (error) {
      // Error handled by parent
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import từ CSV</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
            {isImporting ? (
              <div className="flex flex-col items-center">
                <Loader2 className="w-12 h-12 animate-spin text-orange-500 mb-4" />
                <p className="text-gray-600">Đang import...</p>
              </div>
            ) : (
              <>
                <FileSpreadsheet className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 mb-4">
                  Kéo thả file CSV hoặc click để chọn
                </p>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="csv-upload"
                />
                <label htmlFor="csv-upload">
                  <Button variant="outline" asChild>
                    <span>Chọn file CSV</span>
                  </Button>
                </label>
              </>
            )}
          </div>
          <Button
            variant="link"
            onClick={onDownloadTemplate}
            className="w-full"
          >
            <Download className="w-4 h-4 mr-2" />
            Tải template CSV mẫu
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
