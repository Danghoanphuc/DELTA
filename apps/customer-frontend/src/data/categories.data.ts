// apps/customer-frontend/src/data/categories.data.ts
// Comprehensive category data structure inspired by VistaPrint
// Adapted for Vietnamese market and PrintZ marketplace model

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
  avgPrice: string; // "Từ 80.000đ"
  priceRange?: string; // "50.000đ - 500.000đ"
  bulkDiscount?: boolean;
}

export interface PrintZCategory {
  id: string;
  label: string;
  value: string;
  image: string;
  
  // Marketplace specific
  printerCount?: number;
  pricing: PricingInfo;
  
  // Taxonomy
  subcategories: SubCategory[];
  useCases: UseCase[];
  
  // Vietnamese context
  seasonal?: boolean; // Tết, Trung Thu, etc.
  trending?: boolean;
  featured?: boolean;
  
  // SEO & Description
  description?: string;
  keywords?: string[];
}

// ============================================
// CATEGORY DATA - Vietnamese Market Context
// ============================================

export const printzCategories: PrintZCategory[] = [
  // 1. ÁO THUN & ĐỒNG PHỤC
  {
    id: "tshirt",
    label: "Áo thun in",
    value: "tshirts",
    image: "https://res.cloudinary.com/da3xfws3n/image/upload/v1763387284/Thi%E1%BA%BFt_k%E1%BA%BF_ch%C6%B0a_c%C3%B3_t%C3%AAn_2_q1c7pf.svg",
    printerCount: 45,
    trending: true,
    pricing: {
      avgPrice: "Từ 80.000đ",
      priceRange: "50.000đ - 300.000đ",
      bulkDiscount: true
    },
    description: "In áo thun chất lượng cao, giao hàng nhanh chóng",
    keywords: ["áo thun", "áo đồng phục", "áo lớp", "áo team building"],
    
    subcategories: [
      { value: "cotton-tshirt", label: "Áo cotton 100%", popular: true, productCount: 234 },
      { value: "polo-shirt", label: "Áo polo", productCount: 123 },
      { value: "hoodie", label: "Áo hoodie/sweater", productCount: 89 },
      { value: "tank-top", label: "Áo tank top", productCount: 56 },
      { value: "raglan", label: "Áo raglan", productCount: 34 },
      { value: "long-sleeve", label: "Áo dài tay", productCount: 67 }
    ],
    
    useCases: [
      { label: "Áo đồng phục công ty", emoji: "🏢", searchTerm: "company-uniform", description: "Xây dựng thương hiệu doanh nghiệp" },
      { label: "Áo lớp", emoji: "🎓", searchTerm: "class-shirt", description: "Kỷ niệm thời học sinh" },
      { label: "Áo team building", emoji: "🤝", searchTerm: "team-building", description: "Gắn kết tập thể" },
      { label: "Áo sự kiện", emoji: "🎉", searchTerm: "event-shirt", description: "Chạy bộ, hội thảo, triển lãm" },
      { label: "Quà tặng doanh nghiệp", emoji: "🎁", searchTerm: "corporate-gift" },
      { label: "Áo gia đình", emoji: "👨‍👩‍👧", searchTerm: "family-shirt", description: "Family trip, họp mặt" }
    ]
  },

  // 2. TẾT & LÌ XÌ
  {
    id: "tet-gifts",
    label: "Bao lì xì & Thiệp Tết",
    value: "tet-holiday-cards",
    image: "https://res.cloudinary.com/da3xfws3n/image/upload/v1763385804/bao_th%C6%B0_bao_li%CC%80_xi%CC%80_biesjs.svg",
    seasonal: true,
    featured: true,
    printerCount: 28,
    pricing: {
      avgPrice: "Từ 5.000đ",
      priceRange: "3.000đ - 50.000đ",
      bulkDiscount: true
    },
    description: "Bao lì xì in logo, thiệp chúc Tết doanh nghiệp",
    keywords: ["bao lì xì", "thiệp tết", "lì xì", "red envelope", "lịch tết"],
    
    subcategories: [
      { value: "red-envelope-logo", label: "Bao lì xì in logo", popular: true, productCount: 456 },
      { value: "tet-greeting-card", label: "Thiệp chúc Tết", productCount: 234 },
      { value: "tet-wall-calendar", label: "Lịch Tết treo tường", productCount: 189 },
      { value: "bloc-calendar", label: "Lịch bloc", productCount: 123 },
      { value: "desk-calendar", label: "Lịch để bàn", productCount: 98 },
      { value: "tet-gift-box", label: "Hộp quà Tết", productCount: 76 }
    ],
    
    useCases: [
      { label: "Lì xì nhân viên", emoji: "🧧", searchTerm: "employee-lucky-money", description: "Tặng nhân viên dịp Tết" },
      { label: "Quà tặng đối tác", emoji: "🤝", searchTerm: "partner-gift", description: "Tri ân đối tác kinh doanh" },
      { label: "Tri ân khách hàng", emoji: "🙏", searchTerm: "customer-appreciation", description: "Gửi lời chúc Tết" },
      { label: "Quà tết doanh nghiệp", emoji: "🎊", searchTerm: "corporate-tet-gift" },
      { label: "Lì xì cho con em", emoji: "👶", searchTerm: "kids-lucky-money" }
    ]
  },

  // 3. DANH THIẾP
  {
    id: "business-cards",
    label: "Danh thiếp & Thẻ",
    value: "business-cards",
    image: "https://res.cloudinary.com/da3xfws3n/image/upload/v1763386452/Thi%E1%BA%BFt_k%E1%BA%BF_ch%C6%B0a_c%C3%B3_t%C3%AAn_4_zw10gs.svg",
    trending: true,
    printerCount: 67,
    pricing: {
      avgPrice: "Từ 100.000đ",
      priceRange: "80.000đ - 1.000.000đ",
      bulkDiscount: true
    },
    description: "Danh thiếp chuyên nghiệp, nhiều chất liệu cao cấp",
    keywords: ["danh thiếp", "business card", "name card", "thẻ nhựa"],
    
    subcategories: [
      { value: "art-paper-card", label: "Giấy mỹ thuật", popular: true, productCount: 345 },
      { value: "laminated-card", label: "Phủ màng bóng/mờ", productCount: 289 },
      { value: "embossed-card", label: "Dập nổi/chìm", productCount: 156 },
      { value: "foil-card", label: "Ép kim/bạc", productCount: 123 },
      { value: "metal-card", label: "Danh thiếp kim loại", productCount: 45 },
      { value: "pvc-card", label: "Thẻ nhựa PVC", productCount: 234 },
      { value: "transparent-card", label: "Danh thiếp trong suốt", productCount: 67 }
    ],
    
    useCases: [
      { label: "Startup / Doanh nghiệp", emoji: "💼", searchTerm: "business-startup" },
      { label: "Freelancer", emoji: "💻", searchTerm: "freelancer" },
      { label: "Sales / Marketing", emoji: "📱", searchTerm: "sales-marketing" },
      { label: "Thẻ hội viên", emoji: "🎫", searchTerm: "membership-card" },
      { label: "Giáo viên/Giảng viên", emoji: "👨‍🏫", searchTerm: "teacher-lecturer" }
    ]
  },

  // 4. QUÀ KHUYẾN MẠI
  {
    id: "promotional",
    label: "Quà khuyến mại",
    value: "promotional-products",
    image: "https://res.cloudinary.com/da3xfws3n/image/upload/v1763385803/sa%CC%89n_ph%C3%A2%CC%89m_khuy%C3%AA%CC%81n_ma%CC%83i_rupn6q.svg",
    featured: true,
    printerCount: 52,
    pricing: {
      avgPrice: "Từ 30.000đ",
      priceRange: "15.000đ - 500.000đ",
      bulkDiscount: true
    },
    description: "Quà tặng in logo: ly, bình nước, móc khóa, balo",
    keywords: ["quà tặng", "promotional", "merchandise", "corporate gift"],
    
    subcategories: [
      { value: "ceramic-mug", label: "Ly sứ in logo", popular: true, productCount: 234 },
      { value: "water-bottle", label: "Bình nước", productCount: 189 },
      { value: "tote-bag", label: "Túi tote canvas", productCount: 267 },
      { value: "backpack", label: "Balo/Túi xách", productCount: 123 },
      { value: "keychain", label: "Móc khóa", productCount: 345 },
      { value: "notebook", label: "Sổ tay", productCount: 178 },
      { value: "pen", label: "Bút bi/bút ký", productCount: 234 },
      { value: "usb", label: "USB in logo", productCount: 89 }
    ],
    
    useCases: [
      { label: "Quà tặng sự kiện", emoji: "🎊", searchTerm: "event-giveaway" },
      { label: "Quà tri ân khách hàng", emoji: "🎁", searchTerm: "customer-gift" },
      { label: "Quà tặng nhân viên", emoji: "👥", searchTerm: "employee-gift" },
      { label: "Quà hội nghị/hội thảo", emoji: "📊", searchTerm: "conference-gift" },
      { label: "Quà tặng đối tác", emoji: "🤝", searchTerm: "partner-gift" }
    ]
  },

  // 5. BAO BÌ & HỘP
  {
    id: "packaging",
    label: "Bao bì & Hộp",
    value: "packaging",
    image: "https://res.cloudinary.com/da3xfws3n/image/upload/v1763385799/%C4%90o%CC%81ng_go%CC%81i_zbdloi.svg",
    trending: true,
    printerCount: 34,
    pricing: {
      avgPrice: "Từ 2.000đ",
      priceRange: "1.500đ - 100.000đ",
      bulkDiscount: true
    },
    description: "Bao bì thương hiệu: hộp, túi giấy, nhãn dán",
    keywords: ["bao bì", "packaging", "hộp", "túi giấy", "nhãn dán"],
    
    subcategories: [
      { value: "cardboard-box", label: "Hộp carton/giấy", popular: true, productCount: 345 },
      { value: "kraft-paper-bag", label: "Túi giấy kraft", productCount: 289 },
      { value: "gift-box", label: "Hộp quà tặng", productCount: 167 },
      { value: "product-label", label: "Nhãn dán sản phẩm", productCount: 456 },
      { value: "zip-bag", label: "Túi zip/zipper", productCount: 234 },
      { value: "food-container", label: "Hộp đựng thực phẩm", productCount: 123 },
      { value: "cosmetic-packaging", label: "Bao bì mỹ phẩm", productCount: 89 }
    ],
    
    useCases: [
      { label: "Shop online/E-commerce", emoji: "🛒", searchTerm: "ecommerce-packaging" },
      { label: "F&B/Nhà hàng", emoji: "🍜", searchTerm: "food-packaging" },
      { label: "Mỹ phẩm/Skincare", emoji: "💄", searchTerm: "cosmetic-packaging" },
      { label: "Thời trang/Fashion", emoji: "👗", searchTerm: "fashion-packaging" },
      { label: "Quà tặng/Gift shop", emoji: "🎁", searchTerm: "gift-packaging" }
    ]
  },

  // 6. BẢNG HIỆU & BIỂU NGỮ
  {
    id: "signage",
    label: "Bảng hiệu, biểu ngữ",
    value: "signage-banners",
    image: "https://res.cloudinary.com/da3xfws3n/image/upload/v1763386922/Thi%E1%BA%BFt_k%E1%BA%BF_ch%C6%B0a_c%C3%B3_t%C3%AAn_6_imoupw.svg",
    printerCount: 41,
    pricing: {
      avgPrice: "Từ 150.000đ",
      priceRange: "100.000đ - 5.000.000đ",
      bulkDiscount: false
    },
    description: "Bảng hiệu, standee, poster khổ lớn cho sự kiện",
    keywords: ["bảng hiệu", "biểu ngữ", "standee", "backdrop", "poster"],
    
    subcategories: [
      { value: "vinyl-banner", label: "Băng rôn canvas/vinyl", popular: true, productCount: 234 },
      { value: "standee", label: "Standee X/L/Roll up", productCount: 189 },
      { value: "large-poster", label: "Poster khổ lớn", productCount: 267 },
      { value: "acrylic-sign", label: "Bảng hiệu mica/acrylic", productCount: 123 },
      { value: "led-sign", label: "Bảng hiệu LED", productCount: 45 },
      { value: "backdrop", label: "Backdrop phông sự kiện", productCount: 156 }
    ],
    
    useCases: [
      { label: "Khai trương/Grand opening", emoji: "🎊", searchTerm: "grand-opening" },
      { label: "Hội chợ/Triển lãm", emoji: "🏪", searchTerm: "trade-show" },
      { label: "Sự kiện/Event", emoji: "🎪", searchTerm: "event-signage" },
      { label: "Cửa hàng/Shop", emoji: "🏬", searchTerm: "shop-signage" },
      { label: "Nhà hàng/Cafe", emoji: "☕", searchTerm: "restaurant-signage" }
    ]
  },

  // 7. NHÃN DÁN & TEM
  {
    id: "labels-stickers",
    label: "Nhãn dán & tem",
    value: "labels-stickers",
    image: "https://res.cloudinary.com/da3xfws3n/image/upload/v1763387243/nha%CC%83n_da%CC%81n_pezqf5.svg",
    printerCount: 29,
    pricing: {
      avgPrice: "Từ 500đ",
      priceRange: "300đ - 50.000đ",
      bulkDiscount: true
    },
    description: "Nhãn dán sản phẩm, tem bảo hành, sticker",
    keywords: ["nhãn dán", "sticker", "tem", "decal"],
    
    subcategories: [
      { value: "product-label", label: "Nhãn dán sản phẩm", popular: true, productCount: 456 },
      { value: "barcode-label", label: "Tem mã vạch/QR", productCount: 234 },
      { value: "warranty-sticker", label: "Tem bảo hành", productCount: 189 },
      { value: "decal-sticker", label: "Sticker decal", productCount: 267 },
      { value: "die-cut-sticker", label: "Sticker cắt hình", productCount: 345 },
      { value: "transparent-sticker", label: "Sticker trong suốt", productCount: 123 }
    ],
    
    useCases: [
      { label: "Nhãn mác thương hiệu", emoji: "🏷️", searchTerm: "brand-label" },
      { label: "Nhãn thực phẩm/F&B", emoji: "🍱", searchTerm: "food-label" },
      { label: "Sticker trang trí", emoji: "🎨", searchTerm: "decorative-sticker" },
      { label: "Tem chống giả", emoji: "🔐", searchTerm: "anti-counterfeit" },
      { label: "Nhãn mỹ phẩm", emoji: "💄", searchTerm: "cosmetic-label" }
    ]
  },

  // 8. QUẢNG CÁO IN ẤN
  {
    id: "postcards-marketing",
    label: "Quảng cáo in ấn",
    value: "postcards-marketing",
    image: "https://res.cloudinary.com/da3xfws3n/image/upload/v1763386942/Thi%E1%BA%BFt_k%E1%BA%BF_ch%C6%B0a_c%C3%B3_t%C3%AAn_5_lgldk1.svg",
    printerCount: 38,
    pricing: {
      avgPrice: "Từ 1.000đ",
      priceRange: "500đ - 20.000đ",
      bulkDiscount: true
    },
    description: "Tờ rơi, brochure, catalogue cho marketing",
    keywords: ["tờ rơi", "flyer", "brochure", "catalogue", "voucher"],
    
    subcategories: [
      { value: "flyer", label: "Tờ rơi/Flyer", popular: true, productCount: 567 },
      { value: "brochure", label: "Brochure/Catalogue", productCount: 345 },
      { value: "postcard", label: "Postcard/Thiệp quảng cáo", productCount: 234 },
      { value: "voucher", label: "Voucher/Phiếu giảm giá", productCount: 289 },
      { value: "coupon", label: "Coupon/Phiếu mua hàng", productCount: 178 },
      { value: "menu", label: "Menu nhà hàng", productCount: 156 }
    ],
    
    useCases: [
      { label: "Khai trương/Khuyến mại", emoji: "🎉", searchTerm: "promotion-campaign" },
      { label: "Marketing offline", emoji: "📢", searchTerm: "offline-marketing" },
      { label: "Giới thiệu dịch vụ", emoji: "📋", searchTerm: "service-introduction" },
      { label: "Tuyển dụng", emoji: "👔", searchTerm: "recruitment" },
      { label: "Nhà hàng/F&B", emoji: "🍽️", searchTerm: "restaurant-menu" }
    ]
  },

  // 9. LỊCH & QUÀ TẶNG
  {
    id: "calendar-gifts",
    label: "Lịch & Quà tặng",
    value: "calendar-gifts",
    image: "https://res.cloudinary.com/da3xfws3n/image/upload/v1763381378/Calendar_and_Gifts_Icon_in_Mint_and_Blush_rs5zks.svg",
    seasonal: true,
    printerCount: 31,
    pricing: {
      avgPrice: "Từ 20.000đ",
      priceRange: "10.000đ - 200.000đ",
      bulkDiscount: true
    },
    description: "Lịch tết, lịch để bàn, quà tặng doanh nghiệp",
    keywords: ["lịch", "calendar", "quà tặng", "corporate gift"],
    
    subcategories: [
      { value: "wall-calendar", label: "Lịch treo tường", popular: true, productCount: 234 },
      { value: "desk-calendar", label: "Lịch để bàn", productCount: 189 },
      { value: "bloc-calendar", label: "Lịch bloc", productCount: 156 },
      { value: "photo-book", label: "Photo book/Album ảnh", productCount: 123 },
      { value: "canvas-print", label: "Tranh canvas", productCount: 89 },
      { value: "puzzle", label: "Puzzle ghép hình", productCount: 67 }
    ],
    
    useCases: [
      { label: "Quà tết doanh nghiệp", emoji: "🎊", searchTerm: "tet-corporate-gift" },
      { label: "Quà sinh nhật", emoji: "🎂", searchTerm: "birthday-gift" },
      { label: "Quà kỷ niệm", emoji: "💝", searchTerm: "souvenir-gift" },
      { label: "Trang trí văn phòng", emoji: "🖼️", searchTerm: "office-decoration" }
    ]
  }
];

// ============================================
// HELPER FUNCTIONS
// ============================================

export const getCategoryById = (id: string): PrintZCategory | undefined => {
  return printzCategories.find(cat => cat.id === id);
};

export const getCategoryByValue = (value: string): PrintZCategory | undefined => {
  return printzCategories.find(cat => cat.value === value);
};

export const getSeasonalCategories = (): PrintZCategory[] => {
  return printzCategories.filter(cat => cat.seasonal);
};

export const getTrendingCategories = (): PrintZCategory[] => {
  return printzCategories.filter(cat => cat.trending);
};

export const getFeaturedCategories = (): PrintZCategory[] => {
  return printzCategories.filter(cat => cat.featured);
};

// Export all subcategories for filtering
export const getAllSubCategories = (): SubCategory[] => {
  return printzCategories.flatMap(cat => cat.subcategories);
};

// Export all use cases
export const getAllUseCases = (): UseCase[] => {
  return printzCategories.flatMap(cat => cat.useCases);
};

