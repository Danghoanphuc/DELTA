// apps/admin-frontend/src/constants/product-categories.ts
// 5 Danh mục sản phẩm theo Ngũ Hành

export const PRODUCT_CATEGORIES = {
  TINH_TAI: {
    id: "tinh-tai",
    name: "Tinh Tài",
    subtitle: "TRẦM & TRÀ",
    element: "Kim",
    icon: "💎",
    color: "#C0C0C0", // Silver
    description: "Trầm hương, Tràng hạt, Đồ trang sức",
    keywords: ["Sang trọng", "Tinh tế", "Quý phái"],
  },
  DONG_CHAY: {
    id: "dong-chay",
    name: "Dòng Chảy",
    subtitle: "SƠN MÀI & LỤA",
    element: "Thủy",
    icon: "🌊",
    color: "#1E3A8A", // Deep Blue
    description: "Sơn mài, Lụa, Đồ gốm men rạn",
    keywords: ["Linh hoạt", "Mềm mại", "Thanh lịch"],
  },
  THO_NHUONG: {
    id: "tho-nhuong",
    name: "Thổ Nhưỡng",
    subtitle: "GỐM SỨ",
    element: "Thổ",
    icon: "🏔️",
    color: "#92400E", // Brown
    description: "Gốm sứ, Đá, Đồ gỗ",
    keywords: ["Vững chãi", "Bền vững", "Truyền thống"],
  },
  MOC_BAN: {
    id: "moc-ban",
    name: "Mộc Bản",
    subtitle: "GỖ & TRE",
    element: "Mộc",
    icon: "🍃",
    color: "#166534", // Green
    description: "Gỗ & Tre, Thảo mộc, Đồ thủ công",
    keywords: ["Tự nhiên", "Sinh động", "Phát triển"],
  },
  KIM_HOAN: {
    id: "kim-hoan",
    name: "Kim Hoàn",
    subtitle: "ĐỒNG & VÀNG",
    element: "Kim",
    icon: "💍",
    color: "#B45309", // Gold
    description: "Đồng & Vàng, Trang sức, Đồ thờ cúng",
    keywords: ["Quý giá", "Bền bỉ", "Giá trị"],
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
