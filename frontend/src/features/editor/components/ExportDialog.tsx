// frontend/src/features/editor/components/ExportDialog.tsx
// ✅ EXPORT DIALOG - Advanced export options

import React, { useState } from "react";
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
import { Slider } from "@/shared/components/ui/slider";
import { Input } from "@/shared/components/ui/input";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Separator } from "@/shared/components/ui/separator";
import { toast } from "sonner";
import { Download, Loader2, FileImage, FileType, FileCode } from "lucide-react";

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  editorRef: React.RefObject<any>;
}

type ExportFormat = "png" | "jpg" | "svg" | "pdf";

interface ExportOptions {
  format: ExportFormat;
  quality: number;
  width?: number;
  height?: number;
  includeBackground: boolean;
  scale: number;
}

export const ExportDialog: React.FC<ExportDialogProps> = ({
  isOpen,
  onClose,
  editorRef,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [options, setOptions] = useState<ExportOptions>({
    format: "png",
    quality: 1,
    width: undefined,
    height: undefined,
    includeBackground: true,
    scale: 1,
  });

  const formatOptions = [
    {
      value: "png",
      label: "PNG",
      description: "Best for web, supports transparency",
      icon: <FileImage size={20} />,
    },
    {
      value: "jpg",
      label: "JPG",
      description: "Smaller file size, no transparency",
      icon: <FileImage size={20} />,
    },
    {
      value: "svg",
      label: "SVG",
      description: "Vector format, infinite scalability",
      icon: <FileCode size={20} />,
    },
    {
      value: "pdf",
      label: "PDF",
      description: "Print-ready format",
      icon: <FileType size={20} />,
    },
  ];

  const handleExport = async () => {
    const canvas = editorRef.current?.getCanvas?.();
    if (!canvas) {
      toast.error("Canvas not found");
      return;
    }

    setIsExporting(true);

    try {
      let blob: Blob | null = null;
      let filename = `design.${options.format}`;

      switch (options.format) {
        case "png":
          blob = await canvas.toBlob({
            format: "png",
            quality: options.quality,
            multiplier: options.scale,
          });
          break;

        case "jpg":
          blob = await canvas.toBlob({
            format: "jpeg",
            quality: options.quality,
            multiplier: options.scale,
          });
          break;

        case "svg":
          const svgString = canvas.toSVG({
            width: options.width,
            height: options.height,
          });
          blob = new Blob([svgString], { type: "image/svg+xml" });
          break;

        case "pdf":
          // For PDF export, we'll use jsPDF
          // You'll need to install: npm install jspdf
          try {
            const { jsPDF } = await import("jspdf");
            const pdf = new jsPDF({
              orientation:
                canvas.width > canvas.height ? "landscape" : "portrait",
              unit: "px",
              format: [canvas.width, canvas.height],
            });

            const imgData = canvas.toDataURL("image/png", options.quality);
            pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
            pdf.save(filename);

            setIsExporting(false);
            toast.success("PDF exported successfully!");
            onClose();
            return;
          } catch (error) {
            throw new Error("jsPDF not installed. Run: npm install jspdf");
          }
      }

      if (!blob) {
        throw new Error("Failed to create blob");
      }

      // Download file
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);

      setIsExporting(false);
      toast.success(
        `Exported as ${options.format.toUpperCase()} successfully!`
      );
      onClose();
    } catch (error: any) {
      console.error("Export error:", error);
      toast.error(error.message || "Failed to export");
      setIsExporting(false);
    }
  };

  const estimatedFileSize = () => {
    const canvas = editorRef.current?.getCanvas?.();
    if (!canvas) return "Unknown";

    const baseSize =
      canvas.width * canvas.height * options.scale * options.scale;
    let sizeInKB = 0;

    switch (options.format) {
      case "png":
        sizeInKB = (baseSize * 4 * options.quality) / 1024; // 4 bytes per pixel
        break;
      case "jpg":
        sizeInKB = (baseSize * 0.5 * options.quality) / 1024; // JPEG compression
        break;
      case "svg":
        sizeInKB = 50; // SVG is text-based, usually small
        break;
      case "pdf":
        sizeInKB = (baseSize * 0.3) / 1024;
        break;
    }

    if (sizeInKB > 1024) {
      return `~${(sizeInKB / 1024).toFixed(2)} MB`;
    }
    return `~${sizeInKB.toFixed(0)} KB`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download size={20} />
            Export Design
          </DialogTitle>
          <DialogDescription>
            Choose your export format and customize the output settings
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Format Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Format</Label>
            <RadioGroup
              value={options.format}
              onValueChange={(value) =>
                setOptions({ ...options, format: value as ExportFormat })
              }
            >
              {formatOptions.map((format) => (
                <div
                  key={format.value}
                  className="flex items-start space-x-3 border rounded-lg p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() =>
                    setOptions({
                      ...options,
                      format: format.value as ExportFormat,
                    })
                  }
                >
                  <RadioGroupItem value={format.value} id={format.value} />
                  <div className="flex-1">
                    <Label
                      htmlFor={format.value}
                      className="flex items-center gap-2 font-medium cursor-pointer"
                    >
                      {format.icon}
                      {format.label}
                    </Label>
                    <p className="text-xs text-gray-500 mt-1">
                      {format.description}
                    </p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>

          <Separator />

          {/* Quality (for PNG/JPG) */}
          {(options.format === "png" || options.format === "jpg") && (
            <div className="space-y-2">
              <Label className="text-sm font-semibold">
                Quality ({Math.round(options.quality * 100)}%)
              </Label>
              <Slider
                value={[options.quality]}
                onValueChange={(value) =>
                  setOptions({ ...options, quality: value[0] })
                }
                min={0.1}
                max={1}
                step={0.1}
              />
              <p className="text-xs text-gray-500">
                Higher quality = larger file size
              </p>
            </div>
          )}

          {/* Scale */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">
              Scale ({options.scale}x)
            </Label>
            <Slider
              value={[options.scale]}
              onValueChange={(value) =>
                setOptions({ ...options, scale: value[0] })
              }
              min={0.5}
              max={4}
              step={0.5}
            />
            <p className="text-xs text-gray-500">
              Export at {options.scale}x the original canvas size
            </p>
          </div>

          {/* Custom Dimensions */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">
              Custom Dimensions (optional)
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="width" className="text-xs">
                  Width (px)
                </Label>
                <Input
                  id="width"
                  type="number"
                  placeholder="Auto"
                  value={options.width || ""}
                  onChange={(e) =>
                    setOptions({
                      ...options,
                      width: e.target.value
                        ? parseInt(e.target.value)
                        : undefined,
                    })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="height" className="text-xs">
                  Height (px)
                </Label>
                <Input
                  id="height"
                  type="number"
                  placeholder="Auto"
                  value={options.height || ""}
                  onChange={(e) =>
                    setOptions({
                      ...options,
                      height: e.target.value
                        ? parseInt(e.target.value)
                        : undefined,
                    })
                  }
                />
              </div>
            </div>
          </div>

          {/* Background Option */}
          {options.format === "png" && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeBackground"
                checked={options.includeBackground}
                onCheckedChange={(checked) =>
                  setOptions({
                    ...options,
                    includeBackground: checked as boolean,
                  })
                }
              />
              <Label
                htmlFor="includeBackground"
                className="text-sm cursor-pointer"
              >
                Include canvas background
              </Label>
            </div>
          )}

          <Separator />

          {/* File Size Estimate */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-600">Estimated file size:</span>
            <span className="text-sm font-semibold">{estimatedFileSize()}</span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isExporting}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
