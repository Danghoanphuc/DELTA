// src/features/editor/core/fabricApi.ts
// BẢN HOÀN CHỈNH: Đã sửa lỗi 'Image' và gộp đầy đủ API (ContextMenu, Clipboard...)

import {
  Canvas,
  IText,
  Image, // ✅ SỬA LỖI: Import 'Image' (thay vì FabricImage)
  Rect,
  Circle,
  Triangle,
  Line,
  filters,
  FabricObject, // Thêm import (cho clipboard)
  ActiveSelection, // Thêm import (cho delete)
  TDataUrlOptions,
} from "fabric";
import { toast } from "@/shared/utils/toast";

// Các kiểu dữ liệu
type ShapeType = "rect" | "circle" | "triangle" | "line";
type FilterType = "grayscale" | "sepia" | "blur" | "brightness" | "contrast";
type AlignmentType = "left" | "center" | "right" | "top" | "middle" | "bottom";
type ExportFormat = "png" | "jpg" | "svg";

// Biến clipboard toàn cục (từ file gốc)
let clipboard: FabricObject | null = null;

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
    // ✅ SỬA LỖI: Sử dụng 'Image.fromURL'
    const img = await Image.fromURL(imageUrl, {
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
  const commonOptions = {
    left: 100,
    top: 100,
    width: 100,
    height: 100,
  };

  switch (shapeType) {
    case "rect":
      shape = new Rect({ ...commonOptions, fill: "#3498db" });
      break;
    case "circle":
      shape = new Circle({
        ...commonOptions,
        radius: 50,
        fill: "#e74c3c",
      });
      break;
    case "triangle":
      shape = new Triangle({ ...commonOptions, fill: "#2ecc71" });
      break;
    case "line":
      shape = new Line([50, 100, 200, 100], {
        left: 50,
        top: 100,
        stroke: "#34495e",
        strokeWidth: 3,
      });
      break;
  }
  canvas.add(shape);
  canvas.setActiveObject(shape);
  canvas.renderAll();
};

// --- Các hàm thao tác (Xóa, Nhân bản) ---

export const deleteSelected = (canvas: Canvas) => {
  const activeObject = canvas.getActiveObject();
  if (activeObject) {
    // Xử lý khi chọn nhiều đối tượng
    if (activeObject.type === "activeSelection") {
      (activeObject as ActiveSelection)._objects.forEach((obj: any) => {
        canvas.remove(obj);
      });
    } else {
      // Xóa 1 đối tượng
      canvas.remove(activeObject);
    }
    canvas.discardActiveObject(); // Bỏ chọn sau khi xóa
    canvas.renderAll();
  }
};

export const duplicateSelected = async (canvas: Canvas) => {
  const activeObject = canvas.getActiveObject();
  if (activeObject) {
    const cloned = await activeObject.clone();
    cloned.set({
      left: (activeObject.left || 0) + 10,
      top: (activeObject.top || 0) + 10,
    });
    canvas.add(cloned);
    canvas.setActiveObject(cloned);
    canvas.renderAll();
  }
};

// --- Clipboard API (Lấy từ file gốc) ---

export const copySelected = async (canvas: Canvas) => {
  const activeObject = canvas.getActiveObject();
  if (activeObject) {
    const cloned = await activeObject.clone();
    clipboard = cloned;
    toast.success("Đã sao chép!");
  }
};

export const paste = async (canvas: Canvas) => {
  if (!clipboard) {
    toast.warning("Clipboard trống!");
    return;
  }
  const cloned = await clipboard.clone();
  cloned.set({
    left: (cloned.left || 0) + 10,
    top: (cloned.top || 0) + 10,
    evented: true,
  });
  canvas.add(cloned);
  canvas.setActiveObject(cloned);
  canvas.renderAll();
};

// --- Layer Order API (Lấy từ file gốc) ---

export const bringToFront = (canvas: Canvas) => {
  const activeObject = canvas.getActiveObject();
  if (activeObject) {
    (canvas as any).bringToFront(activeObject);
    canvas.renderAll();
  }
};

export const bringForward = (canvas: Canvas) => {
  const activeObject = canvas.getActiveObject();
  if (activeObject) {
    (canvas as any).bringForward(activeObject);
    canvas.renderAll();
  }
};

export const sendToBack = (canvas: Canvas) => {
  const activeObject = canvas.getActiveObject();
  if (activeObject) {
    (canvas as any).sendToBack(activeObject);
    canvas.renderAll();
  }
};

export const sendBackwards = (canvas: Canvas) => {
  const activeObject = canvas.getActiveObject();
  if (activeObject) {
    (canvas as any).sendBackwards(activeObject);
    canvas.renderAll();
  }
};

export const toggleLock = (canvas: Canvas) => {
  const activeObject = canvas.getActiveObject();
  if (activeObject) {
    const isLocked = activeObject.lockMovementX;
    activeObject.set({
      lockMovementX: !isLocked,
      lockMovementY: !isLocked,
      lockScalingX: !isLocked,
      lockScalingY: !isLocked,
      lockRotation: !isLocked,
    });
    canvas.renderAll();
    toast.success(isLocked ? "Đã mở khóa" : "Đã khóa");
  }
};

export const toggleVisibility = (canvas: Canvas) => {
  const activeObject = canvas.getActiveObject();
  if (activeObject) {
    activeObject.set({ visible: !activeObject.visible });
    canvas.renderAll();
    toast.success(activeObject.visible ? "Đã hiện" : "Đã ẩn");
  }
};

// --- Thuộc tính & Căn chỉnh ---

export const applyFilter = (canvas: Canvas, filterType: FilterType) => {
  const activeObject = canvas.getActiveObject();
  // ✅ SỬA LỖI: Kiểm tra 'instanceof Image'
  if (activeObject && activeObject instanceof Image) {
    activeObject.filters = activeObject.filters || [];

    // Xóa bộ lọc cùng loại nếu đã tồn tại
    activeObject.filters = activeObject.filters.filter((f) => {
      if (filterType === "grayscale") return !(f instanceof filters.Grayscale);
      if (filterType === "sepia") return !(f instanceof filters.Sepia);
      if (filterType === "blur") return !(f instanceof filters.Blur);
      if (filterType === "brightness")
        return !(f instanceof filters.Brightness);
      if (filterType === "contrast") return !(f instanceof filters.Contrast);
      return true;
    });

    let filter;
    switch (filterType) {
      case "grayscale":
        filter = new filters.Grayscale();
        break;
      case "sepia":
        filter = new filters.Sepia();
        break;
      case "blur":
        filter = new filters.Blur({ blur: 0.3 });
        break;
      case "brightness":
        filter = new filters.Brightness({ brightness: 0.1 });
        break;
      case "contrast":
        filter = new filters.Contrast({ contrast: 0.1 });
        break;
      default:
        return;
    }

    activeObject.filters.push(filter);
    activeObject.applyFilters();
    canvas.renderAll();
  } else {
    toast.warning("Vui lòng chọn một ảnh để áp dụng bộ lọc.");
  }
};

export const align = (canvas: Canvas, alignment: AlignmentType) => {
  const activeObject = canvas.getActiveObject();
  if (!activeObject) return;

  const canvasWidth = canvas.width || 0;
  const canvasHeight = canvas.height || 0;
  const objWidth = (activeObject.width || 0) * (activeObject.scaleX || 1);
  const objHeight = (activeObject.height || 0) * (activeObject.scaleY || 1);

  switch (alignment) {
    case "left":
      activeObject.set({ left: 0 });
      break;
    case "center":
      activeObject.set({ left: (canvasWidth - objWidth) / 2 });
      break;
    case "right":
      activeObject.set({ left: canvasWidth - objWidth });
      break;
    case "top":
      activeObject.set({ top: 0 });
      break;
    case "middle":
      activeObject.set({ top: (canvasHeight - objHeight) / 2 });
      break;
    case "bottom":
      activeObject.set({ top: canvasHeight - objHeight });
      break;
  }
  activeObject.setCoords();
  canvas.renderAll();
};

export const updateTextStyle = (
  canvas: Canvas,
  property: string,
  value: any
) => {
  const activeObject = canvas.getActiveObject();
  if (activeObject && activeObject instanceof IText) {
    activeObject.set(property as keyof IText, value);
    canvas.renderAll();
  }
};

// --- Các hàm xuất/helper ---

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportCanvas = async (canvas: Canvas, format: ExportFormat) => {
  let blob: Blob | null = null;
  let filename = `design.${format}`;

  switch (format) {
    case "png":
    case "jpg":
      const options: TDataUrlOptions = {
        format: format === "jpg" ? "jpeg" : "png",
        quality: format === "jpg" ? 0.9 : 1,
        multiplier: 1,
      };
      const oldBg = canvas.backgroundColor;
      if (format === "jpg") {
        canvas.backgroundColor = "#ffffff";
        canvas.renderAll();
      }

      const dataUrl = canvas.toDataURL(options);
      blob = await (await fetch(dataUrl)).blob();

      if (format === "jpg") {
        canvas.backgroundColor = oldBg;
        canvas.renderAll();
      }
      break;

    case "svg":
      const svgString = canvas.toSVG();
      blob = new Blob([svgString], { type: "image/svg+xml" });
      break;
  }

  if (blob) {
    downloadBlob(blob, filename);
  }
};
