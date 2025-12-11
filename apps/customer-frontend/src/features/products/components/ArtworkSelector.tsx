// features/products/components/ArtworkSelector.tsx
/**
 * Component for uploading or selecting artwork
 * Phase 3.3.1 - Task: Upload/select artwork
 * Integrates with Phase 2 Artwork Management
 */

import React, { useState } from "react";
import { Label } from "@/shared/components/ui/label";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Upload, Image as ImageIcon, Check } from "lucide-react";
import { PrintArea } from "../types/customization.types";

interface Artwork {
  _id: string;
  fileName: string;
  thumbnailUrl: string;
  fileUrl: string;
  dimensions: {
    width: number;
    height: number;
    unit: string;
  };
  resolution: number;
}

interface ArtworkSelectorProps {
  printAreas: PrintArea[];
  artworks: Artwork[];
  onArtworkSelect: (areaName: string, artworkId: string) => void;
  onUploadClick: () => void;
  disabled?: boolean;
}

export const ArtworkSelector: React.FC<ArtworkSelectorProps> = ({
  printAreas,
  artworks,
  onArtworkSelect,
  onUploadClick,
  disabled = false,
}) => {
  const [selectedArea, setSelectedArea] = useState<string | null>(
    printAreas[0]?.area || null
  );

  if (printAreas.length === 0) {
    return null;
  }

  const currentArea = printAreas.find((a) => a.area === selectedArea);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Chọn artwork</h3>

      {/* Area Tabs */}
      <div className="flex gap-2 flex-wrap">
        {printAreas.map((area) => (
          <Button
            key={area.area}
            variant={selectedArea === area.area ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedArea(area.area)}
            disabled={disabled}
          >
            {area.area}
            {area.artworkId && <Check size={14} className="ml-1" />}
          </Button>
        ))}
      </div>

      {/* Upload Button */}
      <Button
        variant="outline"
        className="w-full"
        onClick={onUploadClick}
        disabled={disabled}
      >
        <Upload size={16} className="mr-2" />
        Tải lên artwork mới
      </Button>

      {/* Artwork Library */}
      {artworks.length > 0 && (
        <div>
          <Label className="font-medium mb-2 block">
            Hoặc chọn từ thư viện
          </Label>
          <div className="grid grid-cols-3 gap-3 max-h-64 overflow-y-auto">
            {artworks.map((artwork) => (
              <Card
                key={artwork._id}
                className={`cursor-pointer hover:border-blue-500 transition-colors ${
                  currentArea?.artworkId === artwork._id
                    ? "border-blue-500 border-2"
                    : ""
                }`}
                onClick={() =>
                  selectedArea && onArtworkSelect(selectedArea, artwork._id)
                }
              >
                <CardContent className="p-2">
                  <div className="aspect-square bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                    {artwork.thumbnailUrl ? (
                      <img
                        src={artwork.thumbnailUrl}
                        alt={artwork.fileName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon size={32} className="text-gray-400" />
                    )}
                  </div>
                  <p className="text-xs mt-1 truncate">{artwork.fileName}</p>
                  <p className="text-xs text-gray-500">
                    {artwork.dimensions.width}x{artwork.dimensions.height}
                    {artwork.dimensions.unit} @ {artwork.resolution}DPI
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {artworks.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-4">
          Chưa có artwork nào. Vui lòng tải lên artwork mới.
        </p>
      )}
    </div>
  );
};
