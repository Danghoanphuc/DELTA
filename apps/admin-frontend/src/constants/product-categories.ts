// apps/admin-frontend/src/constants/product-categories.ts
// 5 Danh mục sản phẩm theo Ngũ Hành (đồng bộ với LandingHeader)

export const PRODUCT_CATEGORIES = {
  HANH_KIM: {
    id: "hanh-kim",
    name: "Hành Kim",
    subtitle: "ĐỒNG & KIM LOẠI",
    element: "Kim",
    icon: "💎",
    color: "#C0C0C0", // Silver
    description: "Chuông Đồng, Khánh Đồng, Lư Đồng",
    keywords: ["Sang trọng", "Tinh tế", "Quý phái"],
  },
  HANH_MOC: {
    id: "hanh-moc",
    name: "Hành Mộc",
    subtitle: "GỖ & TRE",
    element: "Mộc",
    icon: "🍃",
    color: "#166534", // Green
    description: "Mô Hình Thuyền Gỗ, Nón Lá, Khay Mây Tre Đan",
    keywords: ["Tự nhiên", "Sinh động", "Phát triển"],
  },
  HANH_THUY: {
    id: "hanh-thuy",
    name: "Hành Thủy",
    subtitle: "SƠN MÀI & THỦY TINH",
    element: "Thủy",
    icon: "🌊",
    color: "#1E3A8A", // Deep Blue
    description: "Sơn Mài, Vẽ Trong Chai, Tranh Cẩn Ốc",
    keywords: ["Linh hoạt", "Mềm mại", "Thanh lịch"],
  },
  HANH_HOA: {
    id: "hanh-hoa",
    name: "Hành Hỏa",
    subtitle: "TRẦM & GỐM HỎA BIẾN",
    element: "Hỏa",
    icon: "🔥",
    color: "#DC2626", // Red
    description: "Trầm Hương, Gốm Men Hỏa Biến, Đèn Gốm",
    keywords: ["Nhiệt huyết", "Năng lượng", "Sáng tạo"],
  },
  HANH_THO: {
    id: "hanh-tho",
    name: "Hành Thổ",
    subtitle: "GỐM SỨ & ĐÁ",
    element: "Thổ",
    icon: "🏔️",
    color: "#92400E", // Brown
    description: "Gốm Biên Hòa, Điêu Khắc Đá, Lu Sành",
    keywords: ["Vững chãi", "Bền vững", "Truyền thống"],
  },
} as const;

export type CategoryId = keyof typeof PRODUCT_CATEGORIES;

export const CATEGORY_OPTIONS = Object.values(PRODUCT_CATEGORIES).map(
  (cat) => ({
    value: cat.id,
    label: cat.name,
    subtitle: cat.subtitle,
    icon: cat.icon,
    color: cat.color,
  })
);

export const FENG_SHUI_ELEMENTS = [
  { value: "Thổ", label: "Thổ (Đất)", color: "#92400E" },
  { value: "Kim", label: "Kim (Kim loại)", color: "#C0C0C0" },
  { value: "Thủy", label: "Thủy (Nước)", color: "#1E3A8A" },
  { value: "Mộc", label: "Mộc (Gỗ)", color: "#166534" },
  { value: "Hỏa", label: "Hỏa (Lửa)", color: "#DC2626" },
] as const;

export const LOGO_CUSTOMIZATION_METHODS = [
  { value: "laser-engraving", label: "Khắc laser" },
  { value: "uv-printing", label: "In UV" },
  { value: "embossing", label: "Dập nổi" },
  { value: "hot-stamping", label: "Dập nóng" },
  { value: "screen-printing", label: "In lụa" },
  { value: "embroidery", label: "Thêu" },
] as const;
