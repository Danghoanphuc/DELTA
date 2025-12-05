// apps/customer-frontend/src/data/categories.data.ts
// Đồng bộ với danh mục từ LandingHeader

export interface SubCategory {
  value: string;
  label: string;
  popular?: boolean;
  productCount?: number;
  description?: string;
}

export interface UseCase {
  label: string;
  emoji: string;
  searchTerm: string;
  description?: string;
}

export interface PricingInfo {
  avgPrice: string;
  priceRange?: string;
  bulkDiscount?: boolean;
}

export interface PrintZCategory {
  id: string;
  label: string;
  value: string;
  image: string;

  printerCount?: number;
  pricing: PricingInfo;

  subcategories: SubCategory[];
  useCases: UseCase[];

  seasonal?: boolean;
  trending?: boolean;
  featured?: boolean;

  description?: string;
  keywords?: string[];
}

export const printzCategories: PrintZCategory[] = [
  // 1. ẤN PHẨM VĂN PHÒNG
  {
    id: "office-stationery",
    label: "Ấn phẩm văn phòng",
    value: "office-stationery",
    image:
      "https://res.cloudinary.com/da3xfws3n/image/upload/v1763386452/Thi%E1%BA%BFt_k%E1%BA%BF_ch%C6%B0a_c%C3%B3_t%C3%AAn_4_zw10gs.svg",
    printerCount: 67,
    trending: true,
    pricing: {
      avgPrice: "Từ 100.000đ",
      priceRange: "80.000đ - 1.000.000đ",
      bulkDiscount: true,
    },
    description: "Ấn phẩm văn phòng chuyên nghiệp cho doanh nghiệp",
    keywords: ["danh thiếp", "phong bì", "kẹp file", "hóa đơn", "biểu mẫu"],

    subcategories: [
      {
        value: "business-cards",
        label: "Danh thiếp (Namecards)",
        popular: true,
        productCount: 345,
      },
      {
        value: "envelopes",
        label: "Phong bì & Tiêu đề thư",
        productCount: 289,
      },
      { value: "folders", label: "Kẹp file (Folder)", productCount: 156 },
      { value: "invoices", label: "Hóa đơn & Biểu mẫu", productCount: 123 },
    ],

    useCases: [
      {
        label: "Startup / Doanh nghiệp",
        emoji: "💼",
        searchTerm: "business-startup",
      },
      { label: "Freelancer", emoji: "💻", searchTerm: "freelancer" },
      {
        label: "Sales / Marketing",
        emoji: "📱",
        searchTerm: "sales-marketing",
      },
      {
        label: "Văn phòng công ty",
        emoji: "🏢",
        searchTerm: "office-supplies",
      },
    ],
  },

  // 2. MARKETING & SỰ KIỆN
  {
    id: "marketing-events",
    label: "Marketing & Sự kiện",
    value: "marketing-events",
    image:
      "https://res.cloudinary.com/da3xfws3n/image/upload/v1763386942/Thi%E1%BA%BFt_k%E1%BA%BF_ch%C6%B0a_c%C3%B3_t%C3%AAn_5_lgldk1.svg",
    printerCount: 38,
    trending: true,
    pricing: {
      avgPrice: "Từ 1.000đ",
      priceRange: "500đ - 20.000đ",
      bulkDiscount: true,
    },
    description: "Tờ rơi, brochure, catalogue, standee cho marketing",
    keywords: [
      "tờ rơi",
      "flyer",
      "brochure",
      "catalogue",
      "standee",
      "backdrop",
    ],

    subcategories: [
      {
        value: "flyers",
        label: "Tờ rơi & Brochure",
        popular: true,
        productCount: 567,
      },
      { value: "catalogues", label: "Catalogue & Profile", productCount: 345 },
      { value: "standees", label: "Standee & Backdrop", productCount: 234 },
      { value: "stickers", label: "Sticker & Tem nhãn", productCount: 289 },
    ],

    useCases: [
      {
        label: "Khai trương/Khuyến mại",
        emoji: "🎉",
        searchTerm: "promotion-campaign",
      },
      {
        label: "Marketing offline",
        emoji: "📢",
        searchTerm: "offline-marketing",
      },
      { label: "Hội chợ/Triển lãm", emoji: "🏪", searchTerm: "trade-show" },
      { label: "Sự kiện/Event", emoji: "🎪", searchTerm: "event-signage" },
    ],
  },

  // 3. QUÀ TẶNG DOANH NGHIỆP
  {
    id: "corporate-gifts",
    label: "Quà tặng doanh nghiệp",
    value: "corporate-gifts",
    image:
      "https://res.cloudinary.com/da3xfws3n/image/upload/v1763385803/sa%CC%89n_ph%C3%A2%CC%89m_khuy%C3%AA%CC%81n_ma%CC%83i_rupn6q.svg",
    featured: true,
    printerCount: 52,
    pricing: {
      avgPrice: "Từ 30.000đ",
      priceRange: "15.000đ - 500.000đ",
      bulkDiscount: true,
    },
    description: "Quà tặng in logo: bình giữ nhiệt, ly, sổ tay, áo đồng phục",
    keywords: [
      "quà tặng",
      "promotional",
      "merchandise",
      "corporate gift",
      "áo đồng phục",
    ],

    subcategories: [
      {
        value: "bottles-cups",
        label: "Bình giữ nhiệt & Ly",
        popular: true,
        productCount: 234,
      },
      { value: "notebooks-pens", label: "Sổ tay & Bút ký", productCount: 189 },
      { value: "uniforms", label: "Áo đồng phục & Mũ", productCount: 267 },
      { value: "umbrellas", label: "Ô dù & Áo mưa", productCount: 123 },
    ],

    useCases: [
      { label: "Quà tặng sự kiện", emoji: "🎊", searchTerm: "event-giveaway" },
      {
        label: "Quà tri ân khách hàng",
        emoji: "🎁",
        searchTerm: "customer-gift",
      },
      { label: "Quà tặng nhân viên", emoji: "👥", searchTerm: "employee-gift" },
      {
        label: "Quà hội nghị/hội thảo",
        emoji: "📊",
        searchTerm: "conference-gift",
      },
      {
        label: "Áo đồng phục công ty",
        emoji: "🏢",
        searchTerm: "company-uniform",
      },
    ],
  },

  // 4. BAO BÌ ĐÓNG GÓI
  {
    id: "packaging",
    label: "Bao bì đóng gói",
    value: "packaging",
    image:
      "https://res.cloudinary.com/da3xfws3n/image/upload/v1763385799/%C4%90o%CC%81ng_go%CC%81i_zbdloi.svg",
    trending: true,
    printerCount: 34,
    pricing: {
      avgPrice: "Từ 2.000đ",
      priceRange: "1.500đ - 100.000đ",
      bulkDiscount: true,
    },
    description: "Bao bì thương hiệu: hộp, túi giấy, băng keo logo",
    keywords: ["bao bì", "packaging", "hộp", "túi giấy", "băng keo"],

    subcategories: [
      {
        value: "premium-boxes",
        label: "Hộp cứng cao cấp",
        popular: true,
        productCount: 345,
      },
      { value: "paper-bags", label: "Túi giấy thương hiệu", productCount: 289 },
      {
        value: "carton-boxes",
        label: "Hộp carton ship hàng",
        productCount: 167,
      },
      { value: "branded-tape", label: "Băng keo logo", productCount: 234 },
    ],

    useCases: [
      {
        label: "Shop online/E-commerce",
        emoji: "🛒",
        searchTerm: "ecommerce-packaging",
      },
      { label: "F&B/Nhà hàng", emoji: "🍜", searchTerm: "food-packaging" },
      {
        label: "Mỹ phẩm/Skincare",
        emoji: "💄",
        searchTerm: "cosmetic-packaging",
      },
      {
        label: "Thời trang/Fashion",
        emoji: "👗",
        searchTerm: "fashion-packaging",
      },
      {
        label: "Quà tặng/Gift shop",
        emoji: "🎁",
        searchTerm: "gift-packaging",
      },
    ],
  },
];

// Helper functions
export const getCategoryById = (id: string): PrintZCategory | undefined => {
  return printzCategories.find((cat) => cat.id === id);
};

export const getCategoryByValue = (
  value: string
): PrintZCategory | undefined => {
  return printzCategories.find((cat) => cat.value === value);
};

export const getSeasonalCategories = (): PrintZCategory[] => {
  return printzCategories.filter((cat) => cat.seasonal);
};

export const getTrendingCategories = (): PrintZCategory[] => {
  return printzCategories.filter((cat) => cat.trending);
};

export const getFeaturedCategories = (): PrintZCategory[] => {
  return printzCategories.filter((cat) => cat.featured);
};

export const getAllSubCategories = (): SubCategory[] => {
  return printzCategories.flatMap((cat) => cat.subcategories);
};

export const getAllUseCases = (): UseCase[] => {
  return printzCategories.flatMap((cat) => cat.useCases);
};
