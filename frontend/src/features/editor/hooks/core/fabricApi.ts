// src/features/editor/core/fabricApi.ts
import {
  Canvas,
  IText,
  FabricImage,
  Rect,
  Circle,
  Triangle,
  Line,
  filters,
} from "fabric";
import { toast } from "sonner";

// Các kiểu dữ liệu
type ShapeType = "rect" | "circle" | "triangle" | "line";
type FilterType = "grayscale" | "sepia" | "blur" | "brightness" | "contrast";
type AlignmentType = "left" | "center" | "right" | "top" | "middle" | "bottom";
type ExportFormat = "png" | "jpg" | "svg";

// --- Các hàm thêm đối tượng ---

export const addText = (canvas: Canvas, text: string) => {
  const textObj = new IText(text, {
    left: 100,
    top: 100,
    fontSize: 24,
    fill: "#000000",
  });
  canvas.add(textObj);
  canvas.setActiveObject(textObj);
  canvas.renderAll();
};

export const addImage = async (canvas: Canvas, imageUrl: string) => {
  try {
    const img = await FabricImage.fromURL(imageUrl, {
      crossOrigin: "anonymous",
    });
    img.scaleToWidth(150);
    canvas.add(img);
    canvas.centerObject(img);
    canvas.setActiveObject(img);
    canvas.renderAll();
  } catch (error) {
    console.error("Lỗi khi tải ảnh:", error);
    toast.error("Không thể tải ảnh");
  }
};

export const addShape = (canvas: Canvas, shapeType: ShapeType) => {
  let shape;
  switch (shapeType) {
    case "rect":
      shape = new Rect({ /* ... Cấu hình Rect ... */ fill: "#3498db" });
      break;
    case "circle":
      shape = new Circle({ /* ... Cấu hình Circle ... */ fill: "#e74c3c" });
      break;
    case "triangle":
      shape = new Triangle({ /* ... Cấu hình Triangle ... */ fill: "#2ecc71" });
      break;
    case "line":
      shape = new Line([50, 100, 200, 100], {
        stroke: "#34495e",
        strokeWidth: 3,
      });
      break;
  }
  canvas.add(shape);
  canvas.setActiveObject(shape);
  canvas.renderAll();
};

// --- Các hàm thao tác ---

export const deleteSelected = (canvas: Canvas) => {
  const activeObject = canvas.getActiveObject();
  if (activeObject) {
    canvas.remove(activeObject);
    canvas.renderAll();
  }
};

export const duplicateSelected = (canvas: Canvas) => {
  const activeObject = canvas.getActiveObject();
  if (activeObject) {
    activeObject.clone((cloned: any) => {
      cloned.set({
        left: (activeObject.left || 0) + 10,
        top: (activeObject.top || 0) + 10,
      });
      canvas.add(cloned);
      canvas.setActiveObject(cloned);
      canvas.renderAll();
    });
  }
};

export const applyFilter = (canvas: Canvas, filterType: FilterType) => {
  const activeObject = canvas.getActiveObject();
  if (activeObject && activeObject instanceof FabricImage) {
    // ... (Logic applyFilter như cũ) ...
    activeObject.applyFilters();
    canvas.renderAll();
  }
};

export const align = (canvas: Canvas, alignment: AlignmentType) => {
  // ... (Logic align như cũ) ...
  canvas.renderAll();
};

export const updateTextStyle = (
  canvas: Canvas,
  property: string,
  value: any
) => {
  const activeObject = canvas.getActiveObject();
  if (activeObject && activeObject instanceof IText) {
    activeObject.set(property as any, value);
    canvas.renderAll();
  }
};

// --- Các hàm xuất/helper ---

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

export const exportCanvas = async (canvas: Canvas, format: ExportFormat) => {
  switch (format) {
    case "png":
      const pngBlob = await canvas.toBlob({ format: "png", quality: 1 });
      if (pngBlob) downloadBlob(pngBlob, "design.png");
      break;
    // ... (Các trường hợp 'jpg', 'svg' như cũ) ...
  }
};
