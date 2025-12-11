// apps/admin-frontend/src/components/products/PrintMethodConfig.tsx
// ✅ SOLID: Single Responsibility - Print Method Configuration UI

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

export interface PrintArea {
  name: string;
  maxWidth: number;
  maxHeight: number;
  position: { x: number; y: number };
  allowedColors: number;
  setupFee: number;
  unitCost: number;
}

export interface ArtworkRequirements {
  minResolution: number;
  acceptedFormats: string[];
  colorMode: string;
  maxFileSize: number;
}

export interface PrintMethod {
  method: string;
  areas: PrintArea[];
  artworkRequirements: ArtworkRequirements;
  leadTime: {
    min: number;
    max: number;
    unit: string;
  };
}

interface PrintMethodConfigProps {
  printMethods: PrintMethod[];
  onChange: (printMethods: PrintMethod[]) => void;
}

const PRINT_METHOD_OPTIONS = [
  { value: "screen_print", label: "Screen Print (Lụa)" },
  { value: "dtg", label: "DTG (In kỹ thuật số)" },
  { value: "embroidery", label: "Embroidery (Thêu)" },
  { value: "heat_transfer", label: "Heat Transfer (Ép nhiệt)" },
  { value: "sublimation", label: "Sublimation (Thăng hoa)" },
];

const PRINT_AREA_OPTIONS = [
  { value: "front", label: "Mặt trước" },
  { value: "back", label: "Mặt sau" },
  { value: "left_chest", label: "Ngực trái" },
  { value: "right_chest", label: "Ngực phải" },
  { value: "left_sleeve", label: "Tay trái" },
  { value: "right_sleeve", label: "Tay phải" },
];

const FILE_FORMAT_OPTIONS = ["AI", "EPS", "PDF", "PNG", "SVG", "PSD"];
const COLOR_MODE_OPTIONS = ["CMYK", "RGB", "Pantone"];

export function PrintMethodConfig({
  printMethods,
  onChange,
}: PrintMethodConfigProps) {
  const [expandedMethod, setExpandedMethod] = useState<number | null>(null);
  const [editingArea, setEditingArea] = useState<{
    methodIndex: number;
    areaIndex: number;
  } | null>(null);

  const addPrintMethod = () => {
    const newMethod: PrintMethod = {
      method: "screen_print",
      areas: [],
      artworkRequirements: {
        minResolution: 300,
        acceptedFormats: ["AI", "EPS", "PDF"],
        colorMode: "CMYK",
        maxFileSize: 50,
      },
      leadTime: {
        min: 5,
        max: 7,
        unit: "days",
      },
    };
    onChange([...printMethods, newMethod]);
    setExpandedMethod(printMethods.length);
  };

  const removePrintMethod = (index: number) => {
    onChange(printMethods.filter((_, i) => i !== index));
    if (expandedMethod === index) setExpandedMethod(null);
  };

  const updatePrintMethod = (index: number, updates: Partial<PrintMethod>) => {
    const updated = [...printMethods];
    updated[index] = { ...updated[index], ...updates };
    onChange(updated);
  };

  const addPrintArea = (methodIndex: number) => {
    const newArea: PrintArea = {
      name: "front",
      maxWidth: 300,
      maxHeight: 400,
      position: { x: 0, y: 0 },
      allowedColors: 4,
      setupFee: 500000,
      unitCost: 50000,
    };
    const updated = [...printMethods];
    updated[methodIndex].areas.push(newArea);
    onChange(updated);
  };

  const removePrintArea = (methodIndex: number, areaIndex: number) => {
    const updated = [...printMethods];
    updated[methodIndex].areas = updated[methodIndex].areas.filter(
      (_, i) => i !== areaIndex
    );
    onChange(updated);
    if (
      editingArea?.methodIndex === methodIndex &&
      editingArea?.areaIndex === areaIndex
    ) {
      setEditingArea(null);
    }
  };

  const updatePrintArea = (
    methodIndex: number,
    areaIndex: number,
    updates: Partial<PrintArea>
  ) => {
    const updated = [...printMethods];
    updated[methodIndex].areas[areaIndex] = {
      ...updated[methodIndex].areas[areaIndex],
      ...updates,
    };
    onChange(updated);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Print Methods</h3>
        <button
          type="button"
          onClick={addPrintMethod}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
        >
          <Plus className="w-4 h-4" />
          Thêm Print Method
        </button>
      </div>

      {printMethods.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Chưa có print method nào. Click "Thêm Print Method" để bắt đầu.
        </div>
      )}

      {printMethods.map((method, methodIndex) => (
        <div key={methodIndex} className="border rounded-lg overflow-hidden">
          {/* Method Header */}
          <div
            className="bg-gray-50 p-4 flex items-center justify-between cursor-pointer hover:bg-gray-100"
            onClick={() =>
              setExpandedMethod(
                expandedMethod === methodIndex ? null : methodIndex
              )
            }
          >
            <div className="flex items-center gap-4">
              <span className="font-medium">
                {PRINT_METHOD_OPTIONS.find((o) => o.value === method.method)
                  ?.label || method.method}
              </span>
              <span className="text-sm text-gray-500">
                {method.areas.length} vị trí in
              </span>
              <span className="text-sm text-gray-500">
                Lead time: {method.leadTime.min}-{method.leadTime.max}{" "}
                {method.leadTime.unit}
              </span>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removePrintMethod(methodIndex);
              }}
              className="p-2 text-red-600 hover:bg-red-50 rounded"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Method Details */}
          {expandedMethod === methodIndex && (
            <div className="p-4 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Print Method
                  </label>
                  <select
                    value={method.method}
                    onChange={(e) =>
                      updatePrintMethod(methodIndex, { method: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    {PRINT_METHOD_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Lead Time
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={method.leadTime.min}
                      onChange={(e) =>
                        updatePrintMethod(methodIndex, {
                          leadTime: {
                            ...method.leadTime,
                            min: parseInt(e.target.value) || 0,
                          },
                        })
                      }
                      className="w-20 px-3 py-2 border rounded-lg"
                      placeholder="Min"
                    />
                    <span className="py-2">-</span>
                    <input
                      type="number"
                      value={method.leadTime.max}
                      onChange={(e) =>
                        updatePrintMethod(methodIndex, {
                          leadTime: {
                            ...method.leadTime,
                            max: parseInt(e.target.value) || 0,
                          },
                        })
                      }
                      className="w-20 px-3 py-2 border rounded-lg"
                      placeholder="Max"
                    />
                    <select
                      value={method.leadTime.unit}
                      onChange={(e) =>
                        updatePrintMethod(methodIndex, {
                          leadTime: {
                            ...method.leadTime,
                            unit: e.target.value,
                          },
                        })
                      }
                      className="px-3 py-2 border rounded-lg"
                    >
                      <option value="days">ngày</option>
                      <option value="weeks">tuần</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Artwork Requirements */}
              <div>
                <h4 className="font-medium mb-3">Yêu cầu Artwork</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Resolution tối thiểu (DPI)
                    </label>
                    <input
                      type="number"
                      value={method.artworkRequirements.minResolution}
                      onChange={(e) =>
                        updatePrintMethod(methodIndex, {
                          artworkRequirements: {
                            ...method.artworkRequirements,
                            minResolution: parseInt(e.target.value) || 0,
                          },
                        })
                      }
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      File size tối đa (MB)
                    </label>
                    <input
                      type="number"
                      value={method.artworkRequirements.maxFileSize}
                      onChange={(e) =>
                        updatePrintMethod(methodIndex, {
                          artworkRequirements: {
                            ...method.artworkRequirements,
                            maxFileSize: parseInt(e.target.value) || 0,
                          },
                        })
                      }
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Color Mode
                    </label>
                    <select
                      value={method.artworkRequirements.colorMode}
                      onChange={(e) =>
                        updatePrintMethod(methodIndex, {
                          artworkRequirements: {
                            ...method.artworkRequirements,
                            colorMode: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      {COLOR_MODE_OPTIONS.map((mode) => (
                        <option key={mode} value={mode}>
                          {mode}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      File formats
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {FILE_FORMAT_OPTIONS.map((format) => (
                        <label key={format} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={method.artworkRequirements.acceptedFormats.includes(
                              format
                            )}
                            onChange={(e) => {
                              const formats = e.target.checked
                                ? [
                                    ...method.artworkRequirements
                                      .acceptedFormats,
                                    format,
                                  ]
                                : method.artworkRequirements.acceptedFormats.filter(
                                    (f) => f !== format
                                  );
                              updatePrintMethod(methodIndex, {
                                artworkRequirements: {
                                  ...method.artworkRequirements,
                                  acceptedFormats: formats,
                                },
                              });
                            }}
                            className="rounded"
                          />
                          <span className="text-sm">{format}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Print Areas */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">Vị trí in</h4>
                  <button
                    type="button"
                    onClick={() => addPrintArea(methodIndex)}
                    className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
                  >
                    <Plus className="w-4 h-4" />
                    Thêm vị trí
                  </button>
                </div>

                {method.areas.length === 0 && (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    Chưa có vị trí in nào
                  </div>
                )}

                <div className="space-y-3">
                  {method.areas.map((area, areaIndex) => (
                    <div
                      key={areaIndex}
                      className="border rounded-lg p-4 bg-gray-50"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 grid grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-medium mb-1">
                              Vị trí
                            </label>
                            <select
                              value={area.name}
                              onChange={(e) =>
                                updatePrintArea(methodIndex, areaIndex, {
                                  name: e.target.value,
                                })
                              }
                              className="w-full px-2 py-1 text-sm border rounded"
                            >
                              {PRINT_AREA_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-medium mb-1">
                              Kích thước (mm)
                            </label>
                            <div className="flex gap-1">
                              <input
                                type="number"
                                value={area.maxWidth}
                                onChange={(e) =>
                                  updatePrintArea(methodIndex, areaIndex, {
                                    maxWidth: parseInt(e.target.value) || 0,
                                  })
                                }
                                className="w-full px-2 py-1 text-sm border rounded"
                                placeholder="W"
                              />
                              <span className="py-1">×</span>
                              <input
                                type="number"
                                value={area.maxHeight}
                                onChange={(e) =>
                                  updatePrintArea(methodIndex, areaIndex, {
                                    maxHeight: parseInt(e.target.value) || 0,
                                  })
                                }
                                className="w-full px-2 py-1 text-sm border rounded"
                                placeholder="H"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-medium mb-1">
                              Số màu tối đa
                            </label>
                            <input
                              type="number"
                              value={area.allowedColors}
                              onChange={(e) =>
                                updatePrintArea(methodIndex, areaIndex, {
                                  allowedColors: parseInt(e.target.value) || 0,
                                })
                              }
                              className="w-full px-2 py-1 text-sm border rounded"
                            />
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            removePrintArea(methodIndex, areaIndex)
                          }
                          className="ml-2 p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium mb-1">
                            Setup Fee
                          </label>
                          <input
                            type="number"
                            value={area.setupFee}
                            onChange={(e) =>
                              updatePrintArea(methodIndex, areaIndex, {
                                setupFee: parseInt(e.target.value) || 0,
                              })
                            }
                            className="w-full px-2 py-1 text-sm border rounded"
                          />
                          <span className="text-xs text-gray-500">
                            {formatCurrency(area.setupFee)}
                          </span>
                        </div>

                        <div>
                          <label className="block text-xs font-medium mb-1">
                            Unit Cost
                          </label>
                          <input
                            type="number"
                            value={area.unitCost}
                            onChange={(e) =>
                              updatePrintArea(methodIndex, areaIndex, {
                                unitCost: parseInt(e.target.value) || 0,
                              })
                            }
                            className="w-full px-2 py-1 text-sm border rounded"
                          />
                          <span className="text-xs text-gray-500">
                            {formatCurrency(area.unitCost)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
