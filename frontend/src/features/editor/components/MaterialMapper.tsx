// frontend/src/features/editor/components/MaterialMapper.tsx
// 🔥 UI: Manually map materials giữa canvas và 3D model

import React, { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Badge } from "@/shared/components/ui/badge";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { extractMaterialNames } from "../utils/materialDebug";

interface MaterialMapperProps {
  isOpen: boolean;
  onClose: () => void;
  modelUrl: string;
  surfaceName: string;
  currentMaterialName: string;
  onMaterialNameChange: (newMaterialName: string) => void;
}

export const MaterialMapper: React.FC<MaterialMapperProps> = ({
  isOpen,
  onClose,
  modelUrl,
  surfaceName,
  currentMaterialName,
  onMaterialNameChange,
}) => {
  const [modelMaterials, setModelMaterials] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMaterial, setSelectedMaterial] = useState(currentMaterialName);

  useEffect(() => {
    if (!isOpen) return;

    const loadMaterials = async () => {
      setLoading(true);
      try {
        const materials = await extractMaterialNames(modelUrl);
        setModelMaterials(materials);
      } catch (error) {
        console.error("Failed to load materials:", error);
      } finally {
        setLoading(false);
      }
    };

    loadMaterials();
  }, [isOpen, modelUrl]);

  const handleSave = () => {
    onMaterialNameChange(selectedMaterial);
    onClose();
  };

  const isMatched = modelMaterials.includes(currentMaterialName);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Material Mapping
            {isMatched ? (
              <CheckCircle2 size={20} className="text-green-500" />
            ) : (
              <AlertCircle size={20} className="text-yellow-500" />
            )}
          </DialogTitle>
          <DialogDescription>
            Map canvas surface "{surfaceName}" to 3D model material
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Current Status */}
          <div className="p-3 bg-gray-50 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Surface Name:</span>
              <Badge variant="outline">{surfaceName}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Current Material:</span>
              <Badge variant={isMatched ? "default" : "destructive"}>
                {currentMaterialName}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Status:</span>
              {isMatched ? (
                <span className="text-sm text-green-600 font-medium">
                  ✓ Matched
                </span>
              ) : (
                <span className="text-sm text-red-600 font-medium">
                  ✗ Not Found
                </span>
              )}
            </div>
          </div>

          {/* Material Selector */}
          <div className="space-y-2">
            <Label htmlFor="material-select">
              Select Material from 3D Model:
            </Label>
            {loading ? (
              <div className="text-sm text-gray-500">Loading materials...</div>
            ) : modelMaterials.length === 0 ? (
              <div className="text-sm text-red-500">
                ⚠️ No materials found in model
              </div>
            ) : (
              <Select
                value={selectedMaterial}
                onValueChange={setSelectedMaterial}
              >
                <SelectTrigger id="material-select">
                  <SelectValue placeholder="Choose material..." />
                </SelectTrigger>
                <SelectContent>
                  {modelMaterials.map((mat) => (
                    <SelectItem key={mat} value={mat}>
                      <div className="flex items-center gap-2">
                        {mat}
                        {mat === currentMaterialName && (
                          <Badge variant="secondary" className="text-xs">
                            Current
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Available Materials List */}
          {!loading && modelMaterials.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs">Available Materials:</Label>
              <div className="max-h-32 overflow-y-auto space-y-1 text-xs">
                {modelMaterials.map((mat, idx) => (
                  <div
                    key={mat}
                    className="flex items-center gap-2 p-1 bg-gray-50 rounded"
                  >
                    <span className="text-gray-400">{idx + 1}.</span>
                    <span className="font-mono flex-1">{mat}</span>
                    {mat === selectedMaterial && (
                      <CheckCircle2 size={14} className="text-green-500" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading || !selectedMaterial}>
            Save Mapping
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
