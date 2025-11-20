// apps/customer-frontend/src/features/shop/types/filter.types.ts
// Comprehensive filtering system inspired by VistaPrint

export type FilterType = 'checkbox' | 'radio' | 'range' | 'color' | 'toggle';

export interface FilterValue {
  id: string;
  label: string;
  count?: number; // Number of products with this filter
  icon?: string;
  premium?: boolean;
  thumbnail?: string;
}

export interface FilterDimension {
  id: string;
  label: string;
  type: FilterType;
  values: FilterValue[];
  priority: number; // Display order
  collapsed?: boolean; // Default state
  multiSelect?: boolean; // Allow multiple selections
}

export interface FilterState {
  [dimensionId: string]: string[]; // dimension => selected value IDs
}

export interface QuickFilter {
  id: string;
  label: string;
  icon?: string;
  filters: Partial<FilterState>;
}

// ============================================
// PREDEFINED FILTERS FOR DIFFERENT CATEGORIES
// ============================================

// T-SHIRT FILTERS
export const tshirtFilters: FilterDimension[] = [
  {
    id: 'material',
    label: 'Chất liệu',
    type: 'checkbox',
    priority: 1,
    multiSelect: true,
    values: [
      { id: 'cotton-100', label: 'Cotton 100%', count: 234 },
      { id: 'polyester', label: 'Polyester', count: 189 },
      { id: 'blend', label: 'Cotton-Polyester', count: 156 }
    ]
  },
  {
    id: 'printing-method',
    label: 'Phương pháp in',
    type: 'checkbox',
    priority: 2,
    multiSelect: true,
    values: [
      { id: 'dtg', label: 'In kỹ thuật số (DTG)', count: 345 },
      { id: 'screen-print', label: 'In lụa (Screen Print)', count: 267 },
      { id: 'embroidery', label: 'Thêu', count: 123, premium: true }
    ]
  },
  {
    id: 'size',
    label: 'Kích cỡ',
    type: 'checkbox',
    priority: 3,
    multiSelect: true,
    values: [
      { id: 's', label: 'S', count: 289 },
      { id: 'm', label: 'M', count: 456 },
      { id: 'l', label: 'L', count: 378 },
      { id: 'xl', label: 'XL', count: 267 },
      { id: 'xxl', label: 'XXL', count: 189 }
    ]
  },
  {
    id: 'color',
    label: 'Màu sắc',
    type: 'color',
    priority: 4,
    multiSelect: true,
    values: [
      { id: 'white', label: 'Trắng', thumbnail: '#FFFFFF', count: 456 },
      { id: 'black', label: 'Đen', thumbnail: '#000000', count: 389 },
      { id: 'navy', label: 'Xanh Navy', thumbnail: '#000080', count: 234 },
      { id: 'red', label: 'Đỏ', thumbnail: '#FF0000', count: 178 }
    ]
  },
  {
    id: 'delivery-speed',
    label: 'Thời gian giao hàng',
    type: 'radio',
    priority: 5,
    values: [
      { id: 'standard', label: '7-10 ngày (Tiêu chuẩn)', count: 567 },
      { id: 'express', label: '3-5 ngày (Nhanh)', count: 234, icon: '🚀' },
      { id: 'rush', label: '1-2 ngày (Gấp)', count: 89, icon: '⚡', premium: true }
    ]
  },
  {
    id: 'min-quantity',
    label: 'Số lượng tối thiểu',
    type: 'radio',
    priority: 6,
    values: [
      { id: 'any', label: 'Không giới hạn', count: 234 },
      { id: '10', label: 'Từ 10 chiếc', count: 456 },
      { id: '50', label: 'Từ 50 chiếc', count: 189 },
      { id: '100', label: 'Từ 100 chiếc', count: 123 }
    ]
  }
];

// BUSINESS CARD FILTERS
export const businessCardFilters: FilterDimension[] = [
  {
    id: 'material',
    label: 'Chất liệu giấy',
    type: 'checkbox',
    priority: 1,
    multiSelect: true,
    values: [
      { id: 'art-paper', label: 'Giấy mỹ thuật', count: 345 },
      { id: 'ivory', label: 'Giấy Ivory', count: 289 },
      { id: 'couche', label: 'Giấy Couche', count: 234 },
      { id: 'kraft', label: 'Giấy Kraft', count: 156 }
    ]
  },
  {
    id: 'finish',
    label: 'Hoàn thiện bề mặt',
    type: 'checkbox',
    priority: 2,
    multiSelect: true,
    values: [
      { id: 'laminate-gloss', label: 'Phủ màng bóng', count: 456 },
      { id: 'laminate-matte', label: 'Phủ màng mờ', count: 389 },
      { id: 'embossed', label: 'Dập nổi', count: 123, premium: true },
      { id: 'foil', label: 'Ép kim/bạc', count: 89, premium: true },
      { id: 'spot-uv', label: 'UV cục bộ', count: 67, premium: true }
    ]
  },
  {
    id: 'thickness',
    label: 'Độ dày',
    type: 'checkbox',
    priority: 3,
    multiSelect: false,
    values: [
      { id: '300gsm', label: '300gsm (Tiêu chuẩn)', count: 456 },
      { id: '350gsm', label: '350gsm (Dày)', count: 289 },
      { id: '400gsm', label: '400gsm (Rất dày)', count: 123, premium: true }
    ]
  },
  {
    id: 'shape',
    label: 'Hình dạng',
    type: 'radio',
    priority: 4,
    values: [
      { id: 'standard', label: 'Hình chữ nhật (90x54mm)', count: 567 },
      { id: 'rounded', label: 'Bo góc tròn', count: 234 },
      { id: 'square', label: 'Hình vuông', count: 89 },
      { id: 'custom', label: 'Cắt hình theo yêu cầu', count: 45, premium: true }
    ]
  }
];

// PACKAGING FILTERS
export const packagingFilters: FilterDimension[] = [
  {
    id: 'type',
    label: 'Loại bao bì',
    type: 'checkbox',
    priority: 1,
    multiSelect: true,
    values: [
      { id: 'box', label: 'Hộp giấy', count: 345 },
      { id: 'bag', label: 'Túi giấy', count: 289 },
      { id: 'zipper', label: 'Túi Zipper', count: 234 },
      { id: 'label', label: 'Nhãn dán', count: 456 }
    ]
  },
  {
    id: 'material',
    label: 'Chất liệu',
    type: 'checkbox',
    priority: 2,
    multiSelect: true,
    values: [
      { id: 'kraft', label: 'Giấy Kraft', count: 389 },
      { id: 'ivory', label: 'Giấy Ivory', count: 267 },
      { id: 'duplex', label: 'Giấy Duplex', count: 234 },
      { id: 'corrugated', label: 'Carton gợn sóng', count: 189 }
    ]
  },
  {
    id: 'printing',
    label: 'In ấn',
    type: 'checkbox',
    priority: 3,
    multiSelect: true,
    values: [
      { id: '1-color', label: 'In 1 màu', count: 234 },
      { id: '2-color', label: 'In 2 màu', count: 189 },
      { id: 'full-color', label: 'In đầy đủ màu', count: 456 }
    ]
  },
  {
    id: 'use-case',
    label: 'Ngành hàng',
    type: 'checkbox',
    priority: 4,
    multiSelect: true,
    values: [
      { id: 'food', label: 'Thực phẩm', count: 267, icon: '🍜' },
      { id: 'cosmetic', label: 'Mỹ phẩm', count: 189, icon: '💄' },
      { id: 'fashion', label: 'Thời trang', count: 234, icon: '👗' },
      { id: 'ecommerce', label: 'E-commerce', count: 345, icon: '📦' }
    ]
  }
];

// QUICK FILTERS (Predefined combinations)
export const quickFilters: QuickFilter[] = [
  {
    id: 'most-popular',
    label: 'Phổ biến nhất',
    icon: '🔥',
    filters: { sort: ['popular'] }
  },
  {
    id: 'best-value',
    label: 'Giá tốt nhất',
    icon: '💰',
    filters: { sort: ['price-asc'], 'min-quantity': ['100'] }
  },
  {
    id: 'premium-quality',
    label: 'Chất lượng cao',
    icon: '⭐',
    filters: { material: ['cotton-100'], finish: ['embossed', 'foil'] }
  },
  {
    id: 'express-delivery',
    label: 'Giao hàng nhanh',
    icon: '⚡',
    filters: { 'delivery-speed': ['express', 'rush'] }
  }
];

// Helper function to get filters by category
export const getFiltersByCategory = (categoryValue: string): FilterDimension[] => {
  const filterMap: Record<string, FilterDimension[]> = {
    'tshirts': tshirtFilters,
    'business-cards': businessCardFilters,
    'packaging': packagingFilters,
    // Add more mappings as needed
  };

  return filterMap[categoryValue] || [];
};

