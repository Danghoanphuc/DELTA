// apps/customer-frontend/src/features/rush/data/rush.constants.ts
import { Layers, FileText, Image as ImageIcon, Sticker, Frame } from "lucide-react";

// Lưu ý: RUSH_CATEGORIES này chỉ dùng nếu bạn không dùng categories.data.ts gốc.
// Nhưng vì chúng ta đã dùng CategorySelector lấy data từ categories.data.ts, 
// nên PRODUCT_SPECS bên dưới mới là quan trọng nhất.

export const PRODUCT_SPECS: Record<string, any> = {
  // 1. DANH THIẾP & THẺ (business-card)
  "business-card": {
    sizes: ["9x5.4cm (Chuẩn)", "9x5cm (Nhỏ)", "8.5x5.5cm (Visa)"],
    materials: ["C300 Cán mờ 2 mặt", "Giấy Mỹ thuật", "Thẻ nhựa PVC", "Giấy Kraft"],
    quantities: [2, 5, 10, 20, 50, 100],
    unit: "Hộp (100 cái)"
  },

  // 2. BAO LÌ XÌ & THIỆP TẾT (tet-collection / red-envelope)
  "red-envelope": { 
    sizes: ["8x16cm (Size lớn - Đựng thẳng tiền)", "7.5x10cm (Size nhỏ)", "12x16cm (Thiệp)"],
    materials: ["Couche 150gsm", "Kraft Nhật", "Giấy Mỹ thuật đỏ", "Bristol 200gsm"],
    quantities: [100, 500, 1000, 2000, 5000],
    unit: "Cái"
  },
  // Map thêm key này phòng trường hợp data gốc dùng key khác
  "tet-collection": { 
    sizes: ["8x16cm (Lì xì lớn)", "12x16cm (Thiệp)"],
    materials: ["Couche 150gsm", "Giấy Mỹ thuật"],
    quantities: [100, 500, 1000],
    unit: "Cái"
  },

  // 3. ÁO THUN IN (t-shirt)
  "t-shirt": {
    sizes: ["S, M, L, XL (Nam/Nữ)", "Freesize", "Trẻ em (Số 1-5)"],
    materials: ["Cotton 100% 2 chiều", "Cotton 65/35 4 chiều", "Vải Thun Lạnh", "Vải Cá Sấu"],
    quantities: [1, 5, 10, 20, 50, 100],
    unit: "Áo"
  },

  // 4. BAO BÌ & HỘP (packaging)
  "packaging": {
    sizes: ["10x10x10cm (Hộp vuông)", "20x15x5cm (Hộp nắp gài)", "Túi giấy A4 đứng", "Túi giấy A5 ngang"],
    materials: ["Giấy Ivory 300", "Carton sóng E", "Giấy Kraft nâu", "Duplex 250"],
    quantities: [50, 100, 500, 1000, 2000],
    unit: "Cái"
  },

  // 5. QUÀ KHUYẾN MẠI (gift / promo)
  "gift": {
    sizes: ["Tiêu chuẩn", "Tùy chỉnh"],
    materials: ["Bình giữ nhiệt Inox", "Sổ tay bìa da", "Bút bi nhựa", "Móc khóa Mica"],
    quantities: [10, 50, 100, 200, 500],
    unit: "Món"
  },

  // 6. BẢNG HIỆU, BIỂU NGỮ (banner / signage)
  "banner": {
    sizes: ["60x160cm (Standee X)", "80x180cm (Standee Cuốn)", "Ngang 3m x Cao 1m", "Ngang 5m x Cao 2m"],
    materials: ["Bạt Hiflex dày", "PP trong nhà", "PP ngoài trời", "Decal dán"],
    quantities: [1, 2, 5, 10],
    unit: "Tấm/Cái"
  },

  // 7. TÀI LIỆU (document) - Fallback cho các loại in văn phòng
  "document": {
    sizes: ["A4", "A3", "A5"],
    materials: ["Giấy Bãi Bằng", "Double A 70gsm", "Double A 80gsm", "Bìa kiếng"],
    quantities: [1, 5, 10, 20, 50],
    unit: "Cuốn"
  },

  // 8. TEM NHÃN (sticker)
  "sticker": {
    sizes: ["Tròn 3cm", "Tròn 5cm", "Vuông 4cm", "Chữ nhật 5x8cm"],
    materials: ["Decal giấy", "Decal nhựa trong", "Decal nhựa sữa", "Decal vỡ"],
    quantities: [500, 1000, 2000, 5000, 10000],
    unit: "Cái"
  },

  // ✅ QUAN TRỌNG: Cấu hình mặc định (Fallback)
  // Dùng khi người dùng chọn một category chưa được định nghĩa cụ thể
  "default": {
    sizes: ["Tiêu chuẩn", "Tùy chỉnh theo file"],
    materials: ["Tiêu chuẩn", "Cao cấp"],
    quantities: [1, 10, 50, 100],
    unit: "Cái"
  }
};

export const DEADLINE_OPTIONS = [
  { value: "2h", label: "Hỏa tốc 2H", icon: "⚡", color: "text-red-600 bg-red-50 border-red-200" },
  { value: "4h", label: "Gấp 4H", icon: "🚀", color: "text-orange-600 bg-orange-50 border-orange-200" },
  { value: "today", label: "Trong ngày", icon: "📅", color: "text-blue-600 bg-blue-50 border-blue-200" },
];