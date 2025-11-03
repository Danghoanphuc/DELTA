// frontend/src/features/editor/components/ExportDialog.tsx
// ✅ ĐÃ SỬA LỖI TYPO: onValueValueChange -> onValueChange

import React, { useState } from "react";
// ... (imports giữ nguyên) ...
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group";
import { toast } from "sonner";
import { Download, Loader2, FileImage, FileCode } from "lucide-react";
import { EditorCanvasRef } from "./EditorCanvas";

// ... (Interface và type giữ nguyên) ...
interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  editorRef: React.RefObject<EditorCanvasRef | null>;
}
type ExportFormat = "png" | "jpg" | "svg";

export const ExportDialog: React.FC<ExportDialogProps> = ({
  isOpen,
  onClose,
  editorRef,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [format, setFormat] = useState<ExportFormat>("png");

  const formatOptions = [
    {
      value: "png",
      label: "PNG",
      description: "Tốt nhất cho web, hỗ trợ trong suốt",
      icon: <FileImage size={20} />,
    },
    {
      value: "jpg",
      label: "JPG",
      description: "Kích thước nhỏ, không trong suốt",
      icon: <FileImage size={20} />,
    },
    {
      value: "svg",
      label: "SVG",
      description: "Vector, có thể phóng to vô hạn",
      icon: <FileCode size={20} />,
    },
  ];

  const handleExport = async () => {
    // ... (logic export giữ nguyên) ...
    const editor = editorRef.current;
    if (!editor) {
      toast.error("Editor không tìm thấy");
      return;
    }
    setIsExporting(true);
    try {
      await editor.exportCanvas(format);
      toast.success(`Xuất file ${format.toUpperCase()} thành công!`);
      onClose();
    } catch (error: any) {
      console.error("Lỗi xuất file:", error);
      toast.error(error.message || "Xuất file thất bại");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        {/* ... (Header giữ nguyên) ... */}
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download size={20} />
            Xuất file thiết kế
          </DialogTitle>
          <DialogDescription>Chọn định dạng bạn muốn xuất</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Định dạng</Label>
            <RadioGroup
              value={format}
              // ✅ SỬA LỖI TYPO TẠI ĐÂY
              onValueChange={(value) => setFormat(value as ExportFormat)}
            >
              {formatOptions.map((f) => (
                <div
                  key={f.value}
                  className="flex items-start space-x-3 border rounded-lg p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                  // Bỏ onClick ở đây vì RadioGroup đã xử lý
                >
                  <RadioGroupItem value={f.value} id={f.value} />
                  <div className="flex-1">
                    <Label
                      htmlFor={f.value}
                      className="flex items-center gap-2 font-medium cursor-pointer"
                    >
                      {f.icon}
                      {f.label}
                    </Label>
                    <p className="text-xs text-gray-500 mt-1">
                      {f.description}
                    </p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>

        {/* ... (Footer giữ nguyên) ... */}
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isExporting}>
            Hủy
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang xuất...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Xuất file
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
