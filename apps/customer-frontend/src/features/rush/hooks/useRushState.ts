// apps/customer-frontend/src/features/rush/hooks/useRushState.ts
import { useState, useEffect, useMemo } from "react";
import { PRODUCT_SPECS } from "../data/rush.constants";

export const useRushState = () => {
  // Mặc định chọn 'business-card' vì nó phổ biến nhất
  const [category, setCategory] = useState("business-card");
  
  // State specs
  const [specs, setSpecs] = useState({
    size: "",
    material: "",
    quantity: 0,
    note: ""
  });

  // File State
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState("");
  const [inputMode, setInputMode] = useState<"upload" | "link">("upload");
  
  // Deadline
  const [deadline, setDeadline] = useState("4h");

  // ✅ FIX: Memoize currentConfig để tránh tạo object mới mỗi lần render
  const currentConfig = useMemo(() => {
    return PRODUCT_SPECS[category] || PRODUCT_SPECS["default"] || {
      sizes: ["Tiêu chuẩn"],
      materials: ["Tiêu chuẩn"],
      quantities: [1],
      unit: "Cái"
    };
  }, [category]);

  // ✅ FIX: Tự động reset specs và điền giá trị mặc định khi đổi category
  // Chỉ chạy khi category thay đổi, không phụ thuộc vào currentConfig
  useEffect(() => {
    const config = PRODUCT_SPECS[category] || PRODUCT_SPECS["default"] || {
      sizes: ["Tiêu chuẩn"],
      materials: ["Tiêu chuẩn"],
      quantities: [1],
      unit: "Cái"
    };
    
    const defaultSize = config.sizes[0] || "Tiêu chuẩn";
    const defaultMaterial = config.materials[0] || "Tiêu chuẩn";
    const defaultQuantity = config.quantities[0] || 1;
    
    // ✅ FIX: Chỉ update nếu giá trị thực sự thay đổi để tránh vòng lặp
    setSpecs(prev => {
      // Nếu đã có giá trị và category chưa thay đổi, giữ nguyên
      if (prev.size && prev.material && prev.quantity > 0) {
        // Chỉ reset nếu giá trị hiện tại không hợp lệ với config mới
        const isSizeValid = config.sizes.includes(prev.size);
        const isMaterialValid = config.materials.includes(prev.material);
        const isQuantityValid = config.quantities.includes(prev.quantity);
        
        if (isSizeValid && isMaterialValid && isQuantityValid) {
          return prev; // Giữ nguyên nếu tất cả đều hợp lệ
        }
      }
      
      // Reset về giá trị mặc định
      return {
        size: defaultSize,
        material: defaultMaterial,
        quantity: defaultQuantity,
        note: prev.note // Giữ nguyên note
      };
    });
  }, [category]); // ✅ FIX: Chỉ phụ thuộc vào category để tránh vòng lặp

  const updateSpecs = (key: string, value: any) => {
    setSpecs(prev => ({ ...prev, [key]: value }));
  };

  return {
    category, setCategory,
    specs, updateSpecs,
    file, setFile,
    fileUrl, setFileUrl,
    inputMode, setInputMode,
    deadline, setDeadline,
    currentConfig // Luôn trả về object hợp lệ
  };
};