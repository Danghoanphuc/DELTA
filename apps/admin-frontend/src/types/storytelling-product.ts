// apps/admin-frontend/src/types/storytelling-product.ts
// TypeScript types for Storytelling Product Form

export interface StorytellingProductFormData {
  // === Basic Info ===
  name: string;
  slug: string;
  sku: string;
  description: string;
  categoryId: string;
  tags: string[];

  // === Hero Section ===
  tagline: string;
  heroMedia?: {
    type: "image" | "video";
    url: string;
    thumbnail?: string;
  };

  // === Introduction & Specs ===
  craftingTime?: {
    value: number;
    unit: "hours" | "days";
  };
  technique?: string;
  productionLimit?: {
    value: number;
    text: string;
  };
  certification?: string;

  // === Storytelling Content ===
  story?: {
    materials?: {
      title: string;
      content: string;
      image: string;
    };
    process?: {
      title: string;
      content: string;
      image: string;
    };
  };

  // === Gallery ===
  images: Array<{
    url: string;
    isPrimary: boolean;
    alt?: string;
  }>;

  // === Feng Shui & Application ===
  fengShui?: {
    suitableElements: Array<"Thổ" | "Kim" | "Thủy" | "Mộc" | "Hỏa">;
    placement?: string;
    meaning?: string;
    message?: string;
    lifestyleImage?: string;
  };

  // === Customization & Packaging ===
  customization?: {
    allowLogoCustomization: boolean;
    logoMethods: string[];
    packagingImages: string[];
    packagingDescription?: string;
  };

  // === Artisan Information ===
  artisan?: {
    name: string;
    title: string;
    photo: string;
    bio: string;
  };

  // === Social Proof ===
  clientLogos: string[];

  // === Documents & Downloads ===
  documents?: {
    portfolio?: {
      url: string;
      filename: string;
    };
    catalogue?: {
      url: string;
      filename: string;
    };
    certificate?: {
      url: string;
      filename: string;
    };
  };

  // === Pricing & Inventory ===
  basePrice: number;
  salePrice?: number;
  stock: number;
  lowStockThreshold: number;

  // === Status ===
  isActive: boolean;
  isPublished: boolean;
  isFeatured: boolean;
}

export const INITIAL_FORM_DATA: StorytellingProductFormData = {
  name: "",
  slug: "",
  sku: "",
  description: "",
  categoryId: "",
  tags: [],
  tagline: "",
  images: [],
  clientLogos: [],
  basePrice: 0,
  stock: 0,
  lowStockThreshold: 10,
  isActive: true,
  isPublished: false,
  isFeatured: false,
  customization: {
    allowLogoCustomization: false,
    logoMethods: [],
    packagingImages: [],
  },
  fengShui: {
    suitableElements: [],
  },
};
